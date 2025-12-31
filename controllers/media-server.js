// const fs = require("fs").promises;
// const path = require("path");

module.exports = function (app) {
  const serverIsUp = async function () {
    /**
     * Spawning is not working because VLC can't open a display
     */
    return await fetch(`${app.locals.vlcUrl}`, vlcAuthHeader)
      .then((response) => {
        resolve(response.text());
      })
      .catch((e) => {
        console.error(`Trouble checking on status of VLC server: ${e.message}`);
        res.locals.render.error = e.message;
        reject(e.message);
      });
  };

  const parseVlcMediaServerStatus = function (xmlTextFromVlcServer) {
    const status = {
      state: "disconnected",
    };

    status.volume = calculateVolume(
      parseXML(xmlTextFromVlcServer, /<volume>(\d*)<\/volume>/),
    );
    status.fullscreen = parseXML(
      xmlTextFromVlcServer,
      /<fullscreen>([^<>]*)<\/fullscreen>/,
    );
    status.position = calculatePosition(
      parseXML(xmlTextFromVlcServer, /<position>([\d\.]*)<\/position>/),
    );
    status.time = calculateTime(
      parseXML(xmlTextFromVlcServer, /<time>(\d*)<\/time>/),
    );
    status.state = parseXML(
      xmlTextFromVlcServer,
      /<state>([^<>]*)<\/state>/,
      "disconnected",
    );
    status.length = calculateTime(
      parseXML(xmlTextFromVlcServer, /<length>(\d*)<\/length>/),
    );
    status.name = parseXML(
      xmlTextFromVlcServer,
      /<info name='filename'>([^<>]*)<\/info>/,
    );

    return status;
  };

  return {
    start: async function (req, res, next) {
      // Is the server already started?
      const { spawn } = require("child_process");
      const mediaServer = spawn("vlc", [
        "--intf http",
        "--http-password your_vlc_password_here",
        "--http-port 8081",
        "--fullscreen",
      ]);

      mediaServer.stdout.on("data", (data) => {
        console.log(`media server stdout: ${data}`);
      });

      mediaServer.stderr.on("data", (data) => {
        console.log(`media server stderr: ${data}`);
      });

      mediaServer.on("error", (err) => {
        console.log(`failed to start media server: ${err}`);
      });

      res.send("server started");
    },

    status: async function (req, res, next) {
      console.log("Fetching VLC status");

      await serverIsUp()
        .then((xmlText) => {
          console.dir(xmlText);
          const status = parseVlcMediaServerStatus(xmlText);
          app.locals.debug && console.debug("VLC parsed response:", status);
          res.locals.render.status = status;
        })
        .catch((e) => {
          console.log(`Cannot connect to VLC server - probably down`);
          res.locals.render.status = "Down";
        });

      res.send(res.locals.render.status);
    },
  };
};
