
(function($)
{
  let $musicMorningId = $('#musicMorningId').first(),
      $musicEveningId = $('#musicEveningId').first(),
      $checkboxEnable = $('#checkbox1')
      ;

  let xhr = new XMLHttpRequest();
  xhr.open('GET', '/config');
  xhr.send(null);
  xhr.onreadystatechange = function ()
  {
    if(xhr.status === 200)
    {
      let res = JSON.parse(xhr.responseText);
      res.enable ? $checkboxEnable.prop('checked', true) : null;
      $musicMorningId.val(res.musicMorningId);
      $musicEveningId.val(res.musicEveningId);
    }
  }

  $('#playMorningNow').on('click', function()
  {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/playnow?music=' + $musicMorningId.val());
    xhr.send(null);
  });

  $('#playEveningNow').on('click', function()
  {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/playnow?music=' + $musicEveningId.val());
    xhr.send(null);
  });

}(jQuery));
