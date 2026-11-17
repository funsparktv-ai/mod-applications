(() => {
  const cfg = window.APP_CONFIG;
  const $ = (id) => document.getElementById(id);
  const VIEWS = ["login-view", "pick-view", "form-view", "done-view"];
  const show = (id) => {
    for (const v of VIEWS) $(v).hidden = v !== id;
    $("me-bar").hidden = !me || id === "login-view" || id === "done-view";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const TOKEN_KEY = "modapp_token";
  const cooldownKey = (pos) => `modapp_last_submit_${pos}`;
  // Must match the Redirect in the Developer Portal exactly, so drop "index.html".
  const redirectUri = location.origin + location.pathname.replace(/index\.html$/, "");

  const store = {
    get(k, area = sessionStorage) { try { return area.getItem(k); } catch { return null; } },
    set(k, v, area = sessionStorage) { try { area.setItem(k, v); } catch {} },
    del(k, area = sessionStorage) { try { area.removeItem(k); } catch {} },
  };

  $("server-name").textContent = cfg.serverName;
  document.title = `${cfg.serverName} · Staff Applications`;

  if (cfg.discordClientId.startsWith("PASTE") || cfg.webhookUrl.startsWith("PASTE")) {
    $("setup-warning").hidden = false;
    return;
  }

  let me = null;
  let position = null;
  let fields = {};

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
    me = null;
    show("login-view");
  };
  $("change-btn").onclick = () => show("pick-view");
  $("another-btn").onclick = () => (me ? show("pick-view") : show("login-view"));

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
    show("pick-view");
  }

  // ── Position picker ───────────────────────────────────────────────────────
  for (const pos of cfg.positions) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "position";
    const icon = document.createElement("span");
    icon.className = "position-icon";
    icon.textContent = pos.icon || "⭐";
    const text = document.createElement("div");
    const name = document.createElement("div");
    name.className = "position-name";
    name.textContent = pos.name;
    const blurb = document.createElement("div");
    blurb.className = "position-blurb";
    blurb.textContent = pos.blurb || "";
    text.append(name, blurb);
    if (pos.requirement) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = pos.requirement;
      text.append(badge);
    }
    btn.append(icon, text);
    btn.onclick = () => openForm(pos);
    $("positions").append(btn);
  }

  // ── Build the form for the chosen position ────────────────────────────────
  const questionsFor = (pos) => [
    ...(cfg.commonQuestions || []),
    ...(pos.questions || []),
    ...(cfg.closingQuestions || []),
  ];

  function buildQuestion(q) {
    const wrap = document.createElement("div");
    wrap.className = "q";
    const label = document.createElement("label");
    label.htmlFor = `q-${q.id}`;
    let input;

    if (q.type === "confirm") {
      wrap.classList.add("confirm");
      input = document.createElement("input");
      input.type = "checkbox";
      input.id = `q-${q.id}`;
      input.onchange = () => wrap.classList.remove("invalid-box");
      const span = document.createElement("span");
      span.textContent = q.label;
      label.append(input, span);
      wrap.append(label);
      return { wrap, input };
    }

    label.textContent = q.label;
    if (q.required) {
      const star = document.createElement("span");
      star.className = "req";
      star.textContent = "*";
      label.append(star);
    }
    wrap.append(label);

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
    return { wrap, input };
  }

  function openForm(pos) {
    position = pos;
    $("chosen-icon").textContent = pos.icon || "⭐";
    $("chosen-name").textContent = pos.name;
    $("questions").replaceChildren();
    $("form-error").textContent = "";
    $("agree").checked = false;
    fields = {};
    for (const q of questionsFor(pos)) {
      const { wrap, input } = buildQuestion(q);
      $("questions").append(wrap);
      fields[q.id] = input;
    }
    show("form-view");
  }

  // ── Submit → Discord webhook ──────────────────────────────────────────────
  const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  const answerOf = (q) => {
    const el = fields[q.id];
    if (q.type === "confirm") return el.checked ? "✅ Yes" : "❌ No";
    return el.value.trim();
  };

  $("app-form").onsubmit = async (e) => {
    e.preventDefault();
    $("form-error").textContent = "";
    const questions = questionsFor(position);

    let firstBad = null;
    for (const q of questions) {
      const el = fields[q.id];
      const missing = q.type === "confirm" ? !el.checked : !el.value.trim();
      if (q.required && missing) {
        if (q.type === "confirm") el.closest(".q").classList.add("invalid-box");
        else el.classList.add("invalid");
        firstBad ??= el;
      }
    }
    if (firstBad) {
      firstBad.focus();
      $("form-error").textContent = "Please answer every required question and tick any required boxes.";
      return;
    }
    if (!$("agree").checked) {
      $("form-error").textContent = "Tick the box to confirm.";
      return;
    }

    const last = Number(store.get(cooldownKey(position.id), localStorage) || 0);
    const wait = last + cfg.cooldownSeconds * 1000 - Date.now();
    if (wait > 0) {
      $("form-error").textContent =
        `You already applied for ${position.name}. Try again in ${Math.ceil(wait / 60000)} min.`;
      return;
    }

    const created = Math.floor(Number((BigInt(me.id) >> 22n) + 1420070400000n) / 1000);
    const embed = {
      title: `${clip(position.name, 80)} application`,
      description:
        `**Applicant:** <@${me.id}> (${clip(me.username, 40)})\n` +
        `**Position:** ${position.icon || ""} ${position.name}\n` +
        `**Account created:** <t:${created}:R>`,
      color: 0x5865f2,
      thumbnail: { url: $("me-avatar").src },
      fields: questions.slice(0, 23).map((q) => ({
        name: clip(q.label, 256),
        value: clip(answerOf(q) || "—", 1000),
      })),
      // The bot reads this line to know who to DM and which role it was. Don't change the format.
      footer: { text: `applicant:${me.id} · position:${position.id}` },
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
          username: "Staff Applications",
          embeds: [embed],
          allowed_mentions: { parse: [] },
        }),
      });
      if (!res.ok) throw new Error(`Discord said ${res.status}`);
      store.set(cooldownKey(position.id), String(Date.now()), localStorage);
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
