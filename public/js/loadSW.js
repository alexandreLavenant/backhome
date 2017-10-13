(function($)
{
	let showAlert = function(message, description, level)
	{
		$('#statusMessage').remove();

		let $alert = $('<div id="statusMessage" class="alert alert-' + level + ' alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>' + message + '</strong>' + description + '</div>');

		$alert
			.insertBefore('.container')
			;

	};

	if('serviceWorker' in navigator)
	{
		navigator.serviceWorker.register('/sw')
		.then(function(reg)
		{
			// registration worked
			console.log('Registration succeeded. Scope is ' + reg.scope);
		})
		.catch(function(error)
		{
			// registration failed
			console.log('Registration failed with ' + error);
		});
	}

	window.addEventListener('offline', function()
	{
		showAlert('You are now offline ! ', 'But you can continue to use this app', 'warning');
	});

	window.addEventListener('online', function()
	{
		showAlert('You are now online !', '', 'success');
	});

}(jQuery));
