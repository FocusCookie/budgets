const JWT = require("jsonwebtoken");
const createError = require("http-errors");
const debug = require("debug")("dev:jwt");
const redisClient = require("../init/redis.init");
const { refreshToken } = require("../controllers/auth.controller");

module.exports = {
  signAccessToken: (user) => {
    return new Promise((resolve, reject) => {
      const payload = { name: user.name };
      const secret = process.env.ACCESS_TOKEN_SECRET;
      const options = {
        expiresIn: "2h",
        issuer: "budgets.io",
        audience: "" + user._id, // _id is an object, audience needs to be an string
      };

      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          debug("%o", err);
          reject(createError.InternalServerError());
        } else {
          resolve(token);
        }
      });
    });
  },

  verfiyAccessToken: (req, res, next) => {
    if (!req.headers.authorization) return next(createError.Unauthorized());

    // Split the TOken from the Bearer token string
    const token = req.headers.authorization.split(" ")[1];

    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        debug("%o", err);
        const message =
          err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
        next(createError.Unauthorized(message));
      } else {
        req.payload = payload;
        next();
      }
    });
  },

  signRefreshToken: (user) => {
    return new Promise((resolve, reject) => {
      const payload = { name: user.name };
      const secret = process.env.REFRESH_TOKEN_SECRET;
      const options = {
        expiresIn: "1y",
        issuer: "budgets.io",
        audience: "" + user._id, // _id is an object, audience needs to be an string
      };

      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          debug("%o", err);
          reject(createError.InternalServerError());
        } else {
          // Store the refresh tolen in redis, it will be used as blacklist
          redisClient.set(
            `${user._id}`,
            token,
            "EX",
            365 * 24 * 60 * 60, // needs to set in seconds
            (err, reply) => {
              if (err) {
                debug(err.message);
                reject(createError.InternalServerError());
                return;
              }

              resolve(token);
            }
          );
        }
      });
    });
  },

  // Check if the stored refreshtoken is the same in the request if so return userId
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, payload) => {
          if (err) return reject(createError.Unauthorized());

          const userId = payload.aud;

          // check if the refresh token is also stored in redis, otherwise reject
          redisClient.get(userId, (err, redisRefreshToken) => {
            if (err) {
              debug("%o", err);
              reject(createError.InternalServerError);
              return;
            } else {
              if (refreshToken === redisRefreshToken) {
                resolve(userId);
              } else {
                reject(createError.Unauthorized());
              }
            }
          });
        }
      );
    });
  },

  getTokenPayload: (req) => {
    return new Promise((resolve, reject) => {
      // Split the TOken from the Bearer token string
      const token = req.headers.authorization.split(" ")[1];

      JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
          debug("%o", err);
          const message =
            err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
          reject(createError.Unauthorized(message));
        } else {
          resolve(payload);
        }
      });
    });
  },
};
