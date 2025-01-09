async function checkAuthStatus() {
  const { lastActiveTime, isAuthenticated } = await chrome.storage.local.get(['lastActiveTime', 'isAuthenticated']);
  const currentTime = Date.now();
  const inactiveTime = currentTime - (lastActiveTime || 0);

  const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes

  if (isAuthenticated && inactiveTime < TIMEOUT_DURATION) {
    return true;
  } else {
    await chrome.storage.local.set({ isAuthenticated: false, lastActiveTime: null });
    return false;
  }
}

async function authenticateUser() {
  // Implement your authentication logic here
  await chrome.storage.local.set({ isAuthenticated: true, lastActiveTime: Date.now() });
}
