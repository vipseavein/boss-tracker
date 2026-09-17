const firebaseConfig = {
  apiKey: "AIzaSyD78MgA3rKInTGyAzFW7kmuq-xJENbnqSA",
  authDomain: "boss-tracker-893f8.firebaseapp.com",
  databaseURL: "https://boss-tracker-893f8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "boss-tracker-893f8",
  storageBucket: "boss-tracker-893f8.firebasestorage.app",
  messagingSenderId: "279598212615",
  appId: "1:279598212615:web:d2cf2347c697425f77eca2"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
const table = document.getElementById("bossTable");
const notifications = document.getElementById("notifications");
const columnSelector = document.getElementById("columnSelector");
const themeToggle = document.getElementById("themeToggle");

// ===== BOSS ALERT AUDIO =====
// No extra UI. alert.ogg is local and every boss uses an independent audio source,
// so simultaneous spawns can sound at the same time. Failed starts are retried briefly.
const alertSoundElement = document.getElementById("alertSound");
if (alertSoundElement) {
  try {
    alertSoundElement.preload = "auto";
    alertSoundElement.volume = 1;
    alertSoundElement.load();
  } catch (_) {}
}

let bossAudioContext = null;
let bossAudioBuffer = null;
let bossAudioBytesPromise = null;
let bossAudioDecodePromise = null;
let bossAudioMaster = null;
const pendingBossAlerts = new Map();

function preloadBossAlertBytes() {
  if (bossAudioBytesPromise) return bossAudioBytesPromise;
  bossAudioBytesPromise = fetch("alert.ogg", { cache: "force-cache" })
    .then(response => {
      if (!response.ok) throw new Error(`alert.ogg HTTP ${response.status}`);
      return response.arrayBuffer();
    })
    .catch(error => {
      console.warn("Boss alert preload failed:", error);
      bossAudioBytesPromise = null;
      return null;
    });
  return bossAudioBytesPromise;
}

function getBossAudioContext() {
  if (bossAudioContext) return bossAudioContext;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  try {
    bossAudioContext = new AudioContextClass();
    if (typeof bossAudioContext.createDynamicsCompressor === "function") {
      bossAudioMaster = bossAudioContext.createDynamicsCompressor();
      bossAudioMaster.threshold.value = -8;
      bossAudioMaster.knee.value = 16;
      bossAudioMaster.ratio.value = 4;
      bossAudioMaster.attack.value = 0.002;
      bossAudioMaster.release.value = 0.15;
      bossAudioMaster.connect(bossAudioContext.destination);
    }
  } catch (error) {
    console.warn("Web Audio unavailable:", error);
  }
  return bossAudioContext;
}

function bossAudioDestination(context) {
  return bossAudioMaster || context.destination;
}

async function decodeBossAlert() {
  if (bossAudioBuffer) return bossAudioBuffer;
  if (bossAudioDecodePromise) return bossAudioDecodePromise;
  bossAudioDecodePromise = (async () => {
    const context = getBossAudioContext();
    if (!context) return null;
    const bytes = await preloadBossAlertBytes();
    if (!bytes) return null;
    bossAudioBuffer = await context.decodeAudioData(bytes.slice(0));
    return bossAudioBuffer;
  })().catch(error => {
    console.warn("Boss alert decode failed:", error);
    bossAudioDecodePromise = null;
    return null;
  });
  return bossAudioDecodePromise;
}

async function resumeBossAudio() {
  try {
    const context = getBossAudioContext();
    if (!context) return false;
    if (context.state === "suspended") await context.resume();
    if (context.state !== "running") return false;
    await decodeBossAlert();
    return true;
  } catch (_) {
    return false;
  }
}

function retryPendingBossAlerts() {
  const current = now();
  for (const [key, item] of [...pendingBossAlerts.entries()]) {
    if (current - item.expireAt > 15000) {
      pendingBossAlerts.delete(key);
      continue;
    }
    tryStartBossAlert(item.id, item.expireAt);
  }
}

// Existing normal interaction silently prepares sound; no extra button/status is added.
["pointerdown", "keydown", "touchstart"].forEach(type => {
  window.addEventListener(type, () => {
    resumeBossAudio().then(retryPendingBossAlerts);
  }, { passive: true, capture: true });
});
window.addEventListener("focus", () => resumeBossAudio().then(retryPendingBossAlerts));
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") resumeBossAudio().then(retryPendingBossAlerts);
});

