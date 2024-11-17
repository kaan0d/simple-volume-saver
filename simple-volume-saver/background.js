// MIT License

// Copyright (c) 2024 Kaan

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

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