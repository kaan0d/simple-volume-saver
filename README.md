# Volume Control Chrome Extension
This Chrome extension allows users to control the volume of videos and audios on web pages. The extension provides several features like adjusting volume through a slider, muting/unmuting, and saving volume settings for specific sites.

## Features:
+ Volume Slider: Adjust the volume of the media (audio/video) elements on the active page.
+ ~~Mute/Unmute: Toggle the mute state for the media elements.~~
+ Save Site Settings: Save volume settings for specific sites, so that they persist across sessions.
+ Reset Volume: Reset the volume to 100% or saved value.
+ Remove Sites: Remove saved volume settings for specific sites.

## TODO:
+ Jump to any tab that is playing audio with just one click (Maybe)
+ Boost the volume up to 300% (Maybe)
+ ~~Add extra bass to your music with a bass boost feature~~ (Won't be made.)
+ Complete UI overhaul (In-Progress)
+ ~~Dark mode~~

## Known issues:
+ ~~If there is new media playing on Instagram media volume resets to 100.~~
+ ~~Sometimes percentage shows very long numbers after the point.~~
+ ~~Percentage text moves with input.~~
+ ~~Reset button not setting volume to saved values.~~
+ ~~Mute button resets itself if page unfocused and focused again.~~ (Mute button is removed.)
+ ~~Mute button's and percentage text doesn't change when media is muted.~~

## Changes and Improvements
+ Initial Volume Control Setup
++ Created basic slider functionality for volume control
+ + Implemented popup UI with volume display
+ + Added initial site list management
+ Media Detection Improvements
+ + Replaced continuous interval checking with event-based solution
+ + Added tab audio state monitoring using chrome.tabs.onUpdated
+ + Implemented MutationObserver for detecting new media elements
+ + Added play event listener for catching dynamic media content
+ Background Script Optimization
+ + Added automatic volume display updates
+ + Implemented storage sync for saved sites
+ + Added real-time volume level updates
+ + Fixed percentage display alignment using Bootstrap classes
+ Site Management Features
+ + Added functionality to save site-specific volumes
+ + Implemented site list display with remove options
+ + Added volume reset functionality
+ + Created styled delete buttons for saved sites
+ Error Handling & Reliability
+ + Added checks for existing media elements
+ + Implemented proper cleanup on page unload
+ + Added fallback for when no media is found
+ + Improved error handling for storage operations
+ Code Structure Improvements
+ + Modularized code for better maintainability
+ + Added async/await for better promise handling
+ + Improved event listener organization
+ + Added proper code documentation
+ Performance Optimizations
+ + Removed unnecessary interval checks
+ + Optimized DOM queries
+ + Improved storage usage efficiency
+ + Added proper cleanup for observers and listeners