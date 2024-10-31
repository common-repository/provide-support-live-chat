<?php
/**
Plugin Name: Provide Support Live Chat
Description: This plugin allows adding Provide Support Live Chat button or text link to your website. It can be added as a widget to your website sidebar, or placed to a fixed position on your browser window, or added directly to your posts or pages with help of shortcode.
Version: 5.0.0
Author: Provide Support, LLC
Author URI: http://www.providesupport.com?utm_source=wp-plugin&utm_medium=list&utm_campaign=Plugins
 **/

update_option('ProvideSupport plugin version', '5.0.0');
class f7config
{
    public static $UCNAME       = 'Provide Support Live Chat';
    public static $PLUGINFOLDER = 'provide-support-live-chat';
    public static $SHORTCODE    = 'providesupport';
}

// Adding Settings item to Plugins list - start
$live_chat_plugin_file = 'provide-support-live-chat/plugin.php';
add_filter("plugin_action_links_{$live_chat_plugin_file}", 'live_chat_plugin_action_links', 10, 2);

function live_chat_plugin_action_links($links, $file)
{
    $settings_link = '<a href="' . admin_url('admin.php?page=provide-support-live-chat/plugin.php') . '">' . __('Settings', 'provide-support-live-chat') . '</a>';
    array_unshift($links, $settings_link);

    return $links;
}

// Adding Settings item to Plugins list - end
$themeFolder = get_bloginfo('template_url');
$f7s         = json_decode(get_option('f7settings'));
$f7c         = stripslashes(get_option('f7code'));

$account_name = get_option('f7accountName');
$account_hash = substr(get_option('f7accountHash'), 2);
$urlRvmEnabled = '';
if( strlen( $account_name ) && strlen( $account_hash )) {
    $urlRvmEnabled = 'https://api.providesupport.com/api/account/v1/companies/' . $account_name;
    $urlRvmEnabled .= '/messenger-params?method=get&companyLogin=' . $account_name;
    $urlRvmEnabled .= '&companyPasswordMD5Hash=' . $account_hash;
}

function encJquery()
{
    wp_enqueue_script('jquery');
}

function encFixed()
{
    global $post;
    global $urlRvmEnabled;

    if (!$post || !$post->ID) {
        return;
    }

    $f7other = (is_category() || is_search() || is_tax() || is_archive() || is_attachment()) ? '1' : '0';

    $data = array(
        'code'          => stripslashes(get_option('f7code')),
        'hiddencode'    => stripslashes(get_option('f7hiddencode')),
        'settings'      => json_decode(stripslashes(get_option('f7settings'))),
        'url'           => $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'],
        'single'        => (is_single()) ? true : false,
        'page'          => (is_page()) ? true : false,
        'frontpage'     => (is_front_page() || is_home()) ? true : false,
        'pageid'        => $post->ID,
        'other'         => $f7other,
        'posttype'      => get_post_type($post->ID),
        'urlRvmEnabled' => $urlRvmEnabled,
    );
    wp_enqueue_script('f7fixed', plugins_url() . '/' . f7config::$PLUGINFOLDER . '/etc/js/fixed.js', array('jquery'), '', true);
    wp_enqueue_style('style_provide', plugins_url() . '/' . f7config::$PLUGINFOLDER . '/etc/css/f7style.css');
    wp_localize_script('f7fixed', 'f7php', $data);
}
function loadFixed()
{
    if (!is_admin()) {add_action('wp_enqueue_scripts', 'encFixed');}
}

add_action('wp_enqueue_scripts', 'encjQuery');
add_action('admin_enqueue_scripts', 'encjQuery');

register_deactivation_hook(__FILE__, 'chatDeactivation');
function chatDeactivation()
{
    delete_option('f7accountName');
    delete_option('f7accountHash');
    delete_option('f7settings');
    delete_option('f7code');
    delete_option('f7hiddencode');
}

