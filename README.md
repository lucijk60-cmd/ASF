# ASF AI Agent

Responsive AI marketing assistant starter for ASF PPF Shield. Built with React + Vite + Express and designed for Render deployment.

## Included
- Chat-style responsive interface for Android, tablets, and desktop.
- Gemini chat endpoint (`POST /api/chat`) using the official `@google/genai` SDK.
- Settings and connection status UI.
- Meta Ad Account verification endpoint (`GET /api/meta/ad-account`).
- Dashboard and campaign planning screens.
- API secrets are read by the backend only.

## Run locally
1. Install Node.js 20+.
2. Copy `.env.example` to `.env` and add your `GEMINI_API_KEY`.
3. Install dependencies: `npm install`
4. Start: `npm run dev`
5. Open the Vite URL shown in the terminal (normally http://localhost:5173).

## Deploy on Render
1. Create a GitHub repository and upload this project.
2. In Render choose **New → Web Service** and connect the repository.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables in Render:
   - `GEMINI_API_KEY` (required for chat)
   - `GEMINI_MODEL` (optional; default `gemini-2.5-flash`)
   - `META_APP_ID`
   - `META_APP_SECRET`
   - `META_ACCESS_TOKEN`
   - `META_AD_ACCOUNT_ID` (digits or `act_` prefixed)
   - `META_API_VERSION` (optional; default `v27.0`)
6. Deploy. Render serves the built frontend and API from one Node Web Service.

## Meta integration status
This is a safe starter, not a complete Meta OAuth onboarding or ad-publishing system. The account verification route can read basic ad-account fields if the token has appropriate access. A production integration should implement Meta OAuth authorization-code flow, state/CSRF validation, encrypted token storage, token refresh/expiry handling, app review as required, and permission checks. Meta Marketing API permissions commonly include `ads_management` and relevant Page permissions depending on the features used.

**No ad is created, published, paused, or charged by this starter.** Add campaign creation only after implementing proper authorization, budget limits, audit logs, and an explicit human approval step.

## Security
- Never commit `.env`.
- Never put Gemini or Meta secrets in `VITE_` variables or browser code.
- Use Render Environment for production secrets.
- Add authentication before exposing this app publicly; this starter does not include user login or multi-user isolation.
