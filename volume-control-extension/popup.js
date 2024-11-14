document.addEventListener('DOMContentLoaded', async () => {
  const slider = document.getElementById('volumeSlider');
  const display = document.getElementById('volumeDisplay');
  const addSiteBtn = document.getElementById('addSiteBtn');
  const resetVolumeBtn = document.getElementById('resetVolumeBtn');
  const muteBtn = document.getElementById('muteBtn');
  const siteListEl = document.getElementById('siteList');
  const addSiteText = document.getElementById('siteInput');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.querySelector("video, audio")?.volume * 100 || 100
  }, (result) => {
    if (result && result[0]) {
      slider.value = result[0].result;
      display.textContent = `${result[0].result}%`;
    }
  });
  
  slider.addEventListener('input', () => {
    const volume = slider.value;
    display.textContent = `${volume}%`;
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (volume) => {
        document.querySelectorAll("video, audio").forEach(media => {
          media.volume = volume / 100;
        });
      },
      args: [volume]
    });
  });

  addSiteBtn.addEventListener('click', () => {
    const url = new URL(tab.url);
    chrome.storage.sync.get(['siteList'], (data) => {
      const siteList = data.siteList || {};
      siteList[url.origin] = slider.value;
      chrome.storage.sync.set({ siteList });
      addSiteText.value = '';
      displaySites();
    });
  });

  resetVolumeBtn.addEventListener('click', () => {
    slider.value = 100;
    display.textContent = `100%`;
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        document.querySelectorAll("video, audio").forEach(media => {
          media.volume = 1;
        });
      }
    });
  });

  muteBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: toggleMute,
      });
    });
  });
  
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "updateUI") {
      slider.value = message.volume * 100;
      muteBtn.textContent = message.isMuted ? "Unmute" : "Mute";
      
      if (message.isMuted) {
        display.textContent = "Muted";
      } else {
        display.textContent = `${Math.round(message.volume * 100)}%`;
      }
    }
  });
  
  function toggleMute() {
    const media = document.querySelector("video, audio");
    const isMuted = media.muted;
    if (isMuted) {
      media.volume = media.mutedVolume || 1;
      media.muted = false;
      chrome.runtime.sendMessage({ type: "updateUI", volume: media.volume, isMuted: false });
    } else {
      media.mutedVolume = media.volume;
      media.volume = 0;
      media.muted = true;
      chrome.runtime.sendMessage({ type: "updateUI", volume: 0, isMuted: true });
    }
  }

  function createStyledDeleteButton(onClick) {
    const button = document.createElement('button');
    button.classList.add(
      'bg-red-700',
      'hover:bg-red-800',
      'text-white',
      'font-medium',
      'w-14',
      'py-1',
      'px-2',
      'rounded',
      'flex',
      'items-center',
      'justify-center',
      'cursor-pointer'
    );
  
    const text = document.createElement('span');
    text.textContent = 'Remove';
  
    button.appendChild(text);
    button.onclick = onClick;
  
    return button;
  }
  
  function displaySites() {
    siteListEl.innerHTML = '';
    chrome.storage.sync.get(['siteList'], (data) => {
      const siteList = data.siteList || {};
      for (let site in siteList) {
        const url = new URL(site);
        const simplifiedSite = url.hostname.replace('www.', '');
        
        const li = document.createElement('li');
        li.style.display = 'flex'; 
        li.style.justifyContent = 'space-between';
  
        const siteText = document.createElement('span');
        siteText.textContent = `${simplifiedSite} - ${siteList[site]}%`;
  
        const deleteButton = createStyledDeleteButton(() => {
          delete siteList[site];
          chrome.storage.sync.set({ siteList });
          displaySites();
        });
  
        li.appendChild(siteText);
        li.appendChild(deleteButton);
        siteListEl.appendChild(li);
      }
    });
  }
  

  displaySites();
});
