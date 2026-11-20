// ─── Edit these, then push to GitHub ─────────────────────────────────────────
window.APP_CONFIG = {
  // Shown in the page header.
  serverName: "LARP Scrims",

  // Which positions are open is controlled from Discord with /applications
  // (main server only). The bot writes status.json in this repo:
  statusRepo: "funsparktv-ai/mod-applications",
  // Fallback only, used if status.json can't be loaded: true = all open, false = closed.
  applicationsOpen: false,
  // Optional line under the "closed" heading.
  closedMessage: "Check back later. We'll announce in the server when they open again.",

  // Discord Developer Portal → your bot's application → General Information → Application ID.
  // Also add this site's exact URL under OAuth2 → Redirects:
  // exactly: https://funsparktv-ai.github.io/mod-applications/
  discordClientId: "1558142757053267968",

  // Server Settings → Integrations → Webhooks → New Webhook (in your applications channel) → Copy URL.
  webhookUrl: "https://discord.com/api/webhooks/1572201883378917386/oVBBnwkntueVH5yWJ0SryjCgIXI8zlmlz5q-oE0C5q7Gn4j3yia_fIOsUPO1WymJffWx",

  // Seconds a person must wait before applying for the SAME position again from the same browser.
  cooldownSeconds: 3600,

  // Question types:
  //   "short"   one line          "long"    paragraph
  //   "choice"  pick one (options) "confirm" a box they must tick (use for requirements)

  // Asked on every application, before the position's own questions.
  commonQuestions: [
    { id: "age", label: "How old are you?", type: "short", required: true, max: 10 },
    { id: "timezone", label: "What timezone are you in?", type: "short", required: true, max: 50 },
    { id: "hours", label: "How many hours a week can you be active?", type: "choice", required: true,
      options: ["Under 5", "5–10", "10–20", "20+"] },
  ],

  // The positions people can pick after logging in.
  // id: short code the bot uses (letters/numbers/dashes, don't change once live).
  positions: [
    {
      id: "referee",
      name: "Referee",
      icon: "🏁",
      blurb: "Watch scrims, enforce the rules and settle disputes fairly.",
      questions: [
        { id: "ref_exp", label: "Have you refereed or judged matches before? Where?", type: "long", required: true, max: 600 },
        { id: "ref_rules", label: "How well do you know the scrim rules? Any you think are commonly broken?", type: "long", required: true, max: 600 },
        { id: "ref_scenario", label: "Both teams claim they won a round and the clip is unclear. What do you do?", type: "long", required: true, max: 600 },
      ],
    },
    {
      id: "scrim-hoster",
      name: "Scrim Hoster",
      icon: "🎮",
      blurb: "Set up and run scrims for the community.",
      requirement: "Must have PS+ in Azure Latch",
      questions: [
        { id: "host_ps", label: "I have PS+ in Azure Latch", type: "confirm", required: true },
        { id: "host_often", label: "How often could you host scrims?", type: "choice", required: true,
          options: ["A few times a month", "Weekly", "Several times a week", "Daily"] },
        { id: "host_exp", label: "Have you hosted scrims or events before? Tell us about it.", type: "long", required: true, max: 600 },
        { id: "host_plan", label: "How would you make sure a scrim starts on time and runs smoothly?", type: "long", required: true, max: 600 },
      ],
    },
    {
      id: "admin",
      name: "Admin",
      icon: "🛡️",
      blurb: "Help run the server and manage the staff team.",
      questions: [
        { id: "admin_exp", label: "What staff or admin positions have you held before (here or elsewhere)?", type: "long", required: true, max: 700 },
        { id: "admin_improve", label: "What's one thing you'd change or improve about this server?", type: "long", required: true, max: 600 },
        { id: "admin_scenario", label: "A staff member is abusing their perms. How do you handle it?", type: "long", required: true, max: 600 },
      ],
    },
    {
      id: "elo-counter",
      name: "Elo Counter",
      icon: "📊",
      blurb: "Record scrim results and keep the Elo leaderboard accurate.",
      questions: [
        { id: "elo_know", label: "Explain in your own words how Elo works in our scrims.", type: "long", required: true, max: 600 },
        { id: "elo_accuracy", label: "How would you make sure you never log a result wrong?", type: "long", required: true, max: 600 },
        { id: "elo_scenario", label: "A player says their Elo is wrong after a scrim. What do you do?", type: "long", required: true, max: 600 },
      ],
    },
    {
      id: "moderator",
      name: "Moderator",
      icon: "🔨",
      blurb: "Keep chat friendly, handle reports and enforce the rules.",
      questions: [
        { id: "mod_exp", label: "Have you moderated before? Where and for how long?", type: "long", required: true, max: 700 },
        { id: "mod_why", label: "Why do you want to be a mod here?", type: "long", required: true, max: 600 },
        { id: "mod_scenario", label: "Two players are arguing in chat and it's getting toxic. What do you do?", type: "long", required: true, max: 600 },
      ],
    },
  ],

  // Asked last on every application.
  closingQuestions: [
    { id: "extra", label: "Anything else we should know?", type: "long", required: false, max: 400 },
  ],
};