function playFallbackBeep() {
  try {
    const context = bossAudioContext;
    if (!context || context.state !== "running") return false;
    const start = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.28, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
    oscillator.connect(gain);
    gain.connect(bossAudioDestination(context));
    oscillator.start(start);
    oscillator.stop(start + 0.23);
    return true;
  } catch (_) {
    return false;
  }
}

async function playBossAlert() {
  // First choice: decoded local OGG through an independent Web Audio source.
  try {
    const context = getBossAudioContext();
    if (context?.state === "suspended") {
      try { await context.resume(); } catch (_) {}
    }
    const buffer = await decodeBossAlert();
    if (context && context.state === "running" && buffer) {
      const source = context.createBufferSource();
      const gain = context.createGain();
      gain.gain.value = 1;
      source.buffer = buffer;
      source.connect(gain);
      gain.connect(bossAudioDestination(context));
      source.start(context.currentTime);
      return true;
    }
  } catch (error) {
    console.warn("Web Audio boss alert failed:", error);
  }

  // Second choice: a NEW HTMLAudio instance for every boss, so no sound can cut another.
  try {
    const audio = new Audio("alert.ogg");
    audio.preload = "auto";
    audio.volume = 1;
    const result = audio.play();
    if (result && typeof result.then === "function") await result;
    return true;
  } catch (error) {
    console.warn("HTML boss alert failed:", error);
  }

  return playFallbackBeep();
}

async function tryStartBossAlert(id, expireAt) {
  const cell = document.getElementById("t_" + id);
  if (!cell || !Number.isFinite(+expireAt)) return;

  const alertKey = String(+expireAt);
  if (cell.dataset.alertedExpire === alertKey || cell.dataset.alertingExpire === alertKey) return;

  const pendingKey = `${id}|${alertKey}`;
  pendingBossAlerts.set(pendingKey, { id, expireAt: +expireAt });
  cell.dataset.alertingExpire = alertKey;

  let started = false;
  try {
    started = await playBossAlert();
  } catch (_) {}

  if (cell.dataset.alertingExpire === alertKey) delete cell.dataset.alertingExpire;

  if (started) {
    cell.dataset.alertedExpire = alertKey;
    pendingBossAlerts.delete(pendingKey);
    return;
  }

  // If the browser was temporarily suspended, retry quickly without changing timer/Firebase.
  if (now() - (+expireAt) <= 15000) {
    setTimeout(() => tryStartBossAlert(id, expireAt), 250);
  } else {
    pendingBossAlerts.delete(pendingKey);
  }
}

function triggerBossAlertForExpire(id, expireAt) {
  tryStartBossAlert(id, expireAt);
}

// Download the local file immediately, but do not require AudioContext to be running yet.
preloadBossAlertBytes();

const defaultBossNames = ["Manticore","Dark Kimzark","Minisha","Pluma","Pena Top","Pena Bot","Quadra","Tank Top","Tank Bot","Cây","Sói","Bò","Cauda"];
const defaultBossConfigs = Object.fromEntries(defaultBossNames.map((name, order) => [name, {
  name, order, durationMinutes: 240, sosMinutes: 5, blueMinutes: 5, yellowMinutes: 5, redMinutes: 3
}]));

let currentUser = null;
let currentProfile = {};
let bossConfigs = {};
let visibleBosses = [];
let timersData = {};
let serverOffset = 0;
let globalTick = null;
const tr = (key, vars={}) => window.BT_I18N?.t(key, vars) || key;

