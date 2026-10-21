# CIT Agency — Site: página institucional (link da bio) + páginas de eventos

## Quem somos
CIT Agency (razão social CIT AGENCY LTDA, CNPJ 55.477.306/0001-25) é uma produtora de
eventos e entretenimento de Vitória/ES. Realiza cerca de doze eventos por ano, cada um
com produto e experiência diferentes. O DNA da empresa é criar experiências para o público.

Cases de sucesso (destaque na seção de cases):
- Weekend Pedra Azul
- Pontal Weekend

Eventos grandes:
- Feijoada do Panda
- João Gomes em Itaúnas — show em 03/01/2027 às 16h, Conceição da Barra/ES.
  Já tem landing própria em joaogomesitaunas.com.br — o calendário linka pra lá.

Labels autorais:
- +5521
- Day Night — label de música eletrônica, com artistas relevantes do cenário (3 edições).

Próximos eventos (calendário da página-mãe, nesta ordem):
- Departamento — 31/10/2026, na Lagun
- Aura — 19/12/2026, com Antdot, Unfazed e Camila Jun
- João Gomes em Itaúnas — 03/01/2027 (link externo: joaogomesitaunas.com.br)
- Era Uma Vez — 16/01/2027, Guarapari/ES. Será a primeira página de evento do site.
Links de ingresso: [informar para cada evento]

Endereço: R. Misael Pedreira da Silva, 98, Sala 603 Letra A, Santa Lúcia, Vitória/ES.
Instagram: @cit.agency  |  WhatsApp comercial: (27) 99997-3999 [conferir número]
E-mail: citagency.vix@gmail.com

## Arquitetura do site
O site tem dois tipos de página, construídos sobre a mesma base:

### 1. Página-mãe (index.html) — é o link da bio do Instagram
Quase todo acesso vem do Instagram pelo celular. Precisa abrir instantaneamente e
levar a pessoa a um clique de onde ela quer ir.
Seções, nesta ordem:
1. Hero com logo e frase de posicionamento
2. Próximos eventos — calendário em cards (arte, nome, data, local). Cada card linka
   para a página daquele evento (ou para uma landing externa, quando houver)
3. Cases / eventos realizados — galeria com fotos e números
4. Quem somos — DNA, números (eventos/ano, público acumulado)
5. Para marcas e patrocinadores — formatos de ativação, parceiros anteriores, CTA comercial
6. Contato e redes
7. Rodapé com razão social e CNPJ

### 2. Páginas de evento (eventos/<slug>/index.html)
Uma página por evento, com o key visual daquele evento (cores, fontes, artes), mas
sempre a mesma estrutura de informação:
1. Hero com arte do evento, data, local, horário e botão de ingresso
2. Line-up / atrações
3. Ingressos — lotes e link de compra (plataforma externa)
4. Aniversário — como funciona o pacote de aniversariante e como solicitar
5. Lounges e camarotes — opções, capacidade, valores e botão de reserva (WhatsApp)
6. Embaixadora / RP — como participar e formulário ou link de inscrição
7. Informações gerais — classificação, estacionamento, dress code, FAQ
8. Contato do evento e redes
9. Rodapé igual ao da página-mãe

### 3. Template de evento
O mais importante do projeto: criar um TEMPLATE de página de evento em que eu consiga
gerar um evento novo só preenchendo um arquivo de dados (nome, datas, cores, fontes,
imagens, lotes, valores de lounge, textos). Quero que criar um evento novo seja rápido
e não exija mexer no código.

## Regras técnicas
- HTML, CSS e JavaScript puros, sem frameworks nem etapa de build.
- Estrutura de pastas:
  /index.html            página-mãe
  /eventos/<slug>/       uma pasta por evento, cada uma com seu index.html e suas imagens
  /css, /js              arquivos compartilhados
  /template/             o modelo de página de evento + exemplo de arquivo de dados
- Dados editáveis (calendário da página-mãe e conteúdo de cada evento) em arquivos
  JSON separados do código, com comentários explicando cada campo.
- Mobile first. Imagens otimizadas. Nada pesado.
- Preparado para publicar na Vercel ou Netlify, com domínio próprio depois.
- Textos em português do Brasil. Tom: premium, jovem, direto. Sem clichês de agência.

## Ordem de trabalho
1. Página-mãe completa e no ar.
2. Template de evento.
3. Primeira página de evento real a partir do template: Era Uma Vez — 16/01/2027, Guarapari/ES.
Não comece a etapa seguinte sem eu aprovar a anterior.

## Como trabalhar comigo
- Não sou desenvolvedor. Explique o que fez em uma ou duas frases, sem jargão.
- Antes de mudanças grandes, me mostre o plano e espere eu aprovar.
- Quando eu pedir ajuste visual, faça e me diga como abrir pra conferir.
- Nunca invente números de público, valores de lounge ou patrocinadores; use
  [placeholder] se eu não tiver informado.
