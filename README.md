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

## Blog dinâmico (MySQL) e deploy no cPanel

> Guia completo de implantação (banco, servidor, o que copiar e o que rodar):
> **[DEPLOYMENT.md](DEPLOYMENT.md)**. Abaixo o resumo.

O blog tem dois modos, escolhidos automaticamente:

| Modo | Quando | O que acontece |
| --- | --- | --- |
| **MySQL** | `DATABASE_URL` ou `DB_HOST` definidos e o banco respondendo | `/blog`, `/blog/[slug]`, o sitemap e o painel `/admin` leem e gravam no banco |
| **Arquivo** | sem credenciais, ou banco fora do ar | usa `data/blog-posts.ts`; o painel mostra o aviso **"MySQL offline"** e, ao salvar, baixa o arquivo atualizado em vez de gravar |

O `npm run build` funciona nos dois casos (sem banco ele apenas registra um aviso no log), então nunca existe deploy quebrado por causa da conexão.

### 1. Criar as tabelas e o seed

**cPanel (phpMyAdmin)** — o usuário do cPanel não tem permissão de `CREATE DATABASE`:

1. cPanel → **MySQL® Databases**: crie o banco e o usuário e adicione o usuário ao banco com **ALL PRIVILEGES**. Guarde os nomes com o prefixo da conta (ex.: `conta_organoeste`).
2. phpMyAdmin: selecione o banco na lateral → aba **Import** → escolha **`scripts/db_setup.cpanel.sql`** → Go. Esse arquivo não tem `CREATE DATABASE` nem `USE` justamente por isso.

**Servidor com acesso root (MySQL local):**

```bash
mysql -u root -p < scripts/db_setup.sql   # cria o banco, as tabelas e o seed
```

**Pelo Node (aplica direto, sem importar SQL):**

```bash
npm run db:push    # cria as tabelas + insere/atualiza o seed (idempotente)
npm run db:check   # confere conexão, tabelas e contagem de linhas
npm run db:seed    # regenera os dois .sql a partir de data/blog-posts.ts
```

Os dois `.sql` são **gerados** a partir de `data/blog-posts.ts` (3 posts, 5 categorias, 9 tags), então o seed acompanha o conteúdo real: rode `npm run db:seed` depois de mexer nos posts. Ambos podem ser reexecutados sem duplicar linhas (`INSERT ... ON DUPLICATE KEY UPDATE`), e o script Node detecta a mensagem de erro do MySQL e diz exatamente o que corrigir.

### 2. Variáveis de ambiente

Copie `.env.example` para `.env` e preencha. Em cPanel use os campos separados — senhas com `@`, `#` ou `!` quebrariam uma URL de conexão:

```env
DB_HOST="localhost"
DB_USER="conta_organoeste"
DB_PASSWORD="a-senha-do-painel"
DB_NAME="conta_organoeste"
```

`DATABASE_URL` continua funcionando (senha com `@` escrita como `%40`), e ainda existem `DB_SSL=true` (TLS), `DB_POOL_SIZE`, `BLOG_SOURCE=file` (força o modo arquivo) e `ADMIN_PASSWORD` (senha do painel).

### 3. Como o site se atualiza

`/blog` e `/blog/[slug]` usam ISR (`revalidate = 60`): uma edição feita direto no phpMyAdmin aparece em no máximo 1 minuto, sem rebuild. Já uma publicação/exclusão feita no painel chama `revalidatePath()` e aparece **na hora** em `/blog`, `/blog/<slug>` e no sitemap.

### 4. Checklist do deploy no cPanel

- [ ] Banco criado, usuário com ALL PRIVILEGES e `scripts/db_setup.cpanel.sql` importado.
- [ ] `.env` na raiz do app com `DB_*` e um `ADMIN_PASSWORD` forte.
- [ ] `npm install` e `npm run build` (Node 20+) com `NODE_ENV=production`.
- [ ] App Node publicado (`npm start`) e **reiniciado** depois de alterar o `.env`.
- [ ] `public/uploads` com permissão de escrita (é onde ficam as imagens enviadas pelo editor; o site as entrega por `/media/<arquivo>`).
- [ ] `npm run db:check` confirmando que a tabela `media_files` existe (é a cópia de segurança das imagens; sem ela o site serve só pelo arquivo).
- [ ] `npm run db:check` ou `/admin` confirmando que o aviso "MySQL offline" não aparece.

### 5. Diagnóstico rápido

| Mensagem | Causa provável |
| --- | --- |
| `ECONNREFUSED` | host/porta errados — no cPanel use `DB_HOST=localhost` |
| `ETIMEDOUT` / `ENOTFOUND` | firewall, host errado ou Remote MySQL não liberado para o seu IP |
| `ER_ACCESS_DENIED_ERROR` | usuário/senha errados (no cPanel o usuário tem o prefixo da conta) |
| `ER_BAD_DB_ERROR` | banco inexistente — crie em MySQL Databases |
| `ER_DBACCESS_DENIED_ERROR` | adicione o usuário ao banco no cPanel |
| `ER_NO_SUCH_TABLE` | importe `scripts/db_setup.cpanel.sql` (ou rode `npm run db:push`) |

## Manutenção

Edições são feitas direto no código: `components/*.tsx`, `app/page.tsx` e
`app/site.css`. Não existe etapa de geração — o que você editar é o que roda.

### Changelog

- 2026-09-30: **blog dinâmico em MySQL**. `/blog`, `/blog/[slug]` e o sitemap passaram a usar ISR (`revalidate = 60`) e o painel chama `revalidatePath()` ao publicar/excluir, então a alteração aparece na hora e sem rebuild. `lib/db.ts` aceita `DATABASE_URL` ou `DB_*` (com `DB_SSL`, pool configurável e keep-alive contra queda de socket em hospedagem compartilhada) e `dbPing()` distingue "sem credenciais", "não conecta" e "tabelas ausentes"; `/admin` mostra o aviso "MySQL offline" quando cai para `data/blog-posts.ts`. Seed gerado em duas versões — `scripts/db_setup.sql` (com `CREATE DATABASE`) e `scripts/db_setup.cpanel.sql` (sem, para importar no phpMyAdmin) — mais `npm run db:push`/`db:check` e o `VALUES()` do upsert trocado por literais repetidos (compatível com MySQL 5.7/8.x e MariaDB). O slug de um post novo agora acompanha o título até ser editado à mão (antes congelava na primeira letra).

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
