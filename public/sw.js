var cacheVersion = 1,
	cacheName = 'backhome.cache.v' + cacheVersion,
	staticUrl = '/static/'
	cacheList = [
		'/',
		staticUrl + 'manifest.json',
		// staticUrl + 'js/loadSW.js',
		// staticUrl + 'sw.js',
		staticUrl + 'css/config.css',
		staticUrl + 'css/signin.css',
		staticUrl + 'js/config.js',
		staticUrl + 'img/backhome192.png',
		staticUrl + 'img/backhome256.png',
		staticUrl + 'img/backhome384.png',
		staticUrl + 'img/backhome512.png'
	]
	;

self.addEventListener('install', function(event)
{
	event.waitUntil(
		caches.open(cacheName)
		.then(function(cache)
		{
			console.log('Cache all');
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
	event.respondWith(
		// Opens Cache objects that start with 'font'.
		caches.open(cacheName)
		.then(function(cache)
		{
			return cache.match(event.request)
			.then(function(response)
			{
				if(response)
				{
					console.log('Found response in cache:', response);
					return response;
				}
			})
			.catch(function(error)
			{
				// Handles exceptions that arise from match() or fetch().
				console.error('Error in fetch handler:', error);
				throw error;
			});
		})
	);
});
