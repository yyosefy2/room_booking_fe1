# fe_ms (Room Booking UI)

Minimal React UI for the `be_ms` API.

Quick start

1. From `fe_ms` install deps:

```powershell
cd fe_ms
npm install
```

2. Start the dev server (the app expects the backend at `http://localhost:4000/api/v1` by default):

PowerShell (recommended):

```powershell
set "REACT_APP_API_BASE=http://localhost:4000/api/v1"; npm start
```

Command Prompt (cmd.exe):

```cmd
set REACT_APP_API_BASE=http://localhost:4000/api/v1 && npm start
```

You do not need to set `PORT` — CRA defaults to `3000` on development.

Notes

- If your backend runs on a different port, set `REACT_APP_API_BASE` before starting.
- The backend must allow CORS from `http://localhost:3000` (CRA dev server). If CORS is blocked, enable CORS in `be_ms` or run the frontend from the same origin.
- This is a minimal UI: it expects `GET /rooms`, `GET /bookings`, `POST /bookings` endpoints.

Node / OpenSSL issues on Windows

- If you see an OpenSSL error like:

```
error:03000086:digital envelope routines::initialization error
error:0308010C:digital envelope routines::unsupported
ERR_OSSL_EVP_UNSUPPORTED
```

it's caused by Node 24+ using a newer OpenSSL build. You have two options:

1. Use the legacy OpenSSL provider when starting the dev server (PowerShell):

```powershell
set "REACT_APP_API_BASE=http://localhost:4000/api/v1"; set "NODE_OPTIONS=--openssl-legacy-provider"; npm run start
```

or use the helper script on Windows:

```powershell
set "REACT_APP_API_BASE=http://localhost:4000/api/v1"; npm run start:win
```

2. Use a Node LTS version that doesn't require the legacy provider (Node 18.x is commonly used with CRA). Use nvm-windows to switch Node versions if needed.

