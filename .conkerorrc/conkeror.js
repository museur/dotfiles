var start_time = Date.now();
homepage = "www.google.com";
//set_user_agent("browsindahouse");
url_remoting_fn = load_url_in_new_buffer;
download_buffer_automatic_open_target = OPEN_NEW_BUFFER_BACKGROUND;
cwd = get_home_directory();
cwd.append("Downloads");
external_content_handlers.set("application/pdf", "green");
external_content_handlers.set("video/*", "urxvt -e p");
external_content_handlers.set("application/x-bittorrent", "transmission-gtk");
content_handlers.set("application/x-bittorrent", content_handler_open_default_viewer);
editor_shell_command = "urxvt -e nano";
view_source_use_external_editor = true;
user_pref("browser.download.manager.closeWhenDone", true);
user_pref("extensions.checkCompatibility", false);
session_pref('general.smoothScroll', true);
user_pref("extensions.checkUpdateSecurity", true);
session_pref('browser.history_expire_days', 5);
session_pref("xpinstall.whitelist.required", false);
session_pref("browser.formfill.enable", false);
xkcd_add_title = true;
read_buffer_show_icons = false;
active_hint_background_color = "transparent";
active_img_hint_background_color = "transparent";
hint_background_color = "transparent";
img_hint_background_color = "transparent";
minibuffer_auto_complete_default = true;
add_hook("mode_line_hook", mode_line_adder(buffer_count_widget), true);
add_hook("mode_line_hook", mode_line_adder(downloads_status_widget));
remove_hook("mode_line_hook", mode_line_adder(clock_widget));
session_pref("browser.display.background_color", "#D9D0C5");
url_completion_use_history = true;
read_url_handler_list = [read_url_make_default_webjump_handler("google")];
session_pref("browser.formfill.enable", false);
set_protocol_handler("magnet", find_file_in_path("transmission-gtk"));
define_key(content_buffer_normal_keymap, "f1", "find-url-new-buffer");
define_key(content_buffer_normal_keymap, "k", "kill-current-buffer");
define_key(content_buffer_normal_keymap, "f3", "follow-new-buffer");
define_key(content_buffer_normal_keymap, "f2", "follow-new-buffer-background");
define_key(content_buffer_normal_keymap, "C-p", "paste-x-primary-selection");
define_webjump("trans", "http://translate.google.com/translate_t#auto|en|%s");
define_key(content_buffer_normal_keymap, "f10", "buffer-next");
define_key(content_buffer_normal_keymap, "f9", "buffer-previous");
define_key(content_buffer_normal_keymap, "f8", "forward");
define_key(content_buffer_normal_keymap, "f6", "back");
define_key(content_buffer_normal_keymap, "j", "stop-loading");


/* search selection on google */

interactive("search-clipboard-contents",
"Search in Google the content of the X clipboard (the selected text)",
"find-url",
$browser_object=
function(I) {
return "g "+ read_from_x_primary_selection();
}
);

define_key(content_buffer_normal_keymap, "C-c", "search-clipboard-contents");

//* get https if possible *//

if ('@eff.org/https-everywhere;1' in Cc) {
    interactive("https-everywhere-options-dialog",
                "Open the HTTPS Everywhere options dialog.",
                function (I) {
                    window_watcher.openWindow(
                        null, "chrome://https-everywhere/content/preferences.xul",
                        "", "chrome,titlebar,toolbar,centerscreen,resizable", null);
                });
}

//* hints morph *//

register_user_stylesheet(
    "data:text/css," +
        escape(
            "@namespace url(\"http://www.w3.org/1999/xhtml\");\n" +
            "span.__conkeror_hint {\n"+
            "  font-size: 10px !important;\n"+
            "  line-height: 10px !important;\n"+
            "}"));

register_user_stylesheet(
    "data:text/css," +
        escape (
            "span.__conkeror_hint {" +
            " border: 1px solid #DE9764 !important;" +
            " color: #DE9764 !important;" +
            " background-color: #4D4848 !important;" +
            "}"));