// echo('<script>console.warn("PHP '.phpversion().'")</script>');

if (isset($f7s)) {
    if ($f7s->pluginEnabled) {
        if ($f7s->buttonLocation != 'shortcode') {
            add_action('wp', 'loadFixed');
        }
        if ($f7s->buttonLocation == 'fixed') {
//            add_action('wp','loadFixed');
        }
        if ($f7s->buttonLocation == 'widget') {

//            add_action('wp','loadFixed');
            class provideSupportWidget extends WP_Widget {
                function __construct() {
                    parent::__construct(false, 'Provide Support Widget', array('description' => 'Please be advised, Live Chat widget should be added only once'));
                }
                function widget($args, $instance) {

                    $f7c = "";
                    $f7c .= $args["before_widget"];
                    if (isset($instance["title"])) {

                        $f7c .= $args['before_title'];
                        $f7c .= apply_filters('widget_title', $instance["title"]);
                        $f7c .= $args['after_title'];
                    }
                    if (isset($instance["shortcode"]) && !empty($instance["shortcode"])) {
                        $f7c .= do_shortcode("[provideSupport id='" . $instance["providesupport"] . "']");
                    }
                    $f7c .= $args["after_widget"];
                    echo $f7c;
                    fwidget($instance);
                }
                function update($new_instance, $old_instance) {
                    return $new_instance;
                }
                function form($instance) {
                    global $f7c;
                    echo '<script type="text/javascript">jQuery(".f7r").on("click",function(){jQuery(".f7r").not(jQuery(this)).prop("checked",false);});</script>';
                    $title     = isset($instance['title']) ? $instance['title'] : 'New Title';
                    $style     = ' style="width:100%;" ';
                    $f7checked = ' checked="checked" ';
                    if (!isset($instance['aligment_left'])) {$instance['aligment_left'] = '';}
                    if (!isset($instance['aligment_right'])) {$instance['aligment_right'] = '';}
                    if (!isset($instance['aligment_center'])) {$instance['aligment_center'] = '';}
                    $aligmentLeft   = ($instance['aligment_left'] != '') ? $f7checked : '';
                    $aligmentCenter = ($instance['aligment_center'] != '') ? $f7checked : '';
                    $aligmentRight  = ($instance['aligment_right'] != '') ? $f7checked : '';
                    if ($aligmentLeft == '' && $aligmentCenter == '' && $aligmentRight == '') {
                        $aligmentCenter = $f7checked;
                    }
                    if ($aligmentLeft != '') {
                        $aligment = 'left';
                    } elseif ($aligmentCenter != '') {
                        $aligment = 'center';
                    } elseif ($aligmentRight != '') {
                        $aligment = 'right';
                    }

                    echo 'Title:<input type="text" class="f7w" id="' . $this->get_field_id('title') . '" name ="' . $this->get_field_name('title') . '" value="' . esc_attr($title) . '"' . $style . '>';
                    echo '<p style="margin:0;padding:0;margin-top:6px;margin-bottom:6px;">Chat button alignment:</p>';
                    echo '<input class="f7r"' . $aligmentLeft . 'type="radio" name="' . $this->get_field_name('aligment_left') . '">Left';
                    echo '<input style="margin-left:55px !important" class="f7r"' . $aligmentCenter . 'type="radio" name="' . $this->get_field_name('aligment_center') . '">Center';
                    echo '<input style="margin-left:35px !important" class="f7r"' . $aligmentRight . 'type="radio" name="' . $this->get_field_name('aligment_right') . '">Right<br /><br />';
                    //echo var_dump(get_option($this->option_name));
                }
            }
            function myWidgets() { register_widget('provideSupportWidget'); }
            add_action('widgets_init', 'myWidgets');
        } /* /widget */
        
        if ($f7s->buttonLocation == 'shortcode') {
            add_shortcode(f7config::$SHORTCODE, 'fshortcode');
        }
    }
}

