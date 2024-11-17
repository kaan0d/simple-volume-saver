# Simple Volume Saver Chrome Extension
This Chrome extension allows users to control the audio volume of media (video and audio) elements on web pages. Users can adjust the volume via a slider, view the current volume percentage, and save custom volume settings for specific websites. It also restores saved volume levels automatically whenever the user revisits a site. The extension is designed to work seamlessly unless the website uses highly customized audio controls, which might limit its functionality.

## How It Works  
This extension acts as a media controller. If a web page does not have a dedicated audio control mechanism, the extension can adjust the volume directly. However, on websites with custom-built audio controllers, the extension may not work as expected due to conflicts with the site's proprietary controls.  

<table>
  <tr>
    <td>
      <img src="https://github.com/user-attachments/assets/83ec4e79-e0b4-4a0a-8e98-e50ce854c565" width="200" alt="Main Interface">
      <p align="center"><b>Main Interface</b></p>
    </td>
    <td>
      <img src="https://github.com/user-attachments/assets/359bf765-e9c1-4d70-a5aa-a6c7f8e324c4" width="200" alt="Saved Sites List">
      <p align="center"><b>Saved Sites List</b></p>
    </td>
    <td>
      <img src="https://github.com/user-attachments/assets/c7c46e2c-f9a2-47da-8be0-35e1abef8413" width="200" alt="Reset Volume Button">
      <p align="center"><b>Show more/Hide</b></p>
    </td>
    <td>
      <img src="https://github.com/user-attachments/assets/218570fb-17f2-4293-ae2a-8f2984391640" width="200" alt="Remove All Sites">
      <p align="center"><b>Remove All Sites</b></p>
    </td>
  </tr>
</table>

## Features:
+ Volume Slider: Adjust the volume of media (audio/video) elements on the active page.
+ Save Site Settings: Save custom volume levels for specific sites, ensuring they persist across sessions.
+ Reset Volume: Reset the volume to either the default value (100%) or the saved value for the current site.
+ Remove Sites: Delete saved volume settings for specific sites from the storage.

## Limitations  
- The extension's compatibility may vary on websites with highly customized audio or video controllers.

## TODO:
+ Option to jump to any tab currently playing audio (Pending consideration).
+ ~~Boost the volume up to 300%~~ (Will not be implemented as it interferes with fullscreen functionality).
+ ~~Bass Boost~~ (Will not be implemented).
+ ~~Complete UI redesign~~ (Completed).
+ ~~Dark Mode~~ (Completed).

## Known issues:
+ ~~Volume resets to 100% when new media plays on Instagram.~~
+ ~~Volume percentage occasionally displays overly long decimal numbers.~~
+ ~~Percentage text shifts position when adjusting the slider.~~
+ ~~Reset button does not correctly apply saved volume values.~~