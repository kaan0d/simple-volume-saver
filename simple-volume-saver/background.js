chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    handleTabAudio(tabId, tab);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.audible !== undefined) {
    handleTabAudio(tabId, tab);
  }
});

function handleTabAudio(tabId, tab) {
  chrome.storage.sync.get(['siteList'], (data) => {
    const siteList = data.siteList || {};
    
    for (let site in siteList) {
      if (tab.url.includes(site)) {
        const volume = siteList[site];
        
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: (volume) => {
            const setMediaVolume = (mediaElements) => {
              mediaElements.forEach(media => {
                if (!media.paused || media.currentTime > 0) {
                  media.volume = volume / 100;
                }
              });
            };

            setMediaVolume(document.querySelectorAll("video, audio"));

            const observer = new MutationObserver((mutations) => {
              const mediaElements = document.querySelectorAll("video, audio");
              if (mediaElements.length > 0) {
                setMediaVolume(mediaElements);
              }
            });

            observer.observe(document.body, {
              childList: true,
              subtree: true
            });

            document.addEventListener('play', (event) => {
              if (event.target.tagName === 'VIDEO' || event.target.tagName === 'AUDIO') {
                event.target.volume = volume / 100;
              }
            }, true);

            window.addEventListener('unload', () => {
              observer.disconnect();
            });
          },
          args: [volume]
        });
        
        break;
      }
    }
  });
}