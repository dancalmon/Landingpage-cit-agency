// Monta o calendário compacto e o atalho "Próximo evento" da abertura,
// a partir de data/eventos.json. Para mudar o calendário, edite só o arquivo de dados.
(function () {
  var lista = document.getElementById('lista-eventos');
  var proximo = document.getElementById('proximo-evento');
  if (!lista) return;

  var DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var CORES = ['teal', 'laranja', 'magenta', 'coral', 'azul'];

  function lerData(texto) {
    var p = String(texto || '').split('-').map(Number);
    if (p.length !== 3 || p.some(isNaN)) return null;
    return new Date(p[0], p[1] - 1, p[2]);
  }

  function contagem(data, hoje) {
    var dias = Math.round((data - hoje) / 86400000);
    if (dias === 0) return 'Hoje';
    if (dias === 1) return 'Amanhã';
    return 'Faltam ' + dias + ' dias';
  }

  function dia(data) { return String(data.getDate()).padStart(2, '0'); }

  function el(tag, classe, texto) {
    var n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texto != null) n.textContent = texto;
    return n;
  }

  function linkar(a, url) {
    a.href = url;
    if (/^https?:/.test(url)) { a.target = '_blank'; a.rel = 'noopener'; }
  }

  function linha(ev, data, hoje) {
    var cor = CORES.indexOf(ev.cor) >= 0 ? ev.cor : 'teal';
    var item = el('li', 'cal-item cor-' + cor);
    var caixa = el(ev.link ? 'a' : 'div', 'cal-linha');
    if (ev.link) linkar(caixa, ev.link);

    var mini = el('div', 'cal-mini');
    if (ev.arte) {
      var img = el('img');
      img.src = ev.arte;
      img.alt = '';
      img.loading = 'lazy';
      mini.appendChild(img);
    } else {
      mini.appendChild(el('span', 'cal-mini-letra', ev.nome.charAt(0)));
    }
    caixa.appendChild(mini);

    var info = el('div', 'cal-info');
    var quando = el('p', 'cal-data');
    quando.appendChild(el('strong', null, dia(data) + ' ' + MESES[data.getMonth()]));
    quando.appendChild(document.createTextNode(' ' + DIAS[data.getDay()] + (ev.horario ? ' · ' + ev.horario : '')));
    info.appendChild(quando);
    info.appendChild(el('h3', 'cal-nome', ev.nome));
    var detalhe = [ev.local, (ev.atracoes || []).join(', ')].filter(Boolean).join(' · ');
    if (detalhe) info.appendChild(el('p', 'cal-detalhe', detalhe));
    caixa.appendChild(info);

    caixa.appendChild(el('span', 'cal-acao' + (ev.link ? '' : ' is-breve'), ev.link ? (ev.link_texto || 'Ver evento') : 'Em breve'));
    item.appendChild(caixa);
    return item;
  }

  function destaque(ev, data, hoje) {
    if (!proximo) return;
    proximo.innerHTML = '';
    var a = el(ev.link ? 'a' : 'a', 'proximo');
    linkar(a, ev.link || '#eventos');
    if (ev.arte) {
      var img = el('img', 'proximo-arte');
      img.src = ev.arte;
      img.alt = '';
      a.appendChild(img);
    }
    var txt = el('span', 'proximo-texto');
    txt.appendChild(el('span', 'proximo-rotulo', 'Próximo · ' + contagem(data, hoje)));
    txt.appendChild(el('strong', 'proximo-nome', ev.nome));
    txt.appendChild(el('span', 'proximo-data', dia(data) + ' ' + MESES[data.getMonth()] + (ev.local ? ' · ' + ev.local : '')));
    a.appendChild(txt);
    a.appendChild(el('span', 'proximo-seta', '→'));
    proximo.appendChild(a);
    proximo.hidden = false;
  }

  function aviso(texto) {
    lista.innerHTML = '';
    lista.appendChild(el('li', 'eventos-aviso', texto));
  }

  fetch('data/eventos.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (dados) {
      var hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      var futuros = (dados.eventos || [])
        .map(function (ev) { return { ev: ev, data: lerData(ev.data) }; })
        .filter(function (x) { return x.data && x.data >= hoje; })
        .sort(function (a, b) { return a.data - b.data; });

      lista.innerHTML = '';
      if (!futuros.length) return aviso('Novas datas em breve. Acompanhe no Instagram @cit.agency.');
      futuros.forEach(function (x) { lista.appendChild(linha(x.ev, x.data, hoje)); });
      var primeiro = futuros[0];
      destaque(primeiro.ev, primeiro.data, hoje);
    })
    .catch(function () {
      aviso('Não foi possível carregar o calendário agora. Veja as datas no Instagram @cit.agency.');
    });
})();
