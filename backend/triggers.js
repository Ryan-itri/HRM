function setupTriggers() {
    // Run this manually once to set up the 5 AM trigger
    // Deletes existing triggers to avoid duplicates
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
        if (triggers[i].getHandlerFunction() === 'resetDailyStatus') {
            ScriptApp.deleteTrigger(triggers[i]);
        }
    }

    ScriptApp.newTrigger('resetDailyStatus')
        .timeBased()
        .everyDays(1)
        .atHour(5)
        .create();
}
