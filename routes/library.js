const express = require("express");
const router = express.Router({ mergeParams: true });
const path = require("path");

module.exports = function (app) {
    const currentRouteName = path.basename(__filename, ".js");

    // Require the controller with the same name as the router
    const controller = require(
        path.join("../", app.locals.controllerPath, currentRouteName),
    )(app);

    router
        .route("/:id/resync")
        .get(controller.resync, controller.status, controller.render);

    router.route("/:id/edit").get(controller.edit, controller.render);

    router
        .route("/:id/play")
        .get(controller.play, controller.status, controller.render);

    router.route("/sync").get(controller.syncLibrary);

    router
        .route("/stop")
        .get(controller.stop, controller.status, controller.render);

    router
        .route("/pause")
        .get(controller.pause, controller.status, controller.render);

    router.route("/status").get(controller.status, controller.render);

    router
        .route("/volume-up")
        .get(controller.volumeUp, controller.status, controller.render);

    router
        .route("/volume-down")
        .get(controller.volumeDown, controller.status, controller.render);

    router
        .route("/seek-forward")
        .get(
            controller.seekPlus10Seconds,
            controller.status,
            controller.render,
        );

    router
        .route("/seek-backward")
        .get(
            controller.seekMinus10Seconds,
            controller.status,
            controller.render,
        );

    router
        .route("/:id")
        .get(controller.get, controller.status, controller.render)
        .post(controller.update, controller.status, controller.render);

    router
        .route("/")
        .get(controller.status, controller.library, controller.render);

    return router;
};
