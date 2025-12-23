module.exports = function (app) {
  const tmdbUrl = 'https://api.themoviedb.org/3'
  const tmdbAuthHeader = {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=utf-8',
    Authorization: `Bearer ${app.locals.tmdbAccessToken}`
  }

  // add the task to the app.locals.jobs object
  app.locals.jobs = app.locals.jobs || {}
  app.locals.jobs.getTmdbConfiguration = {
    comment: [
      "Fetches the TMDB configuration data and stores it in app.locals.tmdbConfiguration for later use"
    ],
    name: 'getTmdbConfiguration',
    description: 'Fetches and stores the TMDB configuration data',
    trigger: "onAppStart",
    run: async function () {
      console.log('Fetching TMDB configuration...')
      const configUrl = `${tmdbUrl}/configuration`
      const response = await fetch(configUrl, { headers: tmdbAuthHeader })
      const data = await response.json()
      // Store the configuration in app.locals for later use
      app.locals.tmdbConfiguration = data.images
      console.log('TMDB configuration fetched and stored in app.locals.tmdbConfiguration')
    }
  }
}