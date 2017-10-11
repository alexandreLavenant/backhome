
(function($)
{
	$(document).on('click', '.addMusic', function(e)
	{
		let $html = $('<div class="input-group" style="margin-top : 5px;"><span class="input-group-addon">Morning</span><input class="form-control" type="text" name="musicMorning[]" placeholder="Youtube ID" value=""><span class="input-group-btn"><button class="btn btn-primary playNow" type="button">Play</button></span><span class="input-group-btn" style="margin-left : 5px;"><button class="btn btn-danger removeMusic" type="button">-</button></span></div>');

		$(e.target).prev().prev().after($html);
	});

	$(document).on('click', '.removeMusic', function(e)
	{
		$(e.target).parent().parent().remove();
	});

	$(document).on('click', '.playNow', function(e)
	{
		let xhr = new XMLHttpRequest();
		xhr.open('GET', '/play?music=' + $(e.target).parent().prev().val());
		xhr.send(null);
	});

}(jQuery));
