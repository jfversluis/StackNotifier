$(document).ready(function () {
    $("#enableExtensionCheckbox").prop("checked", localStorage["enableExtension"] === "true");
    $("#watchedTags").val(localStorage["watchedTags"]);
    $("#interval").val(localStorage["interval"]);

    updateFormEnabled($("#enableExtensionCheckbox")[0].checked);

    // Handle enable/disable checkbox
    $('#enableExtensionCheckbox').on('change', function (e) {
        var enabled = $("#enableExtensionCheckbox")[0].checked;
        localStorage["enableExtension"] = enabled;

        updateFormEnabled(enabled);
    });

    // Handle save button click
    $("#saveButton").click(function () {
        try {
            var watchedTags = $('#watchedTags').val();
            var interval = $('#interval').val();

            if (watchedTags === "" || interval === "") {
                $("#success-warning").fadeTo(2000, 500).slideUp(500, function () {
                    $("#success-warning").slideUp(500);
                });
                
                return;
            }

            localStorage["watchedTags"] = watchedTags;
            localStorage["interval"] = interval;

            $("#success-alert").fadeTo(2000, 500).slideUp(500, function () {
                $("#success-alert").slideUp(500);
            });

            chrome.alarms.clear("checkNewQuestions", function() {
                chrome.alarms.create("checkNewQuestions", {
                    periodInMinutes: parseInt(interval)
                });
            });
        }
        catch (exception)
        {
            $("#success-error").fadeTo(2000, 500).slideUp(500, function () {
                $("#success-error").slideUp(500);
            });
        }
    });

    // Handle Open Settings on popup page
    $("#openSettingsLink").click(function () {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('app/settings.html'));
        }
    });

    var urlParams = new URLSearchParams(location.search);

    if (urlParams.has("firstTime")) {
        // AnnoButton.prototype.buttonElem = function (anno) {
        //     return $("<button class='anno-btn'></button>").html(this.textFn(anno)).addClass(this.className).click((function (_this) {
        //         return function (evt) {
        //             evt.preventDefault(); //<--Stop event from bubbling up to elements it shouldn't be fiddling with
        //             return _this.click.call(anno, anno, evt);
        //         };
        //     })(this));
        // };

        // var anno1 = new Anno([{
        //     target: '#unwantedLanguagePicker',
        //     content: 'Enter the <strong>unwanted</strong> language here, i.e.: nl-nl',
        //     position: 'top'
        // },
        // {
        //     target: '#preferedLanguagePicker',
        //     content: 'Enter the <strong>preferred</strong> language here, i.e.: en-us',
        //     position: 'top'
        // },
        // {
        //     target: '#saveButton',
        //     content: 'Click save to persist the new settings',
        //     position: 'bottom'
        // },
        // {
        //     target: '#toolbarIcon',
        //     content: 'You can also quick-access the settings through the icon here when on the Docs pages',
        //     position: 'bottom'
        // }]);

        // anno1.show();

        SE.init({
            clientId: 13505,
            key: localStorage["extensionAppKey"] ,
            channelUrl: location.origin + '/app/settings.html',
            complete: function (data) {
                SE.authenticate({
                    success: function (data) {
                        // TODO
                        localStorage["SOAccessToken"] = data.accessToken;
                    },
                    error: function (data) {
                        // TODO
                    },
                    scope: ['no_expiry']
                });
            }
        });

        
    }
});

function updateFormEnabled(enabled) {
    $("#watchedTags").prop('disabled', !enabled);
    $("#interval").prop('disabled', !enabled);
}