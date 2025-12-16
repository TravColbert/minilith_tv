"use strict"

module.exports = function (app, appInstance) {
  return {
    libraryPaths: [
      "/path/to/your/media/library1",
    ],
    mediaExtensions: [".mp4", ".mkv", ".avi", ".mp3", ".flac"],
    vlcUrl: "http://localhost:8081/requests/status.xml",
    vlcPassword: "your_vlc_password_here"
  }
}
