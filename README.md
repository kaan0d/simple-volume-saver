# Simple Volume Saver

A Chrome extension for controlling and remembering per-site audio volume. Drag a single glowing fader to set the level, watch it react live to whatever is actually playing in the tab, and it restores that level automatically every time you come back to the site.

## Screenshots

<table>
  <tr>
    <td>
      <img src="" width="200" alt="Add Volume tab screenshot link here">
      <p align="center"><b>Volume tab</b></p>
    </td>
    <td>
      <img src="" width="200" alt="Add Saved Sites tab screenshot link here">
      <p align="center"><b>Saved Sites tab</b></p>
    </td>
    <td>
      <img src="" width="200" alt="Add Light mode screenshot link here">
      <p align="center"><b>Light mode</b></p>
    </td>
    <td>
      <img src="" width="200" alt="Add Dark mode screenshot link here">
      <p align="center"><b>Dark mode</b></p>
    </td>
  </tr>
</table>

## How it works

- Reads and sets the volume of `<video>`/`<audio>` elements on the active tab directly, independent of the page's own volume control.
- A live equalizer, driven by `chrome.tabCapture`, shows the tab's real audio output — not a decorative animation.
- Save a level per site (matched by origin, e.g. `https://example.com`); saved sites sync via `chrome.storage.sync` across signed-in Chrome profiles.
- Works even on sites that run their own audio pipeline (YouTube, Spotify, etc.): the visualizer taps the tab's final mixed output rather than the page's internal audio graph, so it isn't blocked by sites that already claim the media element for their own processing.

## Features

- **Draggable volume fader** — a glowing line over a live, audio-reactive bar visualizer; drag it (or use arrow keys, Home/End) to set 0–100%.
- **Live tab audio visualizer** — bars reflect the tab's actual audio output in real time, capped to the current volume ceiling; dims and calms down automatically below 20%.
- **Save per site** — remembers a volume for the current site's origin and re-applies it automatically on future visits, including to media added after the page loads.
- **Reset** — restores the saved level for the site, or 100% if none is saved.
- **Remove saved site** — a one-click control right on the Volume tab whenever the current site already has a saved level, no need to switch tabs.
- **Saved Sites tab** — the full list of saved sites with per-site removal and a Delete All action (with a confirmation step).
- **Dark / Light theme** — toggle in the header; defaults to your system theme and remembers your choice.

## Permissions

- `storage` — saves per-site volume levels and your theme preference.
- `scripting`, `activeTab`, `host_permissions` (`<all_urls>`) — reads and sets `<video>`/`<audio>` volume on the active page, and re-applies saved levels after navigation.
- `tabs` — detects when a tab starts or stops playing audio, to re-apply a saved level.
- `tabCapture` — powers the live visualizer only. Audio is analyzed in memory and immediately routed back to your speakers; nothing is recorded, stored, or sent anywhere.

## Limitations

- Compatibility varies on sites with heavily customized audio/video players.
- The live visualizer needs a capturable tab (regular `http(s)` pages); it stays idle on internal pages like `chrome://`.

## TODO

- Option to jump to any tab currently playing audio (pending consideration).
- ~~Boost volume above 100%~~ (won't implement — breaks fullscreen video).
- ~~Bass boost~~ (won't implement).
- ~~Complete UI redesign~~ (done).
- ~~Dark Mode~~ (done).
- ~~Audio-reactive volume fader~~ (done).
- ~~Split into Volume / Saved Sites tabs~~ (done).

## Known issues (fixed)

- ~~Volume resets to 100% when new media plays on Instagram.~~
- ~~Volume percentage occasionally displays overly long decimal numbers.~~
- ~~Percentage text shifts position when adjusting the slider.~~
- ~~Reset button does not correctly apply saved volume values.~~
- ~~Site matching used substring comparison, so a saved site could match unrelated domains that merely contained its name.~~
- ~~Popup crashed on unsupported pages (`chrome://`, new tab) instead of disabling controls.~~
- ~~Repeated navigation/audio events on the same page stacked duplicate `MutationObserver`s and `play` listeners.~~
- ~~A long saved-sites list made the whole popup scroll, dragging the header and controls along with it.~~
- ~~The fader's drag hit-area and directional hints could get clipped at 0%/100%.~~
- ~~The "remove saved site" control appearing/disappearing shifted the volume control up and down.~~