function isAdmin() { return currentProfile.role === "admin"; }
function logAccess() {
  if (isAdmin()) return "full";
  return currentProfile.logAccess || (currentProfile.canViewLogs === true ? "view" : "none");
}
function canUseBoss(name) { return isAdmin() || currentProfile.allowedBosses?.[name] === true; }
function now() { return Date.now() + serverOffset; }
function configFor(name) { return bossConfigs[name] || defaultBossConfigs[name] || { name, durationMinutes: 240, sosMinutes: 5, blueMinutes: 5, yellowMinutes: 5, redMinutes: 3 }; }

function applyTheme(mode) {
  document.body.classList.toggle("light", mode === "light");
  themeToggle.textContent = mode === "light" ? "Dark Mode" : "Light Mode";
}
applyTheme(localStorage.getItem("themeMode") || "dark");
themeToggle.onclick = () => {
  const mode = document.body.classList.contains("light") ? "dark" : "light";
  localStorage.setItem("themeMode", mode);
  applyTheme(mode);
};
document.getElementById("logoutButton").onclick = () => auth.signOut().then(() => location.replace("login.html"));
document.getElementById("logButton").onclick = () => location.href = "log.html";
document.getElementById("statsButton").onclick = () => location.href = "stats.html";
document.getElementById("adminButton").onclick = () => location.href = "admin.html";

db.ref(".info/serverTimeOffset").on("value", snap => serverOffset = snap.val() || 0);

auth.onAuthStateChanged(async user => {
  if (!user || user.isAnonymous) return location.replace("login.html");
  currentUser = user;
  try {
    currentProfile = (await db.ref("users/" + user.uid).once("value")).val() || {};
    await db.ref("directory/" + user.uid).update({
      email: user.email || "",
      displayName: user.displayName || user.email?.split("@")[0] || "User",
      lastLoginAt: firebase.database.ServerValue.TIMESTAMP
    });
    const configSnap = await db.ref("bossConfigs").once("value");
    bossConfigs = configSnap.val() || {};
    if (!Object.keys(bossConfigs).length) {
      bossConfigs = defaultBossConfigs;
      if (isAdmin()) await db.ref("bossConfigs").set(defaultBossConfigs);
    }
  } catch (error) {
    console.error(error);
    bossConfigs = defaultBossConfigs;
  }

  visibleBosses = Object.values(bossConfigs)
    .filter(config => config && config.name && canUseBoss(config.name))
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999) || a.name.localeCompare(b.name));

  await migrateLegacyBossFields();

  const displayName = user.displayName || user.email?.split("@")[0] || "User";
  document.getElementById("userGreeting").innerHTML = "";
  document.getElementById("userGreeting").append(tr("greeting") + " “", Object.assign(document.createElement("strong"), { textContent: displayName }), "”");
  document.getElementById("logButton").style.display = logAccess() !== "none" ? "block" : "none";
  document.getElementById("statsButton").style.display = logAccess() !== "none" ? "block" : "none";
  document.getElementById("adminButton").style.display = isAdmin() ? "block" : "none";
  buildInterface();
  attachFirebaseListeners();
  document.body.classList.remove("auth-pending");
});

async function migrateLegacyBossFields() {
  try {
    const [timerSnap, colorSnap] = await Promise.all([
      db.ref("timers").once("value"),
      db.ref("colors").once("value")
    ]);
    const allowed = new Set(visibleBosses.map(config => config.name));
    const jobs = [];

    Object.entries(timerSnap.val() || {}).forEach(([id, value]) => {
      const boss = value?.boss || id.split("_").slice(1).join("_");
      if (allowed.has(boss) && !value?.boss) jobs.push(db.ref("timers/" + id).update({ boss }));
    });
    Object.entries(colorSnap.val() || {}).forEach(([id, value]) => {
      const boss = value?.boss || id.split("_").slice(1).join("_");
      if (!allowed.has(boss) || value?.boss) return;
      jobs.push(db.ref("colors/" + id).set(typeof value === "object" ? { ...value, boss } : { active: true, boss }));
    });
    await Promise.all(jobs);
  } catch (error) {
    console.warn("Không thể nâng cấp một số timer cũ:", error);
  }
}

