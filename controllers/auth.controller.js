const debug = require("debug")("dev:auth");

const createError = require("http-errors");
const User = require("../models/user.model");
const userValidation = require("../helpers/validations/user.validation");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../helpers/jwt.helper");
const redisClient = require("../init/redis.init");

module.exports = {
  register: async (req, res, next) => {
    try {
      // validate the user that wants to register
      const validatedUser = await userValidation.register.validateAsync(
        req.body
      );

      const userExist = await User.findOne({ email: validatedUser.email });

      if (userExist) {
        throw createError.Conflict(
          `${validatedUser.email} is already registered.`
        );
      }

      const user = new User(validatedUser);
      const savedUser = await user.save();
      const accessToken = await signAccessToken(savedUser);
      const refreshToken = await signRefreshToken(savedUser);

      res.send({ accessToken, refreshToken });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;

      debug(error.message);
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const validatedUser = await userValidation.login.validateAsync(req.body);
      const user = await User.findOne({ email: validatedUser.email });

      if (!user) throw createError.NotFound("User not registered.");

      const validPassword = await user.isValidPassword(validatedUser.password);

      if (!validPassword)
        throw createError.Unauthorized("Invalid Email/Password.");

      const accessToken = await signAccessToken(user);
      const refreshToken = await signRefreshToken(user);

      res.send({ accessToken, refreshToken });
    } catch (error) {
      debug(error.message);

      if (error.isJoi)
        return next(createError.BadRequest("Invalid Email/Password."));

      next(error);
    }
  },

  // The accessToken expires within 2 hours, if the frontend destroys the accesstoken after a session there is no real logout. But you need to destroy the refresh token in the backend, because this one expires after a year.
  logout: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) throw createError.BadRequest();

      const userId = await verifyRefreshToken(refreshToken);

      redisClient.DEL(userId, (err, value) => {
        if (err) {
          debug(err.message);
          throw createError.InternalServerError();
        } else {
          debug(`Refresh-Token for userId: ${userId} successfully deleted.`);
          res.sendStatus(204);
        }
      });
    } catch (error) {
      debug(error.message);
      next(error);
    }
  },

  refreshTokens: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) throw createError.BadRequest();

      const userId = await verifyRefreshToken(refreshToken);

      // delete old refresh token
      redisClient.DEL(userId, (err, value) => {
        if (err) {
          debug(err.message);
          throw createError.InternalServerError();
        } else {
          debug(`Refresh-Token for userId: ${userId} successfully deleted.`);
        }
      });

      const user = await User.findOne({ _id: userId });

      const newAccessToken = await signAccessToken(user);
      const newRefreshToken = await signRefreshToken(user);

      res.send({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (error) {
      debug(error.message);
      next(error);
    }
  },
};
