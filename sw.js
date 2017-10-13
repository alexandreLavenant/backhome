var cacheVersion = 1,
	cacheName = 'backhome.cache.v' + cacheVersion,
	staticUrl = '/static/',
	cacheList = [
		staticUrl + 'favicon.png',
		staticUrl + 'img/backhome192.png',
		staticUrl + 'img/backhome256.png',
		staticUrl + 'img/backhome384.png',
		staticUrl + 'img/backhome512.png',
		staticUrl + 'manifest.json',
		'https://code.jquery.com/jquery-3.2.1.slim.min.js',
		'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js',
		'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css',
		'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/js/bootstrap.min.js',
		staticUrl + 'css/config.css',
		staticUrl + 'css/signin.css',
		staticUrl + 'js/config.js',
		staticUrl + 'js/loadSW.js'
	]
	lastRequest = null,
	handlePostResponse = function(req)
	{
		if(navigator.onLine)
		{
			return fetch(req);
		}

		lastRequest = req;
		return new Response(null, { status : 200 }).clone();
	}
	;

self.addEventListener('install', function(event)
{
	event.waitUntil(
		caches.open(cacheName)
		.then(function(cache)
		{
			// console.log('Cache all');
			return cache.addAll(cacheList);
		})
	);
});

self.addEventListener('activate', function(event) {
	// Active worker won't be treated as activated until promise resolves successfully.
	event.waitUntil(
		caches.keys()
		.then(function(cacheKeys)
		{
			return Promise.all(
				cacheKeys.map(function(cacheKey)
				{
					if (cacheKey !== cacheName)
					{
						console.log('Deleting out of date cache:', cacheKey);
						return caches.delete(cacheKey);
					}
				})
			);
		})
	);
});

self.addEventListener('fetch', function(event)
{
	console.log('Handling fetch event for', event.request.url);

	if(/^(?:http|https):\/\/.+:3000\/saveMusic$/.test(event.request.url) && event.request.method === 'POST')
	{
		return handlePostResponse(event.request);
	}

	event.respondWith(
		caches.open(cacheName)
		.then(function(cache)
		{
			return cache.match(event.request)
			.then(function(response)
			{
				if(response)
				{
					// console.log('Found response in cache:', response);
					return response;
				}

				return fetch(event.request)
				.then(function(response)
				{
					// response may be used only once
					// we need to save clone to put one copy in cache
					// and serve second one
					let responseClone = response.clone();

					caches.open(cacheName)
					.then(function(cache)
					{
						console.log('Put in cache:', response);
						cache.put(event.request, responseClone);
					});

					return response;
				})
				.catch(function(error)
				{
					// Handles exceptions that arise from match() or fetch().
					console.error('Error in fetch handler:', error);
				});
			})
		})
	);
});

self.addEventListener('message', function(message)
{
	if(message.data.type === 'network' && message.data.status === true && lastRequest !== null)
	{
		return fetch(lastRequest)
		.then((response) =>
		{
			return caches.open(cacheName)
			.then(function(cache)
			{
				return cache.delete('/')
				.then(() =>
				{
					lastRequest = null;
					return response;
				});
			});
		});
	}
});
