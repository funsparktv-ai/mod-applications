# Staff Applications site

A static site (GitHub Pages) where people apply for staff positions. It logs them in with Discord, lets them pick a position, posts the
application to a webhook in your applications channel, and the bot reposts it with
**Accept / Decline** buttons. Clicking one DMs the applicant the result.

## Setup (about 10 minutes)

### 1. Webhook
In your server: open the applications channel's settings → **Integrations → Webhooks → New Webhook**
→ **Copy Webhook URL**. The URL looks like `https://discord.com/api/webhooks/<WEBHOOK_ID>/<token>`.

### 2. Bot `.env` (next to `bot.py`)
```
APPLICATIONS_CHANNEL_ID=<the applications channel ID>
APPLICATIONS_WEBHOOK_ID=<the WEBHOOK_ID number from the URL>
# optional: role given automatically on accept, per position id from config.js
APPLICATION_ROLE_IDS=referee:111,scrim-hoster:222,admin:333,elo-counter:444,moderator:555
```
Leave out any position you don't want auto-roled.
Upload `mod_applications.py` alongside `bot.py` and restart the bot. The startup log should say
`mod applications ON`. The bot needs **View Channel, Send Messages, Embed Links, Manage Messages**
in that channel (and **Manage Roles** above the mod role if you use `MOD_ROLE_ID`).

### 3. Discord login
Discord Developer Portal → your bot's application:
- **General Information**: copy the **Application ID**.
- **OAuth2 → Redirects**: add exactly `https://funsparktv-ai.github.io/mod-applications/`
  (including the trailing slash).

### 4. `config.js`
Paste the Application ID and webhook URL, set your server name, and edit the positions and questions.
`commonQuestions` are asked for every position, then that position's own `questions`, then
`closingQuestions`. Use `type: "confirm"` for a requirement people must tick (like PS+ for Scrim Hoster).
Don't rename a position's `id` once it's live: the bot uses it to pick the role.

### 5. Publish
Live at https://funsparktv-ai.github.io/mod-applications/ (repo `funsparktv-ai/mod-applications`,
Pages serves the `main` branch). After editing `config.js`, commit and push; it updates in about a minute.

## Who can review
Anyone the bot counts as Co-Owner or higher: Administrator / Manage Server, the configured Co-Owner
role, or the bot owner. Everyone else gets "Only staff can review applications."

## Good to know
- The webhook URL is visible to anyone who opens the site's source (unavoidable on a static site).
  Someone could use it to post junk into the channel. The bot only adds buttons to messages from
  that exact webhook in the right format, and if it ever gets abused, delete the webhook, make a
  new one, and update `config.js` + `APPLICATIONS_WEBHOOK_ID`.
- The one-hour resubmit cooldown is per browser, so it stops accidents, not determined spammers.
- Applicants only get the DM if their DMs are open and they share a server with the bot; you'll see
  a note if the DM failed.
