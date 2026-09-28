# Grupo Organoeste — site (Next.js)

Reconstrução do site [organoeste.com.br](https://www.organoeste.com.br/) como uma aplicação Next.js (App Router + TypeScript), mantendo layout, conteúdo, tipografia, cores, imagens e comportamento responsivo do site original.

## Como rodar

```bash
npm install
npm run dev     # desenvolvimento (http://localhost:3000)
npm run build   # build de produção
npm start       # servidor de produção
```

## Estrutura

```
app/
  layout.tsx        # metadados, lang pt-BR, wrapper #site, importa site.css
  page.tsx          # compõe as seções da página
  site.css          # ÚNICO stylesheet do site (mobile + desktop + fontes)
components/
  navbar.tsx        # cabeçalho fixo (logo, navegação, CTA WhatsApp)
  Hero.tsx          # faixa principal com imagem de fundo + animação de entrada
  About.tsx         # bloco OLAM + bloco de bioconversão (vídeo em lightbox)
  ProductsSection.tsx      # adubo orgânico
  Clients.tsx       # empresas que confiam + "Leve a Organoeste para sua cidade"
  contact.tsx              # "É um grande gerador?" + formulário
  ProcessSection.tsx       # logística, metodologia, galpão
  Footer.tsx               # rodapé completo
  Reveal.tsx        # animação suave de entrada por seção
public/
  images/           # imagens do site (baixadas do original)
  fonts/            # Montserrat e Roboto self-hosted (woff2)
  favicon.ico
```

Cada seção é um componente próprio; todos os estilos vivem em `app/site.css`,
com as coordenadas de **desktop** (base) e **mobile**
(`@media (max-width: 800px)`), exatamente como o site original (canvas fixo de
960px no desktop e 360px no celular).

## Nomenclatura de classes

Todas as classes usam nomes em inglês, em kebab-case — e **cada elemento tem
uma única classe significativa** (ex.: `<div className="footer-contact-heading">`
em vez de `element element-text show-desktop show-mobile footer-heading-contact`).
As únicas classes extras são os estados em tempo de execução.

Estrutura de cada faixa da página:

| classe | papel |
| --- | --- |
| `<seção>` (`hero-section`, `about-section-top`, `site-footer`, ...) | faixa de largura total (`<section>`/`<footer>`) |
| `block-overlay` | camada de sobreposição da faixa |
| `canvas` | canvas centralizado (960px desktop / 360px mobile) |
| `<seção>-<parte>` (`hero-title`, `city-cta-image`, `process-card-1`, ...) | elemento posicionado dentro do canvas |
| caixas internas tipadas: `text-content`, `title-content`, `card-content`, `image-content`, `button-content`, `icon-content`, `form-content`, `divider-h-content`, `divider-v-content` | caixa de conteúdo interna do elemento (o tipo ficou no nome) |

Instâncias seguem a seção: `hero-section`/`hero-title`/`hero-subtitle`,
`about-section-top` + `about-top-*`, `about-section-bottom` + `about-bottom-*`,
`products-section` + `products-*`, `clients-section` + `clients-*`,
`city-cta-section` + `city-cta-*`, `contact-section` + `contact-*`,
`process-section` + `process-card-N`/`process-text-N`,
`site-footer` + `footer-*` (ex.: `footer-contact-heading`), `navbar*`,
`about-lightbox*`.

Formulário: `contact-form`, `field-input`, `field-textarea`, `field-label`,
`field-control`, `field-error`, `field-error-icon`, `input-control`,
`button-primary`, `contact-success`.

No `app/site.css`, os grupos estruturais (todos os elementos do canvas, todos os
tipos de caixa, visibilidade por breakpoint) são expressos com listas
`:is(...)` selecionadas por conjunto — a especificidade de cada seletor foi
preservada byte a byte durante o remapeamento. As regras com ids `#e_...`/`#b_...`
são exports mortos do gerador original, mantidas intactas (nunca casam com o
markup atual).

Estados adicionados em tempo de execução: `hero-enter`/`hero-loaded` (hero),
`reveal-pending`/`reveal-in` (revelações no scroll), `navbar-hidden`, `navbar-overlay` (cabeçalho transparente no topo da home), `navbar-links a.is-active` (página atual no menu),
`has-error`;
condicionais de UI: `contact-success`, `about-lightbox*`.

O cabeçalho é fixo (`101px` no desktop, `68px` no mobile) e segue a barra de
referência (`images/navbar.png`): logo da empresa à esquerda (intocado), cinco
links no centro (`Início`, `Produtos`, `Soluções`, `Blog`, `Contato`
— 12.5px/700, espaçados 40px) e o pill verde de WhatsApp à direita (marca de
contorno + "Fale Conosco" + seta). A linha de conteúdo (`min(1260px,
100% - 29px)`) é um pouco mais larga que o canvas da faixa para o pill ficar
perto da borda como na referência. `Produtos` sai do site
(`https://www.fertipower.com.br/`, `target="_blank" rel="noopener noreferrer"`,
nunca marcado como `is-active`) e `Blog` é a rota `/blog` deste app. A página
atual vai em verde escuro com sublinhado de 2px (`is-active`, definido via
`usePathname`); os rótulos com âncora (`/#contato`) rolam suave até as seções
da home, parando exatamente abaixo do cabeçalho (`scroll-margin-top:101px`;
os wrappers `Reveal` em volta das seções têm o `transform` neutralizado para
não deslocar o pouso da âncora).
O `body` reserva o espaço do cabeçalho (`body{padding-top:101px}`), exceto em
páginas cuja primeira seção passa por trás dele — hoje só a home, que contém a
faixa `heading-section`. Nessas páginas o `padding-top` vai a zero
(`body:has(.heading-section)`) e o `Navbar` recebe a prop `overlay`: parado no
topo (até 4px de scroll) ele fica transparente sobre a faixa (`navbar-overlay`) e
troca o logo pela cópia sem a placa branca (`images/logo-transparent.png`); no
primeiro scroll volta a ser a barra branca mesmo com a faixa ainda na tela, e o
esconder/voltar no scroll segue igual.

## Formulário

`components/contact.tsx` reproduz o formulário do original (Nome, E-mail,
Mensagem, botão "Enviar agora mesmo") com validação de e-mail/mensagem, estado
de envio e mensagem de sucesso ("Enviado com sucesso!"). Como não existe
backend no escopo, o envio é simulado no cliente — para integrar de verdade,
basta trocar o `setTimeout` por um `fetch` para a API desejada.

## Manutenção

Edições são feitas direto no código: `components/*.tsx`, `app/page.tsx` e
`app/site.css`. Não existe etapa de geração — o que você editar é o que roda.

### Changelog

- 2026-09-25: **`city-cta-section` com o prefixo completo nos elementos**:
  `city-image` → `city-cta-image`, `city-title` → `city-cta-title`,
  `city-description` → `city-cta-description`, `city-card-back`/`city-card-front`
  → `city-cta-card-*`, `city-contact-name` → `city-cta-contact-name` e o botão
  `city-cta` → `city-cta-button`. O `app/site.css` foi remapeado nas 810
  ocorrências (as listas `:is(...)` continuam em ordem alfabética) e a
  transformação foi conferida por round-trip: revertendo os nomes, o arquivo
  volta a ser idêntico byte a byte ao anterior.
- 2026-09-25: **uma classe por elemento** em todos os componentes:
  `element element-text show-desktop show-mobile footer-heading-contact` →
  `footer-contact-heading` (e `footer-heading-info`/`-company` →
  `footer-info-heading`/`footer-company-heading`); caixas internas →
  `text-content`/`image-content`/`card-content`/...; `block` removido das
  faixas; marcadores sem regra descartados (`border-match`, `required`,
  `input-email`, `field`, `field-full`). O `app/site.css` foi remapeado
  automaticamente (listas `:is(...)`, especificidade preservada, regras mortas
  do gerador `#e_...`/`#b_...` mantidas intactas) e validado por comparação
  pixel-a-pixel: desktop e mobile **0 diferenças** antes/depois.
- 2026-09-25: **cabeçalhos descritivos em inglês** em todos os componentes e em
  `app/page.tsx`; removido `components/page.tsx` (cópia órfã de `app/page.tsx`,
  não importada por nada).
- 2026-09-25: comentários do `app/site.css` reescritos com os nomes atuais das
  seções e mais 8 regras duplicadas colapsadas (123 KB → 122 KB).
- 2026-09-25: **`_reference/` apagado** (ferramentas de análise, backups e
  snapshot do site) e todas as menções removidas do projeto.
- 2026-09-24: **classes renomeadas para nomes de projeto em inglês** em todo o
  CSS e JSX (`gpc-b` → `block`, `gpc-e` → `element`, `c` → `content`,
  `centralizar` → `canvas`, `dd`/`dm` → `show-desktop`/`show-mobile`,
  `e_titulo` → `element-title`, `blk-hero` → `hero-section`,
  `olam-*`/`bio-*` → `about-top-*`/`about-bottom-*`, `adubo-*` → `products-*`,
  `cli-*` → `clients-*`, `proc-*` → `process-*`, `gen-*` → `contact-*`,
  `ftr-*` → `footer-*`, `gpc_campos*` → `field*`, ...). No mesmo passo:
  removidas as regras cujas classes não existem em nenhum markup (cabeçalho
  antigo `hdr-*`, `e_html`, `e_video`, `sombra_*`, `imagem_fundo`,
  `fb-comments`, ...) e colapsadas as duplicatas legado/alias — `app/site.css`
  foi de 184 KB para 123 KB, sem alterar nenhuma regra alcançável.
- 2026-09-24: texto do hero (`<p>`) reduzido para
  `clamp(16px,2.4vh,24px)` desktop / `clamp(15px,2.2vw,20px)` mobile,
  dinâmico pela altura do hero.
- 2026-09-24: alias de classes em inglês em todos os blocos; animação de
  entrada do hero (`hero-enter`/`hero-loaded`); seções AOS do About;
  altura total da seção de produtos; hero a `75vh` com fundo `contain`.
