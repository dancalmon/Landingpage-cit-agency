# Planilha de listas (pré-venda e outros cadastros)

Uma planilha só para todas as listas de cadastro do site. Cada lista vira uma aba (ex.: "Pré-venda Era Uma Vez").
Configuração feita uma vez só, **logado na conta do Google da CIT (citagency.vix@gmail.com)**:

1. Crie uma planilha nova em sheets.new e dê o nome "Listas CIT".
2. Clique em **Extensões → Apps Script**, apague o que estiver escrito e cole o conteúdo de `planilha-listas.gs`. Salve.
3. **Implantar → Nova implantação → App da Web**, com Executar como: **Eu** e Quem pode acessar: **Qualquer pessoa**.
4. Autorize com a conta da CIT e copie o **URL do app da Web** (termina em `/exec`).
5. Cole em `data/formulario.json`, no campo `endereco_listas`.

Para receber e-mail a cada cadastro, troque `EMAIL_AVISO = ''` pelo e-mail e faça
**Implantar → Gerenciar implantações → lápis → Nova versão → Implantar**.
