'use strict';

let config = require('config'),
	path = require('path'),
	fs = require('fs'),
	// Http server
	express = require('express'),
	bodyParser = require('body-parser'),
	app = express(),
	port = config.get('server.port'),
	// Security
	https = require('https'),
	httpsOptions = {
		key: fs.readFileSync('./config/ssl/backhome_privkey.pem'),
		cert: fs.readFileSync('./config/ssl/backhome_certificate.pem')
	},
	helmet = require('helmet'),
	// Authentification Require
	crypto = require('crypto'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	cookieSession = require('cookie-session'),
	// Dash button Setup
	dash_button = require('node-dash-button'),
	dash = dash_button(config.get('dash.mac'), null, null, 'all'),
	// Plug Setup
	plugApi = require('hs100-api'),
	plugClient = new plugApi.Client(),
	plug = plugClient.getPlug(config.get('switch.host')),
	// Kodi Setup
	kodi = require('kodi-ws'),
	kodiConf = config.get('kodi'),
	// App Setup
	appConfFile = './config/app.json',
	appConf = JSON.parse(fs.readFileSync(appConfFile)),
	musicMorning = appConf.music.morning,
	musicEvening = appConf.music.evening,
	canPlayMusic = appConf.enable,
	playMusic = function(musicId)
	{
		let youtubeRegex = /^https:\/\/www.youtube.com\/watch\?v=(.+)&?.+$/;

		if(youtubeRegex.test(musicId))
		{
			musicId = musicId.match(youtubeRegex)[1];
		}

		return kodi(kodiConf.host, kodiConf.port)
			.then(function(connection)
			{
				/* Start the video */
				return connection.Player.Open(
				{
					item :
					{
						file : 'plugin:\/\/plugin.video.youtube\/?path=\/root\/search&action=play_video&videoid=' + musicId
					}
				});
			});
	},
	stopMusic = function()
	{
		return kodi(kodiConf.host, kodiConf.port)
			.then(function(connection)
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

// Dash Button
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
				let d = new Date(),
					n = new Date(),
					musics = musicMorning
					;

				d.setHours(12, 0, 0, 0);
				(n>d) && (musics = musicEvening);

				playMusic(musics[Math.floor(Math.random() * (musics.length))])
				.then(function()
				{
					console.log('Kodi : Playing Music ' + (n>d ? 'Evening' : 'Morning'));
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

passport.use(new LocalStrategy(
	function(username, password, done)
	{

		var userApp = config.get('server.user.username'),
			passApp = config.get('server.user.password'),
			userId
			;

		if (userApp !== crypto.createHash('sha256').update(username).digest('base64') || 
			passApp !== crypto.createHash('sha256').update(password).digest('base64')
		)
		{
		  return done(null, false, { message: 'Incorrect username or password' });
		}

		return done(null, { id : config.get('server.user.id') });
	}
));

passport.serializeUser(function(user, done)
{
	done(null, user);
});

passport.deserializeUser(function(user, done)
{
	done(null, user);
});

app
.use(helmet())
.use('/static', express.static(path.join(__dirname, 'public')))
.use(bodyParser.json())
.use(bodyParser.urlencoded({ extended: true}))
.use(cookieSession(
{
	name: 'session',
	keys: config.get('server.auth.cookieKeys')
}))
.use(passport.initialize())
.use(passport.session())
.set('view engine', 'pug')
.get('/login', function(req, res)
{
	res.render('login', { active : 'Login' });
})
.post('/login', passport.authenticate('local',
{
	successRedirect: '/',
	failureRedirect: '/login'
}))
.get('/', function(req, res)
{
	if(!req.isAuthenticated())
	{
		res.redirect('/login');
	}

	res.render('index',
	{
		active : 'Configuration',
		enable : canPlayMusic,
		musicMorning : musicMorning,
		musicEvening : musicEvening
	});
})
.post('/saveMusic', function(req, res)
{
	if(!req.isAuthenticated())
	{
		res.redirect('/login');
	}

	musicMorning = req.body.musicMorning.filter(Boolean);
	musicEvening = req.body.musicEvening.filter(Boolean);

	if(req.body.enable !== 'undefined')
	{
		canPlayMusic = req.body.enable;
	}

	fs.writeFileSync(appConfFile, JSON.stringify(appConf));

	res.end();
})
.get('/play', function(req, res)
{
	if(!req.isAuthenticated())
	{
		res.redirect('/login');
	}

	playMusic(req.query.music)
	.then(function()
	{
		console.log('Kodi : Playing Music UI');
	});
})
.get('/sw', function(req, res)
{
	res.sendFile(path.join(__dirname, 'sw.js'));
})
;

var httpsServer = https.createServer(httpsOptions, app);
httpsServer.listen(port, function()
{
	console.log(`Server listening ${port}`);
});
