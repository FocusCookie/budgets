const mongooose = require("mongoose");
const debug = require("debug")("app:mongodb");

mongooose
  .connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    debug("MongoDB is connceted.");
  })
  .catch((err) => {
    debug(err.message);
  });

mongooose.connection.on("connected", () => {
  debug("Mongoose is connected to MongoDB.");
});

mongooose.connection.on("error", (err) => {
  debug(err.message);
});

mongooose.connection.on("disconnected", () => {
  debug("Mongoose is disconnected from MongoDB.");
});

// Close the mongoose connection befoe shutting down the application
process.on("SIGINT", async () => {
  await mongooose.connection.close();
  process.exit(0);
});
