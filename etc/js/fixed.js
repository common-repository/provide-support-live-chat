/**
Plugin Name: Provide Support Live Chat
Version: 5.0.0
Author: Provide Support, LLC
Author URI: http://www.providesupport.com?utm_source=wp-plugin&utm_medium=list&utm_campaign=Plugins
**/

var BUTTONTEXT = 'ProvideSupport : chat button code loaded';
var HIDDENTEXT = 'ProvideSupport : hidden monitoring code loaded';
jQuery(document).ready(function() {

    var loaded = typeof(jQuery('#f7widgetBlock').html()) !== 'undefined';
    var rvmEnabled = false;
    var f7s = f7php.settings;

	// Send request only if no code added yet thus adding the code may be required
    if ((!loaded) && (('urlRvmEnabled' in f7php) && f7php.urlRvmEnabled.length)) {
        jQuery.ajax({
            method: "GET",
            url: f7php.urlRvmEnabled + '&params=rvm.enabled',
        }).done(function(res) {
			// Get messenger type
			rvmEnabled = ('rvm.enabled' in res.params) && (res.params['rvm.enabled'] == 'true');

			// Add code for fixed or rvm button
			// Widget and shortcode buttons are added by means of WP
			if ((rvmEnabled) || (f7s.buttonLocation == 'fixed')) {
                launchRender();
            } 

			// Add monitoring code if required and no other code added yet
			// Monitoring code is never required for shortcode
			if (f7s.buttonAvailableWhole + '' == 'true' && !loaded ) {
				showChat(f7php.hiddencode);
			}
        });
    }
	
	function launchRender() {
        if (f7php.page == '1') {
            if (f7s.buttonAvailablePages + '' == 'true') {
                if (f7s.buttonAvailablePagesWhich == 'all') {
                    showChat(f7php.code);
                } else {
                    for (pageid in f7s.buttonAvailablePagesList) {
                        if (f7php.pageid == f7s.buttonAvailablePagesList[pageid]) {
                            showChat(f7php.code);
                        }
                    }
                }
            }
        }
        if (f7s.buttonAvailablePosts + '' == 'true' && f7php.single == '1') {
            showChat(f7php.code);
        }
        if (f7s.buttonAvailableOther + '' == 'true' && f7php.other == '1') {
            showChat(f7php.code);
        }
        if (f7s.buttonAvailableMain + '' == 'true' && f7php.frontpage == '1') {
            showChat(f7php.code);
        }
    }

    showChat = function(code) {
		if (!loaded) {
			code = code || '';
			var codeBlock = document.createElement('div');
			codeBlock.className = 'f7x';
			document.body.appendChild(codeBlock);
			jQuery('.f7x').html(code);
			if (f7s.buttonLocation == 'fixed' && !rvmEnabled) {
				jQuery('.f7x').css(f7s.buttonLocationHorizontalFrom, f7s.buttonLocationHorizontalValue + f7s.buttonLocationHorizontalBy);
				jQuery('.f7x').css(f7s.buttonLocationVerticalFrom, f7s.buttonLocationVerticalValue + f7s.buttonLocationVerticalBy);
			}
			loaded = true;
		}
    }
	
});