// Formulário de cadastro de embaixadores e RPs, usado dentro das páginas.
// Os eventos para marcar vêm de data/eventos.json; o endereço da planilha vem de data/formulario.json.
window.CITCadastro = (function () {
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var contador = 0;

  function el(tag, attrs, texto) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (texto != null) n.textContent = texto;
    return n;
  }

  function lerJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }

  function campo(id, rotulo, attrs, dica) {
    var box = el('div', { class: 'cad-campo' });
    box.appendChild(el('label', { for: id }, rotulo));
    var input = el('input', Object.assign({ id: id, name: id.replace(/^cad\d+-/, '') }, attrs));
    box.appendChild(input);
    if (dica) box.appendChild(el('span', { class: 'cad-dica' }, dica));
    return box;
  }

  // container: onde o formulário entra; opcoes.raiz: caminho até a raiz do site; opcoes.eventoAtual: nome do evento da página
  function montar(container, opcoes) {
    opcoes = opcoes || {};
    var raiz = opcoes.raiz || '';
    var p = 'cad' + (++contador) + '-';
    var form = el('form', { class: 'cad-form', novalidate: '' });

    form.appendChild(campo(p + 'nome', 'Nome completo', { type: 'text', required: '', autocomplete: 'name' }));
    var linha = el('div', { class: 'cad-linha' });
    linha.appendChild(campo(p + 'idade', 'Idade', { type: 'number', required: '', min: '18', max: '99', inputmode: 'numeric' }));
    linha.appendChild(campo(p + 'whatsapp', 'WhatsApp', { type: 'tel', required: '', autocomplete: 'tel', placeholder: '(27) 99999-9999' }));
    form.appendChild(linha);
    var linha2 = el('div', { class: 'cad-linha' });
    linha2.appendChild(campo(p + 'cidade', 'Cidade', { type: 'text', required: '', autocomplete: 'address-level2' }));
    linha2.appendChild(campo(p + 'bairro', 'Bairro', { type: 'text', required: '' }));
    form.appendChild(linha2);
    form.appendChild(campo(p + 'instagram', 'Instagram', { type: 'text', required: '', placeholder: '@seuperfil' }));
    form.appendChild(campo(p + 'outras_redes', 'Outras redes (opcional)', { type: 'text', placeholder: 'TikTok, YouTube…' }));

    var grupo = el('fieldset', { class: 'cad-eventos' });
    grupo.appendChild(el('legend', null, 'Quais eventos você quer divulgar?'));
    var lista = el('div', { class: 'cad-opcoes' }, 'Carregando eventos…');
    grupo.appendChild(lista);
    form.appendChild(grupo);

    // Campo escondido contra robôs: pessoas não veem, robôs preenchem
    var isca = el('input', { type: 'text', name: 'site', tabindex: '-1', autocomplete: 'off', class: 'cad-isca', 'aria-hidden': 'true' });
    form.appendChild(isca);

    var aceite = el('label', { class: 'cad-aceite' });
    var check = el('input', { type: 'checkbox', name: 'autorizacao', id: p + 'autorizacao', required: '' });
    aceite.appendChild(check);
    aceite.appendChild(el('span', null, 'Autorizo a CIT Agency a guardar meus dados e entrar em contato sobre o programa de embaixadores.'));
    form.appendChild(aceite);

    var erro = el('p', { class: 'cad-erro', role: 'alert' });
    erro.hidden = true;
    form.appendChild(erro);
    var enviar = el('button', { type: 'submit', class: 'ev-botao cad-enviar' }, 'Enviar cadastro');
    form.appendChild(enviar);
    container.appendChild(form);

    lerJSON(raiz + 'data/eventos.json').then(function (d) {
      var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
      lista.textContent = '';
      (d.eventos || []).map(function (ev) {
        var x = String(ev.data).split('-').map(Number);
        return { ev: ev, data: new Date(x[0], x[1] - 1, x[2]) };
      }).filter(function (x) { return x.data >= hoje; })
        .sort(function (a, b) { return a.data - b.data; })
        .forEach(function (x, i) {
          var id = p + 'ev' + i;
          var lab = el('label', { class: 'cad-opcao', for: id });
          var c = el('input', { type: 'checkbox', id: id, value: x.ev.nome });
          if (x.ev.nome === opcoes.eventoAtual) c.checked = true;
          lab.appendChild(c);
          lab.appendChild(el('span', null, x.ev.nome + ' · ' + String(x.data.getDate()).padStart(2, '0') + ' ' + MESES[x.data.getMonth()]));
          lista.appendChild(lab);
        });
    }).catch(function () { lista.textContent = 'Não foi possível carregar a lista de eventos.'; });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      erro.hidden = true;
      var marcados = [].slice.call(lista.querySelectorAll('input:checked')).map(function (c) { return c.value; });
      var invalidos = [].slice.call(form.querySelectorAll('input[required]')).filter(function (i) { return !i.checkValidity(); });
      [].slice.call(form.querySelectorAll('input')).forEach(function (i) { i.removeAttribute('aria-invalid'); });
      invalidos.forEach(function (i) { i.setAttribute('aria-invalid', 'true'); });
      var invalido = invalidos[0];
      if (invalido) {
        erro.textContent = invalido.type === 'checkbox' ? 'Marque a autorização para enviar o cadastro.' : 'Preencha o campo "' + (form.querySelector('label[for="' + invalido.id + '"]') || {}).textContent + '" corretamente.';
        erro.hidden = false;
        invalido.focus();
        return;
      }
      if (!marcados.length) { erro.textContent = 'Marque pelo menos um evento.'; erro.hidden = false; return; }
      if (isca.value) return;

      var corpo = new URLSearchParams();
      ['nome', 'idade', 'whatsapp', 'cidade', 'bairro', 'instagram', 'outras_redes'].forEach(function (k) {
        corpo.append(k, form.elements[k].value.trim());
      });
      corpo.append('eventos', marcados.join(', '));
      corpo.append('origem', opcoes.eventoAtual || 'Página CIT Agency');
      corpo.append('autorizacao', 'Sim');

      enviar.disabled = true;
      enviar.textContent = 'Enviando…';
      lerJSON(raiz + 'data/formulario.json').then(function (cfg) {
        if (!cfg.endereco_envio) throw new Error('sem-endereco');
        // A planilha do Google não devolve resposta legível para o site; se o envio sair, consideramos recebido
        return fetch(cfg.endereco_envio, { method: 'POST', mode: 'no-cors', body: corpo });
      }).then(function () {
        form.innerHTML = '';
        form.appendChild(el('p', { class: 'cad-ok' }, 'Cadastro enviado! A equipe da CIT vai analisar e entrar em contato pelo seu WhatsApp.'));
      }).catch(function (err) {
        enviar.disabled = false;
        enviar.textContent = 'Enviar cadastro';
        erro.textContent = err.message === 'sem-endereco'
          ? 'O formulário ainda está em teste: o envio para a planilha não foi configurado.'
          : 'Não foi possível enviar agora. Verifique sua internet e tente de novo.';
        erro.hidden = false;
      });
    });
  }

  return { montar: montar };
})();
