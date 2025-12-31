const express = require("express");
const router = express.Router({ mergeParams: true });

module.exports = function (app) {
  router.route("/").get((_req, res) => res.render("home"));

  return router;
};
