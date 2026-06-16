(function () {
  "use strict";

  var totalScreens = 16;
  var app = document.getElementById("app");

  var defaultState = {
    screen: 0,
    score: 0,
    answers: {
      case: null,
      mini: {},
      detector: [],
      matches: {},
      priority: {},
      quiz: {}
    },
    completed: {},
    finalStatus: "incomplete",
    finished: false
  };
  var state = cloneDefault();

  var miniQuestions = {
    4: {
      id: "conceptos",
      q: "¿Cual opcion describe mejor una vulnerabilidad?",
      options: ["Una accion que reduce el riesgo.", "Una debilidad que puede ser aprovechada.", "Un activo protegido.", "Una copia de seguridad."],
      correct: 1,
      good: "Correcto. La vulnerabilidad es la debilidad; el control es la accion que ayuda a reducirla.",
      bad: "Revisa la formula: la vulnerabilidad no es el control ni el activo, es la debilidad que puede ser explotada."
    },
    5: {
      id: "cuentas",
      q: "¿Cual control reduce el riesgo cuando una contraseña fue robada?",
      options: ["Activar MFA.", "Usar la misma clave en varias cuentas.", "Compartir la clave con alguien de confianza.", "Guardar la clave en una nota visible."],
      correct: 0,
      good: "Correcto. MFA agrega una barrera adicional si la contraseña se filtra o se entrega por engaño.",
      bad: "La mejor respuesta es activar MFA. Repetir o compartir contraseñas aumenta el riesgo."
    },
    6: {
      id: "dispositivos",
      q: "¿Que configuracion reduce el riesgo si pierdes el celular?",
      options: ["Tenerlo sin bloqueo para entrar rapido.", "Activar bloqueo automatico con PIN o biometria.", "Desactivar actualizaciones.", "Guardar todas las claves en una foto."],
      correct: 1,
      good: "Correcto. El bloqueo automatico limita el acceso si el equipo se pierde o es robado.",
      bad: "La proteccion inicial del dispositivo es el bloqueo automatico con PIN, huella, rostro o patron seguro."
    },
    7: {
      id: "wifi",
      q: "¿Cual es la mejor opcion para entrar a banca digital fuera de casa?",
      options: ["WiFi publica abierta.", "Datos moviles propios.", "Red desconocida sin contraseña.", "Cualquier red con nombre de banco."],
      correct: 1,
      good: "Correcto. Los datos moviles propios reducen la exposicion frente a redes abiertas o falsas.",
      bad: "Para banca fuera de casa es preferible usar datos moviles propios o una VPN confiable, no una red abierta."
    },
    8: {
      id: "apps",
      q: "Una app sencilla pide acceso a contactos, microfono, ubicacion y SMS. ¿Que indica esto?",
      options: ["Puede tener permisos excesivos.", "Siempre es obligatorio aceptar.", "No tiene relacion con seguridad.", "Es señal de que la app es mas rapida."],
      correct: 0,
      good: "Correcto. Los permisos deben corresponder a la funcion real de la aplicacion.",
      bad: "Una app que pide permisos que no necesita puede aumentar la exposicion de datos personales."
    }
  };

  var detectorGroups = [
    {
      title: "Cuentas",
      items: [
        "Uso la misma contraseña en mas de una cuenta.",
        "No tengo MFA en mi correo principal.",
        "No reviso sesiones abiertas.",
        "No reviso apps conectadas a mis cuentas.",
        "Mis datos de recuperacion no estan actualizados."
      ]
    },
    {
      title: "Dispositivos",
      items: [
        "Mi celular no se bloquea en maximo 1 minuto.",
        "Mi computador no se bloquea automaticamente.",
        "Aplazo actualizaciones por semanas o meses.",
        "No reviso permisos de aplicaciones.",
        "Instalo apps sin verificar permisos o reputacion."
      ]
    },
    {
      title: "Redes y navegacion",
      items: [
        "Uso WiFi publica para entrar a cuentas importantes.",
        "Mi router conserva la clave predeterminada.",
        "No se si mi WiFi usa WPA2 o WPA3.",
        "Hago clic en enlaces sin revisar el dominio.",
        "Descargo adjuntos inesperados sin verificar."
      ]
    },
    {
      title: "Respaldos y privacidad",
      items: [
        "No tengo copia automatica de fotos.",
        "No tengo respaldo de documentos importantes.",
        "Publico ubicacion o rutinas en redes sociales.",
        "Tengo cuentas antiguas que ya no uso.",
        "No se que informacion publica aparece sobre mi."
      ]
    }
  ];

  var matchCases = [
    {
      text: "Contraseña repetida.",
      answer: "Usar contraseña unica por servicio y gestor de contraseñas.",
      feedback: "Una clave unica evita que una filtracion abra varias cuentas al mismo tiempo."
    },
    {
      text: "Cuenta sin MFA.",
      answer: "Activar doble factor de autenticacion.",
      feedback: "MFA reduce el impacto de una contraseña robada o entregada por phishing."
    },
    {
      text: "Celular sin bloqueo.",
      answer: "Activar PIN, patron, huella o rostro y bloqueo automatico.",
      feedback: "El bloqueo protege sesiones, mensajes, fotos y apps si el equipo se pierde."
    },
    {
      text: "Router con clave predeterminada.",
      answer: "Cambiar clave del WiFi y contraseña de administracion.",
      feedback: "Las claves predeterminadas facilitan accesos no autorizados."
    },
    {
      text: "WiFi publica para banca.",
      answer: "Usar datos moviles o VPN confiable.",
      feedback: "Evita ingresar credenciales sensibles en redes abiertas o desconocidas."
    },
    {
      text: "App con permisos excesivos.",
      answer: "Revocar permisos innecesarios o desinstalar la app.",
      feedback: "Una app no deberia acceder a datos que no necesita para funcionar."
    },
    {
      text: "Sin copia de seguridad.",
      answer: "Activar respaldo automatico y verificar recuperacion.",
      feedback: "La copia reduce el impacto de perdida, robo, daño o ransomware."
    },
    {
      text: "Sesiones abiertas en dispositivos antiguos.",
      answer: "Cerrar sesiones desconocidas y cambiar contraseña si aplica.",
      feedback: "Cerrar sesiones corta accesos que ya no controlas."
    }
  ];

  var controls = [
    "Usar contraseña unica por servicio y gestor de contraseñas.",
    "Activar doble factor de autenticacion.",
    "Activar PIN, patron, huella o rostro y bloqueo automatico.",
    "Cambiar clave del WiFi y contraseña de administracion.",
    "Usar datos moviles o VPN confiable.",
    "Revocar permisos innecesarios o desinstalar la app.",
    "Activar respaldo automatico y verificar recuperacion.",
    "Cerrar sesiones desconocidas y cambiar contraseña si aplica."
  ];

  var priorityActions = [
    "Activar MFA en correo principal.",
    "Cambiar contraseña repetida en correo y banco.",
    "Activar bloqueo del celular.",
    "Activar copia de seguridad.",
    "Revisar privacidad de red social.",
    "Cambiar clave de cuenta de entretenimiento."
  ];

  var correctPriority = priorityActions.slice();

  var quiz = [
    {
      q: "¿Que es una vulnerabilidad?",
      options: ["Una debilidad que puede ser aprovechada por una amenaza.", "Una accion que reduce el riesgo.", "Un activo sin valor.", "Una copia de seguridad."],
      correct: 0
    },
    {
      q: "¿Cual es un ejemplo de configuracion insegura?",
      options: ["Tener MFA activo.", "Usar WPA2 o WPA3.", "Usar la misma contraseña en varias cuentas.", "Tener copia de seguridad verificada."],
      correct: 2
    },
    {
      q: "¿Cual control ayuda a reducir el impacto de la perdida de un celular?",
      options: ["No usar bloqueo.", "Activar bloqueo automatico y copia de seguridad.", "Compartir el PIN.", "Desactivar actualizaciones."],
      correct: 1
    },
    {
      q: "¿Que debe hacerse con una app que pide permisos excesivos?",
      options: ["Aceptar todo sin revisar.", "Revisar, limitar permisos o desinstalar si no es confiable.", "Compartir los permisos con contactos.", "Guardar la contraseña en la app."],
      correct: 1
    },
    {
      q: "¿Cual accion debe priorizarse si el correo principal no tiene MFA?",
      options: ["Cambiar el fondo de pantalla.", "Activar MFA lo antes posible.", "Crear otra red social.", "Desactivar alertas de seguridad."],
      correct: 1
    }
  ];

  var resources = [
    ["https://grow.google/certificates/cybersecurity/", "Google Cybersecurity Certificate", "Ruta para profundizar en fundamentos, riesgos, amenazas, vulnerabilidades y controles."],
    ["https://www.coursera.org/learn/manage-security-risks", "Play It Safe: Manage Security Risks", "Curso de Google para ampliar amenazas, riesgos, marcos y controles."],
    ["https://www.coursera.org/learn/assets-threats-and-vulnerabilities", "Assets, Threats, and Vulnerabilities", "Curso para profundizar en activos, amenazas, superficie de ataque y vulnerabilidades."],
    ["https://www.nist.gov/cyberframework", "NIST Cybersecurity Framework 2.0", "Marco de referencia para gobernar, identificar, proteger, detectar, responder y recuperar."],
    ["https://www.cisa.gov/resources-tools/resources/cyber-essentials", "CISA Cyber Essentials", "Guia practica de controles y habitos basicos para personas y organizaciones."],
    ["https://myaccount.google.com/security-checkup", "Google Security Checkup", "Herramienta para revisar cuenta, dispositivos conectados y actividad sospechosa."],
    ["https://passwords.google.com/", "Google Password Manager", "Herramienta para revisar contraseñas guardadas, debiles o expuestas."],
    ["https://haveibeenpwned.com/", "Have I Been Pwned", "Recurso para verificar si un correo aparecio en filtraciones conocidas."]
  ];

  function cloneDefault() { return JSON.parse(JSON.stringify(defaultState)); }

  function initialize() {
    Scorm.initialize();
    var saved = Scorm.loadSuspendData();
    state = saved && typeof saved === "object" ? mergeState(saved) : cloneDefault();
    normalizeState();
    var location = parseInt(Scorm.getLocation(), 10);
    if (!Number.isNaN(location) && location >= 0 && location < totalScreens) state.screen = location;
    if (!state.finished) Scorm.setStatus("incomplete");
    Scorm.setValue("cmi.core.score.min", "0");
    Scorm.setValue("cmi.core.score.max", "100");
    bindGlobalEvents();
    render();
  }

  function mergeState(saved) {
    var base = cloneDefault();
    base.screen = typeof saved.screen === "number" ? saved.screen : base.screen;
    base.score = typeof saved.score === "number" ? saved.score : base.score;
    base.answers = Object.assign(base.answers, saved.answers || {});
    base.answers.mini = Object.assign({}, defaultState.answers.mini, base.answers.mini || {});
    base.answers.matches = Object.assign({}, defaultState.answers.matches, base.answers.matches || {});
    base.answers.priority = Object.assign({}, defaultState.answers.priority, base.answers.priority || {});
    base.answers.quiz = Object.assign({}, defaultState.answers.quiz, base.answers.quiz || {});
    base.answers.detector = Array.isArray(base.answers.detector) ? base.answers.detector : [];
    base.completed = Object.assign({}, saved.completed || {});
    base.finalStatus = saved.finalStatus || "incomplete";
    base.finished = Boolean(saved.finished);
    return base;
  }

  function normalizeState() {
    state.answers = state.answers || {};
    state.answers.mini = state.answers.mini || {};
    state.answers.detector = Array.isArray(state.answers.detector) ? state.answers.detector : [];
    state.answers.matches = state.answers.matches || {};
    state.answers.priority = state.answers.priority || {};
    state.answers.quiz = state.answers.quiz || {};
    state.completed = state.completed || {};
    state.finalStatus = state.finalStatus || "incomplete";
  }

  function bindGlobalEvents() {
    document.getElementById("reset-button").addEventListener("click", function () {
      document.getElementById("confirm-dialog").classList.remove("hidden");
      document.getElementById("cancel-reset").focus();
    });
    document.getElementById("cancel-reset").addEventListener("click", closeResetDialog);
    document.getElementById("confirm-reset").addEventListener("click", resetOva);
    document.getElementById("help-button").addEventListener("click", openHelpPanel);
    document.getElementById("close-help").addEventListener("click", closeHelpPanel);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeHelpPanel(false);
        closeResetDialog(false);
      }
    });
    window.addEventListener("beforeunload", function () { if (!state.finished) saveProgress(); });
  }

  function openHelpPanel() {
    document.getElementById("help-panel").classList.remove("hidden");
    document.getElementById("close-help").focus();
  }

  function closeHelpPanel(restoreFocus) {
    var panel = document.getElementById("help-panel");
    if (panel.classList.contains("hidden")) return;
    panel.classList.add("hidden");
    if (restoreFocus !== false) document.getElementById("help-button").focus();
  }

  function closeResetDialog(restoreFocus) {
    var dialog = document.getElementById("confirm-dialog");
    if (dialog.classList.contains("hidden")) return;
    dialog.classList.add("hidden");
    if (restoreFocus !== false) document.getElementById("reset-button").focus();
  }

  function resetOva() {
    Scorm.resetLocal();
    state = cloneDefault();
    Scorm.setStatus("incomplete");
    Scorm.setScore(0);
    closeResetDialog(false);
    saveProgress();
    render();
  }

  function calculateScore() {
    state.score = getCaseScore() + getMiniScore() + getDetectorScore() + getMatchScore() + getPriorityScore() + getQuizScore();
    state.score = Math.max(0, Math.min(100, Math.round(state.score)));
    return state.score;
  }

  function saveProgress() {
    calculateScore();
    Scorm.setScore(state.score);
    Scorm.setLocation(String(state.screen));
    Scorm.saveSuspendData({
      screen: state.screen,
      score: state.score,
      answers: {
        case: state.answers.case,
        mini: state.answers.mini,
        detector: state.answers.detector,
        matches: state.answers.matches,
        priority: state.answers.priority,
        quiz: state.answers.quiz
      },
      vulnerabilidadesIdentificadas: state.answers.detector,
      controlesSeleccionados: state.answers.matches,
      completed: state.completed,
      finalStatus: state.finalStatus,
      finished: state.finished
    });
    Scorm.commit();
  }

  function allMiniComplete() {
    return Object.keys(miniQuestions).every(function (screenIndex) {
      return typeof state.answers.mini[miniQuestions[screenIndex].id] === "number";
    });
  }

  function allRequiredComplete() {
    return Boolean(state.completed.case && allMiniComplete() && state.completed.detector && state.completed.matching && state.completed.priority && state.completed.quiz);
  }

  function statusLabel() {
    if (!allRequiredComplete()) return "En proceso";
    return state.score >= 70 ? "Aprobado" : "Completado con recomendaciones";
  }

  function nav(back, next, nextLabel) {
    return '<div class="button-row">' +
      (back ? '<button class="button button-secondary" data-nav="-1" type="button">Anterior</button>' : '<span></span>') +
      (next ? '<button class="button button-primary" data-nav="1" type="button">' + (nextLabel || "Continuar") + '</button>' : "") +
      "</div>";
  }

  function render() {
    calculateScore();
    var screens = [
      welcome,
      objective,
      initialCase,
      vulnerabilityConcept,
      riskTerms,
      accountVulnerabilities,
      deviceVulnerabilities,
      wifiVulnerabilities,
      appPrivacy,
      detectorActivity,
      matchingActivity,
      priorityActivity,
      helpMaterial,
      finalQuiz,
      results,
      finalization
    ];
    app.innerHTML = screens[state.screen]();
    updateHeader();
    bindScreenEvents();
    app.focus();
    window.scrollTo(0, 0);
  }

  function updateHeader() {
    var percent = Math.round(((state.screen + 1) / totalScreens) * 100);
    document.getElementById("score").textContent = state.score;
    document.getElementById("step-label").textContent = "Pantalla " + (state.screen + 1) + " de " + totalScreens;
    document.getElementById("progress-label").textContent = percent + " %";
    document.getElementById("progress-bar").style.width = percent + "%";
  }

  function bindScreenEvents() {
    app.querySelectorAll("[data-nav]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.screen = Math.max(0, Math.min(totalScreens - 1, state.screen + Number(button.dataset.nav)));
        saveProgress();
        render();
      });
    });
    var caseButton = document.getElementById("submit-case");
    if (caseButton) caseButton.addEventListener("click", submitCase);
    var miniButton = document.getElementById("submit-mini");
    if (miniButton) miniButton.addEventListener("click", submitMini);
    var detectorButton = document.getElementById("submit-detector");
    if (detectorButton) detectorButton.addEventListener("click", submitDetector);
    var matchButton = document.getElementById("submit-match");
    if (matchButton) matchButton.addEventListener("click", submitMatching);
    var priorityButton = document.getElementById("submit-priority");
    if (priorityButton) priorityButton.addEventListener("click", submitPriority);
    var quizButton = document.getElementById("submit-quiz");
    if (quizButton) quizButton.addEventListener("click", submitQuiz);
    var finishButton = document.getElementById("finish-ova");
    if (finishButton) finishButton.addEventListener("click", finishOva);
  }

  function welcome() {
    return '<section class="screen hero">' +
      '<span class="tag">Unidad 2 · OVA 2 · 100 puntos</span>' +
      '<h2>Bienvenido a la OVA 2 de la Unidad 2</h2>' +
      '<p class="subtitle">Vulnerabilidades y configuraciones inseguras: ¿donde esta la debilidad?</p>' +
      '<p class="lead">En la OVA anterior identificaste tus activos digitales: cuentas, dispositivos, informacion, servicios y archivos importantes. Ahora revisaras que debilidades pueden exponer esos activos.</p>' +
      '<p>Una vulnerabilidad puede estar en una mala configuracion, una contraseña debil, una cuenta sin doble factor, un equipo desactualizado, una red WiFi mal configurada o una aplicacion con permisos excesivos.</p>' +
      '<div class="notice asset"><strong>Mensaje central:</strong> una vulnerabilidad no siempre es un fallo tecnico complejo. Muchas veces es una contraseña repetida, una cuenta sin doble factor, un celular sin bloqueo o una copia de seguridad inexistente.</div>' +
      '<div class="brand-strip"><img src="assets/logo-unicartagena-ctev.png" alt="Logo Universidad de Cartagena y CTEV"><span>Curso interactivo de formacion en ciberseguridad</span></div>' +
      nav(false, true, "Iniciar OVA") + '</section>';
  }

  function objective() {
    return '<section class="screen"><span class="tag">Objetivo de aprendizaje</span><h2>Identificar debilidades y proponer controles</h2>' +
      '<p class="lead">Identificar vulnerabilidades y configuraciones inseguras en cuentas, dispositivos, redes, aplicaciones y servicios digitales, proponiendo controles basicos para reducir el riesgo.</p>' +
      '<div class="card-grid">' +
      infoCard("1", "Conceptos clave", "Diferenciar vulnerabilidad, amenaza, riesgo, impacto y control.") +
      infoCard("2", "Cuentas digitales", "Reconocer contraseñas debiles, contraseñas repetidas, ausencia de MFA y sesiones abiertas.") +
      infoCard("3", "Dispositivos", "Identificar celulares sin bloqueo, equipos sin contraseña, sistemas desactualizados y descargas inseguras.") +
      infoCard("4", "Redes y navegacion", "Revisar WiFi, router, cifrado, dominios, adjuntos y redes publicas.") +
      infoCard("5", "Apps y privacidad", "Detectar permisos excesivos, cuentas abandonadas e informacion sensible publicada.") +
      infoCard("6", "Controles", "Relacionar cada debilidad con una accion preventiva y priorizar lo urgente.") +
      '</div>' +
      '<div class="notice alert"><strong>Importante:</strong> no escribiras contraseñas, correos reales, telefonos, documentos ni codigos. Las actividades trabajan con categorias y situaciones generales.</div>' +
      nav(true, true, "Ver caso inicial") + '</section>';
  }

  function initialCase() {
    var feedback = "";
    if (state.completed.case) {
      if (state.answers.case === "B") feedback = '<p class="feedback correct">Correcto. La contraseña repetida y la ausencia de doble factor facilitaron que el atacante tomara control de la cuenta. Puntaje: 10/10.</p>';
      else feedback = '<p class="feedback incorrect">Vender por internet o publicar productos no es el problema principal. El riesgo aumento por malas configuraciones de seguridad y falta de controles basicos. Puntaje: 0/10.</p>';
    }
    return '<section class="screen"><span class="tag">Caso inicial · 10 puntos</span><h2>Caso: El emprendimiento expuesto por una mala configuracion</h2>' +
      '<div class="simulation-grid">' + phoneSimulation() +
      '<div><p>Diana tiene un pequeño emprendimiento y vende por redes sociales. Usa el mismo correo para clientes, pagos, redes sociales y recuperacion de contraseñas.</p><p>Su contraseña es facil de recordar y la usa en varias plataformas. Ademas, no tiene doble factor activado. Su cuenta de Instagram esta publica, acepta mensajes de cualquier persona y administra ventas desde el mismo celular que usa para todo.</p><p>Un dia recibe un mensaje falso de soporte. Ingresa sus datos en una pagina falsa. En pocas horas pierde acceso a la cuenta, los atacantes publican promociones falsas y varios clientes son engañados.</p><div class="notice risk"><strong>Lo importante:</strong> el ataque tuvo exito porque encontro varias debilidades acumuladas.</div></div></div>' +
      '<fieldset class="question"><legend>¿Cual fue la vulnerabilidad principal?</legend>' +
      caseOption("A", "Tener un emprendimiento en redes sociales.") +
      caseOption("B", "Usar contraseña repetida y no tener doble factor.") +
      caseOption("C", "Tener clientes por internet.") +
      caseOption("D", "Publicar fotos de productos.") +
      '</fieldset><button id="submit-case" class="button button-primary" type="button">Confirmar respuesta</button>' + feedback +
      nav(true, state.completed.case, "Concepto de vulnerabilidad") + '</section>';
  }

  function vulnerabilityConcept() {
    return '<section class="screen"><span class="tag">Concepto clave</span><h2>¿Que es una vulnerabilidad?</h2>' +
      '<div class="visual-lesson"><div><p class="lead">Una vulnerabilidad es una debilidad que puede ser aprovechada por una amenaza para causar daño.</p><p>No siempre es una falla tecnica compleja. En la vida cotidiana puede ser una contraseña repetida, una cuenta sin doble factor, un celular sin bloqueo, un sistema desactualizado, una red WiFi publica usada para banca o una app con permisos excesivos.</p><div class="notice asset"><strong>Regla practica:</strong> una vulnerabilidad es una puerta abierta. Un control es la accion que ayuda a cerrarla.</div></div><img class="lesson-image" src="assets/candado-digital.png" alt="Ilustracion de candado digital y proteccion"></div>' +
      '<div class="status-grid">' +
      statusCard("Contraseña repetida", "Si una plataforma se filtra, varias cuentas quedan expuestas.", "level-high") +
      statusCard("Sin copia de seguridad", "Un daño fisico o ransomware puede convertirse en perdida total.", "level-medium") +
      statusCard("App con permisos limitados", "La aplicacion solo accede a lo necesario para funcionar.", "level-safe") +
      '</div>' +
      nav(true, true, "Cinco conceptos") + '</section>';
  }

  function riskTerms() {
    return '<section class="screen"><span class="tag">Conceptos para entender riesgo</span><h2>Amenaza, vulnerabilidad, riesgo, impacto y control</h2>' +
      '<p class="lead">Para tomar mejores decisiones no basta con sentir que algo es peligroso. Conviene separar las piezas: que proteges, que podria afectarlo, que debilidad existe, cual seria la consecuencia y que puedes hacer.</p>' +
      '<div class="risk-chain">' +
      riskPiece("Activo", "Lo que tiene valor. Ejemplo: correo principal.") +
      riskPiece("Amenaza", "Lo que puede causar daño. Ejemplo: phishing.") +
      riskPiece("Vulnerabilidad", "La debilidad. Ejemplo: contraseña repetida y sin MFA.") +
      riskPiece("Impacto", "La consecuencia. Ejemplo: suplantacion, perdida de acceso o dinero.") +
      riskPiece("Control", "La accion que reduce el riesgo. Ejemplo: contraseña unica y MFA.") +
      '</div><div class="formula-card"><span>Formula pedagogica</span><strong>Activo + Amenaza + Vulnerabilidad = Riesgo</strong><strong>Control = accion que reduce el riesgo</strong></div>' +
      miniQuestionBlock(4) + nav(true, isMiniAnswered("conceptos"), "Vulnerabilidades en cuentas") + '</section>';
  }

  function accountVulnerabilities() {
    var items = [
      ["Contraseña debil", "Ejemplos: maria2020, 123456, password, nombre + fecha.", "Usar frase de contraseña larga y unica."],
      ["Contraseña repetida", "La misma clave para correo, banco y red social.", "Usar una clave diferente por servicio y gestor de contraseñas."],
      ["Sin MFA/2FA", "La cuenta solo pide usuario y contraseña.", "Activar doble factor en correo, banco, redes y nube."],
      ["Recuperacion insegura", "Correo o telefono de recuperacion desactualizado.", "Actualizar opciones de recuperacion."],
      ["Sesiones abiertas", "Cuenta abierta en computadores compartidos o dispositivos antiguos.", "Revisar y cerrar sesiones desconocidas."],
      ["Apps conectadas innecesarias", "Aplicaciones antiguas con acceso a la cuenta.", "Revocar accesos que no se usan."]
    ];
    return '<section class="screen"><span class="tag">Cuentas digitales</span><h2>Vulnerabilidades comunes en cuentas</h2>' +
      '<div class="simulation-grid"><div>' + dashboardSimulation() + '</div><div><p class="lead">El correo principal, la cuenta de nube, redes sociales, banca y plataformas de estudio o trabajo suelen concentrar recuperacion, identidad, dinero, reputacion y archivos.</p><p>Por eso las cuentas deben tener controles basicos: contraseña unica, MFA, recuperacion actualizada, revision de sesiones y alertas de seguridad activas.</p></div></div>' +
      '<div class="accordion">' + items.map(function (item) {
        return detailsBlock(item[0], ["Ejemplo: " + item[1], "Control recomendado: " + item[2]]);
      }).join("") + '</div>' +
      miniQuestionBlock(5) + nav(true, isMiniAnswered("cuentas"), "Configuraciones en dispositivos") + '</section>';
  }

  function deviceVulnerabilities() {
    var items = [
      ["Celular sin bloqueo", "Cualquiera podria acceder si se pierde o es robado.", "PIN, patron, huella o rostro y bloqueo automatico."],
      ["Computador sin contraseña", "Acceso no autorizado a archivos y sesiones.", "Contraseña de inicio y bloqueo automatico."],
      ["Sistema desactualizado", "Fallas conocidas siguen abiertas.", "Actualizaciones automaticas."],
      ["Antivirus desactivado", "Mayor exposicion a malware.", "Mantener proteccion activa."],
      ["USB desconocidas", "Malware o robo de informacion.", "No conectar dispositivos desconocidos."],
      ["Descargas no confiables", "Instalacion de software malicioso.", "Descargar solo de fuentes oficiales."]
    ];
    return '<section class="screen"><span class="tag">Dispositivos</span><h2>Configuraciones inseguras en celular y computador</h2>' +
      '<div class="visual-lesson"><div><p class="lead">Tus dispositivos no son solo objetos: guardan sesiones abiertas, mensajes, fotos, archivos, apps bancarias, codigos de verificacion y accesos a la nube.</p><p>Una configuracion insegura puede convertir una perdida fisica en un incidente digital completo. Por eso el bloqueo automatico, las actualizaciones y los respaldos son controles prioritarios.</p></div><img class="lesson-image" src="assets/celular-alerta-real.png" alt="Celular con alerta de seguridad"></div>' +
      '<table class="security-table"><thead><tr><th>Debilidad</th><th>Riesgo</th><th>Control recomendado</th></tr></thead><tbody>' +
      items.map(function (item) { return '<tr><td>' + item[0] + '</td><td>' + item[1] + '</td><td>' + item[2] + '</td></tr>'; }).join("") +
      '</tbody></table>' + miniQuestionBlock(6) + nav(true, isMiniAnswered("dispositivos"), "Redes y navegacion") + '</section>';
  }

  function wifiVulnerabilities() {
    var items = [
      ["Router con clave predeterminada", "La red puede ser mas facil de comprometer.", "Cambiar clave del WiFi y clave de administracion del router."],
      ["Cifrado debil", "La comunicacion puede ser insegura.", "Usar WPA2 o WPA3."],
      ["WiFi publica para banca", "Exposicion de credenciales o trafico.", "Usar datos moviles o VPN confiable."],
      ["Conexion automatica a redes abiertas", "El dispositivo puede conectarse a redes trampa.", "Desactivar conexion automatica."],
      ["No revisar dominios", "Ingresar datos en sitios falsos.", "Revisar dominio y entrar manualmente al sitio oficial."],
      ["Adjuntos inesperados", "Malware o robo de datos.", "Verificar remitente y origen antes de abrir."]
    ];
    return '<section class="screen"><span class="tag">Redes y navegacion</span><h2>Debilidades frecuentes en WiFi y navegacion</h2>' +
      '<div class="simulation-grid">' + routerSimulation() +
      '<div><p class="lead">La red de casa y la forma de navegar tambien hacen parte de la superficie de ataque. Un router con clave predeterminada, una WiFi abierta o un enlace falso pueden exponer cuentas importantes.</p><p>No se trata de vivir con miedo, sino de aplicar pequeñas decisiones: cambiar claves por defecto, usar cifrado seguro, evitar redes abiertas para operaciones sensibles y mirar el dominio antes de ingresar datos.</p></div></div>' +
      '<div class="accordion">' + items.map(function (item) { return detailsBlock(item[0], ["Riesgo: " + item[1], "Control: " + item[2]]); }).join("") + '</div>' +
      miniQuestionBlock(7) + nav(true, isMiniAnswered("wifi"), "Apps y privacidad") + '</section>';
  }

  function appPrivacy() {
    var items = [
      ["Permisos excesivos", "Una app de linterna pide contactos, camara, microfono y ubicacion.", "Revisar y limitar permisos."],
      ["Apps no confiables", "Aplicaciones descargadas fuera de tiendas oficiales.", "Instalar desde fuentes confiables."],
      ["Perfil publico con informacion sensible", "Publicar ubicacion, rutina diaria, familiares, colegio o viajes.", "Configurar privacidad y limitar visibilidad."],
      ["Ubicacion en tiempo real", "Compartir ubicacion sin necesidad o por tiempo indefinido.", "Compartir solo cuando sea necesario y por tiempo limitado."],
      ["Cuentas abandonadas", "Cuentas antiguas sin uso, sin MFA y con datos personales.", "Eliminar o asegurar cuentas que ya no se usan."]
    ];
    return '<section class="screen"><span class="tag">Apps y privacidad</span><h2>Permisos y privacidad: pequeñas decisiones, grandes riesgos</h2>' +
      '<div class="simulation-grid">' + permissionSimulation() +
      '<div><p class="lead">Muchas vulnerabilidades aparecen cuando una aplicacion recibe mas permisos de los que necesita o cuando una persona publica informacion que facilita el engaño.</p><p>La privacidad no es esconderse. Es decidir quien puede ver tus datos, que apps pueden acceder a ellos y por cuanto tiempo.</p></div></div>' +
      '<div class="status-grid">' + items.map(function (item, index) {
        return statusCard(item[0], "Ejemplo: " + item[1] + " Control: " + item[2], index === 0 ? "level-high" : "level-medium");
      }).join("") + '</div>' +
      miniQuestionBlock(8) + nav(true, isMiniAnswered("apps"), "Actividad 1") + '</section>';
  }

  function detectorActivity() {
    var count = state.answers.detector.length;
    var feedback = state.completed.detector ? detectorFeedback() : '<p class="muted">Marca las situaciones que aplican actualmente a tu vida digital. No escribas datos privados.</p>';
    return '<section class="screen"><span class="tag">Actividad 1 · Detector · 25 puntos</span><h2>Detector de vulnerabilidades personales</h2>' +
      '<p class="lead">Se honesto contigo mismo: el objetivo no es juzgarte, sino encontrar oportunidades de mejora. Cada situacion marcada representa una vulnerabilidad detectada.</p><p><span class="asset-count">Vulnerabilidades marcadas: ' + count + '</span></p>' +
      '<div class="inventory-grid">' + detectorGroups.map(function (group) {
        return '<fieldset class="check-group"><legend>' + group.title + '</legend>' + group.items.map(function (item) {
          var id = group.title + "::" + item;
          return '<label class="option"><input type="checkbox" name="detector" value="' + escapeHtml(id) + '"' + (state.answers.detector.indexOf(id) >= 0 ? " checked" : "") + '><span>' + item + '</span></label>';
        }).join("") + '</fieldset>';
      }).join("") + '</div><button id="submit-detector" class="button button-primary" type="button">Calcular exposicion</button>' + feedback +
      nav(true, state.completed.detector, "Actividad 2") + '</section>';
  }

  function matchingActivity() {
    var feedback = state.completed.matching
      ? '<p class="feedback ' + feedbackClass(getMatchScore(), 20) + '">Relaciones revisadas. Puntaje: ' + getMatchScore() + '/20.</p>' + matchingFeedbackList()
      : '<p class="muted">Para cada vulnerabilidad, selecciona el control mas adecuado.</p>';
    return '<section class="screen"><span class="tag">Actividad 2 · Relaciona · 20 puntos</span><h2>Relaciona la debilidad con el control</h2>' +
      '<div class="select-list">' + matchCases.map(function (item, index) {
        var selected = state.answers.matches[index] || "";
        return '<div class="select-row"><label for="match-' + index + '"><strong>Caso ' + (index + 1) + ':</strong> ' + item.text + '</label><select id="match-' + index + '" name="match"><option value="">Selecciona un control...</option>' + controls.map(function (control) { return selectOption(control, control, selected); }).join("") + '</select></div>';
      }).join("") + '</div><button id="submit-match" class="button button-primary" type="button">Calificar relaciones</button>' + feedback +
      nav(true, state.completed.matching, "Actividad 3") + '</section>';
  }

  function priorityActivity() {
    var feedback = state.completed.priority
      ? '<p class="feedback ' + feedbackClass(getPriorityScore(), 10) + '">Priorizacion revisada. Puntaje: ' + getPriorityScore() + '/10. Primero se corrigen debilidades que afectan acceso a muchas cuentas, dinero, dispositivos criticos y recuperacion.</p>'
      : '<p class="muted">Ordena las acciones de mayor prioridad a menor prioridad. No repitas acciones.</p>';
    return '<section class="screen"><span class="tag">Actividad 3 · Priorizar · 10 puntos</span><h2>¿Que corrijo primero?</h2>' +
      '<p class="lead">Situacion: una persona tiene correo principal sin MFA, contraseña repetida en correo y banco, celular sin bloqueo, sin copia de seguridad, perfil publico y una cuenta de entretenimiento con clave debil.</p>' +
      '<div class="select-list">' + correctPriority.map(function (_expected, index) {
        var selected = state.answers.priority[index] || "";
        return '<div class="select-row"><label for="priority-' + index + '"><strong>Prioridad ' + (index + 1) + '</strong></label><select id="priority-' + index + '" name="priority"><option value="">Selecciona accion...</option>' + priorityActions.map(function (action) { return selectOption(action, action, selected); }).join("") + '</select></div>';
      }).join("") + '</div><button id="submit-priority" class="button button-primary" type="button">Calificar priorizacion</button>' + feedback +
      '<div class="notice asset"><strong>Pista:</strong> inicia por lo que protege el correo principal, el dinero, el dispositivo que concentra sesiones y la recuperacion de archivos.</div>' +
      nav(true, state.completed.priority, "Material de ayuda") + '</section>';
  }

  function helpMaterial() {
    return '<section class="screen"><span class="tag">Aprende mas · opcional</span><h2>Detectar debilidades antes de que sean incidentes</h2>' +
      '<p class="subtitle">No toda vulnerabilidad requiere una herramienta avanzada para corregirse. Muchas se reducen con buenas decisiones, configuracion segura y habitos constantes.</p>' +
      '<p class="lead">Esta seccion no es obligatoria para finalizar la OVA, pero te ayuda a ampliar conceptos y prepararte para construir una matriz basica de riesgos.</p>' +
      '<div class="accordion">' +
      detailsBlock("Vulnerabilidad no significa culpa", ["Tener una vulnerabilidad no significa que una persona sea descuidada o incapaz.", "Muchas aparecen porque las plataformas cambian, los dispositivos se actualizan y los usuarios no siempre reciben orientacion clara.", "La accion correcta es identificar la debilidad, entender el riesgo y aplicar un control."]) +
      detailsBlock("Configuracion insegura vs ataque", ["Configuracion insegura: condicion que deja expuesto un activo, por ejemplo una cuenta sin MFA o un router con clave predeterminada.", "Ataque: accion realizada por un atacante o estafador, por ejemplo phishing, malware, suplantacion o robo de sesion.", "Una configuracion insegura no siempre produce un incidente inmediato, pero aumenta la posibilidad de que un ataque tenga exito."]) +
      detailsBlock("Superficie de ataque en lenguaje ciudadano", ["Es el conjunto de lugares por donde un atacante podria intentar entrar o engañar.", "Puede incluir correo, redes sociales, celular, router, WhatsApp, banca, nube, apps instaladas y formularios en linea.", "Reducir superficie de ataque significa cerrar puertas innecesarias."]) +
      detailsBlock("Vulnerabilidades comunes por categoria", ["Cuentas: contraseñas debiles, sin MFA, recuperacion desactualizada y sesiones abiertas.", "Dispositivos: celular sin bloqueo, sistema desactualizado, antivirus desactivado y descargas no confiables.", "Redes: router con clave predeterminada, WiFi abierta, cifrado debil y conexion automatica.", "Privacidad: apps con permisos excesivos, perfil publico, ubicacion compartida y cuentas abandonadas.", "Respaldos: sin copia de seguridad, copia no verificada o nube sin MFA."]) +
      detailsBlock("Control = accion que reduce el riesgo", ["Contraseña repetida: usar contraseña unica y gestor.", "Cuenta sin MFA: activar doble factor.", "Celular sin bloqueo: activar PIN, huella o rostro.", "Router con clave predeterminada: cambiar clave de WiFi y administracion.", "Sin copia de seguridad: activar respaldo automatico y verificar recuperacion."]) +
      detailsBlock("Preguntas para revisar mis configuraciones", ["¿Mi correo principal tiene MFA?", "¿Uso la misma contraseña en mas de una cuenta?", "¿Reviso sesiones abiertas?", "¿Mi celular se bloquea automaticamente?", "¿Mi router conserva la clave predeterminada?", "¿Reviso permisos de aplicaciones?", "¿Tengo copia de seguridad de documentos importantes?", "¿Se recuperar mi correo principal?"]) +
      detailsBlock("Errores frecuentes", ["Creer que eso nunca me pasara.", "Pensar que solo las empresas tienen riesgos.", "Confiar solo en el antivirus.", "Ignorar actualizaciones.", "No activar MFA.", "Guardar todo en un solo dispositivo.", "Dejar cuentas antiguas abiertas.", "Aceptar todos los permisos."]) +
      detailsBlock("Glosario de vulnerabilidades y controles", ["Vulnerabilidad: debilidad que puede ser aprovechada por una amenaza.", "Configuracion insegura: ajuste que deja expuesto un activo.", "Riesgo: posibilidad de que una amenaza aproveche una vulnerabilidad y cause impacto.", "Control: medida que reduce el riesgo.", "Superficie de ataque: puntos por donde alguien puede intentar entrar o engañar.", "MFA/2FA: doble factor de autenticacion.", "WPA2/WPA3: metodos de cifrado para redes WiFi.", "Copia de seguridad: respaldo de informacion importante."]) +
      '</div><div class="reading-block"><h3>Ejemplo guiado: correo principal</h3><p><strong>Activo:</strong> correo principal. <strong>Vulnerabilidades:</strong> contraseña repetida, sin MFA, telefono de recuperacion desactualizado y sesiones abiertas en dispositivos antiguos.</p><p><strong>Amenazas:</strong> phishing, robo de credenciales, acceso no autorizado y suplantacion. <strong>Impacto:</strong> perdida de acceso, restablecimiento de otras cuentas, envio de mensajes falsos y exposicion de documentos.</p><p><strong>Controles:</strong> contraseña unica, MFA, recuperacion actualizada, cierre de sesiones desconocidas y revision de actividad reciente. <strong>Prioridad:</strong> alta.</p></div>' +
      '<div class="reading-block"><h3>Mini actividad de ampliacion: ¿vulnerabilidad o control?</h3><p>Clasifica mentalmente: cuenta sin doble factor, activar MFA, contraseña repetida, gestor de contraseñas, router con clave predeterminada, cambiar clave del router, celular sin bloqueo, bloqueo automatico, sin copia de seguridad, respaldo verificado.</p><p><strong>Respuesta:</strong> las condiciones inseguras son vulnerabilidades; las acciones de proteccion son controles.</p></div>' +
      resourcesBlock() + nav(true, true, "Evaluacion final") + '</section>';
  }

  function finalQuiz() {
    var feedback = state.completed.quiz
      ? '<p class="feedback ' + feedbackClass(getQuizScore(), 20) + '">Evaluacion calificada. Puntaje: ' + getQuizScore() + '/20.</p>'
      : "";
    return '<section class="screen"><span class="tag">Evaluacion final · 20 puntos</span><h2>Comprueba lo aprendido</h2><p>Cada respuesta correcta vale 4 puntos.</p>' +
      quiz.map(function (item, qIndex) {
        return '<fieldset class="question"><legend>' + (qIndex + 1) + '. ' + item.q + '</legend>' + item.options.map(function (option, oIndex) {
          return '<label class="option"><input type="radio" name="q' + qIndex + '" value="' + oIndex + '"' + (String(state.answers.quiz[qIndex]) === String(oIndex) ? " checked" : "") + '><span>' + option + '</span></label>';
        }).join("") + '</fieldset>';
      }).join("") + '<button id="submit-quiz" class="button button-primary" type="button">Calificar evaluacion</button>' + feedback +
      nav(true, state.completed.quiz, "Ver resultados") + '</section>';
  }

  function results() {
    var level = exposureCategory(state.answers.detector.length);
    var complete = allRequiredComplete();
    var recommendation = !complete
      ? "Completa el caso, las mini preguntas, el detector, la relacion de controles, la priorizacion y la evaluacion final."
      : state.score >= 85
        ? "Excelente. Reconoces debilidades, eliges controles y priorizas lo critico con buen criterio."
        : state.score >= 70
          ? "Buen avance. Refuerza la relacion entre vulnerabilidad, control y prioridad de correccion."
          : "Completado con recomendaciones: vuelve a revisar cuentas criticas, MFA, contraseñas, bloqueo, respaldos y permisos.";
    return '<section class="screen center"><span class="tag">Resultados</span><h2>Tu resultado en OVA U2-02</h2>' +
      '<div class="result-score" style="--score:' + state.score + '%">' + state.score + '<small>/100</small></div><h3>Estado: ' + statusLabel() + '</h3><p class="lead">' + recommendation + '</p>' +
      '<div class="metric-grid">' +
      metric("Caso inicial", state.completed.case ? getCaseScore() + "/10" : "Pendiente") +
      metric("Mini preguntas", getMiniScore() + "/15") +
      metric("Vulnerabilidades", state.completed.detector ? state.answers.detector.length + " detectadas" : "Pendiente") +
      metric("Nivel de exposicion", state.completed.detector ? level.label : "Pendiente") +
      metric("Controles", state.completed.matching ? getMatchScore() + "/20" : "Pendiente") +
      metric("Priorizacion", state.completed.priority ? getPriorityScore() + "/10" : "Pendiente") +
      metric("Evaluacion", state.completed.quiz ? getQuizScore() + "/20" : "Pendiente") +
      '</div><div class="reading-block"><h3>Recomendaciones personalizadas</h3>' + listItems(resultRecommendations()) + '</div>' +
      '<div class="notice asset"><strong>Proxima meta:</strong> convertir estas debilidades y controles en una matriz basica de riesgos.</div>' +
      nav(true, complete, "Finalizacion SCORM") + '</section>';
  }

  function finalization() {
    return '<section class="screen"><span class="tag">Finalizacion SCORM</span><h2>Registrar avance en Moodle</h2>' +
      '<p class="lead">Cuando presiones "Finalizar OVA", se enviara el puntaje final, la ubicacion, el estado de finalizacion y el progreso guardado al LMS.</p>' +
      '<div class="notice ' + (allRequiredComplete() ? "success" : "alert") + '"><strong>Estado actual:</strong> ' + statusLabel() + '. Puntaje: ' + state.score + '/100.</div>' +
      (allRequiredComplete() ? '<button id="finish-ova" class="button button-primary" type="button">' + (state.finished ? "OVA finalizada" : "Finalizar OVA") + '</button>' : '<p class="feedback incorrect">Aun hay actividades obligatorias pendientes. Regresa y completalas para registrar el intento completo.</p>') +
      (state.finished ? '<p class="feedback correct">Tu avance fue registrado. Puedes cerrar esta ventana.</p>' : "") +
      '<div class="brand-strip"><img src="assets/logo-unicartagena-ctev.png" alt="Logo Universidad de Cartagena y CTEV"><span>Unidad 2 · Gestion de riesgos y respuesta inicial</span></div>' +
      nav(true, false) + '</section>';
  }

  function submitCase() {
    var checked = app.querySelector('input[name="case"]:checked');
    if (!checked) return showInlineError("Selecciona una respuesta antes de continuar.");
    state.answers.case = checked.value;
    state.completed.case = true;
    saveProgress();
    render();
  }

  function submitMini() {
    var question = miniQuestions[state.screen];
    var checked = app.querySelector('input[name="mini"]:checked');
    if (!question || !checked) return showInlineError("Selecciona una respuesta antes de continuar.");
    state.answers.mini[question.id] = Number(checked.value);
    saveProgress();
    render();
  }

  function submitDetector() {
    state.answers.detector = Array.from(app.querySelectorAll('input[name="detector"]:checked')).map(function (input) { return input.value; });
    state.completed.detector = true;
    saveProgress();
    render();
  }

  function submitMatching() {
    var answers = {};
    for (var i = 0; i < matchCases.length; i += 1) {
      var select = document.getElementById("match-" + i);
      if (!select.value) return showInlineError("Relaciona los ocho casos antes de calificar.");
      answers[i] = select.value;
    }
    state.answers.matches = answers;
    state.completed.matching = true;
    saveProgress();
    render();
  }

  function submitPriority() {
    var answers = {};
    var values = [];
    for (var i = 0; i < correctPriority.length; i += 1) {
      var select = document.getElementById("priority-" + i);
      if (!select.value) return showInlineError("Completa las seis posiciones de prioridad.");
      answers[i] = select.value;
      values.push(select.value);
    }
    if (new Set(values).size !== values.length) return showInlineError("No repitas acciones en la priorizacion.");
    state.answers.priority = answers;
    state.completed.priority = true;
    saveProgress();
    render();
  }

  function submitQuiz() {
    var answers = {};
    for (var i = 0; i < quiz.length; i += 1) {
      var checked = app.querySelector('input[name="q' + i + '"]:checked');
      if (!checked) return showInlineError("Responde las cinco preguntas antes de calificar.");
      answers[i] = Number(checked.value);
    }
    state.answers.quiz = answers;
    state.completed.quiz = true;
    saveProgress();
    render();
  }

  function finishOva() {
    if (!allRequiredComplete()) return showInlineError("Completa todas las actividades obligatorias antes de finalizar.");
    calculateScore();
    state.finalStatus = state.score >= 70 ? "passed" : "completed";
    state.finished = true;
    Scorm.setScore(state.score);
    Scorm.setStatus(state.finalStatus);
    Scorm.setLocation(String(state.screen));
    Scorm.saveSuspendData({
      screen: state.screen,
      score: state.score,
      answers: state.answers,
      vulnerabilidadesIdentificadas: state.answers.detector,
      controlesSeleccionados: state.answers.matches,
      completed: state.completed,
      finalStatus: state.finalStatus,
      finished: true
    });
    Scorm.commit();
    Scorm.finish();
    render();
  }

  function getCaseScore() {
    if (!state.completed.case) return 0;
    return state.answers.case === "B" ? 10 : 0;
  }

  function getMiniScore() {
    var correct = Object.keys(miniQuestions).reduce(function (sum, screenIndex) {
      var item = miniQuestions[screenIndex];
      return sum + (state.answers.mini[item.id] === item.correct ? 1 : 0);
    }, 0);
    return correct * 3;
  }

  function getDetectorScore() {
    if (!state.completed.detector) return 0;
    var count = state.answers.detector.length;
    if (count <= 3) return 25;
    if (count <= 8) return 18;
    if (count <= 14) return 10;
    return 5;
  }

  function getMatchScore() {
    if (!state.completed.matching) return 0;
    var correct = matchCases.reduce(function (sum, item, index) {
      return sum + (state.answers.matches[index] === item.answer ? 1 : 0);
    }, 0);
    return Math.round(correct * 2.5);
  }

  function getPriorityScore() {
    if (!state.completed.priority) return 0;
    var selected = correctPriority.map(function (_item, index) { return state.answers.priority[index]; });
    var exact = selected.every(function (item, index) { return item === correctPriority[index]; });
    if (exact) return 10;
    var firstThreeExact = selected.slice(0, 3).every(function (item, index) { return item === correctPriority[index]; });
    if (firstThreeExact) return 8;
    var critical = correctPriority.slice(0, 3);
    var criticalInTopThree = critical.filter(function (item) { return selected.slice(0, 3).indexOf(item) >= 0; }).length;
    if (criticalInTopThree === 3) return 7;
    if (criticalInTopThree === 2) return 5;
    return 0;
  }

  function getQuizScore() {
    if (!state.completed.quiz) return 0;
    return quiz.reduce(function (sum, item, index) {
      return sum + (state.answers.quiz[index] === item.correct ? 4 : 0);
    }, 0);
  }

  function isMiniAnswered(id) {
    return typeof state.answers.mini[id] === "number";
  }

  function miniQuestionBlock(screenIndex) {
    var item = miniQuestions[screenIndex];
    var selected = state.answers.mini[item.id];
    var answered = typeof selected === "number";
    var feedback = "";
    if (answered) feedback = selected === item.correct
      ? '<p class="feedback correct">' + item.good + ' Puntaje acumulado de mini preguntas: ' + getMiniScore() + '/15.</p>'
      : '<p class="feedback incorrect">' + item.bad + ' Puntaje acumulado de mini preguntas: ' + getMiniScore() + '/15.</p>';
    return '<fieldset class="question"><legend>' + item.q + '</legend>' + item.options.map(function (option, index) {
      return '<label class="option"><input type="radio" name="mini" value="' + index + '"' + (selected === index ? " checked" : "") + '><span><strong>' + String.fromCharCode(65 + index) + '.</strong> ' + option + '</span></label>';
    }).join("") + '</fieldset><button id="submit-mini" class="button button-primary" type="button">Confirmar mini pregunta</button>' + feedback;
  }

  function detectorFeedback() {
    var level = exposureCategory(state.answers.detector.length);
    return '<p class="feedback ' + level.feedback + '">Detectaste ' + state.answers.detector.length + ' vulnerabilidades. Nivel: ' + level.label + '. Puntaje: ' + getDetectorScore() + '/25.</p>' +
      '<div class="reading-block"><h3>Recomendaciones segun resultado</h3>' + listItems(level.recommendations) + '</div>';
  }

  function exposureCategory(count) {
    if (count <= 3) return {
      label: "Bajo nivel de exposicion",
      feedback: "correct",
      recommendations: ["Mantener MFA y contraseñas unicas.", "Revisar sesiones abiertas una vez al mes.", "Verificar copias de seguridad periodicamente."]
    };
    if (count <= 8) return {
      label: "Exposicion media",
      feedback: "partial",
      recommendations: ["Priorizar correo principal, banco y celular.", "Activar MFA donde falte.", "Cerrar sesiones desconocidas y revisar permisos."]
    };
    if (count <= 14) return {
      label: "Exposicion alta",
      feedback: "incorrect",
      recommendations: ["Cambiar contraseñas repetidas.", "Activar MFA en cuentas criticas.", "Bloquear dispositivos y activar copias de seguridad.", "Revisar router, apps y privacidad."]
    };
    return {
      label: "Accion urgente",
      feedback: "incorrect",
      recommendations: ["Empezar por correo principal, banco y nube.", "Cambiar contraseñas repetidas hoy.", "Activar MFA y cerrar sesiones desconocidas.", "Configurar bloqueo, respaldo y permisos antes de instalar nuevas apps."]
    };
  }

  function matchingFeedbackList() {
    return '<div class="reading-block"><h3>Retroalimentacion por relacion</h3><ul>' + matchCases.map(function (item, index) {
      var answer = state.answers.matches[index];
      var ok = answer === item.answer;
      return '<li><strong>' + item.text + '</strong> ' + (ok ? "Correcto. " : "Revisa. ") + item.feedback + '</li>';
    }).join("") + '</ul></div>';
  }

  function resultRecommendations() {
    var items = [
      "Activa MFA en cuentas criticas.",
      "Cambia contraseñas repetidas.",
      "Revisa sesiones abiertas.",
      "Actualiza opciones de recuperacion.",
      "Bloquea celular y computador.",
      "Manten sistemas actualizados.",
      "No uses WiFi publica para banca.",
      "Cambia claves predeterminadas del router.",
      "Revisa permisos de aplicaciones.",
      "Activa copias de seguridad.",
      "Revisa privacidad en redes.",
      "Elimina o asegura cuentas antiguas."
    ];
    if (state.completed.detector && state.answers.detector.length > 8) items.unshift("Trabaja por prioridad: correo principal, banco, celular, respaldo y privacidad.");
    if (getMatchScore() < 15) items.unshift("Refuerza la relacion entre cada debilidad y su control preventivo.");
    if (getPriorityScore() < 7) items.unshift("Revisa la priorizacion: primero accesos criticos, dinero, dispositivos y recuperacion.");
    return items;
  }

  function phoneSimulation() {
    return '<div class="phone-shell" aria-label="Simulacion de mensaje sospechoso en celular">' +
      '<div class="phone-top"><span>11:28</span><span class="phone-contact"><span class="avatar">S</span>Soporte Red Social</span><span>75%</span></div>' +
      '<div class="phone-chat">' +
      '<div class="bubble in">Hola Diana. Detectamos actividad irregular en tu cuenta de ventas. Para evitar suspension verifica tus datos hoy.<small>10:00</small></div>' +
      '<div class="bubble out">¿Que debo hacer?<small>10:01</small></div>' +
      '<div class="bubble in">Ingresa al enlace de validacion y confirma usuario y contraseña. Si no lo haces, perderas acceso.<small>10:02</small></div>' +
      '<div class="bubble in"><strong>Alerta:</strong> enlace con dominio parecido, urgencia y solicitud de contraseña.<small>10:02</small></div>' +
      '</div><div class="phone-input"><span>Mensaje</span><strong>Enviar</strong></div></div>';
  }

  function dashboardSimulation() {
    return '<div class="dashboard" aria-label="Simulacion de panel de seguridad de cuenta">' +
      '<div class="dashboard-header"><strong>Revision de seguridad</strong><span class="pill red">3 acciones</span></div>' +
      '<div class="check-row"><span>Contraseña unica</span><span class="pill red">No</span></div>' +
      '<div class="check-row"><span>Doble factor</span><span class="pill red">Inactivo</span></div>' +
      '<div class="check-row"><span>Recuperacion</span><span class="pill orange">Desactualizada</span></div>' +
      '<div class="check-row"><span>Sesiones recientes</span><span class="pill orange">Revisar</span></div>' +
      '<div class="check-row"><span>Alertas de seguridad</span><span class="pill green">Activas</span></div>' +
      '</div>';
  }

  function routerSimulation() {
    return '<div class="router-panel" aria-label="Simulacion de panel de router domestico">' +
      '<div class="router-header"><strong>Router de casa</strong><span class="pill orange">Requiere revision</span></div>' +
      '<div class="check-row"><span>Nombre de red</span><strong>Casa_2.4G</strong></div>' +
      '<div class="check-row"><span>Cifrado</span><span class="pill green">WPA2</span></div>' +
      '<div class="check-row"><span>Clave WiFi</span><span class="pill orange">Debil</span></div>' +
      '<div class="check-row"><span>Clave administracion</span><span class="pill red">Predeterminada</span></div>' +
      '<div class="check-row"><span>Red de invitados</span><span class="pill indigo">Recomendada</span></div>' +
      '</div>';
  }

  function permissionSimulation() {
    return '<div class="permission-panel" aria-label="Simulacion de permisos de aplicacion">' +
      '<h3>Permisos solicitados por App Linterna Plus</h3>' +
      '<div class="permission-row"><span>Camara</span><span class="pill orange">No necesario</span></div>' +
      '<div class="permission-row"><span>Microfono</span><span class="pill red">Excesivo</span></div>' +
      '<div class="permission-row"><span>Contactos</span><span class="pill red">Excesivo</span></div>' +
      '<div class="permission-row"><span>Ubicacion</span><span class="pill orange">Revisar</span></div>' +
      '<div class="permission-row"><span>Notificaciones</span><span class="pill indigo">Opcional</span></div>' +
      '<p class="muted">Control recomendado: limitar permisos o desinstalar si no es confiable.</p></div>';
  }

  function caseOption(value, text) {
    return '<label class="option"><input type="radio" name="case" value="' + value + '"' + (state.answers.case === value ? " checked" : "") + '><span><strong>' + value + '.</strong> ' + text + '</span></label>';
  }

  function selectOption(value, label, selected) {
    return '<option value="' + escapeHtml(value) + '"' + (selected === value ? " selected" : "") + '>' + label + '</option>';
  }

  function infoCard(icon, title, text) {
    return '<article class="card"><span class="icon" aria-hidden="true">' + icon + '</span><h3>' + title + '</h3><p>' + text + '</p></article>';
  }

  function statusCard(title, text, levelClass) {
    return '<article class="status-card ' + levelClass + '"><strong>' + title + '</strong><p>' + text + '</p></article>';
  }

  function riskPiece(title, text) {
    return '<article class="risk-piece"><strong>' + title + '</strong><p>' + text + '</p></article>';
  }

  function metric(title, value) {
    return '<article class="metric"><strong>' + value + '</strong><span>' + title + '</span></article>';
  }

  function detailsBlock(title, items) {
    return '<details><summary>' + title + '</summary>' + listItems(items) + '</details>';
  }

  function resourcesBlock() {
    return '<div class="reading-block"><h3>Para seguir aprendiendo</h3><p>Estos recursos son opcionales, requieren internet y no afectan el puntaje SCORM.</p><div class="resource-list">' +
      resources.map(function (item) { return '<a href="' + item[0] + '" target="_blank" rel="noopener"><strong>' + item[1] + '</strong><small>' + item[2] + '</small></a>'; }).join("") +
      '</div></div>';
  }

  function listItems(items) {
    return '<ul>' + items.map(function (item) { return '<li>' + item + '</li>'; }).join("") + '</ul>';
  }

  function feedbackClass(score, max) {
    if (score >= Math.ceil(max * 0.8)) return "correct";
    if (score > 0) return "partial";
    return "incorrect";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showInlineError(message) {
    var old = app.querySelector(".validation-error");
    if (old) old.remove();
    var error = document.createElement("p");
    error.className = "feedback incorrect validation-error";
    error.setAttribute("role", "alert");
    error.textContent = message;
    var firstButton = app.querySelector(".button-primary");
    if (firstButton) firstButton.insertAdjacentElement("afterend", error);
    else app.appendChild(error);
    error.scrollIntoView({ block: "center" });
  }

  initialize();
}());
