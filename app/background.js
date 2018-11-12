'use strict';

// Wire up click on toolbar icon
chrome.browserAction.onClicked.addListener(function (tab) { 
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('app/settings.html'));
    }
});

// Wire up things for when Chrome is started
chrome.runtime.onStartup.addListener(function () {
    init();
});

// Wire up things when extension is first installed
chrome.runtime.onInstalled.addListener(function () {
    localStorage["enableExtension"] = "true";
    localStorage["extensionAppKey"] = "NuP)jiIOUwDL6rNI0nzIuQ((";
    localStorage["interval"] = "15";

    init();

    window.open(chrome.runtime.getURL('app/settings.html?firstTime=true'));
});

chrome.alarms.onAlarm.addListener(function (alarm) {
    if (localStorage["enableExtension"] != "true") {
        return;
    }

    if (alarm.name === newQuestionsAlarmName) {

        // https://api.stackexchange.com/docs/search
        $.getJSON("https://api.stackexchange.com/2.2/search?key=" + localStorage["extensionAppKey"] + "&fromdate=" + localStorage["lastCheck"]
            + "&order=desc&sort=creation&tagged=" + localStorage["watchedTags"] + "&site=stackoverflow&access_token=" + localStorage["SOAccessToken"] + "&filter=!9Z(-wwYGT", function (data) {
                var newQuestionsFound = data.items.length >= 1;

                //console.log(data.quota_remaining);

                if (data.items.length == 1) {
                    localStorage[data.items[0].question_id] = data.items[0].link;

                    chrome.notifications.create(data.items[0].question_id.toString(), {
                        type: "basic",
                        iconUrl: "/img/icon128.png",
                        title: data.items[0].title,
                        message: data.items[0].body
                    });
                }
                else if (data.items.length > 1) {
                    var allItems = [];

                    $.each(data.items, function(index, item) {
                        allItems.push({"title": item.title, "message":""});
                    });

                    chrome.notifications.create("", {
                        type: "list",
                        iconUrl: "/img/icon128.png",
                        title: "New questions",
                        message: "New questions in one or more of your tags were added",
                        items: allItems
                    });
                }

                if (newQuestionsFound) {
                    updateLastCheck();
                }
            });
    }
});

// Wire up clicking on a desktop notification
chrome.notifications.onClicked.addListener(function (notificationId) {
    if (localStorage[notificationId] != "" && localStorage[notificationId] != undefined) {
        window.open(localStorage[notificationId]);
        chrome.notifications.clear(notificationId);
        localStorage.removeItem(notificationId);
    }
});

function init() {
    updateLastCheck();
    
    setAlarm(newQuestionsAlarmName, localStorage["interval"]);
}