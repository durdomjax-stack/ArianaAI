# ArianaAI backend

Small Node.js backend for the Android companion app. The OpenAI key stays on this server and is never included in the APK or Git repository.

## Run locally
- Install Node.js 20+
- Set `OPENAI_API_KEY` as an environment variable
- Optional: set `OPENAI_MODEL` (default: `gpt-5-mini`)
- Run `npm start`
- Health check: `GET /health`; chat: `POST /chat`

Deploy this folder to a Node hosting provider that supports environment variables and HTTPS. Add `OPENAI_API_KEY` in that provider's secret/environment settings. Then in the Android app tap **⚙ Подключить ИИ** and enter the server's HTTPS URL.

Do not paste the API key into the app, chat, source code, or GitHub repository. For production, set `ALLOWED_ORIGIN` appropriately and add per-user authentication and rate limiting before sharing the endpoint publicly.

The app retains its local fallback replies when no backend URL is configured or the backend is unreachable.
