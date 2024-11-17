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

  function checkAndUpdateSaveButton() {
    const url = new URL(tab.url);
  
    if (url.protocol === 'chrome:' || url.protocol === 'file:') {
      addSiteBtn.disabled = true;
      addSiteBtn.style.color = '#8B0000';
      addSiteBtn.style.borderColor = '#8B0000';
    } else {
      addSiteBtn.disabled = false;
      addSiteBtn.style.backgroundColor = '';
      addSiteBtn.style.borderColor = '';
    }
  }

  checkAndUpdateSaveButton();

  addSiteBtn.addEventListener('click', () => {
    const url = new URL(tab.url);

    if (url.protocol === 'chrome:' || url.protocol === 'file:') {
      return;
    }

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
      const sites = Object.entries(siteList);
      
      let isExpanded = false;
      let isConfirmingDelete = false;
      
      const renderSites = (sitesToShow) => {
        const siteContainer = document.createElement('div');
        
        sitesToShow.forEach(([site, volume]) => {
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
          );
          siteText.textContent = `${simplifiedSite} - ${volume}%`;
      
          const deleteButton = createStyledDeleteButton(() => {
            delete siteList[site];
            chrome.storage.sync.set({ siteList });
            displaySites();
          });
      
          li.appendChild(siteText);
          li.appendChild(deleteButton);
          siteContainer.appendChild(li);
        });
        
        return siteContainer;
      };
  
      const createDeleteAllButton = () => {
        const deleteAllContainer = document.createElement('div');
        deleteAllContainer.classList.add('mt-2');
  
        if (!isConfirmingDelete) {
          const deleteAllButton = document.createElement('button');
          deleteAllButton.classList.add(
            'btn',
            'btn-danger',
            'btn-sm',
            'w-100'
          );
          deleteAllButton.textContent = 'Remove All Sites';
          deleteAllButton.addEventListener('click', () => {
            isConfirmingDelete = true;
            updateDisplay();
          });
          deleteAllContainer.appendChild(deleteAllButton);
        } else {
          const confirmButtonsContainer = document.createElement('div');
          confirmButtonsContainer.classList.add('d-flex', 'gap-2');
  
          const yesButton = document.createElement('button');
          yesButton.classList.add(
            'btn',
            'btn-danger',
            'btn-sm',
            'flex-grow-1'
          );
          yesButton.textContent = 'Yes, Remove All';
          yesButton.addEventListener('click', () => {
            chrome.storage.sync.set({ siteList: {} }, () => {
              isConfirmingDelete = false;
              isExpanded = false;
              displaySites();
            });
          });
  
          const noButton = document.createElement('button');
          noButton.classList.add(
            'btn',
            'btn-secondary',
            'btn-sm',
            'flex-grow-1'
          );
          noButton.textContent = 'No, Cancel';
          noButton.addEventListener('click', () => {
            isConfirmingDelete = false;
            updateDisplay();
          });
  
          confirmButtonsContainer.appendChild(yesButton);
          confirmButtonsContainer.appendChild(noButton);
          deleteAllContainer.appendChild(confirmButtonsContainer);
        }
  
        return deleteAllContainer;
      };
  
      const updateDisplay = () => {
        siteListEl.innerHTML = '';
        
        const sitesToShow = isExpanded ? sites : sites.slice(0, 5);
        const siteContainer = renderSites(sitesToShow);
        siteListEl.appendChild(siteContainer);
  
        if (isExpanded) {
          siteListEl.appendChild(createDeleteAllButton());
        }
  
        if (sites.length > 5) {
          const showMoreButton = document.createElement('button');
          showMoreButton.classList.add(
            'btn',
            'btn-outline-secondary',
            'btn-sm',
            'w-100',
            'mt-2'
          );
          showMoreButton.textContent = isExpanded ? 'Hide' : 'Show More';
          
          showMoreButton.addEventListener('click', () => {
            isExpanded = !isExpanded;
            isConfirmingDelete = false;
            updateDisplay();
          });
          
          siteListEl.appendChild(showMoreButton);
        }
      };
  
      updateDisplay();
    });
  }
  
  displaySites();
});
