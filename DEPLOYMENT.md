# Deployment guide — Organoeste (Next.js 16 + MySQL)

Guia completo para subir o site **com o banco de dados** (cPanel ou servidor próprio):
o que copiar, onde colocar cada arquivo, o que rodar e como conferir que ficou certo.

- Stack: **Next.js 16.3.6 (App Router) + TypeScript + mysql2**. Nenhum CMS externo.
- O conteúdo do blog vive no **MySQL**; `data/blog-posts.ts` é apenas o conteúdo
  inicial (seed) e o plano B quando o banco não responde.
- Sem banco configurado o site **não quebra**: ele serve o conteúdo do arquivo e o
  painel mostra o aviso "MySQL offline".

---

## 0. TL;DR (caminho rápido para cPanel)

```bash
# dependências + build de produção, no servidor (ou por SSH)
npm install
npm run build
```

1. **cPanel → MySQL® Databases**: crie o banco e o usuário, e adicione o usuário ao
   banco com **ALL PRIVILEGES**. Anote `usuario`, `senha`, `banco` (todos com o
   prefixo da conta, ex.: `minhaconta_organoeste`).
2. **cPanel → phpMyAdmin**: selecione o banco → aba **Import** →
   envie `scripts/db_setup.cpanel.sql` → **Go**.
   *(esse arquivo NÃO tem `CREATE DATABASE`/`USE`, exatamente porque o usuário do
   cPanel não tem esse privilégio)*
3. **cPanel → Setup Node.js App**: crie a aplicação apontando para a pasta do
   projeto, com startup file **`server.js`**.
4. Coloque o **`.env`** na raiz do projeto (mesma pasta do `package.json`) com os
   dados do passo 1 (veja a seção 4).
5. `npm install` → `npm run build` → **Restart** na aplicação.
6. Abra `https://seudominio.com/admin` e entre com a `ADMIN_PASSWORD`.
7. Confira que **não** aparece o aviso "MySQL offline" e que os posts aparecem.

Verificação rápida a qualquer momento (na pasta do projeto, no servidor):

```bash
npm run db:check     # conexão + tabelas + contagem de linhas
```

---

## 1. O que vai para o servidor e onde

### Arquivos/pastas que **precisam** existir no servidor

| Caminho | Para que serve | Observação |
| --- | --- | --- |
| `app/`, `components/`, `lib/`, `data/` | código do site e do painel | só leitura em produção |
| `public/` | imagens, fontes, ícones | servido direto pelo Next |
| `public/uploads/` | **imagens enviadas pelo painel** | precisa ser **gravável** pelo processo Node; entregues pela rota `/media/<arquivo>` |
| `scripts/` | criar tabelas, semear, conferir o banco | pode rodar por SSH ou local |
| `.env` | senha do painel + credenciais do MySQL | **nunca** versionar; criar no servidor |
| `package.json` / `package-lock.json` | dependências (`mysql2`, `next`, `react`) | instalar no servidor com `npm ci`/`npm install` |
| `.next/` | build de produção | gerado por `npm run build` |
| `server.js` | startup file para cPanel/Passenger | usa o mesmo build do `next start` |

### Como as imagens do painel são servidas

O painel grava o arquivo em `public/uploads/` e guarda no post a URL
`/media/<arquivo>`. Quem entrega a imagem é a rota `app/media/[name]/route.ts`,
que lê `public/uploads` **do mesmo processo Node** que recebeu o upload. Isso
resolve o caso clássico do cPanel em que o arquivo até é salvo, mas
`/uploads/<arquivo>` responde **404**: o Apache procura o arquivo no *document
root* (por exemplo `public_html/`) enquanto o app Node guarda em outra pasta.

URLs antigas, já salvas no banco como `/uploads/<arquivo>`, continuam abrindo:
o `next.config.ts` faz `rewrite` de `/uploads/:name` para `/media/:name`. O
rewrite só entra quando **não** existe arquivo estático com esse nome, então
nada muda em servidor onde o `public/` já é servido corretamente.

### Pastas que **não** devem ser enviadas

| Caminho | Motivo |
| --- | --- |
| `node_modules/` | instale no servidor (`npm ci`) — binários da sua máquina podem não servir |
| `.git/`, `.history/` | histórico local, sem uso em produção |
| `.next/cache/` (opcional) | pode ir junto para preservar cache, mas dobra o tamanho |

