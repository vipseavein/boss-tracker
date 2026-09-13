const firebaseConfig={apiKey:"AIzaSyD78MgA3rKInTGyAzFW7kmuq-xJENbnqSA",authDomain:"boss-tracker-893f8.firebaseapp.com",databaseURL:"https://boss-tracker-893f8-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"boss-tracker-893f8",storageBucket:"boss-tracker-893f8.firebasestorage.app",messagingSenderId:"279598212615",appId:"1:279598212615:web:d2cf2347c697425f77eca2"};
firebase.initializeApp(firebaseConfig);
const auth=firebase.auth(), db=firebase.database();
const state={logs:[],timers:{},bossConfigs:{},directory:{},profile:{},offset:0};
const listeners=[]; let clock=null, ready=false;
const el=id=>document.getElementById(id);
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ago=(time,now)=>time?Math.floor((now-time)/3600000)+" giờ":"Chưa đủ dữ liệu";
const date=time=>time?new Date(time).toLocaleString(BT_STATS_I18N.locale()):"Không có log";
function table(title,heads,rows) {
  return '<article class="panel full"><h2>'+esc(title)+'</h2><div class="table-wrap"><table><thead><tr>'+
    heads.map(x=>'<th>'+esc(x)+'</th>').join("")+'</tr></thead><tbody>'+
    (rows.length?rows.map(row=>'<tr>'+row.map((x,i)=>(i===0?'<td data-raw>':'<td>')+esc(x)+'</td>').join("")+'</tr>').join(""):
    '<tr><td colspan="'+heads.length+'">Không có dữ liệu phù hợp</td></tr>')+
    '</tbody></table></div></article>';
}
function render() {
  if(!ready)return;
  const now=Date.now()+state.offset;
  const names=Object.values(state.bossConfigs).filter(x=>x?.name &&
    (state.profile.role==="admin"||state.profile.allowedBosses?.[x.name]===true))
    .sort((a,b)=>(a.order??999)-(b.order??999)).map(x=>x.name);
  const result=BTStats.analyze({...state,names,now,days:+el("period").value});
  const {cells,period,suspicious,unknown,stale,missing,bossCounts,users}=result;
  const sortDesc=(a,b)=>b.count-a.count||a.name.localeCompare(b.name);
  const sortAsc=(a,b)=>a.count-b.count||a.name.localeCompare(b.name);
  const usersLabel=state.profile.role==="admin"?"User (gồm hồ sơ DB có 0 thao tác)":"User xuất hiện trong log được xem";
  const cards=[
    ["Checkbox đang bật",cells.filter(x=>x.active).length],
    ["Đang bật • cần kiểm tra ≥24h",suspicious.length],
    ["Đang bật • thiếu lịch sử",unknown.length],
    ["Thao tác thủ công trong kỳ",period.length],
    ["Boss/channel im lặng ≥24h",stale.length],
    ["Boss/channel chưa có log",missing.length]
  ];
  let html='<p class="panel">Các số liệu chỉ phản ánh log còn lưu. Nếu log từng bị xóa, không thể xác nhận đủ lịch sử 24 giờ. Cảnh báo là dấu hiệu cần kiểm tra, không khẳng định boss lỗi. Không tính tự hồi/SOS/viền vàng là thao tác checkbox. Mốc 24 giờ luôn cố định, bảng xếp hạng theo bộ lọc.</p>';
  html+='<p>Log thủ công cũ nhất còn thấy: '+esc(date(result.oldest))+'. '+
    (result.oldest && now-result.oldest>=+el("period").value*86400000?
      'Có log từ trước đầu kỳ; không đảm bảo lịch sử liên tục.':'Lịch sử chưa phủ hết khoảng thời gian đã chọn.')+
    '</p><section class="cards">'+cards.map(([k,v])=>'<div class="card"><div class="label">'+esc(k)+'</div><div class="value">'+v+'</div></div>').join("")+'</section><section class="grid">';
  html+=table("Ưu tiên kiểm tra: đang bật, không thấy tắt/reset ≥24 giờ",
    ["Boss","Channel","Tắt/reset gần nhất","Mốc đối chiếu","Thời gian","Căn cứ"],
    suspicious.sort((a,b)=>a.anchor-b.anchor).map(x=>[x.boss,x.ch,date(x.lastStop),date(x.anchor),ago(x.anchor,now),x.lastStop?"Log tắt/reset gần nhất":"Log bật cũ; chưa thấy log tắt/reset"]));
  html+=table("Checkbox đang bật nhưng thiếu dữ liệu để kết luận",["Boss","Channel","Log thủ công gần nhất"],
    unknown.map(x=>[x.boss,x.ch,date(x.last)]));
  html+=table("Boss đang bật: mức độ tắt/bật trong 24 giờ",["Boss","Số checkbox đang bật","Thao tác 24h trên các checkbox đang bật"],
    bossCounts.filter(x=>x.active).sort((a,b)=>b.recent24-a.recent24).map(x=>[x.name,x.active,x.recent24]));
  html+=table("Chi tiết checkbox đang bật — nhiều thao tác trước",["Boss","Channel","Tắt/bật 24h","Bật trong kỳ","Tắt/reset trong kỳ"],
    cells.filter(x=>x.active).sort((a,b)=>b.recent24-a.recent24).map(x=>[x.boss,x.ch,x.recent24,x.on,x.off]));
  html+=table("Boss hoạt động nhiều nhất",["Boss","Tổng thủ công","Bật","Tắt/reset"],
    [...bossCounts].sort(sortDesc).map(x=>[x.name,x.count,x.on,x.off]));
  html+=table("Boss hoạt động ít nhất (kể cả 0)",["Boss","Tổng thủ công"],
    [...bossCounts].sort(sortAsc).map(x=>[x.name,x.count]));
  html+=table("Người dùng hoạt động nhiều nhất", [usersLabel,"Thao tác"],
    [...users].sort(sortDesc).map(x=>[x.name,x.count]));
  html+=table("Người dùng hoạt động ít nhất", [usersLabel,"Thao tác"],
    [...users].sort(sortAsc).map(x=>[x.name,x.count]));
  html+=table("Boss/channel có log cũ nhưng im lặng ≥24 giờ",["Boss","Channel","Hiện tại","Thao tác cuối","Cách đây"],
    stale.sort((a,b)=>a.last-b.last).map(x=>[x.boss,x.ch,x.active?"Bật":"Tắt",date(x.last),ago(x.last,now)]));
  html+=table("Boss/channel không có lịch sử — không kết luận quá 24h",["Boss","Channel","Hiện tại"],
    missing.map(x=>[x.boss,x.ch,x.active?"Bật":"Tắt"]));
  html+='</section><p>Đếm thao tác, không phải số boss đã giết. User được gộp theo UID; đổi tên không tách thành người mới. Hồ sơ Database không đồng nghĩa danh sách Authentication.</p>';
  el("report").innerHTML=html;
  el("updated").textContent="Cập nhật: "+new Date(now).toLocaleTimeString(BT_STATS_I18N.locale());
  BT_STATS_I18N.apply();
}
function cleanup(){listeners.splice(0).forEach(([ref,fn])=>ref.off("value",fn));clearInterval(clock);ready=false;}
auth.onAuthStateChanged(async user=>{
  cleanup();
  if(!user||user.isAnonymous)return location.replace("login.html");
  document.body.classList.remove("auth-pending");
  try {
    const profileRef=db.ref("users/"+user.uid);
    state.profile=(await profileRef.once("value")).val()||{};
    const permitted=p=>p.role==="admin"||["view","full"].includes(p.logAccess)||(p.logAccess==null&&p.canViewLogs===true);
    if(!permitted(state.profile))return location.replace("index.html");
    const watch=(ref,fn)=>{ref.on("value",fn,error=>{ready=false;el("report").textContent="Không đọc được dữ liệu: "+error.message;BT_STATS_I18N.apply();});listeners.push([ref,fn]);};
    let pending=new Set(["logs","timers","bossConfigs",...(state.profile.role==="admin"?["directory"]:[])]);
    for(const key of pending) {
      watch(db.ref(key),snap=>{state[key]=key==="logs"?Object.values(snap.val()||{}):snap.val()||{};
        pending.delete(key);ready=pending.size===0;render();});
    }
    watch(profileRef,snap=>{state.profile=snap.val()||{};if(!permitted(state.profile)){cleanup();location.replace("index.html");return;}render();});
    watch(db.ref(".info/serverTimeOffset"),snap=>{state.offset=snap.val()||0;render();});
    el("admin").style.display=state.profile.role==="admin"?"block":"none";
    clock=setInterval(render,60000);
  } catch(error){el("updated").textContent="Không tải được dữ liệu: "+error.message;BT_STATS_I18N.apply();}
});
el("period").onchange=render;
for(const [id,path] of [["back","index.html"],["log","log.html"],["admin","admin.html"]])el(id).onclick=()=>location.href=path;
el("logout").onclick=()=>auth.signOut().then(()=>location.replace("login.html"));
function theme(){const light=localStorage.getItem("themeMode")==="light";document.body.classList.toggle("light",light);el("theme").textContent=light?"DARK MODE":"LIGHT MODE";BT_STATS_I18N.apply();}
theme();el("theme").onclick=()=>{localStorage.setItem("themeMode",document.body.classList.contains("light")?"dark":"light");theme();};
window.addEventListener("beforeunload",cleanup);
window.addEventListener("bosslanguagechange",()=>{render();BT_STATS_I18N.apply();});
BT_STATS_I18N.apply();
