const debug = require("debug")("app:error");

module.exports = (app) => {
  app.use((err, req, res, next) => {
    debug("%o", err); // %o is for logging an object without printing each propertie in a new line, in .env are 5 levels ob a nested object setup

    res.status(err.status || 500); // if the error was created wuth http errors use the error, if not use 500 as default statuscode
    res.send({
      error: {
        status: err.status || 500,
        message: err.message,
      },
    });
  });

  debug("Errorhandler initialized in app.js");
};