### Escrita em disco (permissões)

| Caminho | Permissão | Por quê |
| --- | --- | --- |
| `public/uploads/` | `755` (dono = usuário do Node) | upload de capas e imagens do editor |
| `.next/` | gravável pelo processo Node | cache de páginas/ISR (`revalidate = 60`) |
| `.env` | `600` | contém senhas |

---

## 2. Requisitos do servidor

| Item | Mínimo | Como conferir |
| --- | --- | --- |
| Node.js | **>= 20.9** (exigência do Next 16.3.6) | `node -v` |
| npm | 9+ | `npm -v` |
| MySQL / MariaDB | MySQL 5.7+, MariaDB 10.4+ | `SELECT VERSION();` no phpMyAdmin |
| Charset do banco | `utf8mb4` / `utf8mb4_unicode_ci` | conteúdo em português com acentos |
| Processo Node | cPanel com "Setup Node.js App" (Passenger) ou VPS | — |
| RAM para o build | ~1 GB | se o servidor não compilar, veja 5.7 |

> Não há suporte a **prefixo de tabela**: o app consulta `blog_posts`,
> `blog_categories` e `blog_tags` com esses nomes fixos (`lib/posts.ts`,
> `lib/db.ts`, `app/admin/actions.ts`). Como no cPanel o banco já é exclusivo da
> conta, não é preciso prefixo.

## 3. O banco de dados

### 3.1 Como o app escolhe a fonte de dados

```
lib/db.ts        cria o pool (DATABASE_URL ou DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME)
lib/posts.ts     lê blog_posts + blog_tags + blog_categories; se falhar, usa data/blog-posts.ts
app/admin/actions.ts  login, salvar, excluir, upload; grava direto nas tabelas
scripts/db_setup*.sql  criação das tabelas + conteúdo inicial (seed)
```

| Situação | Resultado |
| --- | --- |
| Credenciais certas e tabelas criadas | site e painel 100% no banco (caminho normal) |
| Sem credenciais, ou banco fora do ar | site serve `data/blog-posts.ts`; o painel avisa "MySQL offline" e, ao salvar, baixa o arquivo atualizado |

> Sempre que o conteúdo é lido do banco, `publishedPosts()` já filtra
> `status = 'published'` e ordena por data. Rascunhos só aparecem no painel.

### 3.2 Caminho A — cPanel + phpMyAdmin (recomendado)

1. **Criar o banco** — cPanel → **MySQL® Databases**:
   - *Create New Database*: nome do banco (ex.: `organoeste`) → vira `minhaconta_organoeste`.
   - *Add New User*: usuário + senha (anote!) → vira `minhaconta_organoeste`.
   - *Add User To Database*: selecione banco + usuário → **Add** → marque **ALL PRIVILEGES** → *Make Changes*.
2. **Importar as tabelas** — cPanel → **phpMyAdmin**:
   - clique no banco na coluna da esquerda (ele precisa estar selecionado);
   - aba **Import** → *Choose File* → `scripts/db_setup.cpanel.sql`
     (o arquivo tem ~27 KB) → charset `utf-8` → **Go**.
   - Resultado esperado: *"Import has been successfully finished"* e as tabelas
     `blog_categories`, `blog_posts`, `blog_tags` na lateral.
3. **Conferir**: clique em `blog_posts` → aba *Browse* → devem existir 3 posts.

O arquivo começa assim (não tem `CREATE DATABASE` nem `USE`, de propósito):

```sql
-- Organoeste blog store: tables + seed for cPanel (phpMyAdmin import).
-- Safe to re-run: tables are created IF NOT EXISTS ...
CREATE TABLE IF NOT EXISTS blog_categories (...);
CREATE TABLE IF NOT EXISTS blog_posts (...);
CREATE TABLE IF NOT EXISTS blog_tags (...);
```

Pode importar **quantas vezes quiser**: as tabelas usam `IF NOT EXISTS` e as
inserções usam `INSERT ... ON DUPLICATE KEY UPDATE`, então só atualizam o conteúdo
(sem duplicar linhas).

### 3.3 Caminho B — linha de comando (SSH / VPS / MySQL local)