add_action('admin_menu', 'adminMenuInit');
function fshortcode()
{
    global $f7c;
    return $f7c;
}
function ffwidget($aligment, $inst)
{
    global $f7c;
    echo '<section id="f7widgetBlock" class="widget" style="text-align:' . $aligment . '">' . $f7c . '</section>';

}
function fwidget($inst)
{
    global $f7s;
    $f7showed = false;
    if (!isset($inst['aligment_left'])) {$inst['aligment_left'] = '';}
    if (!isset($inst['aligment_right'])) {$inst['aligment_right'] = '';}
    if (!isset($inst['aligment_center'])) {$inst['aligment_center'] = '';}
    if (!isset($showed)) {$showed = '';}
    if ($inst['aligment_left'] != '') {
        $aligment = 'left';
    }

    if ($inst['aligment_center'] != '') {
        $aligment = 'center';
    }

    if ($inst['aligment_right'] != '') {
        $aligment = 'right';
    }

    if ($f7s->buttonAvailableMain && (is_front_page() || is_home()) && !$f7showed) {
        ffwidget($aligment, $inst);
        $f7showed = true;}
    if ($f7s->buttonAvailablePosts && is_single() && !$f7showed) {
        ffwidget($aligment, $inst);
        $f7showed = true;}
    if ($f7s->buttonAvailablePages && is_page() && !$showed) {
        if ($f7s->buttonAvailablePagesWhich == 'all' && !$f7showed) {
            ffwidget($aligment, $inst);
            $f7showed = true;
        } else {
            if ($f7s->buttonAvailablePagesWhich == 'selected' && !$f7showed) {
                foreach ($f7s->buttonAvailablePagesList as $f7pageid) {
                    global $post;
                    if ($f7pageid == $post->ID) {
                        ffwidget($aligment, $inst);
                        $f7showed = true;}
                }
            }
        }
    }
    if ($f7s->buttonAvailableOther && !$f7showed && (is_category() || is_search() || is_tax() || is_archive() || is_attachment())) {
        ffwidget($aligment, $inst);
        $f7showed = true;
    }
}
function custom_option_tree_admin_scripts($hook)
{
    if ('toplevel_page_provide-support-live-chat/plugin' == $hook) {
        wp_enqueue_script('cryptoMD5', plugins_url() . '/' . f7config::$PLUGINFOLDER . '/etc/js/libs/md5.js');
        wp_enqueue_script('_utils', plugins_url() . '/' . f7config::$PLUGINFOLDER . '/etc/js/libs/utils.js');
        wp_enqueue_script('Cacher', plugins_url() . '/' . f7config::$PLUGINFOLDER . '/etc/js/libs/Cacher.js');
        wp_enqueue_script('PsForm', plugins_url() . '/' . f7config::$PLUGINFOLDER . '/etc/js/PsForm.js');
        wp_enqueue_script('PsSettings', plugins_url() . '/' . f7config::$PLUGINFOLDER . '/etc/js/PsSettings.js');
        wp_enqueue_script('chatXscript', plugins_url() . '/' . f7config::$PLUGINFOLDER . '/etc/js/index.js');
    }
}
add_action('admin_enqueue_scripts', 'custom_option_tree_admin_scripts');

function f7adminScript()
{
    global $urlRvmEnabled;
    $accountName = get_option('f7accountName');
    $accountHash = get_option('f7accountHash');
    $accountHash = substr($accountHash, 2);
    $data        = array(
        'ajaxurl'       => admin_url('admin-ajax.php'),
        'secret'        => wp_create_nonce('$P^RoV%@'), //my
        'settings'      => json_decode(get_option('f7settings')),
        'pluginsFolder' => plugins_url() . '/' . f7config::$PLUGINFOLDER,
        'accountName'   => $accountName,
        'accountHash'   => $accountHash,
        'code'          => get_option('f7code'),
        'hiddencode'    => get_option('f7hiddencode'),
    );
    wp_localize_script('chatXscript', 'f7php', $data);
    wp_enqueue_style('f7less', plugins_url() . '/' . f7config::$PLUGINFOLDER . '/etc/css/f7style.css');
}

