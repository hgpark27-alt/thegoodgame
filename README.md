# TKM Calendar

Shared team calendar widget backed by Google Calendar. Frontend is static HTML/CSS/JS hosted on GitHub Pages; the backend is a Google Apps Script web app that reads/writes a shared Google Calendar.

Also wrapped as an Electron desktop widget (always-on-top) — see `Desktop\TKM Widget`.

- Live: `https://hgpark27-alt.github.io/thegoodgame/`
- Backend source: `Desktop\TKM Widget\backend\Code.gs`
- Firebase (`firebase-config.js`) is connected but not currently used — kept as a possible future auxiliary store.

## Local dev

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.