```bash
# cria banco, tabelas e seed (precisa de um usuário com privilégio de criar banco)
mysql -u root -p < scripts/db_setup.sql

# ou, importando numa base já existente e com usuário restrito:
mysql -u minhaconta_organoeste -p minhaconta_organoeste < scripts/db_setup.cpanel.sql
```

### 3.4 Caminho C — script Node (sem importar SQL)

```bash
npm run db:push     # cria as tabelas + aplica o seed (idempotente, com placeholders)
npm run db:check    # só confere: conexão, tabelas e contagens
node scripts/db-apply.cjs --dry   # mostra o que seria executado, sem conectar
```

Aceita sobrescrever as credenciais por linha de comando (útil para testar antes de
mexer no `.env`):

```bash
node scripts/db-apply.cjs --check --host=localhost --user=minhaconta_organoeste \
  --password='senha' --database=minhaconta_organoeste
# ou
node scripts/db-apply.cjs --check --url='mysql://user:senha%40comarroba@localhost:3306/banco'
```

Saída esperada de um banco saudável:

```
conectado : 11.4.2-MariaDB — banco minhaconta_organoeste
tabelas   : blog_categories, blog_posts, blog_tags
conteúdo  : 3 posts, 5 categorias, 9 tags

✔ Banco pronto para o app.
```

### 3.5 Estrutura das tabelas (referência)

**`blog_posts`** — uma linha por artigo:

| Coluna | Tipo | Quem controla |
| --- | --- | --- |
| `id` | INT AI PK | banco |
| `slug` | VARCHAR(160) UNIQUE | app (URL do post) |
| `title`, `excerpt`, `category`, `author`, `author_role` | VARCHAR/TEXT | app |
| `published_at`, `updated_at` | DATE | app (`yyyy-mm-dd`) |
| `status` | ENUM('draft','published') | app |
| `featured` | TINYINT(1) | app |
| `image`, `image_alt` | VARCHAR(255) | app |
| `content_html` | MEDIUMTEXT | app (HTML já sanitizado) |
| `show_toc` | TINYINT(1) | app |
| `seo_title`, `meta_description`, `focus_keyword`, `canonical_url`, `og_image` | VARCHAR (NULL) | app (campos "SEO & extra") |
| `created_at`, `updated_ts` | TIMESTAMP | só o banco (auditoria) |

**`blog_categories`** — `id`, `name` (UNIQUE), `sort_order`.
**`blog_tags`** — `post_id` (FK → `blog_posts.id`, `ON DELETE CASCADE`), `tag`, `sort_order`; PK `(post_id, tag)`.

Índices criados: `(status, published_at)`, `(category)` e `FULLTEXT (title, excerpt, content_html)`.
Tudo em `ENGINE=InnoDB`, `utf8mb4 / utf8mb4_unicode_ci`.

### 3.6 O que o seed insere

Gerado a partir de `data/blog-posts.ts` (fonte única, evita divergência):

- **3 posts** publicados (compostagem industrial, coleta licenciada, adubo orgânico);
- **5 categorias**: Compostagem, Coleta e Logística, Fertilizantes, ESG e Sustentabilidade, Operação;
- **9 tags**.

Depois de editar os posts em `data/blog-posts.ts`, regenere os dois arquivos SQL:

```bash
npm run db:seed    # reescreve scripts/db_setup.sql e scripts/db_setup.cpanel.sql
npm run db:push    # opcional: aplica direto no banco configurado no .env
```

---

## 4. Variáveis de ambiente (`.env`)

**Onde colocar:** um arquivo chamado exatamente `.env` na **raiz do projeto**, na
mesma pasta do `package.json` (ao lado de `app/`, `lib/`, `scripts/`).
O Next lê esse arquivo quando o processo inicia — depois de alterar, **reinicie a
aplicação** (no cPanel: botão *Restart*).

No Gerenciador de Arquivos do cPanel, ative **Settings → Show Hidden Files** para
ver/criar o `.env`.

