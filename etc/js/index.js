/**
Plugin Name: Provide Support Live Chat
Version: 5.0.0
Author: Provide Support, LLC
Author URI: http://www.providesupport.com?utm_source=wp-plugin&utm_medium=list&utm_campaign=Plugins
**/

/* global f7php CryptoJS */

$ = jQuery.noConflict();

$(document).ready(function($) {
  /* CONSTANTS *********************************************************************************************************/
  var URLS = {
    API: 'https://api.providesupport.com/api',
    WAIT: f7php.pluginsFolder + '/etc/img/provide-support_loader.gif',
  };
  URLS.GET_CODE_API = URLS.API + '/chat-button/v2/get-code';
  URLS.ACCOUNT_API = URLS.API + '/account/v1/companies';

  /* MAIN LOGIC ********************************************************************************************************/
  var cacher = new Cacher({
    secret: f7php.secret,
    ajaxurl: f7php.ajaxurl,
  });

  var form = new PsForm({
    CryptoJS,
    accountApiUrl: URLS.ACCOUNT_API,
    spinnerHtml: getSpinnerHtml(URLS.WAIT, 'accountWait', 'position:absolute;top:2px;right:70px'),
    onLogin,
    onLogout,
  });

  var settings = new PsSettings({
    values: f7php.settings,
    accountApiUrl: URLS.ACCOUNT_API,
    getCodeUrl: URLS.GET_CODE_API,
    cacher,
    spinnerHtml: getSpinnerHtml(URLS.WAIT),
  });

  var isAutoLogin = f7php.accountName != '' && f7php.accountHash != '';
  if (isAutoLogin) form.autoLogin(f7php.accountName, f7php.accountHash);

  function onLogin(account) {
    form.hide();
    settings.setAccount(account);
    settings.show();
    // settings.useCachedCode(f7php.code || f7php.hiddencode)
    cacher.saveAccount(account);
  }

  function onLogout() {
    cacher.forgetAll()
    .done(function() {
      location.reload();
    })
  }
});
