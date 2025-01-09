const DEFAULT_TIMEOUT = 30;

chrome.storage.sync.get(['timeoutDuration'], function(result) {
  const timeoutDuration = result.timeoutDuration || DEFAULT_TIMEOUT;
  document.getElementById('timeout-duration').value = timeoutDuration;
});

document.getElementById('save-settings').addEventListener('click', function() {
  const timeoutDuration = document.getElementById('timeout-duration').value;
  chrome.storage.sync.set({ timeoutDuration: parseInt(timeoutDuration) });
}); 