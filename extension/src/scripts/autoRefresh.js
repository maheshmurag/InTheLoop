/*global chrome*/

//chrome.storage.onChanged.addListener(function(changes, namespace) {
//    if(changes.current_theme || changes.custom || changes.sandbox_enabled){
//        reloadPages();
//    }
//});
//
//function reloadPages(){
//    chrome.tabs.query({
//        url:"*://*.schoolloop.com/*"
//    }, 
//    function(Tabs){
//        for(var i in Tabs){
//            chrome.tabs.reload(Tabs[i].id);
//        }
//    });
//}

/*

function onAlarm(alarm){
  console.log("onAlarm");
  if(alarm.name == "refreshSchoolLoop")refreshPages();
}


chrome.alarms.onAlarm.addListener(onAlarm);

var period_in_mins = 9007199254740991;

chrome.alarms.get("refreshSchoolLoop", function(alarm){
  if(typeof alarm == "undefined" || alarm.periondInMinutes != period_in_mins){
    chrome.alarms.create("refreshSchoolLoop", {
      delayInMinutes: period_in_mins,
      periodInMinutes: period_in_mins
    });
  }
}); */
