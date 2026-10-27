// Recebe os cadastros de aniversariantes do site e grava na aba "Aniversários" da planilha.
// A cada cadastro: manda um e-mail de aviso (sem o CPF) e, se WEBHOOK_CRM estiver preenchido,
// envia os dados para o CRM disparar a mensagem com o link da Sympla e o cupom.
// Como instalar: veja ferramentas/planilha-aniversarios.md

// E-mail que recebe o aviso de cada cadastro (pode colocar mais de um, separados por vírgula)
var EMAIL_AVISO = 'citagency.vix@gmail.com';

// Endereço do CRM que recebe os dados (deixe '' enquanto não houver integração)
var WEBHOOK_CRM = '';

var COLUNAS = [
  ['Data do cadastro', null],
  ['Evento', 'evento'],
  ['Nome completo', 'nome'],
  ['Data de aniversário', 'aniversario'],
  ['CPF', 'cpf'],
  ['WhatsApp', 'whatsapp'],
  ['E-mail Sympla', 'email'],
  ['Comissário que indicou', 'comissario'],
  ['Cupom', 'cupom'],
  ['Autorizou (LGPD)', 'autorizacao'],
  ['Enviado ao CRM', null]
];

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.site) return ContentService.createTextOutput('ok'); // campo-isca preenchido: robô

  var crm = enviarParaCRM(p);

  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName('Aniversários') || planilha.insertSheet('Aniversários');
  if (aba.getLastRow() === 0) {
    aba.appendRow(COLUNAS.map(function (c) { return c[0]; }));
    aba.setFrozenRows(1);
    aba.getRange(1, 1, 1, COLUNAS.length).setFontWeight('bold');
  }

  var trava = LockService.getScriptLock();
  trava.waitLock(10000);
  try {
    aba.appendRow(COLUNAS.map(function (c, i) {
      if (i === 0) return new Date();
      if (!c[1]) return crm;
      // Apóstrofo impede a planilha de interpretar textos como fórmulas e mantém zeros do CPF
      return "'" + String(p[c[1]] || '').slice(0, 300);
    }));
  } finally {
    trava.releaseLock();
  }
  avisarPorEmail(p, planilha.getUrl());
  return ContentService.createTextOutput('ok');
}

function enviarParaCRM(p) {
  if (!WEBHOOK_CRM) return 'Não configurado';
  var whats = String(p.whatsapp || '').replace(/\D/g, '');
  if (whats && whats.length <= 11) whats = '55' + whats;
  try {
    var r = UrlFetchApp.fetch(WEBHOOK_CRM, {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      payload: JSON.stringify({
        tipo: 'aniversario',
        evento: p.evento, nome: p.nome, aniversario: p.aniversario,
        whatsapp: whats, email: p.email, comissario: p.comissario, cupom: p.cupom
      })
    });
    return r.getResponseCode() < 300 ? 'Sim' : 'Erro ' + r.getResponseCode();
  } catch (err) {
    return 'Erro';
  }
}

function avisarPorEmail(p, linkPlanilha) {
  if (!EMAIL_AVISO) return;
  // O CPF fica só na planilha, nunca no e-mail
  var linhas = COLUNAS.filter(function (c) { return c[1] && c[1] !== 'cpf'; }).map(function (c) {
    return c[0] + ': ' + (p[c[1]] || '-');
  });
  var whats = String(p.whatsapp || '').replace(/\D/g, '');
  if (whats && whats.length <= 11) whats = '55' + whats;
  MailApp.sendEmail({
    to: EMAIL_AVISO,
    subject: 'Aniversariante: ' + (p.nome || 'sem nome') + ' · ' + (p.evento || '') + ' · cupom ' + (p.cupom || ''),
    body: 'Chegou um cadastro de aniversariante pelo site da CIT.\n\n' + linhas.join('\n') +
      '\n\nLembrete: o cupom ' + (p.cupom || '') + ' precisa estar criado na Sympla para funcionar.' +
      (whats ? '\n\nChamar no WhatsApp: https://wa.me/' + whats : '') +
      '\n\nTodos os cadastros: ' + linkPlanilha
  });
}