| Variável | Obrigatória | Exemplo | Para que serve |
| --- | --- | --- | --- |
| `DB_HOST` | sim* | `localhost` | endereço do MySQL (no cPanel quase sempre `localhost`) |
| `DB_PORT` | não | `3306` | porta (padrão 3306) |
| `DB_USER` | sim* | `minhaconta_organoeste` | usuário criado em MySQL Databases |
| `DB_PASSWORD` | sim* | `S3nh@Forte!` | senha desse usuário |
| `DB_NAME` | sim* | `minhaconta_organoeste` | banco criado no cPanel |
| `DATABASE_URL` | alternativa | `mysql://user:senha@localhost:3306/banco` | URL única; se existir, tem prioridade sobre `DB_*` |
| `DB_SSL` | não | `true` | TLS (só se o servidor exigir) |
| `DB_POOL_SIZE` | não | `5` | conexões simultâneas do pool |
| `BLOG_SOURCE` | não | `file` | força o modo arquivo (ignora o banco) |
| `ADMIN_PASSWORD` | **sim** | `outra-senha-forte` | senha do painel `/admin` |

\* obrigatórias quando se usa `DB_*`. Sem nenhuma delas o site roda em modo arquivo
(com o aviso "MySQL offline" no painel).

### 4.1 cPanel (copie e ajuste) — recomendado

```env
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="minhaconta_organoeste"
DB_PASSWORD="a-senha-que-voce-criou"
DB_NAME="minhaconta_organoeste"
ADMIN_PASSWORD="uma-senha-longa-e-diferente"
```

Use os campos separados no cPanel: senhas criadas lá costumam ter `@ # ! $ %`, que
quebrariam uma URL de conexão.

### 4.2 Banco em outro servidor (URL única)

```env
DATABASE_URL="mysql://usuario:S3nh%40Forte@db.exemplo.com:3306/minhaconta_organoeste?charset=utf8mb4"
DB_SSL="true"
ADMIN_PASSWORD="uma-senha-longa-e-diferente"
```

> Na forma URL, caracteres especiais da senha precisam ser codificados:
> `@` → `%40`, `#` → `%23`, `!` → `%21`, `/` → `%2F`.
> Com o banco em outro host, libere seu IP em **cPanel → Remote MySQL®**.

### 4.3 Desenvolvimento local (XAMPP / WAMP / Docker / MySQL instalado)

```env
DB_HOST="127.0.0.1"
DB_PORT="3306"
DB_USER="root"
DB_PASSWORD=""
DB_NAME="organoeste"
ADMIN_PASSWORD="dev"
```

Depois: `npm run db:push` (cria tabelas + seed) e `npm run db:check`.

### 4.4 Sobre a `ADMIN_PASSWORD`

- É a senha do painel `/admin`, comparada como hash SHA-256 no servidor (a senha
  não fica em texto no navegador nem no cookie).
- **Sem ela definida o padrão é `admin123`** — sempre defina uma senha própria em
  produção.
- Trocar a senha invalida as sessões abertas (o cookie é derivado do hash): basta
  entrar de novo.
- A sessão dura 12 horas (cookie `organoeste-admin`, `httpOnly`, `sameSite=lax`).

### 4.5 Nunca versione o `.env`

O `.gitignore` já ignora `.env` e `.env*.local`. Use o `.env.example` como modelo.

---

## 5. Deploy no cPanel (Node.js App / Passenger)

### 5.1 Criar a aplicação

**cPanel → Setup Node.js App → Create Application**:

| Campo | Valor |
| --- | --- |
| Node.js version | 20.x ou superior (mínimo 20.9) |
| Application mode | **Production** |
| Application root | `organoeste` (a pasta do projeto dentro de `home/minhaconta`) |
| Application URL | o domínio ou subdomínio do site |
| Application startup file | **`server.js`** |

Depois de **Create**, essa tela passa a oferecer os botões **Run NPM Install**,
**Run JS script**, **Stop** e **Restart**, e mostra o comando de ativação do
ambiente (`source /home/minhaconta/nodevenv/organoeste/20/bin/activate`).

### 5.2 Enviar o código

File Manager (upload de `.zip` + *Extract*), FTP/SFTP ou Git Version Control.
Envie **sem** `node_modules/`, `.git/` e `.history/` (seção 1) e garanta que o
`package.json` fique **direto na raiz** da aplicação, não numa subpasta extra.

### 5.3 Instalar dependências

Tela **Setup Node.js App → Run NPM Install**, ou no Terminal/SSH:

```bash
cd ~/organoeste
source /home/minhaconta/nodevenv/organoeste/20/bin/activate   # caminho mostrado pelo cPanel
npm install
```

### 5.4 Compilar (obrigatório)

