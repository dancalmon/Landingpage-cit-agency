// Recebe os cadastros de embaixadores e RPs do site e grava na aba "Cadastros" da planilha.
// Como instalar: veja ferramentas/planilha-embaixadores.md

var COLUNAS = [
  ['Data do cadastro', null],
  ['Nome', 'nome'],
  ['Idade', 'idade'],
  ['WhatsApp', 'whatsapp'],
  ['Cidade', 'cidade'],
  ['Bairro', 'bairro'],
  ['Instagram', 'instagram'],
  ['Outras redes', 'outras_redes'],
  ['Eventos', 'eventos'],
  ['Página de origem', 'origem'],
  ['Autorizou contato', 'autorizacao']
];

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.site) return ContentService.createTextOutput('ok'); // campo-isca preenchido: robô

  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName('Cadastros') || planilha.insertSheet('Cadastros');
  if (aba.getLastRow() === 0) {
    aba.appendRow(COLUNAS.map(function (c) { return c[0]; }));
    aba.setFrozenRows(1);
    aba.getRange(1, 1, 1, COLUNAS.length).setFontWeight('bold');
  }

  var trava = LockService.getScriptLock();
  trava.waitLock(10000);
  try {
    aba.appendRow(COLUNAS.map(function (c) {
      if (!c[1]) return new Date();
      // Apóstrofo impede a planilha de interpretar textos como fórmulas
      return "'" + String(p[c[1]] || '').slice(0, 300);
    }));
  } finally {
    trava.releaseLock();
  }
  return ContentService.createTextOutput('ok');
}
