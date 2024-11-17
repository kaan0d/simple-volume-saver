# Simple Volume Saver Chrome Extension
This Chrome extension allows users to control the audio volume of media (video and audio) elements on web pages. Users can adjust the volume via a slider, view the current volume percentage, and save custom volume settings for specific websites. It also restores saved volume levels automatically whenever the user revisits a site. The extension is designed to work seamlessly unless the website uses highly customized audio controls, which might limit its functionality.

## How It Works  
This extension acts as a media controller. If a web page does not have a dedicated audio control mechanism, the extension can adjust the volume directly. However, on websites with custom-built audio controllers, the extension may not work as expected due to conflicts with the site's proprietary controls.  

![image](https://github.com/user-attachments/assets/83ec4e79-e0b4-4a0a-8e98-e50ce854c565)
![image](https://github.com/user-attachments/assets/359bf765-e9c1-4d70-a5aa-a6c7f8e324c4)
![image](https://github.com/user-attachments/assets/c7c46e2c-f9a2-47da-8be0-35e1abef8413)
![image](https://github.com/user-attachments/assets/218570fb-17f2-4293-ae2a-8f2984391640)

## Features:
+ Volume Slider: Adjust the volume of the media (audio/video) elements on the active page.
+ ~~Mute/Unmute: Toggle the mute state for the media elements.~~
+ Save Site Settings: Save volume settings for specific sites, so that they persist across sessions.
+ Reset Volume: Reset the volume to 100% or saved value.
+ Remove Sites: Remove saved volume settings for specific sites.

## Limitations  
- Compatibility may vary on websites with highly customized audio or video controllers. 

## TODO:
+ Jump to any tab that is playing audio (Maybe)
+ ~~Boost the volume up to 300%~~ (This feature will not be implemented because enabling volume boosting interferes with fullscreen functionality.)
+ ~~Add extra bass to your music with a bass boost feature~~ (This feature will not be implemented)
+ ~~Complete UI overhaul~~
+ ~~Dark mode~~

## Known issues:
+ ~~If there is new media playing on Instagram media volume resets to 100.~~
+ ~~Sometimes percentage shows very long numbers after the point.~~
+ ~~Percentage text moves with input.~~
+ ~~Reset button not setting volume to saved values.~~
+ ~~Mute button resets itself if page unfocused and focused again.~~ (This feature will not be implemented)
+ ~~Mute button's and percentage text doesn't change when media is muted.~~