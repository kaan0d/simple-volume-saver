chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      chrome.storage.sync.get(['siteList'], (data) => {
        const siteList = data.siteList || {};
        for (let site in siteList) {
          if (tab.url.includes(site)) {
            let volume = siteList[site];
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              func: (volume) => {
                document.querySelectorAll("video, audio").forEach(media => {
                  media.volume = volume / 100;
                });
              },
              args: [volume]
            });
            break;
          }
        }
      });
    }
  });
  