document.addEventListener('DOMContentLoaded', async () => {
  const volSlider = document.getElementById('volumeSlider');
  const volDisplay = document.getElementById('volumeDisplay');
  const addSiteBtn = document.getElementById('addSiteBtn');
  const resetVolumeBtn = document.getElementById('resetVolumeBtn');
  const siteListEl = document.getElementById('siteList');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  const updateVolumeDisplay = async () => {
    chrome.storage.sync.get(['siteList'], async (data) => {
      const siteList = data.siteList || {};
      const url = new URL(tab.url);
      
      if (siteList[url.origin]) {
        volSlider.value = siteList[url.origin];
        volDisplay.textContent = `${siteList[url.origin]}%`;
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
            volSlider.value = volume;
            volDisplay.textContent = `${volume}%`;
          }
        } catch {}
      }
    });
  };

  await updateVolumeDisplay();

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, updatedTab) => {
    if (tabId === tab.id && changeInfo.audible !== undefined) {
      updateVolumeDisplay();
    }
  });

  volSlider.addEventListener('input', () => {
    const volume = volSlider.value;
    volDisplay.textContent = `${volume}%`;
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
      siteList[url.origin] = parseInt(volSlider.value);
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
        volSlider.value = volume;
        volDisplay.textContent = `${volume}%`;
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
        volSlider.value = 100;
        volDisplay.textContent = '100%';
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