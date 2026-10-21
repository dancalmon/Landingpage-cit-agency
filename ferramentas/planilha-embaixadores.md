# Planilha de cadastros de embaixadores e RPs

O formulário do site grava cada cadastro numa planilha do Google e manda um e-mail de aviso.
Configuração feita uma vez só, **logado na conta do Google da CIT (citagency.vix@gmail.com)**,
para a planilha ficar no Drive da CIT:

1. Crie uma planilha nova em sheets.new e dê o nome "Embaixadores CIT".
2. No menu, clique em **Extensões → Apps Script**.
3. Apague o que estiver escrito e cole todo o conteúdo do arquivo `planilha-embaixadores.gs`.
   Se quiser avisos em outro e-mail, troque o endereço em `EMAIL_AVISO`. Clique no disquete para salvar.
4. Clique em **Implantar → Nova implantação**. Na engrenagem, escolha **App da Web**.
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
5. Clique em **Implantar** e autorize com a conta da CIT (em "Avançado", confirme que confia no próprio script).
   O Google vai pedir permissão para editar planilhas e enviar e-mails em seu nome: as duas são necessárias.
6. Copie o **URL do app da Web** (termina em `/exec`) e cole em `data/formulario.json`, no campo `endereco_envio`.

Os cadastros aparecem na aba **Cadastros**, uma linha por pessoa, e cada um gera um e-mail com os dados
e um link para chamar a pessoa no WhatsApp.

Se mudar o código depois: **Implantar → Gerenciar implantações → lápis → Versão: Nova versão → Implantar**.
Assim o endereço /exec continua o mesmo.
