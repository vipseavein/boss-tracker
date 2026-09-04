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
  document.getElementById("userGreeting").append("Xin chào “", Object.assign(document.createElement("strong"), { textContent: displayName }), "”");
  document.getElementById("logButton").style.display = logAccess() !== "none" ? "block" : "none";
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
  channelHead.className = "channel-col"; channelHead.textContent = "Channel"; header.appendChild(channelHead);

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
      await db.ref("timers/" + id).set({ checked: true, expireAt: now() + config.durationMinutes * 60000, boss: config.name });
      db.ref("logs").push({ id, boss: config.name, time: now(), action: "check", ...getLogUser() });
    } else {
      const data = timersData[id];
      if (data?.expireAt) {
        const remain = Math.floor((data.expireAt - now()) / 1000);
        if (remain >= 180 && remain <= (config.durationMinutes * 60 - 120) && !confirm("Bạn có muốn reset time boss?")) { cb.checked = true; return; }
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
    const minutes = parseInt(prompt("Nhập số PHÚT muốn đếm ngược:"), 10);
    if (!Number.isInteger(minutes) || minutes <= 0) return alert("Vui lòng nhập số phút hợp lệ!");
    db.ref("timers/" + id).set({ checked: true, expireAt: now() + minutes * 60000, boss: config.name });
  };
  timer.onclick = () => db.ref("timers/" + id).update({ sosOff: true });
}

function attachFirebaseListeners() {
  db.ref("timers").on("value", snapshot => {
    timersData = snapshot.val() || {};
    visibleBosses.forEach(config => {
      for (let ch = 1; ch <= 30; ch++) updateTimerCell(`${ch}_${config.name}`, timersData[`${ch}_${config.name}`]);
    });
    ensureTick(); updateNotifications();
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

      if (cell.dataset.sosStart && !cell.dataset.sosOff) {
        const elapsed = Math.floor((now() - +cell.dataset.sosStart) / 1000);
        if (elapsed <= config.sosMinutes * 60 && Math.floor(now() / 1000) % 2 === 0) {
          cell.textContent = "_SoS_"; cell.className = "timer red"; return;
        }
      }

      if (remain <= 0) {
        cell.textContent = "BOSS"; cell.className = "timer red";
        if (!cell.dataset.resetting) {
          cell.dataset.resetting = "1";
          const expectedExpire = expire;
          db.ref("timers/" + id).transaction(current => {
            if (!current?.checked || current.expireAt !== expectedExpire) return;
            return { checked: true, expireAt: now() + config.durationMinutes * 60000, sosStart: now(), sosOff: false, boss };
          }).finally(() => setTimeout(() => delete cell.dataset.resetting, 1500));
        }
        return;
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
    div.textContent = `Kênh ${item.ch} - Boss ${item.boss} - Còn ${String(Math.floor(item.remain / 60)).padStart(2,"0")}:${String(item.remain % 60).padStart(2,"0")}`;
    const minutes = item.remain / 60;
    div.className = minutes >= item.config.durationMinutes - item.config.blueMinutes ? "blue" : minutes <= item.config.redMinutes ? "red" : minutes <= item.config.yellowMinutes ? "yellow" : "green";
    notifications.appendChild(div);
  });
}
