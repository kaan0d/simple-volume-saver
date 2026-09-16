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
const SITES_COLLAPSED_LIMIT = 5;

function setSliderFill(slider) {
  slider.style.setProperty('--fill', `${slider.value}%`);
}

function setMediaVolume(tabId, volume) {
  return chrome.scripting.executeScript({
    target: { tabId },
    func: (v) => {
      window.__svsVolume = v / 100;
      document.querySelectorAll('video, audio').forEach((media) => {
        media.volume = window.__svsVolume;
      });
    },
    args: [volume]
  }).catch(() => {});
}

function initTheme() {
  const root = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');

  const apply = (theme) => {
    root.setAttribute('data-theme', theme);
  };

  chrome.storage.local.get(['theme'], (data) => {
    const preferred = data.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    apply(preferred);
  });

  toggleBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    apply(next);
    chrome.storage.local.set({ theme: next });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();

  const volSlider = document.getElementById('volumeSlider');
  const volDisplay = document.getElementById('volumeDisplay');
  const addSiteBtn = document.getElementById('addSiteBtn');
  const resetVolumeBtn = document.getElementById('resetVolumeBtn');
  const siteListEl = document.getElementById('siteList');
  const siteCountEl = document.getElementById('siteCount');
  const emptyStateEl = document.getElementById('emptyState');
  const siteLabelEl = document.getElementById('siteLabel');
  const unsupportedNoticeEl = document.getElementById('unsupportedNotice');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  let tabUrl = null;
  try {
    tabUrl = tab && tab.url ? new URL(tab.url) : null;
  } catch {
    tabUrl = null;
  }
  const isSupported = !!tabUrl && INJECTABLE_PROTOCOLS.has(tabUrl.protocol);

  if (siteLabelEl) {
    siteLabelEl.textContent = tabUrl ? tabUrl.hostname : '';
  }

  const setControlsEnabled = (enabled) => {
    addSiteBtn.disabled = !enabled;
    resetVolumeBtn.disabled = !enabled;
    volSlider.disabled = !enabled;
    unsupportedNoticeEl.classList.toggle('hidden', enabled);
  };

  setControlsEnabled(isSupported);

  const setSliderValue = (value) => {
    volSlider.value = value;
    volDisplay.textContent = `${value}%`;
    setSliderFill(volSlider);
  };

  const updateVolumeDisplay = async () => {
    if (!isSupported) {
      setSliderValue(100);
      return;
    }

    chrome.storage.sync.get(['siteList'], async (data) => {
      const siteList = data.siteList || {};
      const saved = siteList[tabUrl.origin];

      if (saved !== undefined) {
        setSliderValue(saved);
        return;
      }

      try {
        const result = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const media = document.querySelector('video, audio');
            return media ? Math.round(media.volume * 100) : 100;
          }
        });
        setSliderValue(result && result[0] ? result[0].result : 100);
      } catch {
        setSliderValue(100);
      }
    });
  };

  await updateVolumeDisplay();

  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (tabId === tab.id && changeInfo.audible !== undefined) {
      updateVolumeDisplay();
    }
  });

  volSlider.addEventListener('input', () => {
    const volume = Number(volSlider.value);
    volDisplay.textContent = `${volume}%`;
    setSliderFill(volSlider);
    if (isSupported) setMediaVolume(tab.id, volume);
  });

  addSiteBtn.addEventListener('click', () => {
    if (!isSupported) return;
    chrome.storage.sync.get(['siteList'], (data) => {
      const siteList = data.siteList || {};
      siteList[tabUrl.origin] = Number(volSlider.value);
      chrome.storage.sync.set({ siteList }, displaySites);
    });
  });

  resetVolumeBtn.addEventListener('click', () => {
    if (!isSupported) return;
    chrome.storage.sync.get(['siteList'], (data) => {
      const siteList = data.siteList || {};
      const saved = siteList[tabUrl.origin];
      const volume = saved !== undefined ? saved : 100;
      setSliderValue(volume);
      setMediaVolume(tab.id, volume);
    });
  });

  function createRemoveButton(onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'icon-btn-remove';
    button.title = 'Remove';
    button.setAttribute('aria-label', 'Remove site');
    button.innerHTML = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path></svg>`;
    button.addEventListener('click', onClick);
    return button;
  }

  function buildSiteRow(site, volume, siteList) {
    const li = document.createElement('li');
    li.className = 'site-row';

    let hostname = site;
    try {
      hostname = new URL(site).hostname.replace(/^www\./, '');
    } catch {}

    const info = document.createElement('div');
    info.className = 'site-info';

    const hostEl = document.createElement('span');
    hostEl.className = 'site-host';
    hostEl.textContent = hostname;

    const volEl = document.createElement('span');
    volEl.className = 'site-volume';
    volEl.textContent = `${volume}%`;

    info.append(hostEl, volEl);

    const removeBtn = createRemoveButton(() => {
      delete siteList[site];
      chrome.storage.sync.set({ siteList }, displaySites);
    });

    li.append(info, removeBtn);
    return li;
  }

  function displaySites() {
    chrome.storage.sync.get(['siteList'], (data) => {
      const siteList = data.siteList || {};
      const sites = Object.entries(siteList);

      siteListEl.innerHTML = '';
      siteCountEl.textContent = sites.length;
      emptyStateEl.classList.toggle('hidden', sites.length > 0);

      let footer = siteListEl.nextElementSibling;
      if (footer && footer.classList.contains('list-footer')) {
        footer.remove();
      }

      if (sites.length === 0) return;

      let isExpanded = false;
      let isConfirmingDelete = false;

      const render = () => {
        siteListEl.innerHTML = '';
        const visible = isExpanded ? sites : sites.slice(0, SITES_COLLAPSED_LIMIT);
        visible.forEach(([site, volume]) => {
          siteListEl.appendChild(buildSiteRow(site, volume, siteList));
        });

        const existingFooter = siteListEl.nextElementSibling;
        if (existingFooter && existingFooter.classList.contains('list-footer')) {
          existingFooter.remove();
        }
        const existingConfirm = document.querySelector('.confirm-row');
        if (existingConfirm) existingConfirm.remove();

        if (isConfirmingDelete) {
          const confirmRow = document.createElement('div');
          confirmRow.className = 'confirm-row';

          const yesBtn = document.createElement('button');
          yesBtn.type = 'button';
          yesBtn.className = 'btn btn-danger';
          yesBtn.textContent = 'Yes, remove all';
          yesBtn.addEventListener('click', () => {
            chrome.storage.sync.set({ siteList: {} }, displaySites);
          });

          const cancelBtn = document.createElement('button');
          cancelBtn.type = 'button';
          cancelBtn.className = 'btn btn-ghost';
          cancelBtn.textContent = 'Cancel';
          cancelBtn.addEventListener('click', () => {
            isConfirmingDelete = false;
            render();
          });

          confirmRow.append(yesBtn, cancelBtn);
          siteListEl.insertAdjacentElement('afterend', confirmRow);
          return;
        }

        const listFooter = document.createElement('div');
        listFooter.className = 'list-footer';

        if (sites.length > SITES_COLLAPSED_LIMIT) {
          const toggleBtn = document.createElement('button');
          toggleBtn.type = 'button';
          toggleBtn.className = 'btn btn-ghost';
          toggleBtn.textContent = isExpanded ? 'Show less' : `Show all (${sites.length})`;
          toggleBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            render();
          });
          listFooter.appendChild(toggleBtn);
        }

        const removeAllBtn = document.createElement('button');
        removeAllBtn.type = 'button';
        removeAllBtn.className = 'btn btn-danger';
        removeAllBtn.textContent = 'Remove all';
        removeAllBtn.addEventListener('click', () => {
          isConfirmingDelete = true;
          render();
        });
        listFooter.appendChild(removeAllBtn);

        siteListEl.insertAdjacentElement('afterend', listFooter);
      };

      render();
    });
  }

  displaySites();
});
