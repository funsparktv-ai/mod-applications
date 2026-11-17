// ─── Edit these, then push to GitHub ─────────────────────────────────────────
window.APP_CONFIG = {
  // Shown in the page header.
  serverName: "LARP Scrims",

  // Discord Developer Portal → your bot's application → General Information → Application ID.
  // Also add this site's exact URL under OAuth2 → Redirects exactly: https://funsparktv-ai.github.io/mod-applications/
  discordClientId: "1558142757053267968",

  // Server Settings → Integrations → Webhooks → New Webhook (in your applications channel) → Copy URL.
  webhookUrl: "https://discord.com/api/webhooks/1572201883378917386/oVBBnwkntueVH5yWJ0SryjCgIXI8zlmlz5q-oE0C5q7Gn4j3yia_fIOsUPO1WymJffWx",

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
