// Append the control button

const chatbotIcon = document.createElement('div');
chatbotIcon.id = 'panel-icon';
chatbotIcon.style.position = 'fixed';
chatbotIcon.style.bottom = '70px';
chatbotIcon.style.right = '3px';
chatbotIcon.style.width = '40px';
chatbotIcon.style.height = '40px';
//chatbotIcon.style.backgroundColor = '#007bff';
chatbotIcon.style.borderRadius = '50%';
chatbotIcon.style.cursor = 'pointer';
chatbotIcon.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
chatbotIcon.style.zIndex = '9000';
const img = document.createElement('img');
img.src = chrome.runtime.getURL('public/tray.gif');
img.style.cssText = `
      width: 100%;
      height: 100%;
      border-radius: 50%;
    `;
chatbotIcon.appendChild(img);
document.body.appendChild(chatbotIcon);

chatbotIcon.addEventListener('click', async () => {
  // Open popup or chat widget
  // Send to Chrome background
  chrome.runtime.sendMessage({ action: "OPEN_MAIN_UI" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error sending message:', chrome.runtime.lastError);
    } else {
      console.log('Response from background:', response);
      }
  });
});
