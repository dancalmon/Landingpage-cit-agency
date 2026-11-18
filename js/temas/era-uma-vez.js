// Tema Era Uma Vez: jardim encantado à noite.
// Varal de luzinhas, vaga-lumes que seguem o dedo/mouse, pétalas caindo,
// quadro em 3D com reflexo, brilhos ao tocar e contagem regressiva ao vivo.
(function () {
  var d = window.CITEvento || {};
  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raiz = (document.querySelector('meta[name="ev-raiz"]') || {}).content || '';

  function el(tag, classe, html) {
    var n = document.createElement(tag);
    if (classe) n.className = classe;
    if (html != null) n.innerHTML = html;
    return n;
  }

  // ---------- Fundo: céu de dia com nuvens (sem foto por trás do conteúdo) ----------
  var fundo = document.querySelector('.ev-tema-fundo');
  if (fundo) fundo.remove();
  var ceu = el('div', 'ceu');
  ceu.setAttribute('aria-hidden', 'true');
  ceu.innerHTML = '<span class="nuvem n1"></span><span class="nuvem n2"></span><span class="nuvem n3"></span><span class="nuvem n4"></span><span class="sol-dia"></span>';
  document.body.insertBefore(ceu, document.body.firstChild);

  var varal = el('div', 'varal');
  varal.setAttribute('aria-hidden', 'true');
  // Fio em curva (SVG esticável) e lâmpadas em HTML, para não deformarem
  var html = '<svg viewBox="0 0 100 70" preserveAspectRatio="none"><path class="fio" d="M-2 8 Q50 82 102 8" /></svg>';
  var n = 9;
  for (var i = 0; i < n; i++) {
    var t = (i + 0.5) / n;
    var x = -2 + 104 * t;
    var y = (1 - t) * (1 - t) * 8 + 2 * (1 - t) * t * 82 + t * t * 8;
    html += '<span class="lampada" style="left:' + x.toFixed(2) + '%;top:' + (y / 70 * 100).toFixed(2) + '%;--atraso:' + (i * 0.37).toFixed(2) + 's"></span>';
  }
  varal.innerHTML = html;

  // ---------- Vaga-lumes e pétalas (canvas) ----------
  var tela = el('canvas', 'jardim-canvas');
  tela.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(tela, document.body.firstChild.nextSibling);
  var ctx = tela.getContext('2d');
  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var ponteiro = { x: -999, y: -999, ativo: false };

  function medir() {
    W = innerWidth; H = innerHeight;
    tela.width = W * dpr; tela.height = H * dpr;
    tela.style.width = W + 'px'; tela.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  medir();
  addEventListener('resize', medir);

  // Brilho do vaga-lume desenhado uma vez e reaproveitado
  var brilho = document.createElement('canvas');
  brilho.width = brilho.height = 64;
  var b = brilho.getContext('2d');
  var g = b.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,248,200,1)');
  g.addColorStop(0.18, 'rgba(255,226,120,0.9)');
  g.addColorStop(0.45, 'rgba(240,190,70,0.25)');
  g.addColorStop(1, 'rgba(240,190,70,0)');
  b.fillStyle = g; b.fillRect(0, 0, 64, 64);

  var rand = function (a, z) { return a + Math.random() * (z - a); };
  var vagalumes = [];
  var qtd = W < 600 ? 26 : 46;
  for (var v = 0; v < qtd; v++) {
    vagalumes.push({ x: rand(0, W), y: rand(0, H), vx: rand(-0.3, 0.3), vy: rand(-0.3, 0.3), t: rand(0, 6.28), s: rand(10, 22), f: rand(0.6, 1.6) });
  }
  var CORES_PETALA = ['#F4A6B8', '#F7C5CF', '#FBD9C4', '#F28C8C', '#FFF1D6'];
  var petalas = [];
  var qtdP = W < 600 ? 10 : 18;
  for (var p = 0; p < qtdP; p++) petalas.push(novaPetala(true));
  function novaPetala(espalhar) {
    return { x: rand(-20, W + 20), y: espalhar ? rand(-H, H) : rand(-60, -10), vy: rand(0.35, 0.9), osc: rand(0, 6.28), amp: rand(0.4, 1.2), r: rand(0, 6.28), vr: rand(-0.02, 0.02), w: rand(7, 12), cor: CORES_PETALA[Math.floor(rand(0, CORES_PETALA.length))] };
  }
  var faiscas = [];

  // 0 = dia (topo), 1 = noite (parte de baixo da página)
  var noite = 0;
  function medirNoite() {
    var total = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    noite = Math.min(1, Math.max(0, (scrollY / total - 0.25) / 0.45));
    document.documentElement.style.setProperty('--noite', noite.toFixed(3));
  }
  addEventListener('scroll', medirNoite, { passive: true });
  addEventListener('resize', medirNoite);
  setTimeout(medirNoite, 300);

  function desenhar() {
    ctx.clearRect(0, 0, W, H);
    // pétalas
    petalas.forEach(function (pt, i) {
      pt.osc += 0.012; pt.y += pt.vy; pt.x += Math.sin(pt.osc) * pt.amp; pt.r += pt.vr;
      if (pt.y > H + 30) petalas[i] = novaPetala(false);
      ctx.save(); ctx.translate(pt.x, pt.y); ctx.rotate(pt.r);
      ctx.globalAlpha = 0.85; ctx.fillStyle = pt.cor;
      ctx.beginPath(); ctx.ellipse(0, 0, pt.w, pt.w * 0.55, 0, 0, 6.28); ctx.fill();
      ctx.globalAlpha = 0.35; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(-pt.w * 0.25, -pt.w * 0.1, pt.w * 0.45, pt.w * 0.18, 0, 0, 6.28); ctx.fill();
      ctx.restore();
    });
    // vaga-lumes: vagam devagar e se aproximam do dedo/mouse
    ctx.globalCompositeOperation = 'lighter';
    vagalumes.forEach(function (f) {
      f.t += 0.02 * f.f;
      f.vx += Math.cos(f.t * 0.7) * 0.01; f.vy += Math.sin(f.t * 0.9) * 0.01;
      if (ponteiro.ativo) {
        var dx = ponteiro.x - f.x, dy = ponteiro.y - f.y, dist = Math.hypot(dx, dy);
        if (dist < 220 && dist > 30) { f.vx += dx / dist * 0.06; f.vy += dy / dist * 0.06; }
      }
      f.vx *= 0.97; f.vy *= 0.97; f.x += f.vx; f.y += f.vy;
      if (f.x < -30) f.x = W + 30; if (f.x > W + 30) f.x = -30;
      if (f.y < -30) f.y = H + 30; if (f.y > H + 30) f.y = -30;
      var a = (0.35 + 0.65 * Math.pow(Math.sin(f.t) * 0.5 + 0.5, 2)) * noite;
      if (a < 0.02) return;
      ctx.globalAlpha = a;
      ctx.drawImage(brilho, f.x - f.s, f.y - f.s, f.s * 2, f.s * 2);
    });
    // brilhos do toque
    for (var k = faiscas.length - 1; k >= 0; k--) {
      var s = faiscas[k];
      s.x += s.vx; s.y += s.vy; s.vy += 0.04; s.vida -= 0.02;
      if (s.vida <= 0) { faiscas.splice(k, 1); continue; }
      ctx.globalAlpha = s.vida;
      ctx.drawImage(brilho, s.x - s.s, s.y - s.s, s.s * 2, s.s * 2);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    if (!calmo) requestAnimationFrame(desenhar);
  }
  desenhar();

  addEventListener('pointermove', function (e) { ponteiro.x = e.clientX; ponteiro.y = e.clientY; ponteiro.ativo = true; }, { passive: true });
  addEventListener('pointerleave', function () { ponteiro.ativo = false; });
  addEventListener('pointerdown', function (e) {
    if (calmo) return;
    for (var i = 0; i < 14; i++) {
      var ang = Math.random() * 6.28, vel = rand(1, 3.2);
      faiscas.push({ x: e.clientX, y: e.clientY, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel - 1, s: rand(6, 13), vida: 1 });
    }
  }, { passive: true });

  // ---------- Quadro em 3D com reflexo ----------
  var arte = document.querySelector('.ev-arte');
  if (arte && !calmo) {
    arte.appendChild(el('span', 'reflexo'));
    var sobre = function (e) {
      var r = arte.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      arte.style.setProperty('--rx', (-py * 14).toFixed(2) + 'deg');
      arte.style.setProperty('--ry', (px * 16).toFixed(2) + 'deg');
      arte.style.setProperty('--gx', ((px + 0.5) * 100).toFixed(1) + '%');
      arte.style.setProperty('--gy', ((py + 0.5) * 100).toFixed(1) + '%');
    };
    arte.addEventListener('pointermove', sobre);
    arte.addEventListener('pointerleave', function () {
      arte.style.setProperty('--rx', '0deg'); arte.style.setProperty('--ry', '0deg');
    });
    // No celular, o quadro balança de leve conforme a rolagem
    addEventListener('scroll', function () {
      var y = Math.min(scrollY, 400) / 400;
      arte.style.setProperty('--rx', (y * 10).toFixed(2) + 'deg');
    }, { passive: true });
  }

  // ---------- Contagem regressiva ao vivo ----------
  var partes = String(d.data || '').split('-').map(Number);
  var hora = parseInt(String(d.horario || '22').replace(/\D/g, ''), 10) || 22;
  if (partes.length === 3) {
    var alvo = new Date(partes[0], partes[1] - 1, partes[2], hora, 0, 0);
    var caixa = el('section', 'ev-largura relogio');
    caixa.setAttribute('aria-label', 'Contagem regressiva para o evento');
    caixa.innerHTML = '<p class="relogio-titulo">A história começa em</p>' +
      '<div class="relogio-numeros">' +
      ['dias', 'horas', 'min', 'seg'].map(function (u) {
        return '<div class="relogio-casa"><span class="relogio-n" data-u="' + u + '">00</span><span class="relogio-u">' + u + '</span></div>';
      }).join('') + '</div>';
    var abertura = document.querySelector('.ev-abertura');
    abertura.parentNode.insertBefore(caixa, abertura.nextSibling);
    var casas = {};
    [].forEach.call(caixa.querySelectorAll('.relogio-n'), function (c) { casas[c.dataset.u] = c; });
    var anterior = {};
    var tick = function () {
      var ms = Math.max(0, alvo - new Date());
      var v = { dias: Math.floor(ms / 864e5), horas: Math.floor(ms / 36e5) % 24, min: Math.floor(ms / 6e4) % 60, seg: Math.floor(ms / 1e3) % 60 };
      Object.keys(v).forEach(function (k) {
        var txt = String(v[k]).padStart(2, '0');
        if (anterior[k] !== txt) {
          casas[k].textContent = txt;
          casas[k].classList.remove('vira'); void casas[k].offsetWidth; casas[k].classList.add('vira');
          anterior[k] = txt;
        }
      });
    };
    tick();
    setInterval(tick, 1000);
  }

  // ---------- A noite: varal de luzinhas e o jardim ----------
  var noiteSecao = el('section', 'noite');
  noiteSecao.setAttribute('aria-label', 'Jardim Onírico à noite');
  noiteSecao.appendChild(varal);
  var quadro = el('figure', 'noite-quadro');
  quadro.innerHTML = '<img src="img/jardim-noite.jpg" alt="O quadro do Era Uma Vez no jardim à noite, entre hortênsias e rosas" loading="lazy" width="900" height="1170"><figcaption>Quando o sol se põe, o jardim acorda.</figcaption>';
  noiteSecao.appendChild(quadro);
  var depoisDe = (document.getElementById('ev-atalhos') || {}).parentNode || document.querySelector('.ev-abertura');
  depoisDe.parentNode.insertBefore(noiteSecao, depoisDe.nextSibling);
  setTimeout(medirNoite, 400);

  // ---------- Elementos que surgem ao rolar ----------
  if ('IntersectionObserver' in window && !calmo) {
    var alvos = document.querySelectorAll('.ev-atalho, .ev-bloco, .relogio, .noite-quadro');
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('surgiu'); obs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    [].forEach.call(alvos, function (a, i) { a.style.setProperty('--ordem', i % 4); a.classList.add('vai-surgir'); obs.observe(a); });
  }
})();
