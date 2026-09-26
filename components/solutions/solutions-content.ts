/* Shared content for the internal /solucoes page — wording matches the public
   reference page (www.organoeste.com.br/solucoes) in the original Portuguese. */

export const WA_MAIN = "https://wa.me/5567992401937";
export const WA_SUPPORT = "https://wa.me/5567999915740";

export type ServiceCard = {
  icon: string;
  title: string;
  description: string;
};

export const SERVICES: ServiceCard[] = [
  {
    icon: "clipboard",
    title: "Gestão de coleta",
    description:
      "Planejamos e executamos a coleta dos resíduos de forma organizada e eficiente, garantindo regularidade, segurança operacional e conformidade ambiental.",
  },
  {
    icon: "truck",
    title: "Transporte OLAM",
    description:
      "Nossa divisão de logística ambiental realiza o transporte licenciado dos resíduos com frota própria, rastreabilidade e total segurança durante todo o percurso.",
  },
  {
    icon: "filter",
    title: "Triagem",
    description:
      "Realizamos a separação e classificação dos resíduos recebidos, assegurando o direcionamento correto para cada etapa do processo de tratamento.",
  },
  {
    icon: "recycle",
    title: "Compostagem",
    description:
      "Transformamos resíduos orgânicos em matéria-prima sustentável por meio de um processo controlado que reduz impactos ambientais e promove a economia circular.",
  },
  {
    icon: "sprout",
    title: "Fertilizante",
    description:
      "Produzimos fertilizantes orgânicos de alta qualidade, contribuindo para a recuperação do solo, aumento da produtividade e agricultura sustentável.",
  },
];

export type Step = { icon: string; title: string; description: string };

export const PROCESS_STEPS: Step[] = [
  {
    icon: "truck-clock",
    title: "Transporte Licenciado de Resíduos",
    description:
      "Frota própria, motoristas treinados e monitoramento operacional para garantir segurança e eficiência em cada coleta.",
  },
  {
    icon: "bin-clock",
    title: "Recebimento e Triagem",
    description:
      "Cada carga recebida passa por processos rigorosos de controle e separação.",
  },
  {
    icon: "recycle",
    title: "Compostagem Industrial",
    description:
      "Transformamos resíduos orgânicos em soluções sustentáveis por meio de processos controlados e tecnologia especializada.",
  },
];

export type Benefit = { icon: string; title: string; description: string };

export const BENEFITS: Benefit[] = [
  {
    icon: "badge-check",
    title: "Conformidade ambiental",
    description:
      "Garantimos que todo o processo de coleta, transporte e destinação dos resíduos esteja de acordo com a legislação ambiental vigente, proporcionando segurança e tranquilidade para sua empresa.",
  },
  {
    icon: "chart",
    title: "Redução de Custos Operacionais",
    description:
      "Transformamos a gestão de resíduos em um processo mais eficiente, reduzindo desperdícios, riscos e custos relacionados ao descarte inadequado.",
  },
  {
    icon: "file-check",
    title: "Certificados de Destinação",
    description:
      "Fornecemos documentação e certificados que comprovam a destinação correta dos resíduos, assegurando transparência e conformidade em auditorias e fiscalizações.",
  },
  {
    icon: "target",
    title: "Apoio às Metas ESG",
    description:
      "Contribuímos para que sua empresa fortaleça seus indicadores ambientais, sociais e de governança, gerando impacto positivo e agregando valor à sua marca.",
  },
];

export type Faq = { question: string; answer: string };

export const FAQS: Faq[] = [
  {
    question: "Quais tipos de resíduos a Organoeste recebe?",
    answer:
      "Recebemos diversos tipos de resíduos orgânicos provenientes de supermercados, indústrias alimentícias, restaurantes, frigoríficos, centros de distribuição, hotéis e outros grandes geradores.",
  },
  {
    question: "A Organoeste realiza a coleta dos resíduos?",
    answer:
      "Sim. Contamos com a OLAM, nossa operação de logística ambiental, responsável pela coleta e transporte licenciado dos resíduos com segurança e rastreabilidade.",
  },
  {
    question: "Minha empresa recebe comprovante da destinação dos resíduos?",
    answer:
      "Sim. Emitimos relatórios e certificados de destinação que comprovam o tratamento adequado dos resíduos e auxiliam em auditorias e exigências ambientais.",
  },
  {
    question: "Como a destinação sustentável pode ajudar minha empresa?",
    answer:
      "Além de garantir conformidade ambiental, a destinação correta reduz riscos, fortalece as práticas ESG e demonstra compromisso com a sustentabilidade.",
  },
  {
    question: "A Organoeste atende apenas Mato Grosso do Sul?",
    answer:
      "Nossa operação está localizada em Campo Grande/MS e atende todo o estado, com capacidade de expansão para outras regiões conforme a demanda.",
  },
  {
    question: "Como solicitar uma avaliação para minha empresa?",
    answer:
      "Basta entrar em contato com nossa equipe. Analisamos sua operação, volume de resíduos e necessidades específicas para apresentar a melhor solução ambiental.",
  },
];
