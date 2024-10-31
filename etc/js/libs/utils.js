/**
Plugin Name: Provide Support Live Chat
Version: 5.0.0
Author: Provide Support, LLC
Author URI: http://www.providesupport.com?utm_source=wp-plugin&utm_medium=list&utm_campaign=Plugins
**/

function generateRandomString(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var ii = length; ii--;) text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
};

function getSpinnerHtml(url, id, style) {
  return '<img ' +
  (id ? 'id="' + id + '" ' : '') +
  (style ? 'style="' + style + '" ' : '') +
  'src="' + url + '" width="30px" height="30px">'
}

/* FOR LISTENERS *****************************************************************************************************/
function showElementOnClick(obj, target, inversion) {
  $(obj).on('click', function() {
    if (inversion ^ $(obj).prop('checked')) {
      $(target).show();
    } else {
      $(target).hide();
    }
  })
}

function showSeveralElementOnClick(obj, target) {
  $(obj).parent().on('click', function() {
    $(obj).parent().each(function() {
      currentSetting = $(this);
      if (currentSetting.children('input').prop('checked')) {
        currentSetting.children(target).slideDown('fast');
      } else {
        currentSetting.children(target).slideUp('fast');
      }
    });
  });
}

function overwriteApostrophesByEvent(event) {
  var element = $(event.target);
  var str = element.val();
  var newStr = str.replace(/\"/gi, "\'");
  element.val(newStr);
}

function createTooltip(tooltipSign, title) {
  var CLASS = 'pstooltip';

  $(tooltipSign).bind({
    mousemove: changeTooltipPosition,
    mouseenter: showTooltip,
    mouseleave: hideTooltip
  });

  function changeTooltipPosition(event) {
    var tooltipX = event.pageX - 8;
    var tooltipY = event.pageY + 8;
    $('div.' + CLASS).css({
      top: tooltipY,
      left: tooltipX
    });
  }
  function showTooltip(event) {
    $('div.' + CLASS).remove();
    var showtext = $(this).attr(title);
    $('<div class="' + CLASS + '">' + showtext + '</div>').appendTo('body');
    changeTooltipPosition(event);
  };
  function hideTooltip() {
    $('div.' + CLASS).remove();
  };
  
}
