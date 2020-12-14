const debug = require("debug")("app:adminUser-init");
const User = require("../models/user.model");

const adminAccount = {
  name: "Admin",
  email: "admin@app.com",
  password: "admin1234",
  role: "admin",
};

function createAdminAccount(account) {
  return new Promise((resolve, reject) => {
    User.findOne({ email: account.email }).then((adminExists) => {
      if (!adminExists) {
        const admin = new User(account);
        admin.save().then(() => {
          resolve(
            "Admin Account successfully created. Email: admin@app.com and Password: admin1234"
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
