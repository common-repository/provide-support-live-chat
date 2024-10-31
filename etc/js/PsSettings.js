/**
Plugin Name: Provide Support Live Chat
Version: 5.0.0
Author: Provide Support, LLC
Author URI: http://www.providesupport.com?utm_source=wp-plugin&utm_medium=list&utm_campaign=Plugins
**/

function PsSettings({ values, accountApiUrl, getCodeUrl, cacher, spinnerHtml }) {
  /* state */
var values = values || createDefaultSettings();
var account = {
    name: '',
    pass: '',
    mail: '',
  }

  /* elements */
  var allFields = $('#settings-wrapper input');
  var depended = $('#buttonAvailablePages,#buttonAvailablePosts,#buttonAvailableOther,#buttonAvailableWhole,#buttonAvailableMain,.shortcodeSeparator').parent()

  /* listeners */
  $('#f7submit').on('click', submit);
  $('#buttonImageTextOnline').on('blur', overwriteApostrophesByEvent);
  $('#buttonImageTextOffline').on('blur', overwriteApostrophesByEvent);
  $('input[location]').on('click', handleLocationInputs);
  $('a[href="/wp-admin/widgets.php"]').on('click', openWidgetSettings);
  $('#f7pluginEnabled').on('click', handlePluginSwitch);
  showSeveralElementOnClick('input[name=buttonAppearance]', '.settingInt');
  showSeveralElementOnClick('input[name=customImages]', '.settingIntInt');
  showSeveralElementOnClick('input[name=buttonLocation]', '.settingInt');
  showSeveralElementOnClick('#buttonAvailablePages', '.settingInt');
  showSeveralElementOnClick('input[name=optionPages]', '#selectPages');
  createTooltip('.pstooltip-sign', 'f7title');

  /* publick */
  return {
    show,
    setAccount,
    // useCachedCode,
  }

  /* functions */
  function setAccount(newAccount) {
    account = newAccount
  }

  function show() {
    $('#settings-title').slideDown();
    $('.f7control').slideDown();
    // $('#wrapper').slideDown();
    $('#f7submit').slideDown();
    showSpinner();
    
    load(values);

    getRvmParams()
    .done(function() {
      hideSpinner();
      handleRvmParams();
    })
  }

  function load(values) {
    if (values.pluginEnabled) {
      check('#f7pluginEnabled');
      $('#settings-wrapper').fadeIn();
      // $('#f7livePreview').show();
      $("#f7submit").removeClass('f7submit').addClass('enDes');
    }
    if (values.buttonImageType === 'graphic') {
      check('.buttonImageType_graphic')
    } else {
      check('.buttonImageType_text');
      $('#buttonImageTextOnline').val(values.buttonImageTextOnline);
      $('#buttonImageTextOffline').val(values.buttonImageTextOffline);
    }
    if (values.buttonImageSource === 'account') {
      check('.f7button3');
    } else {
      check('.f7button4');
      $('#buttonImageUrlOnline').val(values.buttonImageUrlOnline);
      $('#buttonImageUrlOffline').val(values.buttonImageUrlOffline);
    }
    if (values.buttonLocation) {
      string = 'input[location=' + values.buttonLocation + ']';
      check(string);
      if (values.buttonLocation === 'fixed') {
        $('#buttonLocationVerticalValue').val(values.buttonLocationVerticalValue);
        $('#buttonLocationHorizontalValue').val(values.buttonLocationHorizontalValue);
        if (values.buttonLocationVerticalBy === 'px') {
          check('.f7button5');
        } else {
          check('.f7button6');
        }
        if (values.buttonLocationHorizontalBy === 'px') {
          check('.f7button7');
        } else {
          check('.f7button8');
        }
        if (values.buttonLocationVerticalFrom === 'top') {
          check('.f7button9');
        } else {
          check('.f7button10');
        }
        if (values.buttonLocationHorizontalFrom === 'left') {
          check('.f7button11');
        } else {
          check('.f7button12');
        }
      }
    }
    if (values.buttonAvailableMain) {
      check('#buttonAvailableMain');
    }
    if (values.buttonAvailablePages) {
      check('#buttonAvailablePages');
      if (values.buttonAvailablePagesWhich === 'all') {
        check('.f7button13');
      } else {
        check('.f7button14');
        for (id in values.buttonAvailablePagesList) {
          $('#selectPages').children('input[pageid=' + values.buttonAvailablePagesList[id] + ']').trigger('click');
        }
      }
    }
    if (values.buttonAvailablePosts) {
      check('#buttonAvailablePosts');
    }
    if (values.buttonAvailableOther) {
      check('#buttonAvailableOther');
    }
    if (values.buttonAvailableWhole) {
      check('#buttonAvailableWhole');
    }
    if (!values.pluginEnabled) {
      check('.f7control');
      check('.f7control');
    }
  }

  function submit() {
    values = getSettingsFromPage(values);

    if (!isValid(values)) return false

    showSpinner();
    cacher.saveSettings(values);

    var json = {};
    json.hash = generateRandomString(4);
    json.locale = location.language || 'en';
    json.codeType = 'script';
    json.companyLogin = account.name;
    json.companyPasswordMD5Hash = account.pass;

    /* position */
    if (!values.rvm.isEnabled) {
      json.fixed = values.buttonLocation === 'fixed';
      if (values.buttonLocation === 'fixed') {
        var classicButtonLocation =
          values.buttonLocationHorizontalFrom + ':' + values.buttonLocationHorizontalValue + values.buttonLocationHorizontalBy + ';' +
          values.buttonLocationVerticalFrom + ':' + values.buttonLocationVerticalValue + values.buttonLocationVerticalBy;
        json.customParameters = [{ "name": "classic-button-location", "value": classicButtonLocation }]
      } else if (values.buttonLocation === 'shortcode'){
        json.customParameters = [{ "name": "classic-button-location", "value": "" }]
      }
    }

    if (values.buttonImageType == 'graphic') {
      json.appearance = 'graphics';
      if (values.buttonImageSource == 'custom') {
        json.customImageUrls = {};
        json.customImageUrls.online = values.buttonImageUrlOnline;
        json.customImageUrls.offline = values.buttonImageUrlOffline;
      }
    } else {
      json.appearance = 'text';
      json.chatLinkHtmls = {};
      json.chatLinkHtmls.online = values.buttonImageTextOnline;
      json.chatLinkHtmls.offline = values.buttonImageTextOffline;
    }

    var request = requestCode(json, false)

    var isVisitorMonitor = values.buttonAvailableWhole
    if (isVisitorMonitor) {
      json.appearance = 'hidden';
      requestCode(json, true);
    }

    return request;
  };

  function requestCode(json, isVisitorMonitor) {
    isVisitorMonitor = isVisitorMonitor || false;
    return $.ajax({
      type: 'GET',
      url: getCodeUrl,
      dataType: 'jsonp',
      contentType: "application/json",
      data: {
        jsonParam: JSON.stringify(json)
      },
      async: false,
      success: function(msg) {
        // if (!isVisitorMonitor) {
        //   $('#f7livePreview').html(msg.code);
        // }
        cacher.saveCode(msg.code, isVisitorMonitor);
      }
    });
  }

  function isValid(values) {
    allFields.removeClass('novalid');

    if (values.pluginEnabled === false) return validatorHandler(true)

    var res = true;

    if (values.buttonImageType === 'graphic' && values.buttonImageSource === 'custom') {
      isRequired('#buttonImageUrlOnline');
      isRequired('#buttonImageUrlOffline');
    }
    if (values.buttonImageType === 'text') {
      isRequired('#buttonImageTextOnline');
      isRequired('#buttonImageTextOffline');
    }
    if (values.buttonLocation === 'fixed') {
      isRequired('#buttonLocationVerticalValue');
      isRequired('#buttonLocationHorizontalValue');
    }

    return validatorHandler(res)

    function isRequired(elPath) {
      var el = $(elPath);
      var val = el.val();
      if (val) return

      el.addClass('novalid');
      el.attr('placeholder', 'This field is required!');
      res = false;
    }

    function validatorHandler(isValid) {
      if (isValid) {
        $('#f7submit').removeClass('novalidButton');
      } else {
        $('#f7submit').addClass('novalidButton');
      }
      return isValid
    }
  }

  function createDefaultSettings() {
    return {
      pluginEnabled: false, /* false | true */
      buttonImageType: 'graphic', /* graphic | text */
      buttonImageSource: 'account', /* account | custom */
      buttonImageUrlOnline: false, /* url */
      buttonImageUrlOffline: false, /* url */
      buttonImageTextOnline: false, /* text */
      buttonImageTextOffline: false, /* text */
      buttonLocation: 'fixed', /* widget | fixed | shortcode */
      buttonLocationVerticalBy: 'px', /* px | % */
      buttonLocationVerticalValue: '20', /* value */
      buttonLocationVerticalFrom: 'bottom', /* top | bottom */
      buttonLocationHorizontalBy: 'px', /* px | % */
      buttonLocationHorizontalValue: '20', /* value */
      buttonLocationHorizontalFrom: 'right', /* top | bottom */
      buttonAvailableMain: true, /* true | false */
      buttonAvailablePages: true, /* true | false */
      buttonAvailablePagesWhich: 'all', /* all | selected */
      buttonAvailablePagesList: [], /* array(page id, page id) */
      buttonAvailablePosts: true, /* true | false */
      buttonAvailableOther: false, /* true | false */
      buttonAvailableWhole: false, /* true | false */
      rvm: {
        isEnabled: undefined, /* true | false */
        button: {
          top: undefined,
          right: undefined,
          bottom: undefined,
          left: undefined,
        },
      }
    }
  }

  function getSettingsFromPage(values) {
    values.pluginEnabled = ($('#f7pluginEnabled').prop('checked')) ? true : false;
    values.buttonImageType = ($('#buttonImageType').prop('checked')) ? 'graphic' : 'text';
    values.buttonImageSource = ($('#buttonImageSource').prop('checked')) ? 'account' : 'custom';
    values.buttonImageUrlOnline = $('#buttonImageUrlOnline').val() || false;
    values.buttonImageUrlOffline = $('#buttonImageUrlOffline').val() || false;
    values.buttonImageTextOnline = $('#buttonImageTextOnline').val() || false;
    values.buttonImageTextOffline = $('#buttonImageTextOffline').val() || false;
    $('input[name=buttonLocation]').each(function(index) {
      if ($(this).prop('checked')) {
        values.buttonLocation = $(this).attr('location');
      }
    });
    
    values.buttonLocationVerticalValue = $('#buttonLocationVerticalValue').val() || false;
    values.buttonLocationVerticalBy = ($('#buttonLocationVerticalBy').prop('checked')) ? 'px' : '%';
    values.buttonLocationVerticalFrom = ($('#buttonLocationVerticalFrom').prop('checked')) ? 'top' : 'bottom';
    values.buttonLocationHorizontalValue = $('#buttonLocationHorizontalValue').val() || false;
    values.buttonLocationHorizontalBy = ($('#buttonLocationHorizontalBy').prop('checked')) ? 'px' : '%';
    values.buttonLocationHorizontalFrom = ($('#buttonLocationHorizontalFrom').prop('checked')) ? 'left' : 'right';
    values.buttonAvailablePages = ($('#buttonAvailablePages').prop('checked')) ? true : false;
    values.buttonAvailablePagesWhich = ($('#buttonAvailablePagesWhich').prop('checked')) ? 'all' : 'selected';
    values.buttonAvailablePagesList = [];
    $('#selectPages > input').each(function() {
      currentInput = $(this);
      if (currentInput.prop('checked')) {
        values.buttonAvailablePagesList.push(currentInput.attr('pageid'));
      }
    });
    values.buttonAvailablePosts = ($('#buttonAvailablePosts').prop('checked')) ? true : false;
    values.buttonAvailableOther = ($('#buttonAvailableOther').prop('checked')) ? true : false;
    values.buttonAvailableWhole = ($('#buttonAvailableWhole').prop('checked')) ? true : false;
    values.buttonAvailableMain = ($('#buttonAvailableMain').prop('checked')) ? true : false;
    return values
  }

  function showSpinner() {
    $('#settings-spinner').html(spinnerHtml);
    // $('#f7livePreview').html(spinnerHtml);
  }
  function hideSpinner() {
    $('#settings-spinner').remove();
  }

  function check(elPath) {
    $(elPath).trigger('click');
  }

  function openWidgetSettings() {
    e.preventDefault();
    var submitRes = submit();
    if (submitRes) {
      location = '/wp-admin/widgets.php';
    }
  }

  function handleLocationInputs() {
    if ($('input[location=shortcode]').prop('checked')) {
      depended.hide('fast')
    } else {
      depended.show('fast')
    }
    if ($('input[location=widget]').prop('checked')) {
      $('a[href="/wp-admin/widgets.php"]').show('fast');
    } else {
      $('a[href="/wp-admin/widgets.php"]').hide('fast');
    }
  }

  // function useCachedCode(code) {
  //   // console.warn('code', code);

  //   if (code) {
  //     code = code.replace(/\\"/g, '"');
  //     $('#f7livePreview').html(code);
  //   } else {
  //     submit()
  //   }
  // }

  function getRvmParams() {
    var url = accountApiUrl + '/' + account.name + '/messenger-params' +
      '?method=get&companyLogin=' + account.name +
      '&companyPasswordMD5Hash=' + account.pass +
      '&params=rvm.enabled%2Crvm.button.top%2Crvm.button.left%2Crvm.button.bottom%2Crvm.button.right';

    return $.ajax({
      method: 'GET',
      url,
    }).done(function(res) {
      if (!res || !res.params) return

      values.rvm = {
        isEnabled: res.params['rvm.enabled'] && res.params['rvm.enabled'] === 'true',
        button: {
          top: res.params['rvm.button.top'],
          right: res.params['rvm.button.right'],
          bottom: res.params['rvm.button.bottom'],
          left: res.params['rvm.button.left'],
        },
      }
      cacher.saveSettings(values);
    });
  }

  function handleRvmParams() {
    if (!values.rvm.isEnabled) {
      $('.setting.api-positions').css('display', 'none');
      return
    }

    $('.setting.admin-positions').css('display', 'none');
    // $('#f7livePreview').css('pointer-events', 'none').addClass('modern-version');

    var top = values.rvm.button.top;
    var right = values.rvm.button.right;
    var bottom = values.rvm.button.bottom;
    var left = values.rvm.button.left;

    var vertical = '';
    if (top) {
      vertical = top + ' from top.';
    } else if (bottom) {
      vertical = bottom + ' from bottom.';
    }

    var horisontal = '';
    if (right) {
      horisontal = right + ' from right.';
    } else if (left) {
      right = left + ' from left.';
    }
    
    $('#apiVerticalPosition').append(vertical);
    $('#apiHorisontalPosition').append(horisontal);
  }

  function handlePluginSwitch() {
    var pluginEnabled = $('#f7pluginEnabled').prop('checked')
    if (pluginEnabled) {
      $('#settings-wrapper').slideDown('fast');
      // $('#f7livePreview').show();
    } else {
      $('#settings-wrapper').slideUp('fast');
      // $('#f7livePreview').hide();
    }
  }
}
