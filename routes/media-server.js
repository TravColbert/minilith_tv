const express = require("express");
const router = express.Router({ mergeParams: true });
const path = require("path");

module.exports = function (app) {
  const currentRouteName = path.basename(__filename, ".js");

  // Require the controller with the same name as the router
  const controller = require(
    path.join("../", app.locals.controllerPath, currentRouteName),
  )(app);

  router.route("/start").get(controller.start);

  router.route("/").get(controller.status);

  return router;
};