function buildInterface() {
  table.innerHTML = "";
  columnSelector.innerHTML = "";
  const header = table.insertRow();
  const channelHead = document.createElement("th");
    channelHead.className = "channel-col"; channelHead.textContent = tr("channel"); header.appendChild(channelHead);

  const saved = JSON.parse(localStorage.getItem("columnVisibility") || "{}");
  visibleBosses.forEach((config, index) => {
    const th = document.createElement("th"); th.textContent = config.name; header.appendChild(th);
    const label = document.createElement("label");
    const toggle = document.createElement("input");
    toggle.type = "checkbox"; toggle.className = "colToggle"; toggle.dataset.col = String(index + 1);
    toggle.checked = saved[config.name] !== false;
    label.append(toggle, document.createTextNode(" " + config.name));
    columnSelector.appendChild(label);
  });

  for (let ch = 1; ch <= 30; ch++) {
    const row = table.insertRow();
    const channel = row.insertCell(); channel.className = "channel-col"; channel.textContent = ch;
    visibleBosses.forEach(config => {
      const id = `${ch}_${config.name}`;
      const td = row.insertCell();
      const cb = document.createElement("input"); cb.type = "checkbox"; cb.id = id;
      const timer = document.createElement("div"); timer.className = "timer"; timer.id = "t_" + id; timer.textContent = "--";
      td.append(cb, timer);
      bindCellEvents(ch, config, cb, timer);
    });
  }

  document.querySelectorAll(".colToggle").forEach(toggle => toggleColumn(+toggle.dataset.col, toggle.checked));
  columnSelector.onchange = event => {
    if (!event.target.classList.contains("colToggle")) return;
    const index = +event.target.dataset.col;
    toggleColumn(index, event.target.checked);
    const values = {};
    visibleBosses.forEach((config, i) => values[config.name] = document.querySelector(`.colToggle[data-col="${i + 1}"]`).checked);
    localStorage.setItem("columnVisibility", JSON.stringify(values));
  };

  table.onmouseover = event => {
    const cell = event.target.closest("td,th"); if (!cell) return;
    table.querySelectorAll(".highlight-row").forEach(x => x.classList.remove("highlight-row"));
    table.querySelectorAll(".highlight-col").forEach(x => x.classList.remove("highlight-col"));
    cell.parentElement.classList.add("highlight-row");
    [...table.rows].forEach(row => row.cells[cell.cellIndex]?.classList.add("highlight-col"));
  };
  table.onmouseleave = () => {
    table.querySelectorAll(".highlight-row").forEach(x => x.classList.remove("highlight-row"));
    table.querySelectorAll(".highlight-col").forEach(x => x.classList.remove("highlight-col"));
  };
}

function toggleColumn(index, show) {
  [...table.rows].forEach(row => { if (row.cells[index]) row.cells[index].style.display = show ? "" : "none"; });
}

function getLogUser() {
  return { userUid: currentUser.uid, userEmail: currentUser.email || "Unknown", userName: currentUser.displayName || "" };
}

