// ─── Edit these, then push to GitHub ─────────────────────────────────────────
window.APP_CONFIG = {
  // Shown in the page header.
  serverName: "LARP Scrims",

  // Discord Developer Portal → your bot's application → General Information → Application ID.
  // Also add this site's exact URL under OAuth2 → Redirects (e.g. https://yourname.github.io/mod-applications/).
  discordClientId: "PASTE_APPLICATION_ID_HERE",

  // Server Settings → Integrations → Webhooks → New Webhook (in your applications channel) → Copy URL.
  webhookUrl: "PASTE_WEBHOOK_URL_HERE",

  // Seconds a person must wait before submitting again from the same browser.
  cooldownSeconds: 3600,

  // The questions. type: "short" (one line), "long" (paragraph) or "choice" (pick one).
  questions: [
    { id: "age", label: "How old are you?", type: "short", required: true, max: 10 },
    { id: "timezone", label: "What timezone are you in?", type: "short", required: true, max: 50 },
    { id: "hours", label: "How many hours a week can you be active?", type: "choice", required: true,
      options: ["Under 5", "5–10", "10–20", "20+"] },
    { id: "experience", label: "Have you moderated before? Where and for how long?", type: "long", required: true, max: 800 },
    { id: "why", label: "Why do you want to be a mod here?", type: "long", required: true, max: 800 },
    { id: "scenario", label: "Two players are arguing in chat and it's getting toxic. What do you do?", type: "long", required: true, max: 800 },
    { id: "extra", label: "Anything else we should know?", type: "long", required: false, max: 500 },
  ],
};
