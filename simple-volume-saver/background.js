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

const INJECTABLE_PROTOCOLS = new Set(['http:', 'https:']);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.audible !== undefined) {
    handleTabAudio(tabId, tab);
  }
});

function handleTabAudio(tabId, tab) {
  if (!tab || !tab.url) return;

  let url;
  try {
    url = new URL(tab.url);
  } catch {
    return;
  }
  if (!INJECTABLE_PROTOCOLS.has(url.protocol)) return;

  chrome.storage.sync.get(['siteList'], (data) => {
    if (chrome.runtime.lastError) return;

    const siteList = data.siteList || {};
    const volume = siteList[url.origin];
    if (volume === undefined) return;

    chrome.scripting.executeScript({
      target: { tabId },
      func: applyVolumeToPage,
      args: [volume]
    }).catch(() => {
      // Tab navigated away or scripting was rejected; nothing to recover.
    });
  });
}

// Injected into the page. Idempotent: safe to call again on every
// navigation/audio event without stacking duplicate observers or listeners.
function applyVolumeToPage(volumePercent) {
  window.__svsVolume = volumePercent / 100;

  const applyToAll = () => {
    document.querySelectorAll('video, audio').forEach((media) => {
      media.volume = window.__svsVolume;
    });
  };

  applyToAll();

  if (window.__svsInitialized) return;
  window.__svsInitialized = true;

  const observer = new MutationObserver(applyToAll);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('play', (event) => {
    const tag = event.target.tagName;
    if (tag === 'VIDEO' || tag === 'AUDIO') {
      event.target.volume = window.__svsVolume;
    }
  }, true);
}
