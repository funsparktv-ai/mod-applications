(() => {
  const cfg = window.APP_CONFIG;
  const $ = (id) => document.getElementById(id);
  const show = (id) => {
    for (const v of ["login-view", "form-view", "done-view"]) $(v).hidden = v !== id;
  };
  const TOKEN_KEY = "modapp_token";
  const COOLDOWN_KEY = "modapp_last_submit";
  // Must match the Redirect in the Developer Portal exactly, so drop "index.html".
  const redirectUri = location.origin + location.pathname.replace(/index\.html$/, "");

  const store = {
    get(k, area = sessionStorage) { try { return area.getItem(k); } catch { return null; } },
    set(k, v, area = sessionStorage) { try { area.setItem(k, v); } catch {} },
    del(k, area = sessionStorage) { try { area.removeItem(k); } catch {} },
  };

  $("server-name").textContent = cfg.serverName;
  document.title = `${cfg.serverName} · Mod Applications`;

  if (cfg.discordClientId.startsWith("PASTE") || cfg.webhookUrl.startsWith("PASTE")) {
    $("setup-warning").hidden = false;
    return;
  }

  // ── Discord login (OAuth2 implicit grant, "identify" scope only) ──────────
  const hash = new URLSearchParams(location.hash.slice(1));
  if (hash.get("access_token")) {
    if (hash.get("state") === store.get("modapp_state")) {
      store.set(TOKEN_KEY, hash.get("access_token"));
    }
    store.del("modapp_state");
    history.replaceState(null, "", redirectUri);
  }

  $("login-btn").onclick = () => {
    const state = crypto.getRandomValues(new Uint32Array(4)).join("");
    store.set("modapp_state", state);
    const url = new URL("https://discord.com/oauth2/authorize");
    url.search = new URLSearchParams({
      client_id: cfg.discordClientId,
      response_type: "token",
      redirect_uri: redirectUri,
      scope: "identify",
      state,
      prompt: "none",
    });
    location.href = url;
  };

  $("logout-btn").onclick = () => {
    store.del(TOKEN_KEY);
    show("login-view");
  };

  let me = null;

  async function loadUser() {
    const token = store.get(TOKEN_KEY);
    if (!token) return show("login-view");
    try {
      const res = await fetch("https://discord.com/api/v10/users/@me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(res.status);
      me = await res.json();
    } catch {
      store.del(TOKEN_KEY);
      return show("login-view");
    }
    const avatar = me.avatar
      ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png?size=96`
      : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(me.id) >> 22n) % 6}.png`;
    $("me-avatar").src = avatar;
    $("me-name").textContent = me.global_name || me.username;
    $("me-id").textContent = `@${me.username} · ${me.id}`;
    show("form-view");
  }

  // ── Build the questions from config.js ────────────────────────────────────
  const fields = {};
  for (const q of cfg.questions) {
    const wrap = document.createElement("div");
    wrap.className = "q";
    const label = document.createElement("label");
    label.htmlFor = `q-${q.id}`;
    label.textContent = q.label;
    if (q.required) {
      const star = document.createElement("span");
      star.className = "req";
      star.textContent = "*";
      label.append(star);
    }
    wrap.append(label);

    let input;
    if (q.type === "choice") {
      input = document.createElement("select");
      input.append(new Option("Pick one…", ""));
      for (const o of q.options) input.append(new Option(o, o));
    } else {
      input = document.createElement(q.type === "long" ? "textarea" : "input");
      if (q.type !== "long") input.type = "text";
      if (q.max) input.maxLength = q.max;
    }
    input.id = `q-${q.id}`;
    input.oninput = () => input.classList.remove("invalid");
    wrap.append(input);

    if (q.type === "long" && q.max) {
      const count = document.createElement("div");
      count.className = "count";
      const update = () => (count.textContent = `${input.value.length}/${q.max}`);
      input.addEventListener("input", update);
      update();
      wrap.append(count);
    }
    $("questions").append(wrap);
    fields[q.id] = input;
  }

  // ── Submit → Discord webhook ──────────────────────────────────────────────
  const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

  $("app-form").onsubmit = async (e) => {
    e.preventDefault();
    $("form-error").textContent = "";

    let firstBad = null;
    for (const q of cfg.questions) {
      const el = fields[q.id];
      if (q.required && !el.value.trim()) {
        el.classList.add("invalid");
        firstBad ??= el;
      }
    }
    if (firstBad) {
      firstBad.focus();
      $("form-error").textContent = "Please answer every required question.";
      return;
    }
    if (!$("agree").checked) {
      $("form-error").textContent = "Tick the box to confirm.";
      return;
    }

    const last = Number(store.get(COOLDOWN_KEY, localStorage) || 0);
    const wait = last + cfg.cooldownSeconds * 1000 - Date.now();
    if (wait > 0) {
      $("form-error").textContent = `You already applied. Try again in ${Math.ceil(wait / 60000)} min.`;
      return;
    }

    const embed = {
      title: "Mod application",
      description: `**Applicant:** <@${me.id}> (${clip(me.username, 40)})\n**Account created:** <t:${Math.floor(Number((BigInt(me.id) >> 22n) + 1420070400000n) / 1000)}:R>`,
      color: 0x5865f2,
      thumbnail: { url: $("me-avatar").src },
      fields: cfg.questions.slice(0, 23).map((q) => ({
        name: clip(q.label, 256),
        value: clip(fields[q.id].value.trim() || "—", 1000),
      })),
      // The bot reads this line to know who to DM. Don't change the format.
      footer: { text: `applicant:${me.id}` },
      timestamp: new Date().toISOString(),
    };

    // Discord caps an embed at 6000 characters; leave ~1200 for the bot's
    // status line and decline reason. Trim the longest answer until it fits.
    const size = () =>
      embed.title.length + embed.description.length + embed.footer.text.length +
      embed.fields.reduce((n, f) => n + f.name.length + f.value.length, 0);
    while (size() > 4700) {
      const longest = embed.fields.reduce((a, b) => (b.value.length > a.value.length ? b : a));
      longest.value = clip(longest.value, longest.value.length - 50);
    }

    const btn = $("submit-btn");
    btn.disabled = true;
    btn.textContent = "Sending…";
    try {
      const res = await fetch(cfg.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Mod Applications",
          embeds: [embed],
          allowed_mentions: { parse: [] },
        }),
      });
      if (!res.ok) throw new Error(`Discord said ${res.status}`);
      store.set(COOLDOWN_KEY, String(Date.now()), localStorage);
      store.del(TOKEN_KEY);
      show("done-view");
    } catch (err) {
      $("form-error").textContent = `Couldn't send your application (${err.message}). Try again in a minute.`;
    } finally {
      btn.disabled = false;
      btn.textContent = "Submit application";
    }
  };

  loadUser();
})();
