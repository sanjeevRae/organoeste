-- Organoeste blog store: schema + seed (local dev / server with root access).
-- Run against MySQL 5.7+, MariaDB 10.4+ (utf8mb4, InnoDB FULLTEXT):
--   mysql -u root -p < scripts/db_setup.sql
-- Safe to re-run: tables are created IF NOT EXISTS and seed rows use
-- ON DUPLICATE KEY UPDATE, so re-running only refreshes the content.

CREATE DATABASE IF NOT EXISTS `organoeste` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `organoeste`;

CREATE TABLE IF NOT EXISTS media_files (
  name VARCHAR(128) NOT NULL PRIMARY KEY,
  mime VARCHAR(64) NOT NULL,
  bytes INT UNSIGNED NOT NULL,
  data LONGBLOB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_media_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  author VARCHAR(160) NOT NULL DEFAULT 'Equipe Organoeste',
  author_role VARCHAR(160) NOT NULL DEFAULT '',
  published_at DATE NOT NULL,
  updated_at DATE NOT NULL,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  featured TINYINT(1) NOT NULL DEFAULT 0,
  image VARCHAR(255) NOT NULL,
  image_alt VARCHAR(255) NOT NULL DEFAULT '',
  content_html MEDIUMTEXT NOT NULL,
  show_toc TINYINT(1) NOT NULL DEFAULT 1,
  seo_title VARCHAR(255) NULL,
  meta_description VARCHAR(320) NULL,
  focus_keyword VARCHAR(160) NULL,
  canonical_url VARCHAR(255) NULL,
  og_image VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status_published (status, published_at),
  INDEX idx_category (category),
  FULLTEXT INDEX ft_content (title, excerpt, content_html)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_tags (
  post_id INT NOT NULL,
  tag VARCHAR(100) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (post_id, tag),
  CONSTRAINT fk_blog_tags_post FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- categories --
INSERT INTO blog_categories (name, sort_order) VALUES ('Compostagem', 0) ON DUPLICATE KEY UPDATE sort_order = 0;
INSERT INTO blog_categories (name, sort_order) VALUES ('Coleta e Logística', 1) ON DUPLICATE KEY UPDATE sort_order = 1;
INSERT INTO blog_categories (name, sort_order) VALUES ('Fertilizantes', 2) ON DUPLICATE KEY UPDATE sort_order = 2;
INSERT INTO blog_categories (name, sort_order) VALUES ('ESG e Sustentabilidade', 3) ON DUPLICATE KEY UPDATE sort_order = 3;
INSERT INTO blog_categories (name, sort_order) VALUES ('Operação', 4) ON DUPLICATE KEY UPDATE sort_order = 4;

-- posts --
INSERT INTO blog_posts (slug, title, excerpt, category, author, author_role, published_at, updated_at, status, featured, image, image_alt, content_html, show_toc, seo_title, meta_description, focus_keyword, canonical_url, og_image) VALUES ('como-funciona-a-compostagem-industrial', 'Como funciona a compostagem industrial: do resíduo ao adubo', 'Da triagem à maturação: cada etapa que transforma resíduos orgânicos em adubo de alta qualidade.', 'Compostagem', 'Equipe Organoeste', 'Operação e sustentabilidade', '2026-09-22', '2026-09-29', 'published', 1, '/images/solucoes-compostagem.png', 'Leiras de compostagem industrial em operação', '<p>A compostagem industrial devolve à natureza o que veio dela: recebemos resíduos orgânicos, controlamos temperatura, umidade e oxigênio, e entregamos adubo estabilizado, pronto para o campo. A diferença para uma composteira doméstica está na escala e no controle, com histórico em cada leira, rastreabilidade em cada carga e análise em cada lote.</p>
<p>Neste artigo mostramos o caminho completo, do recebimento na central até o ensacamento, para quem precisa entender o que acontece com o resíduo depois que ele sai da empresa.</p>
<h2 id="recebimento">Recebimento e triagem</h2>
<p>Tudo começa na portaria. O caminhão é pesado na entrada, a carga é inspecionada e o resíduo é classificado. Essa etapa protege o processo: plástico, vidro, metal e embalagens contaminadas não entram na leira, porque atrapalham a aeração e podem deixar contaminantes no adubo final.</p>
<ul><li><strong>Pesagem e registro:</strong> o volume de cada gerador fica documentado para os relatórios de ESG.</li><li><strong>Triagem:</strong> separação de contaminantes e de materiais que não podem compostar.</li><li><strong>Homogeneização:</strong> mistura de resíduos verdes, restos de alimentos e material estruturante.</li></ul>
<blockquote><p>A relação entre carbono e nitrogênio define a velocidade do processo. Equilíbrio é mais importante do que pressa.</p></blockquote>
<h2 id="fases">Fases da compostagem</h2>
<p>O processo tem fases bem definidas e cada uma tem um objetivo. Acelerar etapas sem controle é a forma mais comum de produzir odor e material imaturo.</p>
<table><thead><tr><th>Fase</th><th>Duração típica</th><th>Temperatura</th><th>Objetivo</th></tr></thead><tbody><tr><td>Mesofílica</td><td>2 a 5 dias</td><td>25 a 45 °C</td><td>Ativação dos microrganismos</td></tr><tr><td>Termofílica</td><td>2 a 4 semanas</td><td>55 a 65 °C</td><td>Higienização e degradação rápida</td></tr><tr><td>Resfriamento</td><td>1 a 2 semanas</td><td>Abaixo de 45 °C</td><td>Retomada dos fungos</td></tr><tr><td>Maturação</td><td>4 a 8 semanas</td><td>Temperatura ambiente</td><td>Húmus estável e humificado</td></tr></tbody></table>
<h2 id="controle">Controle e monitoramento</h2>
<p>Temperatura, umidade e oxigênio são medidos com frequência. As leiras são revolvidas para renovar o ar e a água é ajustada para manter o material úmido como uma esponja espremida. Quando a temperatura passa de 65 °C, o revolvimento é antecipado para evitar perda de nitrogênio. Quando cai antes do tempo, falta ar ou nitrogênio na mistura.</p>
<h2 id="adubo">Da maturação ao adubo</h2>
<p>Depois da maturação, o material passa por peneiramento, controle de granulometria e, quando o cliente pede, por enriquecimento com nutrientes. Só então o adubo é ensacado, com laudo e registro de lote.</p>
<ol><li><strong>Peneiramento:</strong> retirada de pedaços maiores, que voltam para a leira.</li><li><strong>Análise:</strong> matéria orgânica, carbono, nitrogênio, pH e umidade.</li><li><strong>Ensacamento:</strong> adubo estabilizado, sem odor e livre de sementes viáveis.</li></ol>
<h2 id="faq">Perguntas frequentes</h2>
<p><strong>Tem cheiro?</strong> Compostagem bem conduzida não tem odor perceptível na vizinhança. Odor é sinal de excesso de umidade ou falta de ar. <strong>Quanto tempo leva?</strong> Entre 90 e 120 dias, dependendo da mistura e do clima. <strong>Serve para horta e pastagem?</strong> Sim, com dose definida pela análise de solo.</p>
<p>A Organoeste opera o ciclo completo: <a href="/solucoes">coleta licenciada</a>, compostagem própria e <a href="https://www.fertipower.com.br/">adubos Fertipower</a>.</p>', 1, 'Como funciona a compostagem industrial | Blog Organoeste', 'Recebimento, triagem, fases e maturação da compostagem industrial, do resíduo ao adubo pronto para o campo.', 'compostagem industrial', NULL, NULL) ON DUPLICATE KEY UPDATE title = 'Como funciona a compostagem industrial: do resíduo ao adubo', excerpt = 'Da triagem à maturação: cada etapa que transforma resíduos orgânicos em adubo de alta qualidade.', category = 'Compostagem', author = 'Equipe Organoeste', author_role = 'Operação e sustentabilidade', published_at = '2026-09-22', updated_at = '2026-09-29', status = 'published', featured = 1, image = '/images/solucoes-compostagem.png', image_alt = 'Leiras de compostagem industrial em operação', content_html = '<p>A compostagem industrial devolve à natureza o que veio dela: recebemos resíduos orgânicos, controlamos temperatura, umidade e oxigênio, e entregamos adubo estabilizado, pronto para o campo. A diferença para uma composteira doméstica está na escala e no controle, com histórico em cada leira, rastreabilidade em cada carga e análise em cada lote.</p>
<p>Neste artigo mostramos o caminho completo, do recebimento na central até o ensacamento, para quem precisa entender o que acontece com o resíduo depois que ele sai da empresa.</p>
<h2 id="recebimento">Recebimento e triagem</h2>
<p>Tudo começa na portaria. O caminhão é pesado na entrada, a carga é inspecionada e o resíduo é classificado. Essa etapa protege o processo: plástico, vidro, metal e embalagens contaminadas não entram na leira, porque atrapalham a aeração e podem deixar contaminantes no adubo final.</p>
<ul><li><strong>Pesagem e registro:</strong> o volume de cada gerador fica documentado para os relatórios de ESG.</li><li><strong>Triagem:</strong> separação de contaminantes e de materiais que não podem compostar.</li><li><strong>Homogeneização:</strong> mistura de resíduos verdes, restos de alimentos e material estruturante.</li></ul>
<blockquote><p>A relação entre carbono e nitrogênio define a velocidade do processo. Equilíbrio é mais importante do que pressa.</p></blockquote>
<h2 id="fases">Fases da compostagem</h2>
<p>O processo tem fases bem definidas e cada uma tem um objetivo. Acelerar etapas sem controle é a forma mais comum de produzir odor e material imaturo.</p>
<table><thead><tr><th>Fase</th><th>Duração típica</th><th>Temperatura</th><th>Objetivo</th></tr></thead><tbody><tr><td>Mesofílica</td><td>2 a 5 dias</td><td>25 a 45 °C</td><td>Ativação dos microrganismos</td></tr><tr><td>Termofílica</td><td>2 a 4 semanas</td><td>55 a 65 °C</td><td>Higienização e degradação rápida</td></tr><tr><td>Resfriamento</td><td>1 a 2 semanas</td><td>Abaixo de 45 °C</td><td>Retomada dos fungos</td></tr><tr><td>Maturação</td><td>4 a 8 semanas</td><td>Temperatura ambiente</td><td>Húmus estável e humificado</td></tr></tbody></table>
<h2 id="controle">Controle e monitoramento</h2>
<p>Temperatura, umidade e oxigênio são medidos com frequência. As leiras são revolvidas para renovar o ar e a água é ajustada para manter o material úmido como uma esponja espremida. Quando a temperatura passa de 65 °C, o revolvimento é antecipado para evitar perda de nitrogênio. Quando cai antes do tempo, falta ar ou nitrogênio na mistura.</p>
<h2 id="adubo">Da maturação ao adubo</h2>
<p>Depois da maturação, o material passa por peneiramento, controle de granulometria e, quando o cliente pede, por enriquecimento com nutrientes. Só então o adubo é ensacado, com laudo e registro de lote.</p>
<ol><li><strong>Peneiramento:</strong> retirada de pedaços maiores, que voltam para a leira.</li><li><strong>Análise:</strong> matéria orgânica, carbono, nitrogênio, pH e umidade.</li><li><strong>Ensacamento:</strong> adubo estabilizado, sem odor e livre de sementes viáveis.</li></ol>
<h2 id="faq">Perguntas frequentes</h2>
<p><strong>Tem cheiro?</strong> Compostagem bem conduzida não tem odor perceptível na vizinhança. Odor é sinal de excesso de umidade ou falta de ar. <strong>Quanto tempo leva?</strong> Entre 90 e 120 dias, dependendo da mistura e do clima. <strong>Serve para horta e pastagem?</strong> Sim, com dose definida pela análise de solo.</p>
<p>A Organoeste opera o ciclo completo: <a href="/solucoes">coleta licenciada</a>, compostagem própria e <a href="https://www.fertipower.com.br/">adubos Fertipower</a>.</p>', show_toc = 1, seo_title = 'Como funciona a compostagem industrial | Blog Organoeste', meta_description = 'Recebimento, triagem, fases e maturação da compostagem industrial, do resíduo ao adubo pronto para o campo.', focus_keyword = 'compostagem industrial', canonical_url = NULL, og_image = NULL;
INSERT INTO blog_posts (slug, title, excerpt, category, author, author_role, published_at, updated_at, status, featured, image, image_alt, content_html, show_toc, seo_title, meta_description, focus_keyword, canonical_url, og_image) VALUES ('coleta-licenciada-de-residuos-organicos', 'Coleta licenciada de resíduos orgânicos: o que sua empresa precisa saber', 'Transporte sem licenciamento expõe sua empresa a multas e à responsabilidade solidária pelo descarte.', 'Coleta e Logística', 'Equipe Organoeste', 'Operação', '2026-09-15', '2026-09-29', 'published', 0, '/images/solucoes-atendimento-coleta.png', 'Coleta de resíduos orgânicos em contentores', '<p>Quem gera resíduo orgânico responde por ele até a destinação final. Isso está na Política Nacional de Resíduos Sólidos e vale para indústria, comércio, redes de alimentação, hotéis e condomínios. Mesmo quando o material sai do pátio, a responsabilidade continua sendo do gerador.</p>
<p>A coleta licenciada transforma essa obrigação em rotina simples, com documento em cada etapa.</p>
<h2 id="riscos">Riscos da coleta irregular</h2>
<p>O transporte por um veículo sem licença parece mais barato até o primeiro problema. E o problema chega rápido:</p>
<ul><li><strong>Multas ambientais</strong> e risco de embargo da atividade.</li><li><strong>Responsabilidade solidária</strong> pelo descarte em local irregular.</li><li><strong>Passivo contábil:</strong> resíduo sem documento é resíduo que ninguém sabe onde está.</li><li><strong>Auditorias:</strong> clientes, certificações e financiamentos pedem comprovação.</li></ul>
<h2 id="como-funciona">Como funciona a coleta licenciada</h2>
<ol><li><strong>Dimensionamento:</strong> visitamos a operação e definimos volume, tipo de contentor e frequência.</li><li><strong>Programação:</strong> coletas em dias fixos, com equipe treinada e veículo adequado.</li><li><strong>Pesagem:</strong> cada coleta é registrada por gerador.</li><li><strong>Destinação:</strong> o resíduo segue para central licenciada, onde vira adubo orgânico.</li></ol>
<blockquote><p>Rastreabilidade não é burocracia: é o que permite provar, amanhã, que a sua carga chegou ao lugar certo.</p></blockquote>
<h2 id="documentacao">Documentação e rastreabilidade</h2>
<p>O MTR acompanha o material da origem ao destino e o CDF fecha o ciclo, comprovando o processamento. Esses dois documentos alimentam relatórios de ESG e indicadores de descarbonização.</p>
<ul><li><strong>MTR:</strong> manifesto emitido na origem, que rastreia transporte e destinador.</li><li><strong>CDF:</strong> certificado emitido na destinação, que comprova o processamento.</li><li><strong>Relatórios:</strong> volumes por unidade, por mês e por tipo de resíduo.</li></ul>
<h2 id="escolha">Como escolher o parceiro</h2>
<p>Antes de fechar contrato, peça três coisas: licença de operação do destinador, lista de equipamentos e histórico de documentos emitidos. Um parceiro sério entrega tudo sem hesitar e explica o destino final, com endereço.</p>
<p>Conheça a <a href="/solucoes">coleta licenciada da Organoeste</a> e veja como funciona na prática.</p>', 1, 'Coleta licenciada de resíduos orgânicos | Blog Organoeste', 'O que é coleta licenciada, quais documentos comprovam a destinação e como proteger a empresa de multas.', 'coleta licenciada', NULL, NULL) ON DUPLICATE KEY UPDATE title = 'Coleta licenciada de resíduos orgânicos: o que sua empresa precisa saber', excerpt = 'Transporte sem licenciamento expõe sua empresa a multas e à responsabilidade solidária pelo descarte.', category = 'Coleta e Logística', author = 'Equipe Organoeste', author_role = 'Operação', published_at = '2026-09-15', updated_at = '2026-09-29', status = 'published', featured = 0, image = '/images/solucoes-atendimento-coleta.png', image_alt = 'Coleta de resíduos orgânicos em contentores', content_html = '<p>Quem gera resíduo orgânico responde por ele até a destinação final. Isso está na Política Nacional de Resíduos Sólidos e vale para indústria, comércio, redes de alimentação, hotéis e condomínios. Mesmo quando o material sai do pátio, a responsabilidade continua sendo do gerador.</p>
<p>A coleta licenciada transforma essa obrigação em rotina simples, com documento em cada etapa.</p>
<h2 id="riscos">Riscos da coleta irregular</h2>
<p>O transporte por um veículo sem licença parece mais barato até o primeiro problema. E o problema chega rápido:</p>
<ul><li><strong>Multas ambientais</strong> e risco de embargo da atividade.</li><li><strong>Responsabilidade solidária</strong> pelo descarte em local irregular.</li><li><strong>Passivo contábil:</strong> resíduo sem documento é resíduo que ninguém sabe onde está.</li><li><strong>Auditorias:</strong> clientes, certificações e financiamentos pedem comprovação.</li></ul>
<h2 id="como-funciona">Como funciona a coleta licenciada</h2>
<ol><li><strong>Dimensionamento:</strong> visitamos a operação e definimos volume, tipo de contentor e frequência.</li><li><strong>Programação:</strong> coletas em dias fixos, com equipe treinada e veículo adequado.</li><li><strong>Pesagem:</strong> cada coleta é registrada por gerador.</li><li><strong>Destinação:</strong> o resíduo segue para central licenciada, onde vira adubo orgânico.</li></ol>
<blockquote><p>Rastreabilidade não é burocracia: é o que permite provar, amanhã, que a sua carga chegou ao lugar certo.</p></blockquote>
<h2 id="documentacao">Documentação e rastreabilidade</h2>
<p>O MTR acompanha o material da origem ao destino e o CDF fecha o ciclo, comprovando o processamento. Esses dois documentos alimentam relatórios de ESG e indicadores de descarbonização.</p>
<ul><li><strong>MTR:</strong> manifesto emitido na origem, que rastreia transporte e destinador.</li><li><strong>CDF:</strong> certificado emitido na destinação, que comprova o processamento.</li><li><strong>Relatórios:</strong> volumes por unidade, por mês e por tipo de resíduo.</li></ul>
<h2 id="escolha">Como escolher o parceiro</h2>
<p>Antes de fechar contrato, peça três coisas: licença de operação do destinador, lista de equipamentos e histórico de documentos emitidos. Um parceiro sério entrega tudo sem hesitar e explica o destino final, com endereço.</p>
<p>Conheça a <a href="/solucoes">coleta licenciada da Organoeste</a> e veja como funciona na prática.</p>', show_toc = 1, seo_title = 'Coleta licenciada de resíduos orgânicos | Blog Organoeste', meta_description = 'O que é coleta licenciada, quais documentos comprovam a destinação e como proteger a empresa de multas.', focus_keyword = 'coleta licenciada', canonical_url = NULL, og_image = NULL;
INSERT INTO blog_posts (slug, title, excerpt, category, author, author_role, published_at, updated_at, status, featured, image, image_alt, content_html, show_toc, seo_title, meta_description, focus_keyword, canonical_url, og_image) VALUES ('adubo-organico-solo-produtivo', 'Adubo orgânico: solo vivo e lavoura produtiva', 'Matéria orgânica, nutrientes e biologia: como o adubo orgânico devolve produtividade ao solo.', 'Fertilizantes', 'Equipe Organoeste', 'Operação', '2026-09-08', '2026-09-29', 'published', 0, '/images/leaf.png', 'Folha verde sobre solo fértil', '<p>Adubo orgânico não é apenas resto de material decomposto. É insumo agrícola, com composição conhecida, granulometria controlada e efeito direto na física, na química e na biologia do solo. Aplicado de forma correta, reduz a dependência de insumos minerais e devolve vida ao solo.</p>
<h2 id="beneficios">Benefícios no solo</h2>
<ul><li><strong>Estrutura:</strong> aumenta a agregação, reduz a compactação e melhora a infiltração de água.</li><li><strong>Água:</strong> solos com mais matéria orgânica armazenam mais água e sofrem menos em veranicos.</li><li><strong>Nutrientes:</strong> liberação gradual de nitrogênio, fósforo e potássio, menos sujeita a perdas.</li><li><strong>Biologia:</strong> alimenta bactérias, fungos e micorrizas que transformam o solo em sistema vivo.</li><li><strong>Carbono:</strong> cada tonelada aplicada é carbono retirado da atmosfera e guardado no solo.</li></ul>
<h2 id="composicao">Composição e análise</h2>
<p>Cada lote tem laudo. Olhe além do rótulo: matéria orgânica total, relação carbono/nitrogênio, pH, umidade e ausência de contaminantes importam mais do que um número isolado de NPK.</p>
<table><thead><tr><th>Parâmetro</th><th>O que indica</th></tr></thead><tbody><tr><td>Matéria orgânica</td><td>Reserva de carbono e de nutrientes</td></tr><tr><td>Relação C/N</td><td>Estabilidade e velocidade de liberação</td></tr><tr><td>pH</td><td>Efeito corretivo e disponibilidade de nutrientes</td></tr><tr><td>Umidade</td><td>Facilidade de aplicação e armazenamento</td></tr></tbody></table>
<h2 id="aplicar">Aplicação no campo</h2>
<ol><li><strong>Analise o solo</strong> antes de definir a dose: sem análise, a aplicação vira chute.</li><li><strong>Distribua uniformemente</strong> em área total, faixa ou cova, conforme a cultura.</li><li><strong>Incorpore</strong> quando possível, para acelerar o contato com a biologia do solo.</li><li><strong>Evite dias de chuva forte</strong> logo após a aplicação, para não perder material por escoamento.</li></ol>
<blockquote><p>Adubo orgânico trabalha no tempo do solo. O resultado aparece na segunda e na terceira safra e fica.</p></blockquote>
<h2 id="erros">Erros comuns</h2>
<p>Aplicar sobre solo muito seco, usar material imaturo, estocar em local úmido e comparar preço por tonelada sem olhar a análise. Adubo imaturo compete por oxigênio e pode prejudicar a raiz em vez de ajudar.</p>
<p>Fale com a <a href="/solucoes">Organoeste</a> e conheça os <a href="https://www.fertipower.com.br/">adubos Fertipower</a>.</p>', 1, 'Adubo orgânico: solo vivo e lavoura produtiva | Blog Organoeste', 'Benefícios do adubo orgânico na estrutura, na água, nos nutrientes e na biologia do solo, com cuidados de aplicação.', 'adubo orgânico', NULL, NULL) ON DUPLICATE KEY UPDATE title = 'Adubo orgânico: solo vivo e lavoura produtiva', excerpt = 'Matéria orgânica, nutrientes e biologia: como o adubo orgânico devolve produtividade ao solo.', category = 'Fertilizantes', author = 'Equipe Organoeste', author_role = 'Operação', published_at = '2026-09-08', updated_at = '2026-09-29', status = 'published', featured = 0, image = '/images/leaf.png', image_alt = 'Folha verde sobre solo fértil', content_html = '<p>Adubo orgânico não é apenas resto de material decomposto. É insumo agrícola, com composição conhecida, granulometria controlada e efeito direto na física, na química e na biologia do solo. Aplicado de forma correta, reduz a dependência de insumos minerais e devolve vida ao solo.</p>
<h2 id="beneficios">Benefícios no solo</h2>
<ul><li><strong>Estrutura:</strong> aumenta a agregação, reduz a compactação e melhora a infiltração de água.</li><li><strong>Água:</strong> solos com mais matéria orgânica armazenam mais água e sofrem menos em veranicos.</li><li><strong>Nutrientes:</strong> liberação gradual de nitrogênio, fósforo e potássio, menos sujeita a perdas.</li><li><strong>Biologia:</strong> alimenta bactérias, fungos e micorrizas que transformam o solo em sistema vivo.</li><li><strong>Carbono:</strong> cada tonelada aplicada é carbono retirado da atmosfera e guardado no solo.</li></ul>
<h2 id="composicao">Composição e análise</h2>
<p>Cada lote tem laudo. Olhe além do rótulo: matéria orgânica total, relação carbono/nitrogênio, pH, umidade e ausência de contaminantes importam mais do que um número isolado de NPK.</p>
<table><thead><tr><th>Parâmetro</th><th>O que indica</th></tr></thead><tbody><tr><td>Matéria orgânica</td><td>Reserva de carbono e de nutrientes</td></tr><tr><td>Relação C/N</td><td>Estabilidade e velocidade de liberação</td></tr><tr><td>pH</td><td>Efeito corretivo e disponibilidade de nutrientes</td></tr><tr><td>Umidade</td><td>Facilidade de aplicação e armazenamento</td></tr></tbody></table>
<h2 id="aplicar">Aplicação no campo</h2>
<ol><li><strong>Analise o solo</strong> antes de definir a dose: sem análise, a aplicação vira chute.</li><li><strong>Distribua uniformemente</strong> em área total, faixa ou cova, conforme a cultura.</li><li><strong>Incorpore</strong> quando possível, para acelerar o contato com a biologia do solo.</li><li><strong>Evite dias de chuva forte</strong> logo após a aplicação, para não perder material por escoamento.</li></ol>
<blockquote><p>Adubo orgânico trabalha no tempo do solo. O resultado aparece na segunda e na terceira safra e fica.</p></blockquote>
<h2 id="erros">Erros comuns</h2>
<p>Aplicar sobre solo muito seco, usar material imaturo, estocar em local úmido e comparar preço por tonelada sem olhar a análise. Adubo imaturo compete por oxigênio e pode prejudicar a raiz em vez de ajudar.</p>
<p>Fale com a <a href="/solucoes">Organoeste</a> e conheça os <a href="https://www.fertipower.com.br/">adubos Fertipower</a>.</p>', show_toc = 1, seo_title = 'Adubo orgânico: solo vivo e lavoura produtiva | Blog Organoeste', meta_description = 'Benefícios do adubo orgânico na estrutura, na água, nos nutrientes e na biologia do solo, com cuidados de aplicação.', focus_keyword = 'adubo orgânico', canonical_url = NULL, og_image = NULL;

-- tags (rebuilt per post) --
DELETE FROM blog_tags WHERE post_id = (SELECT id FROM blog_posts WHERE slug = 'como-funciona-a-compostagem-industrial');
INSERT INTO blog_tags (post_id, tag, sort_order) VALUES ((SELECT id FROM blog_posts WHERE slug = 'como-funciona-a-compostagem-industrial'), 'compostagem', 0);
INSERT INTO blog_tags (post_id, tag, sort_order) VALUES ((SELECT id FROM blog_posts WHERE slug = 'como-funciona-a-compostagem-industrial'), 'adubo orgânico', 1);
INSERT INTO blog_tags (post_id, tag, sort_order) VALUES ((SELECT id FROM blog_posts WHERE slug = 'como-funciona-a-compostagem-industrial'), 'resíduos orgânicos', 2);
DELETE FROM blog_tags WHERE post_id = (SELECT id FROM blog_posts WHERE slug = 'coleta-licenciada-de-residuos-organicos');
INSERT INTO blog_tags (post_id, tag, sort_order) VALUES ((SELECT id FROM blog_posts WHERE slug = 'coleta-licenciada-de-residuos-organicos'), 'coleta', 0);
INSERT INTO blog_tags (post_id, tag, sort_order) VALUES ((SELECT id FROM blog_posts WHERE slug = 'coleta-licenciada-de-residuos-organicos'), 'licenciamento', 1);
INSERT INTO blog_tags (post_id, tag, sort_order) VALUES ((SELECT id FROM blog_posts WHERE slug = 'coleta-licenciada-de-residuos-organicos'), 'MTR', 2);
DELETE FROM blog_tags WHERE post_id = (SELECT id FROM blog_posts WHERE slug = 'adubo-organico-solo-produtivo');
INSERT INTO blog_tags (post_id, tag, sort_order) VALUES ((SELECT id FROM blog_posts WHERE slug = 'adubo-organico-solo-produtivo'), 'adubo orgânico', 0);
INSERT INTO blog_tags (post_id, tag, sort_order) VALUES ((SELECT id FROM blog_posts WHERE slug = 'adubo-organico-solo-produtivo'), 'solo', 1);
INSERT INTO blog_tags (post_id, tag, sort_order) VALUES ((SELECT id FROM blog_posts WHERE slug = 'adubo-organico-solo-produtivo'), 'matéria orgânica', 2);