function bindCellEvents(ch, config, cb, timer) {
  const id = `${ch}_${config.name}`;
  cb.onclick = async () => {
    if (cb.checked) {
      await db.ref("timers/" + id).set({ checked: true, expireAt: now() + config.durationMinutes * 60000, boss: config.name, lastSpawnAt: null });
      db.ref("logs").push({ id, boss: config.name, time: now(), action: "check", ...getLogUser() });
    } else {
      const data = timersData[id];
      if (data?.expireAt) {
        const remain = Math.floor((data.expireAt - now()) / 1000);
        if (remain >= 180 && remain <= (config.durationMinutes * 60 - 120) && !confirm(tr("resetConfirm"))) { cb.checked = true; return; }
      }
      await db.ref("timers/" + id).remove();
      db.ref("logs").push({ id, boss: config.name, time: now(), action: "uncheck", ...getLogUser() });
    }
  };
  cb.oncontextmenu = event => {
    event.preventDefault();
    const ref = db.ref("colors/" + id);
    ref.once("value").then(snap => snap.exists() ? ref.remove() : ref.set({ active: true, boss: config.name }));
  };
  timer.oncontextmenu = event => {
    event.preventDefault();
    const minutes = parseInt(prompt(tr("minutePrompt")), 10);
    if (!Number.isInteger(minutes) || minutes <= 0) return alert(tr("invalidMinutes"));
    db.ref("timers/" + id).set({ checked: true, expireAt: now() + minutes * 60000, boss: config.name, lastSpawnAt: null });
  };
  timer.onclick = () => db.ref("timers/" + id).update({ sosOff: true });
}

function attachFirebaseListeners() {
  let timersInitialSyncDone = false;

  db.ref("timers").on("value", snapshot => {
    const nextTimersData = snapshot.val() || {};
    const previousTimersData = timersData || {};
    const currentTime = now();

    Object.entries(nextTimersData).forEach(([id, data]) => {
      // v6.9.6+: every automatic reset carries the exact spawn time in Firebase.
      // All connected clients receive the same event, so sound no longer depends only
      // on whether their local 1-second interval happened to see 00:00.
      const spawnAt = +data?.lastSpawnAt;
      if (Number.isFinite(spawnAt) && currentTime - spawnAt >= -2500 && currentTime - spawnAt <= 15000) {
        triggerBossAlertForExpire(id, spawnAt);
      }

      // Backward-compatible recovery if an older client wins the reset transaction
      // and therefore does not write lastSpawnAt.
      if (timersInitialSyncDone) {
        const previous = previousTimersData[id];
        if (!previous?.checked || !previous.expireAt || !data?.checked || !data.expireAt) return;
        const oldExpire = +previous.expireAt;
        const newExpire = +data.expireAt;
        const age = currentTime - oldExpire;
        if (newExpire > oldExpire && age >= -2500 && age <= 15000) {
          triggerBossAlertForExpire(id, oldExpire);
        }
      }
    });

    timersData = nextTimersData;
    visibleBosses.forEach(config => {
      for (let ch = 1; ch <= 30; ch++) updateTimerCell(`${ch}_${config.name}`, timersData[`${ch}_${config.name}`]);
    });
    timersInitialSyncDone = true;
    ensureTick();
    updateNotifications();
  });

  db.ref("colors").on("value", snapshot => {
    const colors = snapshot.val() || {};
    visibleBosses.forEach(config => {
      for (let ch = 1; ch <= 30; ch++) {
        const id = `${ch}_${config.name}`;
        const cb = document.getElementById(id);
        cb?.classList.toggle("right-clicked", !!colors[id]);
        updateBlink(cb, document.getElementById("t_" + id));
      }
    });
  });
}
function updateTimerCell(id, data) {
  const cb = document.getElementById(id), cell = document.getElementById("t_" + id);
  if (!cb || !cell) return;
  if (!data?.checked || !data.expireAt) {
    cb.checked = false; cell.textContent = "--"; cell.className = "timer";
    delete cell.dataset.expire; delete cell.dataset.sosStart; delete cell.dataset.sosOff;
    delete cell.dataset.alertedExpire; delete cell.dataset.alertingExpire;
    return updateBlink(cb, cell);
  }
  cb.checked = true;
  cell.dataset.expire = data.expireAt;
  if (data.sosStart) cell.dataset.sosStart = data.sosStart; else delete cell.dataset.sosStart;
  if (data.sosOff) cell.dataset.sosOff = "1"; else delete cell.dataset.sosOff;
  updateBlink(cb, cell);
}

