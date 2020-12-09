const crypto = require("crypto");

//32 bytes is for 256 encryption
const accessTokenSecret = crypto.randomBytes(32).toString("hex");
const refreshTokenSecret = crypto.randomBytes(32).toString("hex");

console.table({ accessTokenSecret, refreshTokenSecret });