function adminMenuInit()
{
    add_action('admin_enqueue_scripts', 'f7adminScript');
    add_menu_page(f7config::$UCNAME, f7config::$UCNAME, "manage_options", __FILE__, 'chatControl', plugins_url() . '/' . f7config::$PLUGINFOLDER . "/etc/img/wp_ps_icon.png");
}

if (version_compare(phpversion(), '5.6', '>=')) {

    function chatControl()
    {
        global $wp_scripts;
        global $f7s;

        $div = '';
        $div .= '<div id="f7main">';
        $div .= '<div id="f7title">';
        $div .= '<div id="support_logo"><img src="' . plugins_url('/etc/img/provide-support_logo.png', __FILE__) . '" > </div>';
        $div .= 'Welcome to Provide Support Live Chat plugin settings page.<br/>Visit our website <a href="https://www.providesupport.com?utm_source=wp-plugin&utm_medium=settings&utm_campaign=Plugins" target="_blank">www.providesupport.com</a> to find more information about our Live Chat system.';
        $div .= '</div>';
        $div .= '<div id="f7message">';
        $div .= '';
        $div .= '</div>';
        $div .= '<div id="f7accountInfo"></div>';
        $div .= '<div id="f7account">';
        $div .= '<div id="open-create-account-form-btn" class="borderlessBtn">Existing Account</div>';
        $div .= '<div id="open-login-form-btn">New Account</div>';
        $div .= '<div id="f7accountE">';
        $div .= '<div class="f7fields">';
        $div .= '<div class="f7label">';
        $div .= 'Your Provide Support account name:';
        $div .= '</div>';
        $div .= '<div class="f7field">';
        $div .= '<input type="text" class="accountName">';
        $div .= '</div>';
        $div .= '</div>';
        $div .= '<div class="f7fields">';
        $div .= '<div class="f7label">';
        $div .= 'Your Provide Support account password:';
        $div .= '</div>';
        $div .= '<div class="f7field">';
        $div .= '<input type="password" class="accountPass">';
        $div .= '</div>';
        $div .= '</div>';
        $div .= '<div class="f7fields" style="display:none">';
        $div .= '<div class="f7label">';
        $div .= 'Your email:';
        $div .= '</div>';
        $div .= '<div class="f7field">';
        $div .= '<input type="email" class="accountMail">';
        $div .= '</div>';
        $div .= '</div>';
        $div .= '<div class="f7fields">';
        $div .= '<div class="f7field">';
        $div .= '<div id="submit-btn" class="button button-primary button-large">Connect to Account</div>';
        $div .= '</div>';
        $div .= '</div>';
        $div .= '</div>';
        $div .= '</div>';

        $div .= '<div id="settings-title" style="display:none">Live Chat plugin settings</div>';

        $div .= '<div class="setting f7control" style="display:none">';
        $div .= '<input type="checkbox" id="f7pluginEnabled" class="f7pluginEnabled">Enable Live Chat plugin';
        $div .= '</div>';

        // $div .= '<div id="wrapper" style="display:none">';
        // $div .= '<div id="wrapper_img">';
        // $div .= '<div id="f7monitor">';
        // $div .= '<div id="kant" style="pointer-events: none">';
        // $div .= '<div id="f7livePreview" style="display:none"></div>';
        // $div .= '</div>';
        // $div .= '</div>';
        // $div .= '<div id="f7previewText">This example displays your live chat button image<br/>but does not reflect its actual position on your website page</div>';
        // $div .= '</div>';
        // $div .= '</div>';

        $div .= '<div id="settings-spinner" style="margin:4px auto;width:33px;"></div>';

        $div .= '<div id="settings-wrapper" style="display:none">';
        $div .= '<div id="wrapper_settings">';
        $div .= '<div class="f7separator"><div class="f7inner">Select chat button type</div></div>';
        $div .= '<div class="setting">';
        $div .= '<input type="radio" name="buttonAppearance" id="buttonImageType" class="buttonImageType_graphic">Graphics chat button';
        $div .= '<div class="settingInt" style="display:none">';
        $div .= '<input type="radio" name="customImages" id="buttonImageSource" class="f7button3">Use images selected in your account setings <span f7title="Images uploaded to Account Settings / Images page of your Provide Support account Control Panel will be used" class="pstooltip-sign">?</span>';
        $div .= '<div class="settingIntInt" style="display:none; font-size: 11px; color: #888;">';
        $div .= '';
        $div .= '</div>';
        $div .= '</div>';
        $div .= '<div class="settingInt">';
        $div .= '<input type="radio" name="customImages" class="f7button4">Use custom images <span f7title="You can specify here actual links to images stored on your server. If you use your Live Chat account on several websites, this feature lets you display your custom chat icons, different from the ones uploaded to your Provide Support account" class="pstooltip-sign">?</span>';
        $div .= '<div class="settingIntInt">';
        $div .= 'Online image URL <input type="text" id="buttonImageUrlOnline">';
        $div .= '</div>';
        $div .= '<div class="settingIntInt">';
        $div .= 'Offline image URL <input type="text" id="buttonImageUrlOffline">';
        $div .= '</div>';
        $div .= '</div>';
        $div .= '</div>';
        $div .= '<div class="setting">';
        $div .= '<input type="radio" class="buttonImageType_text" name="buttonAppearance">Text chat link <span f7title="HTML formatting is supported for Chat Link texts" class="pstooltip-sign">?</span>';
        $div .= '<div class="settingInt"  style="display:none">';
        $div .= 'Online Chat Link text <input type="text" id="buttonImageTextOnline">';
        $div .= '</div>';
        $div .= '<div class="settingInt">';
        $div .= 'Offline Chat Link text <input type="text" id="buttonImageTextOffline">';
        $div .= '</div>';
        $div .= '</div>';
        $div .= '<div class="f7separator"><div class="f7inner">Chat button position</div></div>';
        $div .= '<div class="setting admin-positions">';
            $disDisabled = '';
            if (!is_dynamic_sidebar() || ($f7s && $f7s->buttonLocation != 'widget')) {
                $disDisabled = ' disabled="disabled" ';
            }
            $site_url = get_site_url();
            $div .= '<input type="radio" location="widget" name="buttonLocation"' . $disDisabled . '>Show Chat Button as a widget <a target="_blank" href="/wp-admin/widgets.php" style="display:none">Open widget settings</a> <span f7title="Chat button positioning as a widget is not available anymore. It may work if you had it enabled previously but cannot be chosen anymore. Instead you can choose \'By shortcode\' positioning, use \'Shortcode\' widget offered by WordPress and add there [providesupport] shortcode." class="pstooltip-sign">?</span>';
            $div .= '<div class="settingInt" style="display:none; font-size:11px; color:#888; line-height:13px;">';
            $div .= '';
            $div .= '</div>';
        $div .= '</div>';
        $div .= '<div class="setting admin-positions">';
            $div .= '<input type="radio" location="fixed" name="buttonLocation">Show Сhat Button at a fixed position on the browser window <span f7title="Specify vertical and horizontal position in pixels or percent for your Chat Button" class="pstooltip-sign">?</span>';
            $div .= '<div class="settingInt" style="display:none; font-size: 11px; color: #888;">';
            $div .= '';
            $div .= '</div>';
            $div .= '<div class="settingInt" style="padding-top: 0px; margin-bottom: 10px;">';
            $div .= '<div class="f7part1">';
            $div .= 'Vertical';
            $div .= '</div>';
            $div .= '<div class="f7part2">';
            $div .= '<input type="text" id="buttonLocationVerticalValue" value=50>';
            $div .= '</div>';
            $div .= '<div class="f7part3">';
            $div .= '<input type="radio" class="f7button5" name="specVerticalPx" id="buttonLocationVerticalBy">px';
            $div .= '<br />';
            $div .= '<input type="radio" class="f7button6" name="specVerticalPx" checked>%';
            $div .= '</div>';
            $div .= '<div class="f7part4">';
            $div .= '<input type="radio" class="f7button9" name="specVerticalFrom" id="buttonLocationVerticalFrom">from top';
            $div .= '<br />';
            $div .= '<input type="radio" class="f7button10" name="specVerticalFrom" checked>from bottom';
            $div .= '</div>';
            $div .= '</div>';
            $div .= '<div class="settingInt" style=" padding-top: 0px; ">';
            $div .= '<div class="f7part1">';
            $div .= 'Horizontal';
            $div .= '</div>';
            $div .= '<div class="f7part2">';
            $div .= '<input type="text" id="buttonLocationHorizontalValue" value=0>';
            $div .= '</div>';
            $div .= '<div class="f7part3">';
            $div .= '<input type="radio" class="f7button7" name="specHorizontalPx" id="buttonLocationHorizontalBy">px';
            $div .= '<br />';
            $div .= '<input type="radio" class="f7button8" name="specHorizontalPx" checked>%';
            $div .= '</div>';
            $div .= '<div class="f7part4">';
            $div .= '<input type="radio" class="f7button11" name="specHorizontalFrom" id="buttonLocationHorizontalFrom">from left';
            $div .= '<br />';
            $div .= '<input type="radio" class="f7button12" name="specHorizontalFrom" checked>from right';
            $div .= '</div>';
            $div .= '</div>';
        $div .= '</div>';
        $div .= '<div class="setting admin-positions">';
            $div .= '<input type="radio" location="shortcode" name="buttonLocation">By shortcode (for advanced users) <span f7title="Add <b>[' . f7config::$SHORTCODE . ']</b> shortcode to your posts or pages, or <b>echo do_shortcode(\'[' . f7config::$SHORTCODE . ']\')</b> to your website source code. The Chat Button uploaded to your Provide Support account Control Panel will be displayed in the posts or pages where the shortcode has been inserted." class="pstooltip-sign">?</span>';
            $div .= '<div class="settingInt" style="font-size:11px; color:#888;">';
            $div .= '';
            $div .= '</div>';
        $div .= '</div>';
        $div .= '<div class="setting api-positions">';
            $div .= 'Chat button position and live chat window appearance and behavior can be updated from your Provide Support account <a href="https://admin.providesupport.com/view/my-account/company/update/messenger/update-company-messenger-form?utm_source=wp-plugin&utm_medium=settings&utm_campaign=Plugins" target="_blank">Control Panel</a>.';
        $div .= '</div>';
        $div .= '<div class="setting api-positions">';
            $div .= 'Currently chat button is fixed in the following position:';
        $div .= '</div>';
        $div .= '<div id="apiHorisontalPosition" class="setting api-positions">';
            $div .= 'Horizontal position: ';
        $div .= '</div>';
        $div .= '<div id="apiVerticalPosition" class="setting api-positions">';
            $div .= 'Vertical position: ';
        $div .= '</div>';
        $div .= '<div class="f7separator"><div class="f7inner shortcodeSeparator">Display chat button at</div></div>';
        $div .= '<div class="setting">';
        $div .= '<input type="checkbox" id="buttonAvailableMain">Main page';
        $div .= '</div>';
        $div .= '<div class="setting selectPagesToggle">';
        $div .= '<input type="checkbox" id="buttonAvailablePages">Pages';
        $div .= '<div class="settingInt" style="display:none">';
        $div .= '<input type="radio" class="f7button13" name="optionPages" id="buttonAvailablePagesWhich">All';
        $div .= '</div>';
        $div .= '<div class="settingInt">';
        $div .= '<input type="radio" class="f7button14" name="optionPages">Selected';
        $f7pages = get_pages();
        if (count($f7pages) > 0) {
            $div .= '<div id="selectPages" style="display:none">';
            foreach ($f7pages as $f7page) {
                $div .= '<input type="checkbox" pageid="' . $f7page->ID . '">' . $f7page->post_title . '<br />';
            }
            $div .= '</div>';
        }

        $div .= '</div>';
        $div .= '</div>';
        $div .= '<div class="setting">';
        $div .= '<input type="checkbox" id="buttonAvailablePosts">Posts';
        $div .= '</div>';
        $div .= '<div class="setting">';
        $div .= '<input type="checkbox" id="buttonAvailableOther">Other pages';
        $div .= '</div>';
        $div .= '<div class="setting">';
        $div .= '<input type="checkbox" id="buttonAvailableWhole">Monitor the whole website <span f7title="Use this option to ensure that all pages of your website are monitored even if the Chat Button has not been added to them" class="pstooltip-sign">?</span>';
        $div .= '<div class="settingInt" style="font-size: 11px; color: #888;">';
        $div .= '';
        $div .= '</div>';
        $div .= '</div>';
        $div .= '</div>';

        $div .= '</div>';
        $div .= '<div id="f7submit" class="button button-primary button-large f7submit" style="display:none">Update Settings</div>';
        $div .= '</div>';
        echo $div;
    }

    add_action('wp_ajax_setsettings', 'setSettings');
    add_action('wp_ajax_setcode', 'setCode');
    add_action('wp_ajax_setaccount', 'setAccount');

    function getVarPost($var = '') {
        return isset($_POST[$var]) && !empty($_POST[$var]);
    }

    function setAccount() {
        check_ajax_referer('$P^RoV%@', 'secret');
        update_option('f7accountName', stripslashes($_POST['accountName']));
        update_option('f7accountHash', 'K9' . stripslashes($_POST['accountHash']));
        exit;
    }

    function setSettings() {
        check_ajax_referer('$P^RoV%@', 'secret');
        $settings = json_decode(stripslashes($_POST['settings']), true);
        update_option('f7settings', json_encode($settings));
        var_dump(json_decode(get_option('f7settings')));
        exit;
    }

    function setCode() {
        check_ajax_referer('$P^RoV%@', 'secret');
        if (getVarPost('type')) {
            if ($_POST['type'] == 'true') {
                update_option('f7hiddencode', $_POST['value']);
                echo get_option('f7hiddencode');
            } else {
                update_option('f7code', $_POST['value']);
                echo get_option('f7code');
            }
            exit;
        }
    }

    function get_js_scripts() {
        global $wp_scripts;
        $js_src = '';
        if ($wp_scripts) {
            foreach ($wp_scripts->queue as $handle):
                $js_src .= $handle . '.js | ';
            endforeach;

            foreach ($wp_scripts->registered as $registered) {
                $js_src .= $registered->src . ' | ';
            }

            $jsFile = array('script' => $js_src);

            if (get_option('f7jsFile')) {
                update_option('f7jsFile', $jsFile);
            } else {
                add_option('f7jsFile', $jsFile);
            }
        }
    }

    add_action('wp_print_scripts', 'get_js_scripts');
} else {
    function chatControl()
    {
        $err_div = '';
        $err_div .= '<div id="err_title" style="background:#FFA8AD">';
        $err_div .= 'Server PHP version is: ' . phpversion();
        $err_div .= '</div>';
        $err_div .= '<div id="err_message">Unfortunately you can\'t run the plugin.<br/>You need to use PHP version 5.6.x or higher.</div>';
        echo $err_div;
    }
}

// Adding ability to use the plugin as a shortcode in the sidebar
add_filter('widget_text', 'do_shortcode');
