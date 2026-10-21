// Monta os botões de acesso rápido a partir de data/links.json.
(function () {
  var lista = document.getElementById('lista-links');
  if (!lista) return;

  var ICONES = {
    whatsapp: '<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z"/><path d="M8.8 8.6c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c-.1.2-.1.4 0 .5.4.8 1.4 1.8 2.6 2.4.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.3.5 0 .7-.4 1.6-1.4 1.8-.8.2-2.2 0-4.2-1.6-1.6-1.3-2.4-2.9-2.6-3.6-.2-.9 0-1.9.1-2.6Z"/>',
    maleta: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
    grupo: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.6c2.8.2 5 2.1 5 5.4"/>',
    marca: '<path d="M4 12V4h8l8 8-8 8-8-8Z"/><circle cx="8.5" cy="8.5" r="1.5"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor"/>'
  };

  function el(tag, classe, texto) {
    var n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texto != null) n.textContent = texto;
    return n;
  }

  fetch('data/links.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (dados) {
      lista.innerHTML = '';
      (dados.links || []).forEach(function (l) {
        var li = el('li');
        var a = el(l.link ? 'a' : 'div', 'link-rapido' + (l.destaque ? ' is-destaque' : '') + (l.link ? '' : ' is-breve'));
        if (l.link) {
          a.href = l.link;
          if (/^https?:/.test(l.link)) { a.target = '_blank'; a.rel = 'noopener'; }
        }
        var ic = el('span', 'link-icone');
        ic.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONES[l.icone] || ICONES.marca) + '</svg>';
        a.appendChild(ic);
        var txt = el('span', 'link-texto');
        txt.appendChild(el('strong', null, l.titulo));
        if (l.subtitulo) txt.appendChild(el('span', null, l.subtitulo));
        a.appendChild(txt);
        a.appendChild(el('span', 'link-seta', l.link ? '→' : 'em breve'));
        li.appendChild(a);
        lista.appendChild(li);
      });
    })
    .catch(function () { lista.innerHTML = ''; });
})();
