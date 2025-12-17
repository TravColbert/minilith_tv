const fs = require("fs").promises
const path = require("path")


module.exports = function (app) {
  const vlcAuthHeader = {
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`:${app.locals.vlcPassword}`).toString('base64')
    }
  }

  const getLibrary = async function (term=null) {
    let files = []
    // get a list of files from the filesystem by reading from the libraryPaths
    const fullPath = path.join(app.locals.libraryPaths[0])
    // If the directory does not exist, return an empty array
    try {
      await fs.access(fullPath)
    } catch (err) {
      console.warn(`Library path does not exist: ${fullPath}`)
      return files
    }
    const dir = await fs.opendir(fullPath)
    for await (const dirent of dir) {
      if (dirent.isFile()) {
        const ext = path.extname(dirent.name).toLowerCase()
        if (app.locals.mediaExtensions.includes(ext)) {
          files.push({
            name: dirent.name,
            isFile: dirent.isFile(),
            isDirectory: dirent.isDirectory(),
            path: dirent.parentPath
          })
        }
      }
    }

    // Filter for search terms
    if (term && term !== '') {
      files = files.filter(file => {
        return file.name.toLowerCase().includes(term.toLowerCase())
      })
    }

    // Sort files by name
    files.sort((a, b) => a.name.localeCompare(b.name))

    return files
  }

  const getFile = function (filename) {
    // get the full path for the provided file
    return path.join(app.locals.libraryPaths[0], filename)
  }

  /**
   *
   * @param xmlString     string
   * @param regex         regex
   * @param notFoundValue *
   * @param captureGroup  int
   * @returns {*|null}
   */
  const parseXML = function (xmlString, regex, notFoundValue = null, captureGroup = 1) {
    if (!regex || !xmlString) return notFoundValue
    const found = regex.exec(xmlString)
    if (found && found.length > 1) return found[1]
    return notFoundValue
  }

  const calculateVolume = function (volume) {
    // Volume is an integer from 0 - 250???
    return `${Math.round((volume / 255) * 100)}%`
  }

  const calculatePosition = function (position) {
    return `${Math.round(position * 100)}%`
  }

  const calulateTime = function (seconds) {
    const min = Math.floor((seconds / 60))
    const sec = (seconds % 60)
    return `${min}:${sec}`
  }

  return {
    library: async function (req, res, next) {
      app.locals.debug && console.debug("Compiling library...")
      const searchTerm = req.query.search || null
      res.locals.render.library = await app.locals.cache(`library${searchTerm}`, async () => { return await getLibrary(searchTerm) })
      next()
    },
    play: async function (req, res, next) {
      const id = req.params.id
      console.log(`Playing media item: ${id}`)
      const response = await fetch(`${app.locals.vlcUrl}?command=in_play&input=file:///${getFile(id)}`, vlcAuthHeader)
      console.log("VLC response:", await response.text())
      next()
    },
    pause: async function (req, res, next) {
      const id = req.params.id
      console.log(`Pausing media item: ${id}`)
      const response = await fetch(`${app.locals.vlcUrl}?command=pl_pause`, vlcAuthHeader)
      console.log("VLC response:", await response.text())
      next()
    },
    status: async function (req, res, next) {
      console.log("Fetching VLC status")
      let xmlText
      const status = {
        state: 'disconnected'
      }

      try {
        const response = await fetch(`${app.locals.vlcUrl}`, vlcAuthHeader)
        xmlText = await response.text()
      } catch (error) {
        console.log(error)
        res.locals.render.error = error
      }

      app.locals.debug && console.debug("VLC status response:", xmlText)

      // Let's pick out some important stuff using regex
      status.volume = calculateVolume(parseXML(xmlText, /\<volume\>(\d*)\<\/volume\>/))
      status.fullscreen = parseXML(xmlText, /\<fullscreen\>([^\<\>]*)\<\/fullscreen\>/)
      status.position = calculatePosition(parseXML(xmlText, /\<position\>([\d\.]*)\<\/position\>/))
      status.time = calulateTime(parseXML(xmlText, /\<time\>(\d*)\<\/time\>/))
      status.state = parseXML(xmlText, /\<state\>([^\<\>]*)\<\/state\>/, "disconnected")
      status.length = calulateTime(parseXML(xmlText, /\<length\>(\d*)\<\/length\>/))
      status.name = parseXML(xmlText, /\<info name='filename'\>([^\<\>]*)\<\/info\>/)

      app.locals.debug && console.debug("VLC parsed response:", status)
      res.locals.render.status = status

      next()
    },
    stop: async function (req, res, next) {
      const id = req.params.id
      console.log(`Stopping media item: ${id}`)
      const response = await fetch(`${app.locals.vlcUrl}?command=pl_stop`, vlcAuthHeader)
      console.log("VLC response:", await response.text())
      next()
    },
    volumeUp: async function (req, res, next) {
      console.log("Increasing VLC volume")
      const response = await fetch(`${app.locals.vlcUrl}?command=volume&val=%2B10`, vlcAuthHeader)
      console.log("VLC response:", await response.text())
      next()
    },
    volumeDown: async function (req, res, next) {
      console.log("Decreasing VLC volume")
      const response = await fetch(`${app.locals.vlcUrl}?command=volume&val=%2D10`, vlcAuthHeader)
      console.log("VLC response:", await response.text())
      next()
    },
    seekPlus10Seconds: async function (req, res, next) {
      console.log("Seeking forward 10 seconds in VLC")
      const response = await fetch(`${app.locals.vlcUrl}?command=seek&val=%2B10`, vlcAuthHeader)
      console.log("VLC response:", await response.text())
      next()
    },
    seekMinus10Seconds: async function (req, res, next) {
      console.log("Seeking backward 10 seconds in VLC")
      const response = await fetch(`${app.locals.vlcUrl}?command=seek&val=%2D10`, vlcAuthHeader)
      console.log("VLC response:", await response.text())
      next()
    },
    render: async function (req, res) {
      console.log("Rendering output")
      app.locals.debug && console.debug("Rendering:", res.locals.render)
      res.render("content", res.locals.render)
    }
  }
}
