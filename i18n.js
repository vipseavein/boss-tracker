(function () {
  const dictionaries = {
    en: {
      "Light Mode":"Light Mode","Dark Mode":"Dark Mode","LIGHT MODE":"LIGHT MODE","DARK MODE":"DARK MODE","LOG OUT":"LOG OUT","PHÂN QUYỀN":"ADMIN","Quay lại trang chính":"Back to main page",
      "Phân quyền người dùng":"User permissions","Danh sách người dùng":"User list","Tài khoản":"Account","Vai trò":"Role","Quyền Log":"Log access","Boss được cấp":"Assigned bosses","Firebase UID":"Firebase UID","TẢI BẰNG UID":"LOAD BY UID","Quyền sử dụng trang Log":"Log page access","Không có quyền":"No access","Chỉ xem":"View only","Full chức năng":"Full access","LƯU PHÂN QUYỀN":"SAVE PERMISSIONS",
      "Quản lý loại Boss":"Boss management","Tên Boss":"Boss name","Vị trí":"Position","Hồi (phút)":"Respawn (minutes)","SOS (phút)":"SOS (minutes)","Xanh dương đầu (phút)":"Initial blue (minutes)","Vàng khi còn (phút)":"Yellow at remaining (minutes)","Đỏ khi còn (phút)":"Red at remaining (minutes)","THÊM / LƯU BOSS":"ADD / SAVE BOSS","BOSS MỚI":"NEW BOSS","XÓA BOSS ĐANG CHỌN":"DELETE SELECTED BOSS","Hồi":"Respawn","Xanh dương đầu":"Initial blue","Vàng":"Yellow","Đỏ":"Red",
      "Lịch sử thao tác Checkbox":"Checkbox activity history","-- Lọc theo kênh --":"-- Filter by channel --","-- Lọc theo boss --":"-- Filter by boss --","-- Hành động --":"-- Action --","-- Người dùng --":"-- User --","✔ Bật":"✔ On","✘ Tắt":"✘ Off","Thời gian":"Time","Người dùng":"User","Kênh":"Channel","Hành động":"Action","Trang trước":"Previous","Trang sau":"Next","Xuất Excel":"Export Excel","Xóa log cũ hơn 5 tiếng":"Delete logs older than 5 hours","Xóa toàn bộ lịch sử log":"Delete all logs","Reset toàn bộ checkbox":"Reset all checkboxes",
      "Đăng nhập bằng tài khoản đã được Sonate cấp để tiếp tục.":"Sign in with an account provided by Sonate to continue.","Nhập mật khẩu":"Enter password","LOGIN":"LOGIN"
    },
    ph: {
      "Light Mode":"Light Mode","Dark Mode":"Dark Mode","LIGHT MODE":"LIGHT MODE","DARK MODE":"DARK MODE","LOG OUT":"MAG-LOG OUT","PHÂN QUYỀN":"ADMIN","Quay lại trang chính":"Bumalik sa main page",
      "Phân quyền người dùng":"Mga pahintulot ng user","Danh sách người dùng":"Listahan ng user","Tài khoản":"Account","Vai trò":"Role","Quyền Log":"Log access","Boss được cấp":"Mga nakatalagang boss","Firebase UID":"Firebase UID","TẢI BẰNG UID":"I-LOAD ANG UID","Quyền sử dụng trang Log":"Pahintulot sa Log page","Không có quyền":"Walang access","Chỉ xem":"View only","Full chức năng":"Full access","LƯU PHÂN QUYỀN":"I-SAVE ANG PERMISSIONS",
      "Quản lý loại Boss":"Pamamahala ng boss","Tên Boss":"Pangalan ng Boss","Vị trí":"Posisyon","Hồi (phút)":"Respawn (minuto)","SOS (phút)":"SOS (minuto)","Xanh dương đầu (phút)":"Unang blue (minuto)","Vàng khi còn (phút)":"Yellow kapag natitira (minuto)","Đỏ khi còn (phút)":"Red kapag natitira (minuto)","THÊM / LƯU BOSS":"ADD / SAVE BOSS","BOSS MỚI":"BAGONG BOSS","XÓA BOSS ĐANG CHỌN":"BURAHIN ANG NAPILING BOSS","Hồi":"Respawn","Xanh dương đầu":"Unang blue","Vàng":"Yellow","Đỏ":"Red",
      "Lịch sử thao tác Checkbox":"Kasaysayan ng checkbox","-- Lọc theo kênh --":"-- Piliin ang channel --","-- Lọc theo boss --":"-- Piliin ang boss --","-- Hành động --":"-- Action --","-- Người dùng --":"-- User --","✔ Bật":"✔ On","✘ Tắt":"✘ Off","Thời gian":"Oras","Người dùng":"User","Kênh":"Channel","Hành động":"Action","Trang trước":"Nakaraan","Trang sau":"Susunod","Xuất Excel":"I-export sa Excel","Xóa log cũ hơn 5 tiếng":"Burahin ang log na lampas 5 oras","Xóa toàn bộ lịch sử log":"Burahin lahat ng log","Reset toàn bộ checkbox":"I-reset lahat ng checkbox",
      "Đăng nhập bằng tài khoản đã được Sonate cấp để tiếp tục.":"Mag-sign in gamit ang account na ibinigay ni Sonate.","Nhập mật khẩu":"Ilagay ang password","LOGIN":"LOGIN"
    },
    br: {
      "Light Mode":"Modo claro","Dark Mode":"Modo escuro","LIGHT MODE":"MODO CLARO","DARK MODE":"MODO ESCURO","LOG OUT":"SAIR","PHÂN QUYỀN":"ADMIN","Quay lại trang chính":"Voltar à página principal",
      "Phân quyền người dùng":"Permissões de usuários","Danh sách người dùng":"Lista de usuários","Tài khoản":"Conta","Vai trò":"Função","Quyền Log":"Acesso ao Log","Boss được cấp":"Bosses permitidos","Firebase UID":"UID do Firebase","TẢI BẰNG UID":"CARREGAR UID","Quyền sử dụng trang Log":"Permissão da página de Log","Không có quyền":"Sem acesso","Chỉ xem":"Somente leitura","Full chức năng":"Acesso completo","LƯU PHÂN QUYỀN":"SALVAR PERMISSÕES",
      "Quản lý loại Boss":"Gerenciamento de bosses","Tên Boss":"Nome do Boss","Vị trí":"Posição","Hồi (phút)":"Respawn (minutos)","SOS (phút)":"SOS (minutos)","Xanh dương đầu (phút)":"Azul inicial (minutos)","Vàng khi còn (phút)":"Amarelo quando restar (minutos)","Đỏ khi còn (phút)":"Vermelho quando restar (minutos)","THÊM / LƯU BOSS":"ADICIONAR / SALVAR BOSS","BOSS MỚI":"NOVO BOSS","XÓA BOSS ĐANG CHỌN":"EXCLUIR BOSS SELECIONADO","Hồi":"Respawn","Xanh dương đầu":"Azul inicial","Vàng":"Amarelo","Đỏ":"Vermelho",
      "Lịch sử thao tác Checkbox":"Histórico de ações","-- Lọc theo kênh --":"-- Filtrar por canal --","-- Lọc theo boss --":"-- Filtrar por boss --","-- Hành động --":"-- Ação --","-- Người dùng --":"-- Usuário --","✔ Bật":"✔ Ativar","✘ Tắt":"✘ Desativar","Thời gian":"Horário","Người dùng":"Usuário","Kênh":"Canal","Hành động":"Ação","Trang trước":"Anterior","Trang sau":"Próxima","Xuất Excel":"Exportar Excel","Xóa log cũ hơn 5 tiếng":"Excluir logs com mais de 5 horas","Xóa toàn bộ lịch sử log":"Excluir todo o histórico","Reset toàn bộ checkbox":"Resetar todos os checkboxes",
      "Đăng nhập bằng tài khoản đã được Sonate cấp để tiếp tục.":"Entre com uma conta fornecida por Sonate.","Nhập mật khẩu":"Digite a senha","LOGIN":"ENTRAR"
    }
  };

  const help = {
    vi: { title:"Hướng dẫn Boss Tracker", sections:[
      ["Theo dõi Boss","Mỗi cột là một boss, mỗi hàng là một channel. Bạn chỉ nhìn thấy các boss đã được Admin cấp quyền."],
      ["Checkbox","Click để bắt đầu thời gian hồi. Bỏ chọn để tắt/reset timer. Thao tác này chỉ phụ thuộc quyền boss, không phụ thuộc quyền trang Log."],
      ["Đánh dấu vàng","Chuột phải vào checkbox để bật hoặc tắt viền vàng. Checkbox vàng sẽ nhấp nháy khi chưa có timer."],
      ["Timer và SOS","Chuột phải vào thời gian để nhập số phút tùy chỉnh. Click trái vào timer để tắt SOS. SOS nhấp nháy theo thời lượng do Admin cấu hình."],
      ["Màu thời gian","Xanh dương: giai đoạn đầu sau khi đánh dấu. Xanh lá: thời gian an toàn. Vàng: sắp xuất hiện. Đỏ: rất gần hoặc boss đã xuất hiện."],
      ["Thông báo","Các boss sắp xuất hiện nhất được hiển thị bên dưới bảng. Danh sách chỉ chứa boss bạn được phép xem."],
      ["Tùy chọn cột","Checkbox bên dưới bảng cho phép ẩn/hiện tạm thời các boss đã được cấp. Lựa chọn được ghi nhớ trên thiết bị."],
      ["Trang Log","Không có quyền: không vào được. Chỉ xem: xem, lọc và xuất Excel. Full: thêm quyền xóa Log và reset toàn bộ checkbox."],
      ["Trang Admin","Admin có thể phân quyền User, quản lý quyền Log, thêm/xóa/đổi tên/sắp xếp boss và chỉnh thời gian hồi, SOS cùng các ngưỡng màu."]
    ]},
    en: { title:"Boss Tracker Guide", sections:[
      ["Boss tracking","Each column is a boss and each row is a channel. You only see bosses assigned by an Admin."],["Checkbox","Click to start the respawn timer. Uncheck to stop/reset it. This uses boss permission only and is independent of Log access."],["Yellow marker","Right-click a checkbox to enable or disable its yellow outline. A marked checkbox blinks while it has no timer."],["Timer and SOS","Right-click a timer to enter custom minutes. Left-click it to stop SOS. SOS duration is configured by an Admin."],["Timer colors","Blue: initial period. Green: safe period. Yellow: approaching. Red: very close or the boss is available."],["Notifications","The nearest upcoming bosses appear below the table, limited to bosses you may view."],["Column options","Use the checkboxes below the table to temporarily hide assigned bosses. The choice is saved on this device."],["Log page","No access: blocked. View only: view, filter and export. Full: may also delete logs and reset all checkboxes."],["Admin page","Admins manage users, Log access, bosses, ordering, respawn time, SOS and color thresholds."]
    ]},
    ph: { title:"Gabay sa Boss Tracker", sections:[
      ["Boss tracking","Ang bawat column ay boss at bawat row ay channel. Assigned bosses lamang ang makikita mo."],["Checkbox","I-click para simulan ang respawn timer. Alisin ang check para ihinto o i-reset. Hiwalay ito sa Log permission."],["Yellow marker","Mag-right-click sa checkbox para i-on o i-off ang dilaw na outline."],["Timer at SOS","Mag-right-click sa timer para maglagay ng custom minutes. Left-click para ihinto ang SOS."],["Mga kulay","Blue: unang yugto. Green: ligtas. Yellow: malapit na. Red: napakalapit o available na ang boss."],["Notifications","Makikita sa ibaba ang pinakamalapit na bosses na may pahintulot ka."],["Column options","Gamitin ang options sa ibaba para pansamantalang itago o ipakita ang assigned bosses."],["Log page","No access: bawal. View only: tingnan, filter at export. Full: maaari ring mag-delete at reset all."],["Admin page","Namamahala ang Admin ng users, Log access, bosses, order, respawn, SOS at color thresholds."]
    ]},
    br: { title:"Guia do Boss Tracker", sections:[
      ["Rastreamento","Cada coluna é um boss e cada linha é um canal. Você vê apenas os bosses autorizados pelo Admin."],["Checkbox","Clique para iniciar o respawn. Desmarque para parar/resetar. Isso depende apenas da permissão do boss, não do Log."],["Marca amarela","Clique com o botão direito no checkbox para ativar ou remover a borda amarela."],["Timer e SOS","Clique com o botão direito no timer para informar minutos personalizados. Clique esquerdo para desligar o SOS."],["Cores","Azul: período inicial. Verde: período seguro. Amarelo: próximo. Vermelho: muito próximo ou boss disponível."],["Notificações","Os bosses mais próximos aparecem abaixo, somente entre os que você pode visualizar."],["Opções de coluna","Use os checkboxes abaixo para ocultar ou mostrar temporariamente os bosses autorizados."],["Página de Log","Sem acesso: bloqueado. Somente leitura: visualizar, filtrar e exportar. Completo: também excluir logs e resetar tudo."],["Página Admin","Admins gerenciam usuários, Log, bosses, ordem, respawn, SOS e limites de cores."]
    ]}
  };

  let applying = false;
  function language() { return localStorage.getItem("bossTrackerLanguage") || "vi"; }
  function translate(root=document) {
    if (applying) return; applying=true;
    const lang=language(), dict=dictionaries[lang]||{};
    root.querySelectorAll("button,label,th,option,h1,h2,p").forEach(el=>{
      if (el.children.length) return;
      const source=el.dataset.i18nSource || el.textContent.trim();
      if(!el.dataset.i18nSource) el.dataset.i18nSource=source;
      const translated=dict[source]||source;
      if(el.textContent!==translated) el.textContent=translated;
    });
    root.querySelectorAll("input[placeholder]").forEach(el=>{const source=el.dataset.i18nPlaceholder||el.placeholder;if(!el.dataset.i18nPlaceholder)el.dataset.i18nPlaceholder=source;const translated=dict[source]||source;if(el.placeholder!==translated)el.placeholder=translated;});
    document.documentElement.lang=lang==="br"?"pt-BR":lang==="ph"?"fil":lang;
    applying=false;
  }
  function showHelp(){
    const data=help[language()]||help.vi, body=document.getElementById("btHelpBody");
    document.getElementById("btHelpTitle").textContent=data.title;
    body.innerHTML=""; data.sections.forEach(([title,text])=>{const section=document.createElement("section"),h=document.createElement("h3"),p=document.createElement("p");h.textContent=title;p.textContent=text;section.append(h,p);body.appendChild(section);});
    document.getElementById("btHelpModal").classList.add("show");
  }
  function init(){
    const style=document.createElement("style");style.textContent=`#btLanguageTools{position:fixed;top:14px;right:16px;z-index:10000;display:flex;gap:6px;align-items:center}#btLanguageTools select,#btLanguageTools button{height:34px;border:1px solid #47709a;border-radius:7px;background:#101720;color:#fff;font-weight:700;padding:0 9px;box-shadow:0 3px 12px #0005}#btLanguageTools button{width:34px;padding:0;font-size:17px;background:#1f6feb}#btHelpModal{display:none;position:fixed;inset:0;z-index:20000;background:#000b;padding:30px;overflow:auto}#btHelpModal.show{display:flex}#btHelpPanel{width:min(760px,100%);max-height:90vh;overflow:auto;margin:auto;background:#151b23;color:#e6edf3;border:1px solid #3c5875;border-radius:14px;padding:22px;box-shadow:0 20px 70px #000}#btHelpHead{display:flex;justify-content:space-between;gap:15px;align-items:center;position:sticky;top:-22px;background:#151b23;padding:10px 0}#btHelpHead h2{margin:0;color:#58a6ff}#btHelpClose{border:0;border-radius:7px;background:#dc3545;color:#fff;width:34px;height:34px;font-size:20px;cursor:pointer}#btHelpBody section{border-top:1px solid #2f4358;padding:13px 0}#btHelpBody h3{margin:0 0 6px;color:#79c0ff}#btHelpBody p{margin:0;line-height:1.55;color:#c9d1d9}@media(max-width:600px){#btHelpModal{padding:10px}#btLanguageTools{top:8px;right:8px}}`;document.head.appendChild(style);
    const tools=document.createElement("div");tools.id="btLanguageTools";tools.innerHTML=`<select aria-label="Language"><option value="vi">Việt</option><option value="en">ENG</option><option value="ph">PH</option><option value="br">BR</option></select><button type="button" aria-label="Help">?</button>`;document.body.appendChild(tools);
    const modal=document.createElement("div");modal.id="btHelpModal";modal.innerHTML=`<div id="btHelpPanel"><div id="btHelpHead"><h2 id="btHelpTitle"></h2><button id="btHelpClose" type="button">×</button></div><div id="btHelpBody"></div></div>`;document.body.appendChild(modal);
    const select=tools.querySelector("select");select.value=language();select.onchange=()=>{localStorage.setItem("bossTrackerLanguage",select.value);translate();if(modal.classList.contains("show"))showHelp();};tools.querySelector("button").onclick=showHelp;document.getElementById("btHelpClose").onclick=()=>modal.classList.remove("show");modal.onclick=e=>{if(e.target===modal)modal.classList.remove("show");};document.addEventListener("keydown",e=>{if(e.key==="Escape")modal.classList.remove("show");});
    translate();new MutationObserver(m=>{if(!applying)translate();}).observe(document.body,{childList:true,subtree:true});
  }
  window.BT_I18N={translate,language};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
