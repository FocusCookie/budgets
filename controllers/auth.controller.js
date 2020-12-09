const log = require("debug")("dev:auth");
const logRegister = log.extend("register");
const logLogin = log.extend("login");
const logLogout = log.extend("logout");
const logRefreshToken = log.extend("refresh-token");

module.exports = {
  register: async (req, res, next) => {
    console.log("howief");
    try {
      res.send({ register: true });
    } catch (error) {
      logRegister("%o", error);
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      res.send({ login: true });
    } catch (error) {
      logLogin("%o", error);
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      res.send({ logout: true });
    } catch (error) {
      logLogout("%o", error);
      next(error);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      res.send({ refreshToken: true });
    } catch (error) {
      logRefreshToken("%o", error);
      next(error);
    }
  },
};
