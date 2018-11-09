$(document).ready(function () {
    $("#enableExtensionCheckbox").prop("checked", localStorage["enableExtension"] === "true");
    $("#watchedTags").val(localStorage["watchedTags"]);
    $("#interval").val(localStorage["interval"]);

    updateFormEnabled($("#enableExtensionCheckbox")[0].checked);

    checkLogin();

    // Handle enable/disable checkbox
    $('#enableExtensionCheckbox').on('change', function (e) {
        var enabled = $("#enableExtensionCheckbox")[0].checked;
        localStorage["enableExtension"] = enabled;

        updateFormEnabled(enabled);

        if (!enabled) {
            stopAlarm(newQuestionsAlarmName);
        }
        else {
            updateLastCheck();

            setAlarm(newQuestionsAlarmName, localStorage["interval"]);
        }
    });

    // Handle save button click
    $("#saveButton").click(function () {
        try {
            var watchedTags = $('#watchedTags').val();
            var interval = parseInt($('#interval').val());

            if (watchedTags === "" || interval === "") {
                $("#success-warning").fadeTo(2000, 500).slideUp(500, function () {
                    $("#success-warning").slideUp(500);
                });
                
                return;
            }

            saveSettings(watchedTags, interval);
        }
        catch (exception)
        {
            $("#success-error").fadeTo(2000, 500).slideUp(500, function () {
                $("#success-error").slideUp(500);
            });
        }
    });

    $("#loginButton").click(function() {
        SE.init({
            clientId: 13505,
            key: localStorage["extensionAppKey"],
            channelUrl: location.origin + '/app/settings.html',
            complete: function (data) {
                SE.authenticate({
                    success: function (data) {
                        localStorage["SOAccessToken"] = data.accessToken;

                        $.getJSON("https://api.stackexchange.com/2.2/me?key=" + localStorage["extensionAppKey"] + "&access_token=" + localStorage["SOAccessToken"] + "&order=desc&sort=reputation&site=stackoverflow", function (data) {
                            localStorage["SOName"] = data.items[0].display_name;
                            
                            checkLogin();
                        });
                    },
                    error: function (data) {
                        alert("Something went wrong while logging in. Please try again.");
                    },
                    scope: ['no_expiry']
                });
            }
        });
    });

    $("#logoutButton").click(function () {
        $.getJSON("https://api.stackexchange.com/2.2/access-tokens/" + localStorage["SOAccessToken"] + "/invalidate", function (data) {
            localStorage["SOAccessToken"] = "";
            localStorage["SOName"] = "";

            saveSettings(localStorage["watchedTags"], 15, true);
            
            checkLogin();

            $("#loggedout-alert").fadeTo(2000, 500).slideUp(500, function () {
                $("#loggedout-alert").slideUp(500);
            });
        });
    });

    var urlParams = new URLSearchParams(location.search);

    if (urlParams.has("firstTime") && $("#loginButton").is(":visible")) {
        AnnoButton.prototype.buttonElem = function (anno) {
            return $("<button class='anno-btn'></button>").html(this.textFn(anno)).addClass(this.className).click((function (_this) {
                return function (evt) {
                    evt.preventDefault(); //<--Stop event from bubbling up to elements it shouldn't be fiddling with
                    return _this.click.call(anno, anno, evt);
                };
            })(this));
        };

        var anno1 = new Anno([{
            target: '#loginButton',
            content: 'Login to your StackOverflow account to get more daily request. When not logged in, refresh rate is limited to at least 15 minutes',
            position: 'top'
        },
        {
            target: '#watchedTagsGroup',
            content: 'Enter one or more tags to watch delimited by a semicolon',
            position: 'top'
        }, 
        {
            target: '#intervalGroup',
            content: 'Enter the minutes between refreshing the data. When not logged in, this is limited to at least 15 minutes',
            position: 'top'
        },
        {
            target: '#saveButton',
            content: 'Click this button to persist the new settings',
            position: 'bottom'
        }]);

        anno1.show();
    }
});

function updateFormEnabled(enabled) {
    $("#watchedTags").prop('disabled', !enabled);
    $("#interval").prop('disabled', !enabled);
    $("#loginButton").prop('disabled', !enabled);
}

function checkLogin() {
    if (isLoggedIn()) {
        $("#loginGroup").hide();
        $("#logoutGroup").show();

        $("#username").text(localStorage["SOName"]);
    }
    else {
        $("#loginGroup").show();
        $("#logoutGroup").hide();
    }
}

function isLoggedIn() {
    var isLoggedIn = localStorage["SOName"] != "" && localStorage["SOName"] != undefined;
    isLoggedIn = isLoggedIn || localStorage["SOAccessToken"] != "" && localStorage["SOAccessToken"] != undefined;

    return isLoggedIn;
}

function saveSettings(tags, interval, silent = false) {
    if (!isLoggedIn() && interval <= 15) {
        interval = 15;
        $('#interval').val(interval);
    }

    localStorage["watchedTags"] = tags;
    localStorage["interval"] = interval;

    if (!silent) {
        $("#success-alert").fadeTo(2000, 500).slideUp(500, function () {
            $("#success-alert").slideUp(500);
        });
    }

    // Simply creating a new alarm with the same name replaces it
    setAlarm(newQuestionsAlarmName, interval);
}