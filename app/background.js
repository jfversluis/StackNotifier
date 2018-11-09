'use strict';

// Wire up things for when Chrome is started
chrome.runtime.onStartup.addListener(function () {
    init();
});

// Wire up things when extension is first installed
chrome.runtime.onInstalled.addListener(function () {
    localStorage["enableExtension"] = "true";
    localStorage["extensionAppKey"] = "NuP)jiIOUwDL6rNI0nzIuQ((";

    init();

    window.open(chrome.runtime.getURL('app/settings.html?firstTime=true'));
});

chrome.alarms.onAlarm.addListener(function (alarm) {
    if (localStorage["enableExtension"] != "true") {
        return;
    }

    if (alarm.name === "checkNewQuestions") {

        $.getJSON("https://api.stackexchange.com/2.2/search?key=" + localStorage["extensionAppKey"] + "&fromdate=" + localStorage["lastCheck"]
            + "&order=desc&sort=creation&tagged=" + localStorage["watchedTags"] + "&site=stackoverflow&access_token=" + localStorage["SOAccessToken"] + "", function (data) {
                var newQuestionsFound = data.items.length >= 1;

                console.log(data.quota_remaining);

                if (data.items.length == 1) {
                    chrome.notifications.create("", {
                        type: "basic",
                        iconUrl: data.items[0].owner.profile_image,
                        title: data.items[0].title,
                        message: "A new question in one of your tags was added"
                    }, function() {
                        window.open(data.items[0].link);
                    });
                }
                else if (data.items.length > 1) {
                    // TODO make more useful
                    chrome.notifications.create("", {
                        type: "basic",
                        iconUrl: "/img/icon128.png",
                        title: "New questions",
                        message: "New questions in one or more of your tags were added"
                    }, function () {
                        window.open("https://stackoverflow.com");
                    });
                }

                if (newQuestionsFound) {
                    updateLastCheck();
                }
            });
    }
});

function init() {
    updateLastCheck();

    chrome.alarms.create("checkNewQuestions", {
        periodInMinutes: 1 // TODO user determined interval
    });
    // chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
    //     if (localStorage["enableExtension"] != "true")
    //         return;

    //     if (localStorage["unwantedLanguage"] === "" || localStorage["preferedLanguage"] === ""
    //         || localStorage["unwantedLanguage"] === undefined || localStorage["preferedLanguage"] === undefined) {
    //         return;
    //     }

    //     if (details.url.indexOf("stackoverflow.com") != -1) {
    //         if (details.url.indexOf(localStorage["unwantedLanguage"]) != -1) {
    //             chrome.tabs.update(details.tabId, {
    //                 url: details.url.replace(new RegExp(localStorage["unwantedLanguage"], "gi"), localStorage["preferedLanguage"])
    //             });
    //         }
    //     }
    // })
}

function updateLastCheck() {
    localStorage["lastCheck"] = Math.floor(Date.now() / 1000);
}