function updateLastActiveTime() {
  chrome.storage.local.set({ lastActiveTime: Date.now() });
}

setInterval(updateLastActiveTime, 60000);

document.addEventListener('click', updateLastActiveTime);
document.addEventListener('keypress', updateLastActiveTime); 