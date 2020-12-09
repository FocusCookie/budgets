const redis = require("redis");
const debug = require("debug")("app:redis");

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

client.on("connect", () => {
  debug("Client is connected to redis.");
});

client.on("ready", () => {
  debug("Client is ready to use.");
});

client.on("end", () => {
  debug("Client is disconnected from redis.");
});

client.on("error", () => {
  debug(err.message);
});

// close the redis client before shutting down the application
process.on("SIGNINT", () => {
  client.quit();
});

module.exports = client;