```bash
npm run build          # gera .next/, que é o que o servidor executa
```

Se o servidor tiver pouca memória:

```bash
NODE_OPTIONS=--max-old-space-size=1024 npm run build
```

Se nem assim compilar, use o caminho da seção 5.7 (build na sua máquina).

### 5.5 `.env` e restart

1. Crie o `.env` na raiz do projeto (seção 4.1).
2. Clique em **Restart** — o processo só relê o `.env` ao reiniciar.
3. Abra `https://seudominio.com/admin`, entre com a `ADMIN_PASSWORD` e confira que
   o aviso "MySQL offline" **não** aparece.

### 5.6 Permissões

```bash
chmod 755 public/uploads     # uploads do editor precisam ser graváveis
chmod 644 .env
```

O dono de `public/uploads` deve ser o mesmo usuário que roda o processo Node. Se o
upload falhar com erro de permissão, é aqui que se resolve.

### 5.7 Se o servidor não conseguir compilar (build local)

Compile na sua máquina (Node 20+, mesmo projeto) e envie também o `.next/`:

```bash
# na sua máquina
npm install && npm run build
# envie: .next/ public/ app/ components/ lib/ data/ scripts/
#        package.json package-lock.json server.js next.config.ts tsconfig.json .env

# no servidor
npm ci --omit=dev     # runtime precisa só de next, react, react-dom e mysql2
```

Cuidados: não envie `.next/cache/`; mantenha `app/`, `public/` e `next.config.ts`
junto do `.next` (o Next 16 avalia a configuração em execução); e **Restart**
depois de subir um build novo. As dependências do projeto são JavaScript puro
(inclusive `mysql2`), então o build feito no Windows/Linux roda igual no servidor.

### 5.8 Hosts sem Passenger (VPS, Plesk, Docker)

```bash
npm ci --omit=dev
npm run build
NODE_ENV=production PORT=3000 npm start     # ou: npm run serve
```

Com PM2 (mantém vivo e reinicia no boot):

```bash
pm2 start server.js --name organoeste
pm2 save && pm2 startup
```

Publique como proxy reverso para `127.0.0.1:3000` (Apache: `ProxyPreserveHost On` +
`ProxyPass / http://127.0.0.1:3000/` com `mod_proxy`/`mod_proxy_http`; Nginx:
`location / { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; }`).

> `npm run serve` (que usa o `server.js`) existe para painéis que exigem um arquivo
> de inicialização. Quando o host permite rodar um comando, prefira `npm start`:
> o `next start` serve os arquivos estáticos de forma mais eficiente que um
> servidor customizado.

---

## 6. Checklist do primeiro acesso

Depois do restart, confira na ordem:

| Abrir | Esperado |
| --- | --- |
| `/` | home normal (não usa banco) |
| `/blog` | lista de posts **do banco** (3 após o seed) |
| `/blog/como-funciona-a-compostagem-industrial` | artigo completo, com sumário e imagens |
| `/sitemap.xml` | inclui as URLs dos posts |
| `/admin` | tela de login; entre com a `ADMIN_PASSWORD` |
| `/admin` (logado) | **nenhum** aviso "MySQL offline" e a nota *Source: MySQL · N posts* |
| `/admin` → **New Blog Post** → publicar | o post aparece em `/blog` **na hora** |
| mesmo post → `⋯` → **Delete** | sai do site e do banco na hora |
| editor → *Change Image* → enviar JPG | arquivo novo em `public/uploads/` e capa visível no artigo |

Teste do banco (opcional, prova o caminho completo): no phpMyAdmin, altere o
`title` de um post → em até **60 s** o site mostra o novo título (sem rebuild).

---

## 7. Operação no dia a dia

### 7.1 Como o conteúdo chega ao site

| Ação | Quando aparece no site |
| --- | --- |
| Publicar/editar/excluir no painel | imediatamente (`revalidatePath()` limpa o cache dos caminhos afetados) |
| Editar direto no phpMyAdmin / SQL | em até 60 s (ISR `revalidate = 60`) |
| Trocar imagens em `public/uploads` | imediatamente (arquivo estático) |
| Alterar texto de `/` ou `/solucoes` (código) | requer novo `npm run build` |

`/blog` e cada `/blog/<slug>` ficam em cache (rápido para o visitante) e são
regenerados em segundo plano — não existe "publicar e não aparecer".

