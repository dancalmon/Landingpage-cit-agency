# Planilha de cadastros de aniversariantes

O formulário "Comemore seu aniversário" das páginas de evento grava cada cadastro numa planilha do Google,
manda um e-mail de aviso (sem o CPF) e, quando configurado, envia os dados para o CRM.
Configuração feita uma vez só, **logado na conta do Google da CIT (citagency.vix@gmail.com)**:

1. Crie uma planilha nova em sheets.new e dê o nome "Aniversários CIT".
2. No menu, clique em **Extensões → Apps Script**.
3. Apague o que estiver escrito e cole todo o conteúdo do arquivo `planilha-aniversarios.gs`. Clique no disquete para salvar.
4. Clique em **Implantar → Nova implantação**. Na engrenagem, escolha **App da Web**.
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
5. Clique em **Implantar** e autorize com a conta da CIT. O Google vai pedir permissão para editar planilhas,
   enviar e-mails e acessar serviços externos (este último é para o CRM).
6. Copie o **URL do app da Web** (termina em `/exec`) e cole em `data/formulario.json`, no campo `endereco_aniversario`.

O cupom é gerado pelo site: **BDAY + primeiro nome** (ex.: Maria Júlia → BDAYMARIA).
Ele precisa existir na Sympla, no evento, para funcionar na compra.

A planilha tem CPF: compartilhe só com quem precisa.

Para ligar o CRM: troque `WEBHOOK_CRM = ''` pelo endereço que o CRM fornecer e faça
**Implantar → Gerenciar implantações → lápis → Versão: Nova versão → Implantar**.
