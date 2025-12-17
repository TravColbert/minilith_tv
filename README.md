# Minilith TV

This is an add-on module for Minilith that creates a media-center for your dumb (or dumbed) TV.

All you need is a computer that is capable of:

- running VLC
- running a Node application (_this_ node application)
- outputting to a video device like a monitor or TV
- having network access

## Quick Overview

In very general terms, all you need to do to enjoy a simple media-player experience is:

1. Install and start VLC so that it listens to an HTTP port
2. Install, configure and start Minilith TV

### 1. Install and Start VLC

Install VLC.

Start VLC like this:

```sh
vlc --intf http --http-password your_vlc_password_here --http-port 8081 --fullscreen
```

You set the TCP PORT that VLC will listen on (e.g. 8081).

The password (e.g. "your_vlc_password_here") secures VLC's HTTP interface.

We optionally tell VLC to open in fullscreen mode.

### 2. Install, configure and start Minilith TV

#### Install:

```aiignore
git clone https://github.com/TravColbert/node-express-starter.git ./minilith
cd minilith
mkdir app_tv
git clone https://github.com/TravColbert/minilith_tv.git ./minilith
```

#### Configure:

There are many ways to start and run Minilith.

Straight command-line:

```aiignore
APP_LIST=app_tv node server.js
```

--or--

Create a default configuration at `minilith/config/default.json`:

```aiignore
{
	"APP_LIST": "app_tv"
}
```

Then, start Minilith up:

```aiignore
npm start
```

--or--

If you want to get fancy and run Minilith out of a Docker container, create a `.env` file:

```aiignore
APP_LIST=app_tv
```

#### Start:

If you opted for a configuration-file method, start Minilith like this:

```aiignore
npm start
```