### 7.2 Imagens

- Salvas em **`public/uploads/`** e referenciadas como `/uploads/arquivo.jpg`.
- Limites: **5 MB**, formatos JPG, PNG, WebP, GIF e SVG.
- O HTML do artigo passa por sanitização antes de ir para o banco (scripts e CSS
  perigosos são removidos), então colar do Word/Google Docs é seguro.
- **Faça backup dessa pasta**: ela não está no banco nem no `db_setup.sql`. Em
  deploys seguintes, não apague `public/uploads/`.

### 7.3 Backup e restauração

| O quê | Como |
| --- | --- |
| Conteúdo (posts, tags, categorias) | painel → menu do usuário → **Download backup** (JSON) |
| Banco completo | `mysqldump -u minhaconta_organoeste -p minhaconta_organoeste > backup-$(date +%F).sql` |
| Imagens | baixar `public/uploads/` |
| Recriar do zero | `scripts/db_setup.cpanel.sql` (import) ou `npm run db:push` |

Restaurar um dump:

```bash
mysql -u minhaconta_organoeste -p minhaconta_organoeste < backup-2026-09-30.sql
```

### 7.4 Trocar a senha do painel

1. Edite `ADMIN_PASSWORD` no `.env`.
2. **Restart** na aplicação.
3. Entre novamente em `/admin` (as sessões antigas deixam de valer).

### 7.5 Logs e o que cada aviso significa

- No cPanel, a saída do processo aparece no log da aplicação Node (ou
  `~/organoeste/stderr.log` / `passenger.log`, conforme o host).
- `[blog] MySQL unreadable, using bundled posts: ...` → o site caiu para o modo
  arquivo; o motivo exato vem logo depois dos dois-pontos.
- No painel, o aviso **"MySQL offline"** mostra o mesmo erro de forma amigável.

### 7.6 Atualizar o site (nova versão do código)

```bash
# no servidor, na pasta do projeto
npm install          # só é necessário se package.json mudou
npm run build        # sempre
# depois: botão Restart na aplicação
```

Se o conteúdo de `data/blog-posts.ts` também mudou e você quer refletir no banco:

```bash
npm run db:seed      # regenera os .sql
npm run db:push      # aplica no banco configurado
```

### 7.7 Rascunhos e datas futuras

- `status = 'draft'` **nunca** aparece no site (só no painel) — é o jeito seguro de
  preparar um artigo.
- A aba **Scheduled** do painel é apenas derivada de `published_at` no futuro. O
  site filtra por `status = 'published'`, então um post publicado com data futura
  **aparece** com essa data. Para agendar de verdade, deixe como *Draft* e mude
  para *Published* no dia.

---

## 8. Problemas comuns (sintoma → causa → solução)

