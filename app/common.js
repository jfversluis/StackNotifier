var newQuestionsAlarmName = "checkNewQuestions";

function updateLastCheck() {
    localStorage["lastCheck"] = Math.floor(Date.now() / 1000);
}

function setAlarm(name, interval) {
    chrome.alarms.create(name, {
        periodInMinutes: parseInt(interval)
    });
}

function stopAlarm(name) {
    chrome.alarms.clear(name);
}