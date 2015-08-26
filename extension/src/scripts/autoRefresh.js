function refreshPages(){
  chrome.tabs.query({
    url:"*://montavista.schoolloop.com/*"
  }, function(Tabs){
    console.log(Tabs);
    for(i in Tabs){
      chrome.tabs.reload(Tabs[i].id);
    }
  });
}

chrome.runtime.onMessage.addListener(function(message){
    alert('hi! message:' + message);
    chrome.browserAction.setBadgeText({text: '' + message}); 
});

function onAlarm(alarm){
  console.log("onAlarm");
  if(alarm.name == "refreshSchoolLoop")refreshPages();
}


chrome.alarms.onAlarm.addListener(onAlarm);

var period_in_mins = 60;

chrome.alarms.get("refreshSchoolLoop", function(alarm){
  if(typeof alarm == "undefined" || alarm.periondInMinutes != period_in_mins){
    console.log("created alarm");
    chrome.alarms.create("refreshSchoolLoop", {
      delayInMinutes: period_in_mins,
      periodInMinutes: period_in_mins
    });
  }
});