| Sintoma | Causa provável | Solução |
| --- | --- | --- |
| Página branca ou erro 500 logo depois do deploy | `.next` não existe (build não rodou) | `npm run build` e **Restart** |
| 503 / *Application failed to start* (Passenger) | startup file errado, dependências ausentes | aponte para `server.js`, rode **Run NPM Install**, veja o log da aplicação |
| Aviso "MySQL offline" + `ECONNREFUSED` | host/porta errados, ou `.env` não lido | use `DB_HOST="localhost"`; confirme que o `.env` está na raiz e reinicie |
| `ER_ACCESS_DENIED_ERROR` | usuário/senha errados | no cPanel o usuário tem prefixo da conta (`minhaconta_organoeste`) |
| `ER_BAD_DB_ERROR` | banco inexistente | crie em MySQL Databases (o nome também ganha prefixo) |
| `ER_DBACCESS_DENIED_ERROR` | usuário fora do banco | *Add User To Database* com **ALL PRIVILEGES** |
| `ER_NO_SUCH_TABLE` / "Faltam tabelas" | SQL não importado | importe `scripts/db_setup.cpanel.sql` ou rode `npm run db:push` |
| `ETIMEDOUT` / `ENOTFOUND` | firewall, host errado, banco remoto não liberado | libere o IP em **Remote MySQL®** |
| Acentos viram `?` ou `Ã©` | banco/charset não é `utf8mb4` | recrie com o SQL do projeto; no import use `utf-8` (phpMyAdmin) ou `--default-character-set=utf8mb4` (CLI) |
| Upload de imagem falha | permissão ou limite | `chmod 755 public/uploads`; máx. 5 MB (JPG/PNG/WebP/GIF/SVG) |
| Upload "dá certo" (o arquivo aparece na pasta) mas a imagem **não aparece** no site | a URL antiga `/uploads/<arquivo>` era resolvida pelo Apache/document root e não pelo app Node; ou existem duas cópias do projeto e o arquivo foi para a pasta que não é servida | atualize o código (a capa passa a usar `/media/<arquivo>`, servido por `app/media/[name]/route.ts`), rode `npm run build` + **Restart** e confira que só existe **uma** cópia do app no Passenger |
| Site mostra conteúdo antigo | cache ISR (até 60 s) ou banco trocado sem restart | aguarde 1 min, confira o *Source:* no painel e reinicie se trocou o `.env` |
| Não consigo entrar em `/admin` | `ADMIN_PASSWORD` diferente da digitada | ajuste no `.env` + Restart (sem definir, o padrão é `admin123`) |
| Build falha com *Cannot find module 'typescript'* | instalou com `--omit=dev` | rode `npm install` completo (o build usa devDependencies) |
| Build é morto (*Killed*) no servidor | pouca memória | `NODE_OPTIONS=--max-old-space-size=1024 npm run build` ou build local (5.7) |
| Imagens do artigo quebradas após um deploy | pasta `public/uploads` não enviada | restaure o backup da pasta |
| `/admin` dá 404 | build antigo depois de atualizar o código | `npm run build` + Restart |

Todos esses erros também aparecem (em inglês ou português) na saída de
`npm run db:check`, com a dica correspondente.

---

## 9. Segurança

- Defina sempre `ADMIN_PASSWORD` forte: sem ela o painel usa `admin123`.
- O usuário do MySQL deve ter privilégios **somente** sobre o banco do site
  (é o que o cPanel faz ao adicionar o usuário ao banco) — nunca use o usuário
  `root` do servidor na aplicação.
- `.env` com permissão `600`, nunca versionado, nunca dentro de `public/`.
- Todos os acessos ao banco acontecem no servidor (Server Components e Server
  Actions): nenhuma senha de banco chega ao navegador.
- O painel usa cookie `httpOnly` + `sameSite=lax` e compara a senha como hash
  SHA-256 — sirva o site em **HTTPS** (AutoSSL do cPanel).
- Uploads aceitam apenas imagens, e o HTML do editor é sanitizado (allowlist de
  tags/estilos) antes de ser gravado.
- Mantenha as dependências atualizadas: `npm outdated` / `npm audit`.

---

## 10. Referência rápida de comandos

| Comando | O que faz |
| --- | --- |
| `npm install` | instala as dependências (inclui as de desenvolvimento, necessárias ao build) |
| `npm run dev` | servidor de desenvolvimento em `http://localhost:3000` |
| `npm run build` | gera o build de produção em `.next/` |
| `npm start` | sobe o site em produção (`next start`) |
| `npm run serve` | sobe o site usando `server.js` (para cPanel/Passenger) |
| `npm run db:seed` | regenera `scripts/db_setup.sql` e `scripts/db_setup.cpanel.sql` |
| `npm run db:push` | cria as tabelas e aplica o seed no banco do `.env` (idempotente) |
| `npm run db:check` | confere conexão, tabelas e contagens |
| `node scripts/db-apply.cjs --dry` | mostra o que o `db:push` faria, sem conectar |
| `node scripts/db-apply.cjs --check --host=... --user=... --password=... --database=...` | confere um banco sem mexer no `.env` |

### Ordem recomendada (resumo)

1. Criar banco + usuário no cPanel (`ALL PRIVILEGES`).
2. Importar `scripts/db_setup.cpanel.sql` no phpMyAdmin.
3. Criar a aplicação Node (`startup file: server.js`) e enviar o código.
4. `npm install` → `npm run build` → criar `.env` → **Restart**.
5. Abrir `/admin`, entrar e confirmar que não há aviso "MySQL offline".
6. Publicar um post de teste, ver em `/blog`, apagar.

Relacionados: `README.md` (visão geral do projeto e do blog dinâmico) e
`.env.example` (modelo comentado de todas as variáveis).





