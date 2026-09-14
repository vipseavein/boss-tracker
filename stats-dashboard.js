
(function(){
const labels={
map:["Bản đồ theo dõi","Tracking map","Mapa ng pagsubaybay","Mapa de acompanhamento"],
recent:["Có thao tác <12h","Activity <12h","May aksyon <12h","Atividade <12h"],
warn:["Cần kiểm tra 12–24h","Review 12–24h","Suriin 12–24h","Verificar 12–24h"],
danger:["Cần kiểm tra 24–48h","Review 24–48h","Suriin 24–48h","Verificar 24–48h"],
over24:["Cần kiểm tra ≥24h","Review ≥24h","Suriin ≥24h","Verificar ≥24h"],
p12:["Đang bật, chưa tắt/reset 12–16h","Checked, no stop/reset 12–16h","Naka-check, walang stop/reset 12–16h","Ativado, sem desativação/reset 12–16h"],
p16:["Đang bật, chưa tắt/reset 16–24h","Checked, no stop/reset 16–24h","Naka-check, walang stop/reset 16–24h","Ativado, sem desativação/reset 16–24h"],
p24:["Đang bật, chưa tắt/reset >24h","Checked, no stop/reset >24h","Naka-check, walang stop/reset >24h","Ativado, sem desativação/reset >24h"],
overflow:["Trên 48h vẫn giữ màu đỏ. Ưu tiên dựa trên mốc tắt/reset; thiếu mốc dùng log bật.","Over 48h stays red. Priority uses the stop/reset timestamp, or a check log if unavailable.","Pula pa rin lampas 48h. Batayan ang stop/reset, o check log kung wala.","Acima de 48h permanece vermelho. Prioridade usa desativação/reset, ou log de ativação se ausente."],
unknown:["Thiếu lịch sử","Missing history","Kulang na kasaysayan","Histórico insuficiente"],
off:["Không hoạt động","Inactive","Hindi aktibo","Inativo"],
hint:["Chọn một ô để xem chi tiết. Chấm trắng: checkbox đang bật.","Select a cell for details. White dot: currently checked.","Pumili ng cell para sa detalye. Puting tuldok: naka-check.","Selecione uma célula. Ponto branco: checkbox ativado."],
activity:["Hoạt động theo thời gian","Activity over time","Aktibidad sa paglipas ng oras","Atividade ao longo do tempo"],
on:["Bật","On","Naka-on","Ativado"],stop:["Tắt/reset","Stop/reset","Stop/reset","Desativação/reset"],
note:["Chỉ đếm log còn lưu; cột trống không chứng minh không có hoạt động.","Retained logs only; an empty bar does not prove inactivity.","Natitirang logs lamang; hindi patunay ng kawalan ng aksyon ang bakanteng bar.","Apenas logs preservados; barra vazia não comprova inatividade."],
coverage:["Channel đang bật theo boss","Checked channels by boss","Mga naka-check na channel bawat boss","Canais ativados por boss"],
rank:["Đóng góp người dùng","User contributions","Kontribusyon ng user","Contribuições dos usuários"],
most:["Nhiều nhất","Most active","Pinakaaktibo","Mais ativos"],least:["Ít nhất","Least active","Hindi gaanong aktibo","Menos ativos"],
alert:["Cần kiểm tra ngay","Review queue","Kailangang suriin","Fila de verificação"],
more:["Bảng chi tiết đầy đủ","All detailed tables","Lahat ng detalyadong talahanayan","Todas as tabelas detalhadas"],
empty:["Không có dữ liệu phù hợp","No matching data","Walang tugmang data","Nenhum dado correspondente"],
last:["Thao tác gần nhất","Latest action","Huling aksyon","Última ação"],
actor:["Người thao tác cuối","Last actor","Huling gumawa","Último usuário"],
state:["Trạng thái","State","Estado","Estado"],
close:["Đóng","Close","Isara","Fechar"],
hours:["giờ","hours","oras","horas"],
actions:["thao tác","actions","aksyon","ações"],
};
function t(k){return labels[k][({vi:0,en:1,ph:2,br:3}[localStorage.getItem("bossTrackerLanguage")]||0)]}
const e=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let order="most",current=null;
function status(c,now){
 if(c.unknown||!c.last)return "unknown";
 if(c.active && c.anchor && now-c.anchor>=86400000)return "danger";
 if(c.active && c.anchor && now-c.anchor>=43200000)return "warn";
 return now-c.last<43200000?"recent":"off";
}
function bars(users){
 const sorted=[...users].sort((a,b)=>order==="most"?b.count-a.count:a.count-b.count).slice(0,8);
 const max=Math.max(1,...users.map(x=>x.count));
 return sorted.map(x=>'<div class="d-rank"><div class="d-name">'+e(x.name)+'</div><strong>'+x.count+'</strong><div class="d-track"><i style="width:'+x.count/max*100+'%"></i></div><small>'+x.bosses.size+' boss · '+x.channels.size+' channel</small></div>').join("")||t("empty");
}
function html(r,now,days){
 current={r,now};
 const map=r.bossCounts.map(b=>'<div class="d-maprow"><strong>'+e(b.name)+'</strong>'+r.cells.filter(c=>c.boss===b.name).map(c=>'<button class="d-cell '+status(c,now)+(c.active?" checked":"")+'" data-cell="'+e(c.id)+'" aria-label="'+e(c.boss)+' channel '+c.ch+' · '+e(t(status(c,now)))+'" title="'+e(c.boss)+' / '+c.ch+' · '+e(t(status(c,now)))+'">'+c.ch+'</button>').join("")+'</div>').join("");
 const n=days===1?24:days,step=days===1?3600000:86400000,start=now-days*86400000;
 const bins=Array.from({length:n},(_,i)=>({time:start+i*step,on:0,off:0}));
 r.period.forEach(x=>{const b=bins[Math.min(n-1,Math.floor((x.time-start)/step))];if(b){if(x.action==="check")b.on++;if(["uncheck","reset"].includes(x.action))b.off++;}});
 const max=Math.max(1,...bins.map(b=>Math.max(b.on,b.off)));
 const chart=bins.map(b=>{const label=new Date(b.time).toLocaleString(BT_STATS_I18N.locale(),days===1?{hour:"2-digit",minute:"2-digit"}:{day:"2-digit",month:"short"});return '<div class="d-bin" tabindex="0" title="'+e(label)+' · '+e(t("on"))+': '+b.on+' · '+e(t("stop"))+': '+b.off+'"><div class="d-columns"><i style="height:'+b.on/max*100+'%"></i><i style="height:'+b.off/max*100+'%"></i></div><small>'+e(label)+'</small></div>'}).join("");
 const coverage=r.bossCounts.map(b=>{
 const subset=r.cells.filter(c=>c.boss===b.name&&c.active);
 const bad=subset.filter(c=>status(c,now)==="danger").length;
 const warm=subset.filter(c=>status(c,now)==="warn").length;
 const unknown=subset.filter(c=>status(c,now)==="unknown").length;
 return '<div class="d-rank"><div class="d-name">'+e(b.name)+'</div><strong>'+b.active+'/30</strong><div class="d-track"><i style="width:'+(b.active-bad-warm-unknown)/30*100+'%"></i><i class="d-unknown" style="width:'+unknown/30*100+'%"></i><i class="d-warn" style="width:'+warm/30*100+'%"></i><i class="d-red" style="width:'+bad/30*100+'%"></i></div><small>'+t("over24")+': '+bad+' · '+t("warn")+': '+warm+' · '+t("unknown")+': '+unknown+'</small></div>';
 }).join("");
 const warnings=r.priorityGroups.map(group=>'<details class="d-priority" open><summary>'+t(group.key)+' <span class="badge">'+group.cells.length+'</span></summary><div class="d-scroll">'+([...group.cells].sort((a,b)=>a.anchor-b.anchor).map(c=>'<button class="d-warning" data-cell="'+e(c.id)+'"><span>'+e(c.boss)+' · '+c.ch+'</span><strong>'+(Math.floor((now-c.anchor)/360000)/10)+' '+t("hours")+'</strong></button>').join("")||'<p>'+t("empty")+'</p>')+'</div></details>').join("");
 return '<div class="d-dashboard" data-raw><section class="panel d-map"><h2>'+t("map")+'</h2><p>'+t("hint")+' '+t("overflow")+'</p><div class="d-legend">'+["recent","warn","danger","unknown","off"].map(k=>'<span><i class="'+k+'"></i>'+t(k)+'</span>').join("")+'</div><div class="d-mapscroll">'+map+'</div></section><div class="d-layout"><section class="panel"><h2>'+t("activity")+'</h2><div class="d-legend"><span><i class="recent"></i>'+t("on")+'</span><span><i class="danger"></i>'+t("stop")+'</span></div><div class="d-chart">'+chart+'</div><p class="d-note">'+t("note")+'</p></section><section class="panel"><h2>'+t("alert")+' <span class="badge">'+r.review12.length+'</span></h2>'+warnings+'</section><section class="panel"><h2>'+t("coverage")+'</h2><p class="d-note">'+t("over24")+': <span class="d-dot"></span> / '+t("warn")+': <span class="d-dot d-warn"></span></p><div class="d-scroll">'+coverage+'</div></section><section class="panel"><div class="d-rankhead"><h2>'+t("rank")+'</h2><select id="rankOrder"><option value="most" '+(order==="most"?"selected":"")+'>'+t("most")+'</option><option value="least" '+(order==="least"?"selected":"")+'>'+t("least")+'</option></select></div><div id="rankBars">'+bars(r.users)+'</div></section></div></div>';
}
function bind(){
 document.getElementById("rankOrder").onchange=ev=>{order=ev.target.value;document.getElementById("rankBars").innerHTML=bars(current.r.users)};
 document.querySelectorAll("[data-cell]").forEach(b=>b.onclick=()=>show(b.dataset.cell));
}
function show(id){
 const c=current.r.cells.find(x=>x.id===id);if(!c)return;
 document.getElementById("cellDialog")?.remove();
 const d=document.createElement("dialog");d.id="cellDialog";d.dataset.raw="";
 d.innerHTML='<button class="d-close" autofocus>'+t("close")+'</button><h2>'+e(c.boss)+' · Channel '+c.ch+'</h2><p>'+t("state")+': '+t(c.active?"on":"stop")+'</p><p>'+t(status(c,current.now))+'</p><p>'+t("last")+': '+(c.last?e(new Date(c.last).toLocaleString(BT_STATS_I18N.locale())):t("unknown"))+'</p><p>'+t("actor")+': '+(e(c.actor)||'—')+'</p><p>'+c.count+' '+t("actions")+'</p>';
 document.body.append(d);d.querySelector("button").onclick=()=>d.close();d.addEventListener("close",()=>d.remove());d.showModal();
}
window.BTDashboard={html,bind,t,status};
})();
