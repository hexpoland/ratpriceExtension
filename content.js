console.log('Content js loaded');
chrome.runtime.sendMessage({
  greeting: "hello"
}, function (response) {
  console.log(response.farewell);
});
$('.guitable_content').dblclick(() => {
  alert('click table element')
});