'use strict';

let config = require('config'),
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
    playMusic = function()
    {
      let url = 'plugin:\/\/plugin.video.youtube\/?path=\/root\/search&action=play_video&videoid=' + kodiConf.video;
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
            console.error(error);
          });
        }
        else
        {
          console.log('Smart Plug : switch on');
          playMusic()
          .then(function()
          {
            console.log('Kodi : Playing Music');
          })
          .catch(function(error)
          {
            console.error('Kodi : ' + error);
          });
        }
      })
      .catch(function(error)
      {
        console.error('Smart Plug : ' + error);
      })
      ;
});

console.log('Back Home Ready');
