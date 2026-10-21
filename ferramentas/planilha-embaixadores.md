# Planilha de cadastros de embaixadores e RPs

O formulário do site grava cada cadastro numa planilha do Google. Configuração feita uma vez só:

1. Logado na conta do Google da CIT, crie uma planilha nova em sheets.new e dê o nome "Embaixadores CIT".
2. No menu, clique em **Extensões → Apps Script**.
3. Apague o que estiver escrito e cole todo o conteúdo do arquivo `planilha-embaixadores.gs`. Clique no disquete para salvar.
4. Clique em **Implantar → Nova implantação**. Na engrenagem, escolha **App da Web**.
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
5. Clique em **Implantar** e autorize com a conta da CIT (em "Avançado", confirme que confia no próprio script).
6. Copie o **URL do app da Web** (termina em `/exec`) e cole em `data/formulario.json`, no campo `endereco_envio`.

Os cadastros aparecem na aba **Cadastros**, uma linha por pessoa.
Para ser avisado a cada cadastro: na planilha, **Ferramentas → Regras de notificação → Quando alterações forem feitas**.
