/**
Plugin Name: Provide Support Live Chat
Version: 5.0.0
Author: Provide Support, LLC
Author URI: http://www.providesupport.com?utm_source=wp-plugin&utm_medium=list&utm_campaign=Plugins
**/

function PsForm({ CryptoJS, accountApiUrl, spinnerHtml, onLogin, onLogout }) {
/* state */
  var type = 'LOGIN'; /* LOGIN | CREATE_ACCOUNT */

  /* elements */
  var allFields = $('.f7fields > .f7field > input');
  var fields = {
    name: $('.accountName'),
    pass: $('.accountPass'),
    mail: $('.accountMail'),
  }
  var btns = {
    submit: $('#submit-btn'),
    openLogin: $('#open-login-form-btn'),
    openCreateAccount: $('#open-create-account-form-btn'),
  }
  var wrapper = $('#f7account')

  /* listeners */
  btns.submit.on('click', submitForm);
  btns.openCreateAccount.on('click', openLoginForm);
  btns.openLogin.on('click', openCreateAccountForm);

  /* publick */
  return {
    hide: function() { wrapper.slideUp() },
    autoLogin,
    showAccountInfo,
  }

  /* functions */
  function getPass() {
    return fields.pass.val()
  }

  function autoLogin(name, passMD5) {
    fields.name.val(name);
    fields.pass.val(passMD5);
    setTimeout(function() {
      submitForm(undefined, true);
    }, 500);
  }

  function isLogin() { return type === 'LOGIN' }

  function getFieldsValue(isAutoLogin) {
    return {
      name: fields.name.val(),
      pass: isAutoLogin ? fields.pass.val() : CryptoJS.MD5(fields.pass.val()) + '',
      mail: fields.mail.val(),
    }
  }

  function submitForm(event, isAutoLogin) {
    if (!isValid(isAutoLogin ? 32 : 20)) return

    btns.submit.append(spinnerHtml);
    var account = getFieldsValue(isAutoLogin);
    (isLogin()
      ? login(account)
      : createNewAccount(account, getPass())
    ).done(function() {
      $('#accountWait').remove();
    });
  };

  function login(account){
    url = accountApiUrl + '/' + account.name +
      '?companyLogin=' + account.name + '&companyPasswordMD5Hash=' + account.pass;
  
    return $.ajax({
      type: 'GET',
      url: url,
      dataType: 'jsonp',
      data: {},
      async: false,
      success: function(msg) {
        if (msg.error == 'incorrect-password-md5-hash') {
          onError('Incorrect password');
        } else if (msg.errorDescription || msg.error) {
          onError(msg.errorDescription || msg.error);
        } else {
          fireOnLogin(account);
        }
      }
    })
  }
  
  function createNewAccount(account, pass) {
    var accSet = {
      companyLogin: account.name,
      companyPassword: pass,
      email: account.mail,
      caller: 'wordpress-plugin-5.0.0',
      accountSettings: {
        'chatIconOnline': 'round/01-298dd3/chat-icon-round-01-298dd3-online-en.png',
        'chatIconOffline': 'round/01-298dd3/chat-icon-round-01-298dd3-offline-en.png',
      }
    }
    
    return $.ajax({
      url: accountApiUrl + '/?method=post',
      dataType: 'jsonp',
      data: {
        params: JSON.stringify(accSet),
      },
      success: function(msg) {
        if (msg.error == 'duplicate-company-login') {
          onError('Account name "' + account.name + '" is taken', 'warning')
        } else if (msg.result == 'success') {
          fireOnLogin(account, pass);
        } else if (msg.errorDescription || msg.error) {
          onError(msg.errorDescription || msg.error);
        }
      }
    })
  }

  function fireOnLogin(params, pass) {
    $('#f7message').hide();
    showAccountInfo(params, pass)
    onLogin(params)
  }

  function isValid(maxPassLength) {
    allFields.removeClass('novalid');
    var isLog = isLogin();
    var res = true;

    /* name */
    var name = fields.name.val().trim();
    var pattern = new RegExp(/^[-a-z0-9_]{1,20}$/i);
    if (!name || !pattern.test(name)) {
      onErr(fields.name, 'The account name should contain no more than 20 alphanumeric characters (Latin letters or digits), \'-\' (dashes), or \'_\' (underscore) characters. Spaces are not allowed.');
    }

    /* pass */
    var pass = fields.pass.val().trim();
    if (!pass) {
      onErr(fields.pass, 'Password is required!');
    } else if (pass.length < (isLog ? 1 : 5)) {
      onErr(fields.pass, 'The account password must be at least ' + (isLog ? 1 : 5) + ' characters long.');
    } else if (pass.length > (isLog ? maxPassLength : 20)) {
      onErr(fields.pass, 'The account password should contain no more than 20 characters.');
    }

    /* mail */
    if (!isLog) {
      var mail = fields.mail.val().trim();
      pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
      if (!mail || !pattern.test(mail)) {
        onErr(fields.mail, 'Invalid email.');
      }
    }
    
    return res

    function onErr(el, errStr) {
      onError(errStr);
      el.addClass('novalid');
      el.attr('placeholder', 'This field is required!');
      res = false;
    }
  }

  function showAccountInfo(account, pass) {
    accountInfo = '<span class="f7accountInfospan">Connected to account : <b> ' + account.name + '</b></span>';
    if (isLogin()) {
      accountInfo += '<div id="f7oldaccountDetails">To go online and start answering chat requests, please install the <a target="_blank" href = "https://www.providesupport.com/live-chat-apps?utm_source=wp-plugin&utm_medium=settings&utm_campaign=Plugins" style="text-decoration: none">Operator Console</a> ';
      accountInfo += 'and login with the credentials available on your account <a target="_blank" href="https://admin.providesupport.com/view/my-account/operators-and-departments?utm_source=wp-plugin&utm_medium=settings&utm_campaign=Plugins" style="text-decoration: none">Operators and Departments</a> page.';
      accountInfo += '<br />To customize your live chat appearance, please use available settings in your account <a target="_blank" href = "https://admin.providesupport.com/view/my-account/dashboard?utm_source=wp-plugin&utm_medium=settings&utm_campaign=Plugins" style="text-decoration: none">Control Panel</a>.';
      accountInfo += '</div>';
    } else {
      accountInfo += '<br /><br /><div id="f7newaccountDetails">To start using the live chat service and appear online please install the <a target="_blank" href = "https://www.providesupport.com/live-chat-apps?utm_source=wp-plugin&utm_medium=settings&utm_campaign=Plugins" style="text-decoration: none">Operator Console</a> ';
      accountInfo += 'and login with the following credentials:';
      accountInfo += '<br /><br />Account Name: <b>' + account.name + '</b>';
      accountInfo += '<br />Operator Login: <b>operator1</b>';
      accountInfo += '<br />Operator Password: <b>password1</b>';
      accountInfo += '<br /><br />To customize your live chat appearance and configure other settings, please use your account <a target="_blank" href = "https://admin.providesupport.com/action/main/company/company-login?login=' + account.name + '&password=' + pass + '" style="text-decoration: none">Control Panel</a>.';
      accountInfo += '</div>';
    }
    accountInfo += '<br /><div id="f7anotherAccount" class="button button-primary button-large" style="margin:5px auto;width:320px;">Connect to another Provide Support account</div>';
    $('#f7accountInfo').html(accountInfo);
    $('#f7anotherAccount').on('click', onLogout);
  }

  function openLoginForm() {
    $('.f7field input').removeClass('novalid').attr('placeholder', '');
    btns.openLogin.removeClass('borderlessBtn');
    $(this).addClass('borderlessBtn');
    $('.f7fields').eq(2).slideUp();
    btns.submit.html('Connect to Account');
    type = 'LOGIN';
  }
  function openCreateAccountForm() {
    $('.f7field input').removeClass('novalid').attr('placeholder', '');
    btns.openCreateAccount.removeClass('borderlessBtn');
    $(this).addClass('borderlessBtn');
    $('.f7fields').eq(2).slideDown();
    btns.submit.html('Create Account and Connect');
    type = 'CREATE_ACCOUNT';
  }

  function onError(message) {
    $('#f7message').show(message);
    $('#f7message').html(message);
    $('#f7message').addClass('f7warning');
  }
}