//* darken things *//

function darken_page (I) {
    var styles='* { background: #4d4848 !important; color: #4d4848 !important; }'+
        ':link, :link * { color: #de9764 !important; }'+
        ':visited, :visited * { color: #996845 !important; }';
    var document = I.buffer.document;
    var newSS=document.createElement('link');
    newSS.rel='stylesheet';
    newSS.href='data:text/css,'+escape(styles);
    document.getElementsByTagName("head")[0].appendChild(newSS);
}

interactive("darken-page", "Darken the page in an attempt to save your eyes.",
            darken_page);

define_key(content_buffer_normal_keymap, "C-d", "darken-page");

//* key kill, twice *//

key_kill_mode.test.push(build_url_regexp($domain = "facebook"));
key_kill_mode.test.push(/\/\/.*facebook\.com\//);

//* render image without touching pixels *//

register_user_stylesheet(make_css_data_uri(
    ["* { image-rendering: -moz-crisp-edges; }"]));

//* when it is a url; contains . / etc *//

function possibly_valid_url (str) {
    return /^\s*[^\/\s]*(\/|\s*$)/.test(str)
        && /[:\/\.]/.test(str);
};

//* editor *//

run_external_editor_function = function (file) {
    keywords(arguments);

    var args = [null, "-f", file.path];
    if (arguments.$line) {
        args.push(["-l", arguments.$line]);
    }

    try {
        yield spawn_and_wait_for_process("urxvtc -e nano", args);
    } finally {
        if (arguments.$temporary) {
            try {
                file.remove(false);
            } catch (e) {}
        }
    }
};



/* modeline bufferline */

///
/// Auto-hide Minibuffer
///

var minibuffer_autohide_timer = null;
var minibuffer_autohide_message_timeout = 3000; //milliseconds to show messages
var minibuffer_mutually_exclusive_with_mode_line = true;

function hide_minibuffer (window) {
    window.minibuffer.element.collapsed = true;
    if (minibuffer_mutually_exclusive_with_mode_line && window.mode_line)
        window.mode_line.container.collapsed = false;
}

function show_minibuffer (window) {
    window.minibuffer.element.collapsed = false;
    if (minibuffer_mutually_exclusive_with_mode_line && window.mode_line)
        window.mode_line.container.collapsed = true;
}

add_hook("window_initialize_hook", hide_minibuffer);
// for_each_window(hide_minibuffer); // initialize existing windows


var old_minibuffer_restore_state = (old_minibuffer_restore_state ||
                                    minibuffer.prototype._restore_state);
minibuffer.prototype._restore_state = function () {
    if (minibuffer_autohide_timer) {
        timer_cancel(minibuffer_autohide_timer);
        minibuffer_autohide_timer = null;
    }
    if (this.current_state)
        show_minibuffer(this.window);
    else
        hide_minibuffer(this.window);
    old_minibuffer_restore_state.call(this);
};

var old_minibuffer_show = (old_minibuffer_show || minibuffer.prototype.show);
minibuffer.prototype.show = function (str, force) {
    var w = this.window;
    show_minibuffer(w);
    old_minibuffer_show.call(this, str, force);
    if (minibuffer_autohide_timer)
        timer_cancel(minibuffer_autohide_timer);
    minibuffer_autohide_timer = call_after_timeout(
        function () { hide_minibuffer(w); },
        minibuffer_autohide_message_timeout);
};

var old_minibuffer_clear = (old_minibuffer_clear || minibuffer.prototype.clear);
minibuffer.prototype.clear = function () {
    if (minibuffer_autohide_timer) {
        timer_cancel(minibuffer_autohide_timer);
        minibuffer_autohide_timer = null;
    }
    if (! this.current_state)
        hide_minibuffer(this.window);
    old_minibuffer_clear.call(this);
};