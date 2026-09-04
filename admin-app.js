const firebaseConfig = {
  apiKey: "AIzaSyD78MgA3rKInTGyAzFW7kmuq-xJENbnqSA", authDomain: "boss-tracker-893f8.firebaseapp.com",
  databaseURL: "https://boss-tracker-893f8-default-rtdb.asia-southeast1.firebasedatabase.app", projectId: "boss-tracker-893f8",
  storageBucket: "boss-tracker-893f8.firebasestorage.app", messagingSenderId: "279598212615", appId: "1:279598212615:web:d2cf2347c697425f77eca2"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
const uidInput = document.getElementById("uid");
const roleInput = document.getElementById("role");
const statusBox = document.getElementById("status");
const bossesBox = document.getElementById("bosses");
const userList = document.getElementById("userList");
let directoryData = {}, permissionsData = {}, bossConfigs = {}, selectedBossName = "";
const initialBossNames = ["Manticore","Dark Kimzark","Minisha","Pluma","Pena Top","Pena Bot","Quadra","Tank Top","Tank Bot","Cây","Sói","Bò","Cauda"];
let defaultsCreated = false;

auth.onAuthStateChanged(async user => {
  if (!user || user.isAnonymous) return location.replace("login.html");
  const profile = (await db.ref("users/" + user.uid).once("value")).val() || {};
  if (profile.role !== "admin") return location.replace("index.html");
  document.body.classList.remove("auth-pending");
  db.ref("directory").on("value", s => { directoryData = s.val() || {}; renderUsers(); });
  db.ref("users").on("value", s => { permissionsData = s.val() || {}; renderUsers(); });
  db.ref("bossConfigs").on("value", async s => {
    bossConfigs = s.val() || {};
    if (!Object.keys(bossConfigs).length && !defaultsCreated) {
      defaultsCreated = true;
      const defaults = Object.fromEntries(initialBossNames.map((name, order) => [name, { name, order, durationMinutes:240, sosMinutes:5, blueMinutes:5, yellowMinutes:5, redMinutes:3 }]));
      await db.ref("bossConfigs").set(defaults);
      return;
    }
    renderBossOptions(); renderBossConfigs();
  });
});

function bossNames() { return Object.values(bossConfigs).filter(Boolean).sort((a,b)=>(a.order??9999)-(b.order??9999)).map(x=>x.name); }
function setStatus(text, error=false) { statusBox.textContent=text; statusBox.style.color=error?"#ff7b72":"#79c0ff"; }
function logLabel(profile) {
  if (profile.role === "admin" || profile.logAccess === "full") return "Full";
  if (profile.logAccess === "view" || profile.canViewLogs === true) return "Chỉ xem";
  return "Không";
}
function renderBossOptions() {
  const selected = new Set([...bossesBox.querySelectorAll("input:checked")].map(x=>x.value));
  bossesBox.innerHTML="";
  bossNames().forEach(name=>{
    const label=document.createElement("label"), box=document.createElement("input");
    box.type="checkbox"; box.value=name; box.checked=selected.has(name); label.append(box,document.createTextNode(name)); bossesBox.appendChild(label);
  });
}
function renderUsers() {
  const uids=[...new Set([...Object.keys(directoryData),...Object.keys(permissionsData)])]; userList.innerHTML="";
  if(!uids.length){userList.innerHTML='<tr><td colspan="4" class="empty">Chưa có người dùng.</td></tr>';return;}
  uids.sort((a,b)=>(directoryData[a]?.email||a).localeCompare(directoryData[b]?.email||b));
  uids.forEach(uid=>{
    const info=directoryData[uid]||{}, p=permissionsData[uid]||{};
    const row=document.createElement("tr"); row.className="user-row"; row.dataset.uid=uid;
    const account=document.createElement("td"); account.innerHTML=`<strong></strong><div class="empty"></div>`; account.children[0].textContent=info.email||info.displayName||"Chưa có email"; account.children[1].textContent=uid;
    const role=document.createElement("td"); role.textContent=p.role==="admin"?"Admin":"User";
    const log=document.createElement("td"); log.textContent=logLabel(p);
    const rights=document.createElement("td"); const names=p.role==="admin"?["Tất cả boss"]:bossNames().filter(n=>p.allowedBosses?.[n]);
    if(!names.length){rights.textContent="Chưa được cấp boss";rights.className="empty";} else names.forEach(n=>{const b=document.createElement("span");b.className="badge";b.textContent=n;rights.appendChild(b);});
    row.append(account,role,log,rights); row.onclick=()=>selectUser(uid); userList.appendChild(row);
  });
}
function selectUser(uid){
  const p=permissionsData[uid]||{}; uidInput.value=uid; roleInput.value=p.role==="admin"?"admin":"user";
  document.getElementById("logAccess").value=p.role==="admin"?"full":(p.logAccess||(p.canViewLogs?"view":"none"));
  document.getElementById("logAccess").disabled=p.role==="admin";
  bossesBox.querySelectorAll("input").forEach(x=>x.checked=!!p.allowedBosses?.[x.value]);
  document.querySelectorAll(".user-row").forEach(r=>r.classList.toggle("selected",r.dataset.uid===uid));
}
document.getElementById("load").onclick=()=>uidInput.value.trim()?selectUser(uidInput.value.trim()):setStatus("Vui lòng nhập UID.",true);
document.getElementById("save").onclick=async()=>{
  const uid=uidInput.value.trim(); if(!uid)return setStatus("Vui lòng chọn người dùng.",true);
  const allowedBosses={}; bossesBox.querySelectorAll("input:checked").forEach(x=>allowedBosses[x.value]=true);
  await db.ref("users/"+uid).set({role:roleInput.value,logAccess:roleInput.value==="admin"?"full":document.getElementById("logAccess").value,allowedBosses,updatedAt:firebase.database.ServerValue.TIMESTAMP});
  setStatus("Đã lưu phân quyền.");
};
roleInput.onchange=()=>{const a=roleInput.value==="admin", x=document.getElementById("logAccess");x.disabled=a;if(a)x.value="full";};

function field(id){return document.getElementById(id);}
function renderBossConfigs(){
  const body=field("bossConfigList");body.innerHTML="";
  Object.values(bossConfigs).filter(Boolean).sort((a,b)=>(a.order??9999)-(b.order??9999)).forEach(c=>{
    const row=document.createElement("tr");row.className="user-row";row.innerHTML=`<td></td><td>${c.durationMinutes} phút</td><td>${c.sosMinutes} phút</td><td>${c.blueMinutes} phút</td><td>${c.yellowMinutes} phút</td><td>${c.redMinutes} phút</td>`;row.cells[0].textContent=c.name;row.onclick=()=>selectBoss(c.name);body.appendChild(row);
  });
}
function selectBoss(name){const c=bossConfigs[name];if(!c)return;selectedBossName=name;["bossName","durationMinutes","sosMinutes","blueMinutes","yellowMinutes","redMinutes"].forEach(id=>field(id).value=id==="bossName"?c.name:c[id]);field("bossName").disabled=true;}
function resetBossForm(){selectedBossName="";field("bossName").disabled=false;field("bossName").value="";field("durationMinutes").value=240;field("sosMinutes").value=5;field("blueMinutes").value=5;field("yellowMinutes").value=5;field("redMinutes").value=3;}
field("newBoss").onclick=resetBossForm;
field("saveBoss").onclick=async()=>{
  const name=field("bossName").value.trim(); if(!name||/[.#$\[\]\/]/.test(name))return field("bossStatus").textContent="Tên boss trống hoặc chứa ký tự không hợp lệ: . # $ [ ] /";
  const cfg={name,order:selectedBossName?(bossConfigs[name]?.order??9999):Object.keys(bossConfigs).length,durationMinutes:+field("durationMinutes").value,sosMinutes:+field("sosMinutes").value,blueMinutes:+field("blueMinutes").value,yellowMinutes:+field("yellowMinutes").value,redMinutes:+field("redMinutes").value};
  if(cfg.durationMinutes<1||cfg.redMinutes>cfg.yellowMinutes||cfg.yellowMinutes>cfg.durationMinutes||cfg.blueMinutes>cfg.durationMinutes)return field("bossStatus").textContent="Thông số không hợp lệ. Đỏ phải ≤ Vàng và các mốc không vượt thời gian hồi.";
  await db.ref("bossConfigs/"+name).set(cfg);field("bossStatus").textContent="Đã lưu cấu hình boss.";selectBoss(name);
};
field("deleteBoss").onclick=async()=>{if(!selectedBossName)return field("bossStatus").textContent="Hãy chọn boss cần xóa.";if(!confirm(`Xóa boss ${selectedBossName}? Các timer hiện có của boss này sẽ không còn hiển thị.`))return;await db.ref("bossConfigs/"+selectedBossName).remove();field("bossStatus").textContent="Đã xóa boss.";resetBossForm();};

document.getElementById("adminBack").onclick=()=>location.href="index.html";
document.getElementById("adminLog").onclick=()=>location.href="log.html";
document.getElementById("adminLogout").onclick=()=>auth.signOut().then(()=>location.replace("login.html"));
const themeToggle=document.getElementById("themeToggle");
function applyTheme(mode){document.body.classList.toggle("light",mode==="light");themeToggle.textContent=mode==="light"?"DARK MODE":"LIGHT MODE";}
applyTheme(localStorage.getItem("themeMode")||"dark");themeToggle.onclick=()=>{const mode=document.body.classList.contains("light")?"dark":"light";localStorage.setItem("themeMode",mode);applyTheme(mode);};
