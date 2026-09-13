/* Stats translations: exact UI text only. Account and boss names are excluded. */
(function(){
const rows=[
  [
    "Thống kê Boss Tracker",
    "Boss Tracker Statistics",
    "Mga Estadistika ng Boss Tracker",
    "Estatísticas do Boss Tracker"
  ],
  [
    "Phân tích dữ liệu hiện có · Chỉ đọc, không ghi Firebase",
    "Existing data analysis · Read-only Firebase access",
    "Pagsusuri ng kasalukuyang data · Read-only sa Firebase",
    "Análise dos dados existentes · Acesso somente leitura ao Firebase"
  ],
  [
    "Khoảng thời gian",
    "Time range",
    "Saklaw ng oras",
    "Período"
  ],
  [
    "24 giờ / 1 ngày",
    "24 hours / 1 day",
    "24 oras / 1 araw",
    "24 horas / 1 dia"
  ],
  [
    "3 ngày",
    "3 days",
    "3 araw",
    "3 dias"
  ],
  [
    "5 ngày",
    "5 days",
    "5 araw",
    "5 dias"
  ],
  [
    "7 ngày",
    "7 days",
    "7 araw",
    "7 dias"
  ],
  [
    "Đang tải...",
    "Loading...",
    "Naglo-load...",
    "Carregando..."
  ],
  [
    "Chưa đủ dữ liệu",
    "Insufficient data",
    "Kulang ang data",
    "Dados insuficientes"
  ],
  [
    "Không có log",
    "No log available",
    "Walang log",
    "Nenhum log disponível"
  ],
  [
    "Không có dữ liệu phù hợp",
    "No matching data",
    "Walang tugmang data",
    "Nenhum dado correspondente"
  ],
  [
    "User (gồm hồ sơ DB có 0 thao tác)",
    "Users (including DB profiles with 0 actions)",
    "Mga user (kasama ang DB profile na may 0 aksyon)",
    "Usuários (inclui perfis do banco com 0 ações)"
  ],
  [
    "User xuất hiện trong log được xem",
    "Users found in accessible logs",
    "Mga user sa mga log na maaaring tingnan",
    "Usuários encontrados nos logs acessíveis"
  ],
  [
    "Checkbox đang bật",
    "Checked boxes",
    "Mga naka-check na checkbox",
    "Checkboxes ativados"
  ],
  [
    "Đang bật • cần kiểm tra ≥24h",
    "Checked • review needed ≥24h",
    "Naka-check • kailangang suriin ≥24h",
    "Ativado • verificar ≥24h"
  ],
  [
    "Đang bật • thiếu lịch sử",
    "Checked • insufficient history",
    "Naka-check • kulang ang kasaysayan",
    "Ativado • histórico insuficiente"
  ],
  [
    "Thao tác thủ công trong kỳ",
    "Manual actions in period",
    "Manwal na aksyon sa panahon",
    "Ações manuais no período"
  ],
  [
    "Boss/channel im lặng ≥24h",
    "Boss/channels inactive ≥24h",
    "Boss/channel na hindi aktibo ≥24h",
    "Boss/canais inativos ≥24h"
  ],
  [
    "Boss/channel chưa có log",
    "Boss/channels without logs",
    "Boss/channel na walang log",
    "Boss/canais sem logs"
  ],
  [
    "Các số liệu chỉ phản ánh log còn lưu. Nếu log từng bị xóa, không thể xác nhận đủ lịch sử 24 giờ. Cảnh báo là dấu hiệu cần kiểm tra, không khẳng định boss lỗi. Không tính tự hồi/SOS/viền vàng là thao tác checkbox. Mốc 24 giờ luôn cố định, bảng xếp hạng theo bộ lọc.",
    "Figures reflect retained logs only. Deleted logs prevent confirmation of a complete 24-hour history. Warnings suggest review, not a confirmed boss problem. Automatic respawns, SOS and yellow outlines are not checkbox actions. Warnings use a fixed 24-hour threshold; rankings use the selected period.",
    "Batay lamang sa natitirang logs ang bilang. Kapag nabura ang logs, hindi matitiyak ang buong 24-oras na kasaysayan. Ang babala ay para sa pagsusuri, hindi patunay ng problema sa boss. Hindi checkbox action ang auto respawn, SOS at dilaw na outline. Nakatakda sa 24 oras ang babala; sumusunod sa filter ang ranggo.",
    "Os números refletem apenas os logs preservados. Logs excluídos impedem confirmar um histórico completo de 24 horas. Alertas indicam necessidade de análise, não um problema confirmado no boss. Respawns automáticos, SOS e bordas amarelas não são ações de checkbox. Alertas usam 24 horas fixas; rankings seguem o período selecionado."
  ],
  [
    "Log thủ công cũ nhất còn thấy: ",
    "Oldest retained manual log: ",
    "Pinakalumang natitirang manwal na log: ",
    "Log manual mais antigo disponível: "
  ],
  [
    "Có log từ trước đầu kỳ; không đảm bảo lịch sử liên tục.",
    "Logs exist before the period; continuous history is not guaranteed.",
    "May log bago ang panahon; hindi garantisadong tuloy-tuloy ang kasaysayan.",
    "Há logs anteriores ao período; não há garantia de histórico contínuo."
  ],
  [
    "Lịch sử chưa phủ hết khoảng thời gian đã chọn.",
    "History does not cover the full selected period.",
    "Hindi saklaw ng kasaysayan ang buong napiling panahon.",
    "O histórico não cobre todo o período selecionado."
  ],
  [
    "Ưu tiên kiểm tra: đang bật, không thấy tắt/reset ≥24 giờ",
    "Priority review: checked, no stop/reset seen for ≥24 hours",
    "Unahing suriin: naka-check, walang stop/reset sa ≥24 oras",
    "Verificação prioritária: ativado, sem desativação/reset há ≥24 horas"
  ],
  [
    "Channel",
    "Channel",
    "Channel",
    "Canal"
  ],
  [
    "Tắt/reset gần nhất",
    "Last stop/reset",
    "Huling stop/reset",
    "Última desativação/reset"
  ],
  [
    "Mốc đối chiếu",
    "Reference timestamp",
    "Oras na batayan",
    "Data de referência"
  ],
  [
    "Thời gian",
    "Time",
    "Oras",
    "Tempo"
  ],
  [
    "Căn cứ",
    "Evidence",
    "Batayan",
    "Evidência"
  ],
  [
    "Log tắt/reset gần nhất",
    "Latest stop/reset log",
    "Pinakahuling stop/reset log",
    "Último log de desativação/reset"
  ],
  [
    "Log bật cũ; chưa thấy log tắt/reset",
    "Old check log; no stop/reset log found",
    "Lumang check log; walang stop/reset log",
    "Log antigo de ativação; sem log de desativação/reset"
  ],
  [
    "Checkbox đang bật nhưng thiếu dữ liệu để kết luận",
    "Checked boxes with insufficient evidence",
    "Mga naka-check na kulang ang datos para sa konklusyon",
    "Checkboxes ativados com dados insuficientes"
  ],
  [
    "Log thủ công gần nhất",
    "Latest manual log",
    "Huling manwal na log",
    "Último log manual"
  ],
  [
    "Boss đang bật: mức độ tắt/bật trong 24 giờ",
    "Checked bosses: toggle activity over 24 hours",
    "Naka-check na boss: toggle activity sa 24 oras",
    "Bosses ativados: atividade de marcação em 24 horas"
  ],
  [
    "Số checkbox đang bật",
    "Checked boxes",
    "Bilang ng naka-check",
    "Checkboxes ativados"
  ],
  [
    "Thao tác 24h trên các checkbox đang bật",
    "24h actions on currently checked boxes",
    "24-oras na aksyon sa kasalukuyang naka-check",
    "Ações em 24h nos checkboxes atualmente ativados"
  ],
  [
    "Chi tiết checkbox đang bật — nhiều thao tác trước",
    "Checked box details — most active first",
    "Detalye ng naka-check — pinakaaktibo muna",
    "Detalhes dos checkboxes ativados — mais ativos primeiro"
  ],
  [
    "Tắt/bật 24h",
    "Toggles in 24h",
    "Toggle sa 24 oras",
    "Marcações em 24h"
  ],
  [
    "Bật trong kỳ",
    "Checks in period",
    "Check sa panahon",
    "Ativações no período"
  ],
  [
    "Tắt/reset trong kỳ",
    "Stops/resets in period",
    "Stop/reset sa panahon",
    "Desativações/resets no período"
  ],
  [
    "Boss hoạt động nhiều nhất",
    "Most active bosses",
    "Pinakaaktibong boss",
    "Bosses mais ativos"
  ],
  [
    "Tổng thủ công",
    "Manual total",
    "Kabuuang manwal",
    "Total manual"
  ],
  [
    "Bật",
    "On",
    "Naka-on",
    "Ativado"
  ],
  [
    "Tắt",
    "Off",
    "Naka-off",
    "Desativado"
  ],
  [
    "Tắt/reset",
    "Stop/reset",
    "Stop/reset",
    "Desativação/reset"
  ],
  [
    "Boss hoạt động ít nhất (kể cả 0)",
    "Least active bosses (including 0)",
    "Pinakahindi aktibong boss (kasama ang 0)",
    "Bosses menos ativos (incluindo 0)"
  ],
  [
    "Người dùng hoạt động nhiều nhất",
    "Most active users",
    "Pinakaaktibong user",
    "Usuários mais ativos"
  ],
  [
    "Người dùng hoạt động ít nhất",
    "Least active users",
    "Pinakahindi aktibong user",
    "Usuários menos ativos"
  ],
  [
    "Thao tác",
    "Actions",
    "Mga aksyon",
    "Ações"
  ],
  [
    "Boss/channel có log cũ nhưng im lặng ≥24 giờ",
    "Boss/channels with old logs, inactive ≥24 hours",
    "Boss/channel na may lumang log, hindi aktibo ≥24 oras",
    "Boss/canais com logs antigos, inativos há ≥24 horas"
  ],
  [
    "Hiện tại",
    "Current state",
    "Kasalukuyang estado",
    "Estado atual"
  ],
  [
    "Thao tác cuối",
    "Last action",
    "Huling aksyon",
    "Última ação"
  ],
  [
    "Cách đây",
    "Time since",
    "Lumipas na oras",
    "Tempo decorrido"
  ],
  [
    "Boss/channel không có lịch sử — không kết luận quá 24h",
    "Boss/channels without history — cannot infer ≥24h inactivity",
    "Boss/channel na walang kasaysayan — hindi matitiyak ang ≥24h na kawalan ng aktibidad",
    "Boss/canais sem histórico — não é possível concluir inatividade ≥24h"
  ],
  [
    "Đếm thao tác, không phải số boss đã giết. User được gộp theo UID; đổi tên không tách thành người mới. Hồ sơ Database không đồng nghĩa danh sách Authentication.",
    "Counts actions, not boss kills. Users are grouped by UID; renaming does not create a new user. Database profiles are not the Authentication user list.",
    "Aksyon ang binibilang, hindi napatay na boss. Pinagsasama ang user ayon sa UID; hindi bagong user ang pagpapalit ng pangalan. Hindi katumbas ng Authentication list ang DB profiles.",
    "Conta ações, não bosses derrotados. Usuários são agrupados por UID; mudar o nome não cria outro usuário. Perfis do banco não equivalem à lista de Authentication."
  ],
  [
    "Cập nhật: ",
    "Updated: ",
    "Na-update: ",
    "Atualizado: "
  ],
  [
    "Không đọc được dữ liệu: ",
    "Unable to read data: ",
    "Hindi mabasa ang data: ",
    "Não foi possível ler os dados: "
  ],
  [
    "Không tải được dữ liệu: ",
    "Unable to load data: ",
    "Hindi ma-load ang data: ",
    "Não foi possível carregar os dados: "
  ],
  [
    "giờ",
    "hours",
    "oras",
    "horas"
  ]
];
const sources=new WeakMap();
const language=()=>window.BT_I18N?.language()||"vi";
const locale=()=>({vi:"vi-VN",en:"en-US",ph:"fil-PH",br:"pt-BR"}[language()]||"vi-VN");
function text(source){
 const index=({vi:0,en:1,ph:2,br:3})[language()]??0;
 const match=rows.find(row=>row[0]===source);
 if(match)return match[index];
 const hours=source.match(/^(\d+) giờ$/);
 if(hours)return hours[1]+" "+text("giờ");
 return window.BT_I18N?.translateDynamic(source)||source;
}
function apply(){
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 let node;
 while(node=walker.nextNode()){
  if(node.parentElement.closest("script,style,[data-raw],#btLanguageTools,#btHelpModal"))continue;
  const old=sources.get(node);
  const source=old&&node.nodeValue===old.output?old.source:node.nodeValue;
  let output=text(source);
  // Mixed paragraphs contain a dynamic timestamp between fixed translated phrases.
  if(output===source){
   for(const row of rows.filter(r=>r[0].endsWith(": ")||r[0].startsWith("Có log từ")||r[0].startsWith("Lịch sử chưa"))){
    output=output.replace(row[0],text(row[0]));
   }
  }
  sources.set(node,{source,output});
  if(node.nodeValue!==output)node.nodeValue=output;
 }
 document.title=text("Thống kê Boss Tracker");
}
window.BT_STATS_I18N={apply,text,locale,rows};
})();
