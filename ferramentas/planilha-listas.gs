// Recebe cadastros de listas do site (ex.: pré-venda de um evento) e grava numa aba por lista.
// O site manda o campo "lista" (nome da aba) e os demais campos; as colunas são criadas sozinhas.
// Como instalar: veja ferramentas/planilha-listas.md

// E-mail que recebe o aviso de cada cadastro ('' para não avisar)
var EMAIL_AVISO = '';

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.site) return ContentService.createTextOutput('ok'); // campo-isca preenchido: robô

  var nomeAba = String(p.lista || 'Cadastros').slice(0, 90);
  var campos = Object.keys(p).filter(function (k) { return k !== 'lista' && k !== 'site'; });

  var trava = LockService.getScriptLock();
  trava.waitLock(10000);
  try {
    var planilha = SpreadsheetApp.getActiveSpreadsheet();
    var aba = planilha.getSheetByName(nomeAba) || planilha.insertSheet(nomeAba);
    var cabecalho = aba.getLastRow() ? aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0] : ['Data do cadastro'];
    campos.forEach(function (c) { if (cabecalho.indexOf(c) < 0) cabecalho.push(c); });
    aba.getRange(1, 1, 1, cabecalho.length).setValues([cabecalho]).setFontWeight('bold');
    aba.setFrozenRows(1);
    aba.appendRow(cabecalho.map(function (c, i) {
      if (i === 0) return new Date();
      // Apóstrofo impede a planilha de interpretar textos como fórmulas
      return "'" + String(p[c] || '').slice(0, 300);
    }));
  } finally {
    trava.releaseLock();
  }

  if (EMAIL_AVISO) {
    MailApp.sendEmail(EMAIL_AVISO, 'Novo cadastro: ' + nomeAba + ' · ' + (p.nome || ''),
      campos.map(function (c) { return c + ': ' + p[c]; }).join('\n'));
  }
  return ContentService.createTextOutput('ok');
}
