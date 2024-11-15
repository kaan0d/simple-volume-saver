document.addEventListener('DOMContentLoaded', async () => {
  const slider = document.getElementById('volumeSlider');
  const display = document.getElementById('volumeDisplay');
  const addSiteBtn = document.getElementById('addSiteBtn');
  const resetVolumeBtn = document.getElementById('resetVolumeBtn');
  const siteListEl = document.getElementById('siteList');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  const updateVolumeDisplay = async () => {
    chrome.storage.sync.get(['siteList'], async (data) => {
      const siteList = data.siteList || {};
      const url = new URL(tab.url);
      
      if (siteList[url.origin]) {
        slider.value = siteList[url.origin];
        display.textContent = `${siteList[url.origin]}%`;
      } else {
        try {
          const result = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              const media = document.querySelector("video, audio");
              return media ? Math.round(media.volume * 100) : 100;
            }
          });
          
          if (result && result[0]) {
            const volume = result[0].result;
            slider.value = volume;
            display.textContent = `${volume}%`;
          }
        } catch (error) {
          console.error('Error getting media volume:', error);
        }
      }
    });
  };

  await updateVolumeDisplay();

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, updatedTab) => {
    if (tabId === tab.id && changeInfo.audible !== undefined) {
      updateVolumeDisplay();
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
      siteList[url.origin] = parseInt(slider.value);
      chrome.storage.sync.set({ siteList });
      displaySites();
    });
  });

  resetVolumeBtn.addEventListener('click', async () => {
    const url = new URL(tab.url);
    chrome.storage.sync.get(['siteList'], (data) => {
      const siteList = data.siteList || {};
      if (siteList[url.origin]) {
        const volume = siteList[url.origin];
        slider.value = volume;
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
      } else {
        slider.value = 100;
        display.textContent = '100%';
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            document.querySelectorAll("video, audio").forEach(media => {
              media.volume = 1;
            });
          }
        });
      }
    });
  });

  function createStyledDeleteButton(onClick) {
    const button = document.createElement('button');
    button.classList.add(
      'btn',
      'btn-dark',
      'btn-sm',
      'text-white',
      'fw-light',
      'w-auto',
      'py-1',
      'px-2',
      'rounded',
      'd-flex',
      'align-items-center',
      'justify-content-center',
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
        li.style.alignItems = 'center';
        li.classList.add(
          'rounded',
          'secondary-background'
        );
  
        const siteText = document.createElement('span');
        siteText.classList.add(
          'text-white',
          'fw-light',
          'w-auto',
          'py-1',
          'px-2',
        )
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