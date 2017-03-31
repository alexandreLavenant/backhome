'use strict';

let config = require('config'),
    // Http server
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    port = config.get('http.port'),
    // Dash button Setup
    dash_button = require('node-dash-button'),
    dash = dash_button(config.get('dash.mac'), null, null, 'all'),
    // Plug Setup
    plugApi = require('hs100-api'),
    plugClient = new plugApi.Client(),
    plug = plugClient.getPlug(config.get('plug')),
    // Kodi Setup
    kodi = require('kodi-ws'),
    kodiConf = config.get('kodi'),
    videoId = kodiConf.video,
    canPlayMusic = kodiConf.enable,
    playMusic = function(musicId)
    {
      let url = 'plugin:\/\/plugin.video.youtube\/?path=\/root\/search&action=play_video&videoid=' + musicId;
      return kodi(kodiConf.host, kodiConf.port).then(function(connection)
      {
        /* Start the video */
        return connection.Player.Open(
          {
            item :
            {
              file : url
            }
          });
      });
    },
    stopMusic = function()
    {
      return kodi(kodiConf.host, kodiConf.port).then(function(connection)
      {
        return connection.Player.GetActivePlayers()
        .then(function(players)
        {
      		/* Stop everything thats playing */
      		return Promise.all(players.map(function(player)
          {
      			return connection.Player.Stop(player.playerid);
      		}));
    	 });
     });
    }
    ;

// Main application
dash.on("detected", () =>
{
  console.log('Dash Button : pressed');
  plug.getPowerState()
      .then((state) =>
      {
        plug.setPowerState(!state);
        if(state)
        {
          console.log('Smart Plug : switch off');
          stopMusic()
          .then(function()
          {
            console.log('Kodi : Stop all players');
          })
          .catch(function(error)
          {
            console.error('Kodi : ' + error);
          });
        }
        else
        {
          console.log('Smart Plug : switch on');
          if (canPlayMusic)
          {
            playMusic(videoId)
            .then(function()
            {
              console.log('Kodi : Playing Music');
            })
            .catch(function(error)
            {
              console.error('Kodi : ' + error);
            });
          }
          else
          {
            console.log('Kodi : Not Playing Music');
          }
        }
      })
      .catch(function(error)
      {
        console.error('Smart Plug : ' + error);
      })
      ;
});
console.log('Back Home Ready');

app
.use(bodyParser.json())
.use(bodyParser.urlencoded({ extended: true}))
.get('/', function(req, res)
{
  res.sendFile(__dirname + '/index.html');
})
.post('/', function(req, res)
{
  videoId = req.body.video;
  if(req.body.enable !== 'undefined')
  {
    canPlayMusic = req.body.enable;
  }
  res.redirect('/');
})
.get('/config', function(req, res)
{
  res.json(
  {
    enable : canPlayMusic,
    video : videoId
  });
})
.get('/playnow', function(req, res)
{
  playMusic(req.query.video)
  .then(function()
  {
    console.log('Kodi : Playing Music UI');
  });
})
;

app.listen(port, function()
{
  console.log(`Server listening ${port}`);
});
