<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/64a79b0a-395a-4019-8106-3e1cf2baa1af

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env](.env) if required.
3. Run both Backend & Frontend:
   `npm run dev:all`
   - Frontend web app: http://localhost:3005
   - REST API & WebSocket server: http://localhost:5005
4. Run end-to-end backend tests:
   `npx tsx server/test-api.ts`

