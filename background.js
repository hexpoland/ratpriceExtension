var contextMenuItem={
    "id":"CennikRational",
    "title":"CennikRational",
    "contexts":["selection"]
}
chrome.contextMenus.create(contextMenuItem);

chrome.runtime.onInstalled.addListener(function() {
   console.log('Zainstalowano RATIONAL PARTS MANAGER')

   
  });
  
  

chrome.tabs.onActiveChanged.addListener(()=>{
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        var url = tabs[0].url;
        console.log(url)
    });
})

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      if (request.greeting == "hello")
        sendResponse({farewell: "goodbye"});
    });

    