// Formulário de aniversariante, usado dentro das páginas de evento.
// Gera o cupom (BDAY + primeiro nome), envia para a planilha de aniversários
// (endereço em data/formulario.json, campo endereco_aniversario) e mostra o cupom para a pessoa.
window.CITAniversario = (function () {
  var contador = 0;
  var SYMPLA_CADASTRO = 'https://www.sympla.com.br/';

  function el(tag, attrs, texto) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (texto != null) n.textContent = texto;
    return n;
  }

  function campo(id, rotulo, attrs, dica) {
    var box = el('div', { class: 'cad-campo' });
    box.appendChild(el('label', { for: id }, rotulo));
    box.appendChild(el('input', Object.assign({ id: id, name: id.replace(/^niver\d+-/, '') }, attrs)));
    if (dica) box.appendChild(dica);
    return box;
  }

  // BDAY + primeiro nome, só letras, sem acento e em maiúsculas (ex.: "Maria Júlia" -> BDAYMARIA)
  function cupom(nome) {
    var primeiro = String(nome).trim().split(/\s+/)[0] || '';
    return 'BDAY' + primeiro.normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase();
  }

  // Confere os dígitos verificadores do CPF
  function cpfValido(valor) {
    var c = String(valor).replace(/\D/g, '');
    if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
    for (var t = 9; t < 11; t++) {
      var soma = 0;
      for (var i = 0; i < t; i++) soma += Number(c[i]) * (t + 1 - i);
      if (((soma * 10) % 11) % 10 !== Number(c[t])) return false;
    }
    return true;
  }

  function mascaraCPF(input) {
    input.addEventListener('input', function () {
      var c = input.value.replace(/\D/g, '').slice(0, 11);
      input.value = c.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    });
  }

  // container: onde o formulário entra; opcoes.raiz: caminho até a raiz do site; opcoes.evento: nome do evento
  function montar(container, opcoes) {
    opcoes = opcoes || {};
    var raiz = opcoes.raiz || '';
    var p = 'niver' + (++contador) + '-';
    var form = el('form', { class: 'cad-form', novalidate: '' });

    form.appendChild(campo(p + 'nome', 'Nome completo', { type: 'text', required: '', autocomplete: 'name' }));
    var linha = el('div', { class: 'cad-linha' });
    linha.appendChild(campo(p + 'aniversario', 'Data de aniversário', { type: 'date', required: '' }));
    linha.appendChild(campo(p + 'cpf', 'CPF', { type: 'text', required: '', inputmode: 'numeric', placeholder: '000.000.000-00', maxlength: '14' }));
    form.appendChild(linha);
    mascaraCPF(form.elements[p + 'cpf'] || form.querySelector('#' + p + 'cpf'));
    form.appendChild(campo(p + 'whatsapp', 'WhatsApp', { type: 'tel', required: '', autocomplete: 'tel', placeholder: '(27) 99999-9999' }));

    var dica = el('span', { class: 'cad-dica' }, 'O mesmo e-mail da sua conta na Sympla. Ainda não tem conta? ');
    var link = el('a', { href: SYMPLA_CADASTRO, target: '_blank', rel: 'noopener' }, 'Crie aqui');
    dica.appendChild(link);
    dica.appendChild(document.createTextNode(' antes de enviar.'));
    form.appendChild(campo(p + 'email', 'E-mail da sua conta na Sympla', { type: 'email', required: '', autocomplete: 'email', placeholder: 'voce@email.com' }, dica));
    form.appendChild(campo(p + 'comissario', 'Comissário que indicou (opcional)', { type: 'text', placeholder: 'Nome de quem te indicou' }));

    var isca = el('input', { type: 'text', name: 'site', tabindex: '-1', autocomplete: 'off', class: 'cad-isca', 'aria-hidden': 'true' });
    form.appendChild(isca);

    var aceite = el('label', { class: 'cad-aceite' });
    aceite.appendChild(el('input', { type: 'checkbox', id: p + 'autorizacao', required: '' }));
    aceite.appendChild(el('span', null, 'Autorizo a CIT Agency a guardar meus dados, inclusive o CPF, para gerar meu cupom de aniversariante e entrar em contato comigo pelo WhatsApp e e-mail, conforme a LGPD.'));
    form.appendChild(aceite);

    var erro = el('p', { class: 'cad-erro', role: 'alert' });
    erro.hidden = true;
    form.appendChild(erro);
    var enviar = el('button', { type: 'submit', class: 'ev-botao cad-enviar' }, 'Quero meu cupom');
    form.appendChild(enviar);
    container.appendChild(form);

    function falha(input, texto) {
      erro.textContent = texto;
      erro.hidden = false;
      if (input) { input.setAttribute('aria-invalid', 'true'); input.focus(); }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      erro.hidden = true;
      var campos = [].slice.call(form.querySelectorAll('input'));
      campos.forEach(function (i) { i.removeAttribute('aria-invalid'); });
      var invalidos = campos.filter(function (i) { return i.required && !i.checkValidity(); });
      invalidos.forEach(function (i) { i.setAttribute('aria-invalid', 'true'); });
      if (invalidos.length) {
        var i0 = invalidos[0];
        var rotulo = (form.querySelector('label[for="' + i0.id + '"]') || {}).textContent;
        return falha(i0, i0.type === 'checkbox' ? 'Marque a autorização para enviar o cadastro.' : 'Preencha o campo "' + rotulo + '" corretamente.');
      }
      var cpf = form.querySelector('#' + p + 'cpf');
      if (!cpfValido(cpf.value)) return falha(cpf, 'Confira o CPF: os números não estão certos.');
      if (isca.value) return;

      var valor = function (n) { return form.querySelector('#' + p + n).value.trim(); };
      var codigo = cupom(valor('nome'));
      var corpo = new URLSearchParams();
      ['nome', 'aniversario', 'cpf', 'whatsapp', 'email', 'comissario'].forEach(function (n) { corpo.append(n, valor(n)); });
      corpo.append('cupom', codigo);
      corpo.append('evento', opcoes.evento || '');
      corpo.append('autorizacao', 'Sim');

      enviar.disabled = true;
      enviar.textContent = 'Enviando…';
      fetch(raiz + 'data/formulario.json', { cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (cfg) {
          if (!cfg.endereco_aniversario) throw new Error('sem-endereco');
          // A planilha do Google não devolve resposta legível para o site; se o envio sair, consideramos recebido
          return fetch(cfg.endereco_aniversario, { method: 'POST', mode: 'no-cors', body: corpo });
        })
        .then(function () {
          form.innerHTML = '';
          var ok = el('div', { class: 'cad-ok niver-ok' });
          ok.appendChild(el('p', null, 'Cadastro recebido! Seu cupom de aniversariante é:'));
          ok.appendChild(el('strong', { class: 'niver-cupom' }, codigo));
          ok.appendChild(el('p', null, 'Em instantes você recebe no WhatsApp o link da Sympla para usar o cupom.'));
          form.appendChild(ok);
        })
        .catch(function (err) {
          enviar.disabled = false;
          enviar.textContent = 'Quero meu cupom';
          falha(null, err.message === 'sem-endereco'
            ? 'O cadastro de aniversário ainda está em teste: o envio para a planilha não foi configurado.'
            : 'Não foi possível enviar agora. Verifique sua internet e tente de novo.');
        });
    });
  }

  return { montar: montar, cupom: cupom, cpfValido: cpfValido };
})();
