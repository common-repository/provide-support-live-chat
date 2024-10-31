/**
Plugin Name: Provide Support Live Chat
Version: 5.0.0
Author: Provide Support, LLC
Author URI: http://www.providesupport.com?utm_source=wp-plugin&utm_medium=list&utm_campaign=Plugins
**/

function Cacher({ secret, ajaxurl }) {
  /* publick */
  return {
    saveCode,
    saveAccount,
    saveSettings,
    forgetAll,
  }

  /* functions */
  function saveCode(value, isVisitorMonitor) {
    return ajaxSend({
      action: 'setcode',
      type: !!isVisitorMonitor,
      value: value || false
    });
  }

  function saveAccount(account) {
    return ajaxSend({
      action: 'setaccount',
      accountName: account.name,
      accountHash: account.pass
    });
  }

  function saveSettings(settings) {
    return ajaxSend({
      action: 'setsettings',
      settings: JSON.stringify(settings)
    });
  }

  function forgetAll() {
    ajaxSend({
      action: 'setaccount',
      accountName: '',
      accountHash: ''
    });

    ajaxSend({
      action: 'setsettings',
      settings: ''
    });

    ajaxSend({
      action: 'setcode',
      type: true,
      value: ''
    });

    return ajaxSend({
      action: 'setcode',
      type: false,
      value: ''
    });
  }

  function ajaxSend(ajaxData) {
    ajaxData.secret = secret;
    return $.ajax({
      url: ajaxurl,
      type: 'POST',
      data: ajaxData
    })
  }
}
