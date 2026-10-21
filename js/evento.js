// Monta a página de evento a partir do evento.json da mesma pasta.
// Para criar ou mudar um evento, edite só o evento.json — este código serve para todos.
(function () {
  var DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  var ICONES = {
    ingresso: '<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4Z"/><path d="M14 6v12" stroke-dasharray="2 2.5"/>',
    bolo: '<path d="M4 21h16M5 21v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7"/><path d="M5 16c1.5 1 2.5 1 3.5 0s2.5-1 3.5 0 2.5 1 3.5 0 2.5-1 3.5 0"/><path d="M12 12V8M12 5.5c-.8-.8-.8-1.7 0-2.5.8.8.8 1.7 0 2.5Z"/>',
    taca: '<path d="M8 3h8l-.6 6a3.4 3.4 0 0 1-6.8 0Z"/><path d="M12 12.5V20M8.5 20h7"/>',
    estrela: '<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8Z"/>',
    conversa: '<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01" stroke-width="2.4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'
  };

  var dados = null;
  var janela = document.getElementById('ev-janela');
  var corpoJanela = document.getElementById('ev-janela-corpo');

  function $(id) { return document.getElementById(id); }

  function el(tag, classe, texto) {
    var n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texto != null) preencher(n, texto);
    return n;
  }

  // Texto entre [colchetes] aparece marcado como pendente
  function preencher(n, texto) {
    String(texto).split(/(\[[^\]]*\])/).forEach(function (parte) {
      if (!parte) return;
      if (/^\[.*\]$/.test(parte)) n.appendChild(el('span', 'ph', null)).textContent = parte;
      else n.appendChild(document.createTextNode(parte));
    });
  }

  function svg(nome) {
    return '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONES[nome] || ICONES.info) + '</svg>';
  }

  function linkWhats(mensagem) {
    return 'https://wa.me/' + dados.whatsapp + (mensagem ? '?text=' + encodeURIComponent(mensagem) : '');
  }

  // Liga um <a> a uma ação { tipo: 'whatsapp' | 'link', mensagem, link }
  function ligar(a, acao) {
    var url = acao.tipo === 'whatsapp' ? linkWhats(acao.mensagem) : acao.link;
    if (url) {
      a.href = url;
      if (/^https?:/.test(url)) { a.target = '_blank'; a.rel = 'noopener'; }
    } else {
      a.removeAttribute('href');
      a.classList.add('is-breve');
      a.setAttribute('aria-disabled', 'true');
      a.textContent = a.textContent + ' · em breve';
    }
    return a;
  }

  function lerData(t) {
    var p = String(t || '').split('-').map(Number);
    return p.length === 3 ? new Date(p[0], p[1] - 1, p[2]) : null;
  }

  function aplicarVisual(v) {
    var c = v.cores || {};
    var raiz = document.documentElement.style;
    var mapa = { fundo: '--ev-fundo', texto: '--ev-texto', destaque: '--ev-destaque', botao: '--ev-botao', botao_texto: '--ev-botao-texto', cartao: '--ev-cartao' };
    Object.keys(mapa).forEach(function (k) { if (c[k]) raiz.setProperty(mapa[k], c[k]); });
    var meta = document.querySelector('meta[name="theme-color"]') || document.head.appendChild(el('meta'));
    meta.name = 'theme-color';
    meta.content = c.fundo || '#13143A';

    var familias = [v.fonte_titulo, v.fonte_texto].filter(Boolean);
    if (familias.length) {
      var link = el('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?' + familias.map(function (f) {
        return 'family=' + f.trim().replace(/ /g, '+') + (f === v.fonte_texto ? ':wght@400;600;800' : '');
      }).join('&') + '&display=swap';
      document.head.appendChild(link);
    }
    if (v.fonte_titulo) raiz.setProperty('--ev-fonte-titulo', '"' + v.fonte_titulo + '", "Arial Black", system-ui, sans-serif');
    if (v.fonte_texto) raiz.setProperty('--ev-fonte-texto', '"' + v.fonte_texto + '", system-ui, sans-serif');

    var faixa = $('ev-faixa');
    (c.faixa || []).forEach(function (cor) {
      var s = el('span');
      s.style.background = cor;
      faixa.appendChild(s);
    });
  }

  function montarTopo(d) {
    var data = lerData(d.data);
    var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    if (data) {
      $('ev-quando').textContent = DIAS[data.getDay()] + ' · ' + String(data.getDate()).padStart(2, '0') + ' ' + MESES[data.getMonth()] + (d.horario ? ' · ' + d.horario : '') + (d.local ? ' · ' + d.local : '');
      var dias = Math.round((data - hoje) / 86400000);
      $('ev-contagem').textContent = dias > 1 ? 'Faltam ' + dias + ' dias' : dias === 1 ? 'É amanhã' : dias === 0 ? 'É hoje' : 'Evento realizado';
    }
    $('ev-nome').textContent = d.nome;
    var chamada = $('ev-chamada');
    preencher(chamada, [d.chamada, d.subchamada].filter(Boolean).join('. ').replace(/\.\./g, '.'));
    var arte = $('ev-arte');
    if (d.arte) { arte.src = d.arte; arte.alt = 'Arte do evento ' + d.nome; } else { arte.parentNode.hidden = true; }

    var bp = d.botao_principal || {};
    var principal = $('ev-principal');
    principal.textContent = bp.texto || 'Comprar ingresso';
    ligar(principal, bp);
    ligar($('ev-rodape-concierge'), { tipo: 'whatsapp', mensagem: 'Oi! Tenho uma dúvida sobre o ' + d.nome + '.' });
  }

  function montarAtalhos(lista) {
    var ul = $('ev-atalhos');
    lista.filter(function (b) { return b.ativo !== false; }).forEach(function (b) {
      var li = el('li');
      var a = el('a', 'ev-atalho');
      a.innerHTML = '<span class="ev-atalho-icone">' + svg(b.icone) + '</span>';
      var txt = el('span', 'ev-atalho-texto');
      txt.appendChild(el('strong', null, b.titulo));
      if (b.subtitulo) txt.appendChild(el('span', null, b.subtitulo));
      a.appendChild(txt);
      if (b.janela) {
        a.href = '#' + b.id;
        a.addEventListener('click', function (e) { e.preventDefault(); abrir(b); });
      } else if (b.acao_direta) {
        ligar(a, b.acao_direta);
      }
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  function abrir(b) {
    var j = b.janela;
    corpoJanela.innerHTML = '';
    if (j.imagem) {
      var img = el('img', 'ev-janela-imagem');
      img.src = j.imagem;
      img.alt = j.titulo || '';
      corpoJanela.appendChild(img);
    }
    var cab = el('div', 'ev-janela-cab');
    cab.innerHTML = '<span class="ev-atalho-icone">' + svg(b.icone) + '</span>';
    var h = el('h2', null, j.titulo || b.titulo);
    h.id = 'ev-janela-titulo';
    cab.appendChild(h);
    corpoJanela.appendChild(cab);
    if (j.texto) corpoJanela.appendChild(el('p', 'ev-janela-texto', j.texto));
    if (j.itens && j.itens.length) {
      var ul = el('ul', 'ev-janela-itens');
      j.itens.forEach(function (i) { ul.appendChild(el('li', null, i)); });
      corpoJanela.appendChild(ul);
    }
    if (j.formulario === 'embaixadores' && window.CITCadastro) {
      var raiz = (document.querySelector('meta[name="ev-raiz"]') || {}).content || '';
      CITCadastro.montar(corpoJanela, { raiz: raiz, eventoAtual: dados.nome });
    }
    var acoes = el('div', 'ev-janela-acoes');
    (j.acoes || []).forEach(function (ac) { acoes.appendChild(ligar(el('a', 'ev-botao', ac.texto), ac)); });
    corpoJanela.appendChild(acoes);

    if (janela.showModal) { if (!janela.open) janela.showModal(); } else { janela.setAttribute('open', ''); }
    try { history.replaceState(null, '', '#' + b.id); } catch (e) {}
  }

  janela.addEventListener('close', function () {
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  });
  // Fecha ao tocar fora da janela
  janela.addEventListener('click', function (e) { if (e.target === janela) janela.close(); });

  function montarGaleria(itens) {
    var trilho = $('ev-galeria');
    if (!itens || !itens.length) { $('ev-vibe-secao').hidden = true; return; }
    function quadro(item, i, copia) {
      var f = el('figure', 'ev-quadro');
      f.style.setProperty('--giro', ((i % 2 ? 1 : -1) * (1.5 + (i % 3))) + 'deg');
      if (copia) f.setAttribute('aria-hidden', 'true');
      if (item.video) {
        var v = el('video');
        v.src = item.video;
        if (item.capa) v.poster = item.capa;
        v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
        v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.preload = 'none';
        f.appendChild(v);
      } else if (item.foto) {
        var img = el('img');
        img.src = item.foto; img.alt = item.legenda || ''; img.loading = 'lazy';
        f.appendChild(img);
      } else {
        f.classList.add('is-vazio');
        f.appendChild(el('span', 'ph', '[foto ' + (i + 1) + ']'));
      }
      return f;
    }
    itens.forEach(function (it, i) { trilho.appendChild(quadro(it, i, false)); });
    // Segunda volta para o movimento contínuo
    itens.forEach(function (it, i) { trilho.appendChild(quadro(it, i, true)); });
  }

  function montarLineup(lista) {
    var ul = $('ev-lineup');
    (lista || []).forEach(function (a) {
      var li = el('li', 'ev-artista');
      if (a.foto) { var img = el('img'); img.src = a.foto; img.alt = ''; img.loading = 'lazy'; li.appendChild(img); }
      li.appendChild(el('strong', null, a.nome));
      ul.appendChild(li);
    });
  }

  function montarInfos(lista) {
    var dl = $('ev-infos');
    (lista || []).forEach(function (i) {
      var d = el('div');
      d.appendChild(el('dt', null, i.rotulo));
      d.appendChild(el('dd', null, i.valor));
      dl.appendChild(d);
    });
  }

  function montarDuvidas(lista) {
    var box = $('ev-duvidas');
    (lista || []).forEach(function (q) {
      var det = el('details');
      det.appendChild(el('summary', null, q.pergunta));
      det.appendChild(el('p', null, q.resposta));
      box.appendChild(det);
    });
  }

  fetch('evento.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      dados = d;
      aplicarVisual(d.visual || {});
      montarTopo(d);
      montarAtalhos(d.botoes || []);
      montarGaleria(d.galeria);
      montarLineup(d.atracoes);
      montarInfos(d.infos);
      montarDuvidas(d.duvidas);
      document.body.classList.remove('ev-carregando');
      // Link direto para uma janela, ex.: .../#aniversario
      var alvo = (location.hash || '').slice(1);
      var b = (d.botoes || []).filter(function (x) { return x.id === alvo && x.janela && x.ativo !== false; })[0];
      if (b) abrir(b);
    })
    .catch(function () {
      document.body.classList.remove('ev-carregando');
      $('ev-nome').textContent = 'Não foi possível carregar o evento agora.';
    });
})();
