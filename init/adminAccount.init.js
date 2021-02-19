const debug = require("debug")("app:adminUser-init");
const User = require("../models/user.model");

const adminAccount = {
  name: process.env.ADMIN_NAME,
  email: process.env.ADMIN_MAIL,
  password: process.env.ADMIN_PW,
  role: "admin",
};

function createAdminAccount(account) {
  return new Promise((resolve, reject) => {
    User.findOne({ email: account.email }).then((adminExists) => {
      if (!adminExists) {
        const admin = new User(account);
        admin.save().then(() => {
          resolve(
            `Admin Account successfully created. Email: ${process.env.ADMIN_MAIL} and Password: ${process.env.ADMIN_PW}`
          );
        });
      } else {
        reject(
          "Admin Account exists already. No default admin account created."
        );
      }
    });
  });
}

createAdminAccount(adminAccount)
  .then((res) => debug(res))
  .catch((err) => debug(err));
