const pt = {
  auth: {
    loginTitle: "Entrar",
    subtitle: "Entrar",
    emailLabel: "E-mail",
    passwordLabel: "Senha",
    submitButton: "Entrar",
    noAccount: "Ainda não tem uma conta? ",
    signUp: "Criar conta",
    forgotPassword: "Esqueceu sua senha?",

    // ✅ SIGNUP
    signupTitle: "Criar conta",
    passwordHint: "Mínimo de 8 caracteres",
    languageLabel: "Idioma",
    languageHelper: "Selecione o idioma em que você irá gravar",
    agreePrivacyPrefix: "Eu concordo com a ",
    privacyPolicy: "Política de Privacidade",
    agreeTermsPrefix: "Eu concordo com os ",
    termsOfUse: "Termos de Uso e BAA",
    signupButton: "Criar conta",
    haveAccount: "Já tem uma conta? ",
    signin: "Entrar",
  },

  settings: {
    title: "Ajustes",
    bannerPrefix: "Você tem ",
    bannerSuffix: "gravações grátis restantes. Assine agora o Dr. Assistente",
    subscribeTitle: "Assine agora o Dr. Assistente",
    subscribeSubtitle: "A partir de R$ 150/mês. Você pode cancelar a qualquer momento.",
    subscribeButton: "Assinar",
    completeProfileTitle: "Complete seu cadastro",
    completeProfileSubtitle: "Preencha seus dados para que o Dr. Assistente tenha mais precisão ao transcrever.",
    nameLabel: "Nome",
    licenseLabel: "Conselho",
    licensePlaceholder: "CRMV   ex: 123456/RJ – RQE 12345",
    specialtyLabel: "Especialidade",
    changePassword: "Alterar Senha",
    shareTitle: "Compartilhe o Dr. Assistente com seus amigos",
    shareSubtitle: "Ajude seus amigos a economizarem tempo e manter prontuários organizados.",
    shareButton: "Compartilhar",
    supportTitle: "Suporte",
    supportSubtitle: "Tem dúvidas ou precisa de ajuda? Nossa equipe está pronta para te atender.",
    supportButton: "Falar com o Suporte",
    logoutTitle: "Sair da sua conta",
    logoutButton: "Sair",
  },

  changePassword: {
    changePasswordTitle: "Alterar Senha",
    changePasswordInfo: "Atualize a senha de sua conta para maior segurança.",
    currentPasswordLabel: "Senha Atual",
    newPasswordLabel: "Nova Senha",
    confirmNewPasswordLabel: "Confirmar Nova Senha",
    passwordMinHint: "Pelo menos 8 caracteres",
    updatePasswordButton: "Atualizar Senha",

  },

  subscribe: {
    brand: "DrAssistente",
    backToApp: "Voltar ao App",
    title: "Escolha um Plano",
    cta: "Assinar Agora",
    mostPopular: "Mais Popular",

    planBasicTitle: "Plano Individual Básico",
    planBasicPrice: "R$ 150,00/mês",

    planAdvancedTitle: "Plano Individual Avançado",
    planAdvancedPrice: "R$ 250,00/mês",

    planProTitle: "Plano Individual Pro",
    planProPrice: "R$ 450,00/mês",

    featureAdvancedModels: "Modelos avançados para sua profissão",
    featureSupport: "Suporte",
    featurePreferences: "Ensinamos suas preferências para o Dr. Assistente",
    featureLearning: "Dr. Assistente aprende com seus feedbacks",
  },

  record: {
    title: "O que você vai gravar?",
    selectMode: "Selecionar esse modo",
    modeConsultTitle: "Consulta Veterinária",
    modeConsultLine1: "Grave a consulta completa ou apenas um breve relato do atendimento. O Dr. Assistente gera automaticamente o resumo para o prontuário e relatórios adicionais.",
    modeConsultDuration: "Duração máxima de 90 minutos.",
    modeDictTitle: "Ditado",
    modeDictLine1: "Grave um texto para ser transcrito.",
    modeDictLine2: "Dr. Assistente irá transcrever o texto, fazendo correções simples e organizando em parágrafos.",
    modeDictDuration: "Duração máxima de 15 minutos.",
  },

  newRecord: {
    title: "Nova Gravação",
    cardTitle: "Consulta Veterinária",
    patientLabel: "Nome do Paciente (opcional)",
    guardianLabel: "Nome do Responsável (opcional)",
    male: "Macho",
    female: "Fêmea",
    record: "Gravar",
    importantStrong: "Importante:",
    importantText: "Não bloqueie o celular nem saia do aplicativo enquanto estiver gravando.",
    guideTitle: "Guia para Consulta Veterinária",
    guideParagraph1: "O Dr. Assistente entende automaticamente quais relatórios podem ser úteis para você e gera todos eles de forma rápida e automática, utilizando apenas uma única gravação. Você pode optar por gravar a consulta completa com o paciente ou fazer um breve relato narrando como foi o atendimento. A seguir está apenas uma amostra dos principais relatórios disponíveis:",
    guideParagraph2: "",
    report1Title: "Resumo para o Prontuário:",
    report1Desc: "Preparado exatamente na estrutura detalhada abaixo.",
    report2Title: "Mensagem para o Tutor:",
    report2Desc: "Uma mensagem personalizada e acolhedora com informações relevantes discutidas na consulta para ser enviada ao responsável pelo animal.",

    report3Title: "Mensagem de Agradecimento por Indicação:",
    report3Desc: "Se o paciente foi indicado por outro profissional, o Dr. Assistente identificará automaticamente essa situação e gerará uma mensagem personalizada de agradecimento ao profissional que encaminhou o paciente, explicando brevemente sobre o caso.",
    report4Title: "Mensagem de Encaminhamento:",
    report4Desc: "Caso o paciente precise ser encaminhado para outro especialista, será gerada automaticamente uma mensagem com uma breve descrição do caso para facilitar a comunicação com o próximo profissional.",
    guideFooter: "Esses relatórios são padrões no sistema, mas nos planos Individual Pro e Planos para Clínicas e Hospitais é possível criar relatórios personalizados.",
  },

  historyLoading: {
    headerTitle: "Transcrição",
    metaDate: "21 de janeiro, 20:19",
    patientTitle: "Paciente não identificado",
    title: "Preparando seus Relatórios",
    step: "Transcrevendo sua gravação",
    hint:
      "Você pode sair desta página ou iniciar uma nova gravação. Seus relatórios aparecerão aqui quando estiverem prontos.",
    footer: "Feedback? Clique aqui para falar com a nossa equipe.",
    advancedActions: "Ações Avançadas",
  },

  historyTranscription: {
    summaryTitle: "Resumo para o Prontuário",
    summaryEmpty: "Não há informações clínicas relevantes para inclusão no prontuário veterinário nesta transcrição.",
    edit: "Editar",
    copy: "Copiar",
    messageTitle: "Mensagem para o Responsável",
    messageGreeting: "Olá! Tudo bem?",
    messageDefaultBody:
      "Aqui é o Dr. Théo, médico-veterinário.\n\n" +
      "Estou entrando em contato para reforçar que sigo totalmente à disposição para esclarecer qualquer dúvida, oferecer orientações adicionais ou ajudar no que for necessário em relação à saúde e ao bem-estar do seu animalzinho.\n\n" +
      "Neste momento, não há informações clínicas específicas ou orientações de tratamento a serem repassadas, pois a gravação recebida não continha dados objetivos sobre o paciente, como sinais clínicos, diagnóstico, exames ou condutas recomendadas.\n\n" +
      "Assim que houver novas informações ou, caso você deseje complementar com mais detalhes, ficarei feliz em analisar e orientar da melhor forma possível.\n\n" +
      "Sempre que precisar, conte comigo para cuidar do seu pet com atenção, responsabilidade e carinho.",
    print: "Imprimir",
    editEnd: "Editar",

  },

  advancedActionsModal: {
    title: "Ações Avançadas",
    messageResponsibleTitle: "Mensagem para o Responsável",
    messageResponsibleSubtitle: "Prepara uma mensagem para o responsável",
    referralOtherProfessionalTitle: "Encaminhamento para Outro Profissional",
    referralOtherProfessionalSubtitle: "Criar carta de encaminhamento para outro profissional",
    thankYouReferralTitle: "Mensagem de Agradecimento pelo Encaminhamento feito por Profissional",
    thankYouReferralSubtitle: "Cria uma mensagem para um profissional que indicou o paciente",
    examResultsTitle: "Resultado de Exames",
    examResultsSubtitle: "Resume e formata os exames da consulta"
  },

  history: {
    headerTitle: "Histórico",
    dateNov10_2025: "10 DE NOVEMBRO DE 2025",
    badgeExample: "Paciente Exemplo",
    time_2302: "23:02",
    time_2138: "21:38",
    unidentifiedTitle: "Paciente não identificado",
    unidentifiedSubtitle: "Transcrição confusa; usuário descreve envio gradual de áudio/file enviado em blocos de 16s, com paus...",
    biscotoTitle: "Biscoto",
    biscotoSubtitle: "Coelho de 3 anos, com dispneia, ↓ apetite e ↓ atividade. Exame físico: secreção nasal/ocular, ...",
    lunaTitle: "Luna",
    lunaSubtitle: "Gata persa, 2 anos. Sinais: lambedura excessiva, alopecia, dermatite. Exame físico: peso adequado, ...",
    maxTitle: "Max",
    maxSubtitle: "Golden, 5 anos, apatia, perda de apetite, vômito (3d). Exame: desidratação leve, mucosas...",
  },

  editPatient: {
    title: "Editar",
    patientNameLabel: "Nome do Paciente",
    patientNamePlaceholder: "",
    responsibleNameLabel: "Nome do Responsável",
    responsibleNamePlaceholder: "",
    save: "Salvar",
  },

  confirmDelete: {
    title: "Tem certeza? Essa ação não pode ser desfeita.",
    message: "",
    cancel: "Cancelar",
    confirm: "Aceitar",
  },

  transcription: {
    headerTitle: "Transcrição",

    modeLabel: "Modo da Gravação",
    modeValue: "Consulta Veterinária",

    createdByLabel: "Criado por",
    createdByValue: "Théo",

    createdAtLabel: "Criado em",
    createdAtValue: "21 de Janeiro de 2026, 20:10",

    startedAtLabel: "Iniciou Gravação Em",
    startedAtValue: "21 de Janeiro de 2026, 20:11",

    finishedAtLabel: "Finalizou Gravação Em",
    finishedAtValue: "21 de Janeiro de 2026, 20:12",

    durationLabel: "Duração Total",
    durationValue: "49 segundos",

    listenTitle: "Escutar Gravação Original",
    listenBody:
      "Durante a gravação, nosso sistema realiza cortes automáticos no áudio para otimizar o processo de upload.",

    playerTime: "21/01/2026 20:12",

  },


  common: {
    save: "Salvar",
    cancel: "Cancelar",
    loading: "Carregando...",
  },
} as const;

export default pt;
