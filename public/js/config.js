
(function($)
{
	let $playNow = $('.playNow');

	$playNow.on('click', function(e)
	{
		let xhr = new XMLHttpRequest();
		xhr.open('GET', '/play?music=' + $(e.target).parent().prev().val());
		xhr.send(null);
	});

}(jQuery));
