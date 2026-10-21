// Recebe os cadastros de embaixadores e RPs do site e grava na aba "Cadastros" da planilha.
// A cada cadastro, também manda um e-mail com os dados da pessoa para EMAIL_AVISO.
// Como instalar: veja ferramentas/planilha-embaixadores.md

// E-mail que recebe o aviso de cada cadastro (pode colocar mais de um, separados por vírgula)
var EMAIL_AVISO = 'citagency.vix@gmail.com';

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
  avisarPorEmail(p, planilha.getUrl());
  return ContentService.createTextOutput('ok');
}

function avisarPorEmail(p, linkPlanilha) {
  if (!EMAIL_AVISO) return;
  var linhas = COLUNAS.filter(function (c) { return c[1]; }).map(function (c) {
    return c[0] + ': ' + (p[c[1]] || '-');
  });
  var whats = String(p.whatsapp || '').replace(/\D/g, '');
  if (whats && whats.length <= 11) whats = '55' + whats;
  MailApp.sendEmail({
    to: EMAIL_AVISO,
    subject: 'Novo cadastro de embaixador(a): ' + (p.nome || 'sem nome') + ' · ' + (p.eventos || ''),
    body: 'Chegou um novo cadastro pelo site da CIT.\n\n' + linhas.join('\n') +
      (whats ? '\n\nChamar no WhatsApp: https://wa.me/' + whats : '') +
      '\n\nTodos os cadastros: ' + linkPlanilha
  });
}
