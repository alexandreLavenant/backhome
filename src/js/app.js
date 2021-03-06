$(".button-collapse").sideNav();

$(document).on('click', '.addMusic', function(e)
{
	let $button = $(e.target),
		$html = $('<div class="row"><div class="input-field col s8"><input class="icon_prefix" type="text" name="' + $button.data('add') +'[]" value=""><label class="active">Youtube ID</label></div><div class="col s2"><a class="btn-floating waves-effect waves-light red removeMusic" style="margin-right : 5px;"><i class="material-icons">delete</i></a><a class="btn-floating waves-effect waves-light green playNow"><i class="material-icons">play_arrow</i></a></div></div>')
		;
	
		$button.parent().parent().parent().prev().after($html);
});

$(document).on('click', '.removeMusic', function(e)
{
	$(e.target).parent().parent().parent().remove();
});

$(document).on('click', '.playNow', function(e)
{
	if(navigator.onLine)
	{
		let music = $(e.target).parent().parent().prev().find('.icon_prefix').val();

		if($(e.target).parent().parent().prev().find('.icon_prefix').val() !== "")
		{
			let xhr = new XMLHttpRequest();
			xhr.open('GET', '/play?music=' + music);
			xhr.send(null);
			Materialize.toast('Playing music now !', 5e3);
		}
		else
		{
			Materialize.toast('No music to play !', 5e3);
		}
	}
	else
	{
		Materialize.toast('Offline mode does not support this feature', 5e3);
	}
});

$(document).on('click', '#saveMusic', function(e)
{
	e.preventDefault();

	let musicMorning = [],
		musicEvening = [],
		enable = $('input[name="enable"]').prop('checked')
		;

	$('input[name="musicMorning[]"]').each(function()
	{
		musicMorning.push($(this).val());
	});

	$('input[name="musicEvening[]"]').each(function()
	{
		musicEvening.push($(this).val());
	});

	let xhr = new XMLHttpRequest();
	xhr.open('POST', '/saveMusic', true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.onreadystatechange = function()
	{
	};
	xhr.send(JSON.stringify({
		musicMorning : musicMorning,
		musicEvening : musicEvening,
		enable : enable
	}));
	Materialize.toast('Configuration saved !', 5e3);
});

// Service Worker
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
	Materialize.toast('You are now offline ! But you can continue to use this app', 5e3);
	if(navigator.serviceWorker.controller)
	{
		navigator.serviceWorker.controller.postMessage({ 'type' : 'network', 'status' : false });
	}
});

window.addEventListener('online', function()
{
	Materialize.toast('You are now online !', 5e3);
	if(navigator.serviceWorker.controller)
	{
		navigator.serviceWorker.controller.postMessage({ 'type' : 'network', 'status' : true });
	}
});