function updateBlink(cb, cell) {
  if (!cb || !cell) return;
  cb.classList.toggle("blink-yellow", cb.classList.contains("right-clicked") && !cell.dataset.expire);
}

function ensureTick() {
  if (globalTick) return;
  globalTick = setInterval(() => {
    document.querySelectorAll(".timer[data-expire]").forEach(cell => {
      const id = cell.id.slice(2);
      const boss = id.split("_").slice(1).join("_");
      const config = configFor(boss);
      const expire = +cell.dataset.expire;
      const remain = Math.floor((expire - now()) / 1000);

      // 00:00 always has highest priority. Never let SOS rendering skip the alert.
      if (remain <= 0) {
        cell.textContent = "BOSS";
        cell.className = "timer red";
        triggerBossAlertForExpire(id, expire);

        // Keep the expired value on Firebase for ~1 second before auto-reset.
        // This gives every connected client a chance to observe 00:00 locally.
        if (!cell.dataset.resetting) {
          cell.dataset.resetting = "1";
          const expectedExpire = expire;

          setTimeout(() => {
            db.ref("timers/" + id).transaction(current => {
              if (!current?.checked || current.expireAt !== expectedExpire) return;
              const resetNow = now();
              return {
                checked: true,
                expireAt: resetNow + config.durationMinutes * 60000,
                sosStart: resetNow,
                sosOff: false,
                boss,
                lastSpawnAt: expectedExpire
              };
            }).finally(() => {
              setTimeout(() => delete cell.dataset.resetting, 500);
            });
          }, 1100);
        }
        return;
      }

      if (cell.dataset.sosStart && !cell.dataset.sosOff) {
        const elapsed = Math.floor((now() - +cell.dataset.sosStart) / 1000);
        if (elapsed <= config.sosMinutes * 60 && Math.floor(now() / 1000) % 2 === 0) {
          cell.textContent = "_SoS_";
          cell.className = "timer red";
          return;
        }
      }

      cell.textContent = `${String(Math.floor(remain / 60)).padStart(2,"0")}:${String(remain % 60).padStart(2,"0")}`;
      const minutes = remain / 60;
      const blueStart = config.durationMinutes - config.blueMinutes;
      cell.className = "timer " + (minutes >= blueStart ? "blue" : minutes <= config.redMinutes ? "red" : minutes <= config.yellowMinutes ? "yellow" : "green");
    });
    updateNotifications();
  }, 1000);
}

function updateNotifications() {
  const items = [];
  Object.entries(timersData).forEach(([id, data]) => {
    if (!data?.checked || !data.expireAt) return;
    const [ch, ...parts] = id.split("_");
    const boss = parts.join("_");
    if (!visibleBosses.some(config => config.name === boss)) return;
    const remain = Math.floor((data.expireAt - now()) / 1000);
    if (remain > 0) items.push({ ch, boss, remain, config: configFor(boss) });
  });
  items.sort((a, b) => a.remain - b.remain);
  notifications.innerHTML = "";
  items.slice(0, 5).forEach(item => {
    const div = document.createElement("div");
    div.textContent = `${tr("channel")} ${item.ch} - Boss ${item.boss} - ${tr("remaining")} ${String(Math.floor(item.remain / 60)).padStart(2,"0")}:${String(item.remain % 60).padStart(2,"0")}`;
    const minutes = item.remain / 60;
    div.className = minutes >= item.config.durationMinutes - item.config.blueMinutes ? "blue" : minutes <= item.config.redMinutes ? "red" : minutes <= item.config.yellowMinutes ? "yellow" : "green";
    notifications.appendChild(div);
  });
}

window.addEventListener("bosslanguagechange", () => location.reload());
