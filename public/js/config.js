
(function($)
{
	let $playNow = $('.playNow'),
		$addMusic = $('.addMusic'),
		$removeMusic = $('.removeMusic')
		;

	$addMusic.on('click', function(e)
	{
		let $html = $('<div class="input-group"><span class="input-group-addon">Morning</span><input class="form-control" type="text" name="musicMorning[]" placeholder="Youtube ID" value=""><span class="input-group-btn"><button class="btn btn-primary playNow" type="button">Play</button></span></div>');

		$(e.target).prev().prev().after($html);
	});

	$removeMusic.on('click', function(e)
	{
		$(e.target).parent().parent().remove();
	});

	$playNow.on('click', function(e)
	{
		let xhr = new XMLHttpRequest();
		xhr.open('GET', '/play?music=' + $(e.target).parent().prev().val());
		xhr.send(null);
	});

}(jQuery));
