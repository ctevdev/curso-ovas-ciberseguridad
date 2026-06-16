(function () {
  "use strict";

  var totalScreens = 17;
  var app = document.getElementById("app");

  var defaultPlanRows = [
    { risk: "", level: "", action: "", priority: "", date: "", status: "Pendiente" },
    { risk: "", level: "", action: "", priority: "", date: "", status: "Pendiente" },
    { risk: "", level: "", action: "", priority: "", date: "", status: "Pendiente" }
  ];

  var defaultState = {
    screen: 0,
    score: 0,
    answers: {
      case: null,
      mini: {},
      buildRisks: {},
      valuations: {},
      controls: {},
      plan: defaultPlanRows,
      quiz: {}
    },
    completed: {},
    exported: false,
    finalStatus: "incomplete",
    finished: false
  };
  var state = cloneDefault();

  var levels = ["Bajo", "Medio", "Alto"];
  var riskLevels = ["Bajo", "Medio", "Alto", "Critico"];
  var sensitiveWords = ["contraseña", "contrasena", "clave", "codigo", "código", "token", "pin", "cvv"];

  var miniQuestions = {
    4: {
      id: "components",
      q: "¿Que elemento describe la consecuencia si ocurre un incidente?",
      options: ["Impacto.", "Activo.", "Control.", "Probabilidad."],
      correct: 0,
      good: "Correcto. El impacto describe la consecuencia.",
      bad: "La consecuencia se llama impacto; la probabilidad indica que tan posible es que ocurra."
    },
    5: {
      id: "impact",
      q: "Si alguien toma control del correo principal y puede recuperar otras cuentas, el impacto seria:",
      options: ["Bajo.", "Medio.", "Alto.", "Ninguno."],
      correct: 2,
      good: "Correcto. El correo principal suele ser un activo critico.",
      bad: "Cuando se afecta acceso a muchas cuentas, identidad o recuperacion, el impacto es alto."
    },
    6: {
      id: "probability",
      q: "Una cuenta sin MFA, con contraseña repetida y expuesta a phishing tiene probabilidad:",
      options: ["Baja.", "Media.", "Alta.", "Nula."],
      correct: 2,
      good: "Correcto. Debilidades claras elevan la probabilidad.",
      bad: "Sin MFA y con contraseña repetida, la probabilidad no es baja: hay exposicion clara."
    },
    7: {
      id: "riskcalc",
      q: "Impacto alto + probabilidad alta produce:",
      options: ["Riesgo bajo.", "Riesgo medio.", "Riesgo critico.", "Sin riesgo."],
      correct: 2,
      good: "Correcto. Alto + alta requiere actuacion inmediata.",
      bad: "La combinacion impacto alto y probabilidad alta genera riesgo critico."
    }
  };

  var riskBuildCases = [
    {
      asset: "Correo principal",
      threat: "Phishing para robo de credenciales",
      vulnerability: "Sin MFA y contraseña repetida",
      explanation: "El correo recupera otras cuentas; protegerlo reduce varios riesgos a la vez."
    },
    {
      asset: "Celular personal",
      threat: "Robo o perdida del dispositivo",
      vulnerability: "Sin bloqueo automatico y cuentas abiertas",
      explanation: "El celular suele contener sesiones, MFA, banca, fotos y mensajeria."
    },
    {
      asset: "Cuenta bancaria o billetera digital",
      threat: "Fraude por smishing o llamada falsa",
      vulnerability: "Usuario ingresa desde enlaces enviados por SMS",
      explanation: "El canal financiero debe abrirse desde app o sitio oficial, no desde enlaces recibidos."
    },
    {
      asset: "Carpeta en la nube con documentos",
      threat: "Acceso no autorizado o eliminacion de archivos",
      vulnerability: "Cuenta sin MFA y sin revision de permisos",
      explanation: "La nube necesita MFA, permisos revisados y copias verificadas."
    },
    {
      asset: "Red social de emprendimiento",
      threat: "Suplantacion o toma de cuenta",
      vulnerability: "Contraseña debil y recuperacion insegura",
      explanation: "Una cuenta de negocio afecta ventas, clientes y reputacion."
    }
  ];
  var threatOptions = unique(riskBuildCases.map(function (item) { return item.threat; }));
  var vulnerabilityOptions = unique(riskBuildCases.map(function (item) { return item.vulnerability; }));

  var valuationCases = [
    { text: "Correo principal sin MFA y con contraseña repetida.", impact: "Alto", probability: "Alto", accepted: ["Critico"] },
    { text: "Cuenta de entretenimiento con contraseña debil, pero sin datos sensibles.", impact: "Bajo", probability: "Medio", accepted: ["Bajo", "Medio"] },
    { text: "Celular con banca, correo y WhatsApp, pero sin bloqueo automatico.", impact: "Alto", probability: "Medio", accepted: ["Alto"] },
    { text: "Documentos importantes en nube con MFA activo y copia local.", impact: "Medio", probability: "Bajo", accepted: ["Bajo"] },
    { text: "Red social de negocio sin MFA y expuesta a mensajes de soporte falsos.", impact: "Alto", probability: "Alto", accepted: ["Critico"] }
  ];

  var controlCases = [
    {
      risk: "Correo principal comprometido por phishing.",
      control: "Activar MFA, usar contraseña unica y revisar sesiones.",
      feedback: "MFA y clave unica reducen la probabilidad; revisar sesiones ayuda a detectar accesos activos."
    },
    {
      risk: "Perdida de celular con cuentas abiertas.",
      control: "Bloqueo automatico, localizacion/borrado remoto y cierre de sesiones.",
      feedback: "El bloqueo y el cierre de sesiones reducen acceso no autorizado tras perdida o robo."
    },
    {
      risk: "Fraude bancario por SMS falso.",
      control: "No abrir enlaces bancarios por SMS, usar app oficial y reportar al banco.",
      feedback: "La banca debe abrirse por app o sitio oficial; los mensajes se reportan por canal oficial."
    },
    {
      risk: "Perdida de documentos por daño del equipo.",
      control: "Copia de seguridad automatica y verificacion de recuperacion.",
      feedback: "La copia reduce el impacto y la verificacion confirma que realmente puedes recuperar."
    },
    {
      risk: "Red social de negocio tomada.",
      control: "MFA, contraseña fuerte, revision de recuperacion y alerta a contactos/clientes.",
      feedback: "Asegurar acceso y avisar a clientes reduce fraude y daño reputacional."
    }
  ];
  var controlOptions = unique(controlCases.map(function (item) { return item.control; }));

  var planRiskOptions = ["Correo principal sin MFA", "Contraseña repetida", "Celular sin bloqueo", "Sin copia de seguridad", "WiFi insegura", "Red social sin proteccion", "Banca expuesta a phishing", "Apps con permisos excesivos", "Otro"];
  var priorities = ["Alta", "Media", "Baja"];
  var statuses = ["Pendiente", "En proceso", "Realizado"];

  var quiz = [
    {
      q: "¿Que es una matriz de riesgos?",
      options: ["Una herramienta para organizar riesgos y priorizar acciones.", "Una lista de contraseñas.", "Un antivirus.", "Un tipo de copia de seguridad."],
      correct: 0
    },
    {
      q: "¿Que combinacion genera un riesgo critico?",
      options: ["Impacto alto y probabilidad alta.", "Impacto bajo y probabilidad baja.", "Impacto bajo y probabilidad media.", "Impacto medio y probabilidad baja."],
      correct: 0
    },
    {
      q: "¿Que es un control?",
      options: ["Una accion que reduce un riesgo.", "Una amenaza nueva.", "Una perdida economica.", "Una cuenta abandonada."],
      correct: 0
    },
    {
      q: "¿Cual accion debe priorizarse si el correo principal no tiene MFA?",
      options: ["Cambiar el color del perfil.", "Activar MFA y usar contraseña unica.", "Ignorar la cuenta.", "Compartir la clave con alguien."],
      correct: 1
    },
    {
      q: "¿Que debe tener un buen plan de mejora?",
      options: ["Acciones concretas, prioridad, fecha y seguimiento.", "Solo ideas generales.", "Contraseñas escritas.", "Codigos de verificacion guardados."],
      correct: 0
    }
  ];

  var resources = [
    ["https://grow.google/certificates/cybersecurity/", "Google Cybersecurity Certificate", "Ruta para profundizar en gestion de riesgos, amenazas, vulnerabilidades y controles."],
    ["https://www.coursera.org/learn/manage-security-risks", "Play It Safe: Manage Security Risks", "Curso para ampliar gestion de riesgos, marcos, controles y uso de playbooks."],
    ["https://www.coursera.org/learn/assets-threats-and-vulnerabilities", "Assets, Threats, and Vulnerabilities", "Curso para fortalecer el analisis de activos, amenazas, vulnerabilidades y controles."],
    ["https://www.coursera.org/learn/detection-and-response", "Sound the Alarm: Detection and Response", "Curso para conectar riesgos con deteccion, documentacion y respuesta."],
    ["https://www.nist.gov/cyberframework", "NIST Cybersecurity Framework 2.0", "Marco para gobernar, identificar, proteger, detectar, responder y recuperar."],
    ["https://csrc.nist.gov/projects/risk-management/about-rmf", "NIST Risk Management Framework", "Referencia para comprender la gestion del riesgo como proceso continuo."],
    ["https://www.cisa.gov/resources-tools/resources/cyber-essentials", "CISA Cyber Essentials", "Guia practica para fortalecer controles basicos y priorizar acciones."],
    ["https://myaccount.google.com/security-checkup", "Google Security Checkup", "Herramienta para revisar cuenta, dispositivos conectados y protecciones activas."]
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
    base.answers.mini = Object.assign({}, base.answers.mini || {});
    base.answers.buildRisks = Object.assign({}, base.answers.buildRisks || {});
    base.answers.valuations = Object.assign({}, base.answers.valuations || {});
    base.answers.controls = Object.assign({}, base.answers.controls || {});
    base.answers.plan = Array.isArray(base.answers.plan) ? base.answers.plan : cloneDefault().answers.plan;
    base.answers.quiz = Object.assign({}, base.answers.quiz || {});
    base.completed = Object.assign({}, saved.completed || {});
    base.exported = Boolean(saved.exported);
    base.finalStatus = saved.finalStatus || "incomplete";
    base.finished = Boolean(saved.finished);
    return base;
  }

  function normalizeState() {
    state.answers = state.answers || {};
    state.answers.mini = state.answers.mini || {};
    state.answers.buildRisks = state.answers.buildRisks || {};
    state.answers.valuations = state.answers.valuations || {};
    state.answers.controls = state.answers.controls || {};
    state.answers.plan = Array.isArray(state.answers.plan) ? state.answers.plan : cloneDefault().answers.plan;
    while (state.answers.plan.length < 3) state.answers.plan.push({ risk: "", level: "", action: "", priority: "", date: "", status: "Pendiente" });
    state.answers.quiz = state.answers.quiz || {};
    state.completed = state.completed || {};
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
    state.score = getCaseScore() + getMiniScore() + getBuildRiskScore() + getValuationScore() + getControlScore() + getPlanScore() + getQuizScore();
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
      answers: state.answers,
      riesgosConstruidos: buildMatrixRows(),
      matrizBasica: buildMatrixRows(),
      planMejora: getCompletePlanRows(),
      completed: state.completed,
      exported: state.exported,
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
    return Boolean(state.completed.case && allMiniComplete() && state.completed.buildRisks && state.completed.valuations && state.completed.controls && state.completed.plan && state.completed.quiz);
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
      matrixConcept,
      matrixComponents,
      impactScale,
      probabilityScale,
      riskCalculation,
      buildRiskActivity,
      valuationActivity,
      controlsActivity,
      planActivity,
      helpMaterial,
      finalQuiz,
      results,
      exportScreen,
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
        collectPlanIfPresent();
        state.screen = Math.max(0, Math.min(totalScreens - 1, state.screen + Number(button.dataset.nav)));
        saveProgress();
        render();
      });
    });
    bindClick("submit-case", submitCase);
    bindClick("submit-mini", submitMini);
    bindClick("submit-build-risks", submitBuildRisks);
    bindClick("submit-valuations", submitValuations);
    bindClick("submit-controls", submitControls);
    bindClick("add-plan-row", addPlanRow);
    bindClick("submit-plan", submitPlan);
    bindClick("submit-quiz", submitQuiz);
    bindClick("download-html", downloadExport);
    bindClick("finish-ova", finishOva);
    app.querySelectorAll("[data-risk-calc]").forEach(function (select) {
      select.addEventListener("change", updateValuationPreview);
    });
  }

  function bindClick(id, handler) {
    var element = document.getElementById(id);
    if (element) element.addEventListener("click", handler);
  }

  function welcome() {
    return '<section class="screen hero"><span class="tag">Unidad 2 · OVA 4 · 100 puntos</span>' +
      '<h2>Bienvenido a la OVA 4 de la Unidad 2</h2>' +
      '<p class="subtitle">Matriz basica de riesgos digitales y plan de mejora</p>' +
      '<p class="lead">En esta OVA integraras lo aprendido: activos digitales, vulnerabilidades, respuesta inicial, matriz de riesgos y acciones priorizadas.</p>' +
      '<div class="card-grid">' +
      infoCard("1", "¿Que debo proteger?", "Activos personales, academicos, laborales o de negocio.") +
      infoCard("2", "¿Que puede pasar?", "Amenazas y vulnerabilidades que aumentan el riesgo.") +
      infoCard("3", "¿Que tan grave seria?", "Impacto y probabilidad para calcular nivel de riesgo.") +
      infoCard("4", "¿Que hago primero?", "Controles, plan de mejora, fechas y seguimiento.") +
      '</div><div class="notice asset"><strong>Mensaje central:</strong> gestionar riesgos no significa eliminar todos los peligros. Significa decidir que acciones aplicar primero.</div>' +
      '<div class="brand-strip"><img src="assets/logo-unicartagena-ctev.png" alt="Logo Universidad de Cartagena y CTEV"><span>Curso interactivo de formacion en ciberseguridad</span></div>' +
      nav(false, true, "Iniciar OVA") + '</section>';
  }

  function objective() {
    return '<section class="screen"><span class="tag">Objetivo de aprendizaje</span><h2>Pasar de la preocupacion a la accion</h2>' +
      '<p class="lead">Construir una matriz basica de riesgos digitales, relacionando activos, amenazas, vulnerabilidades, impacto, probabilidad, nivel de riesgo, controles y acciones de mejora.</p>' +
      '<div class="status-grid">' +
      statusCard("Activos", "Lo que tiene valor: cuentas, dispositivos, archivos, servicios o informacion.", "level-safe") +
      statusCard("Amenazas y vulnerabilidades", "Lo que puede causar daño y la debilidad que lo facilita.", "level-medium") +
      statusCard("Impacto y probabilidad", "La consecuencia y que tan posible es que ocurra.", "level-medium") +
      statusCard("Controles y plan", "Acciones concretas con prioridad, fecha, estado y seguimiento.", "level-safe") +
      '</div>' + nav(true, true, "Ver caso inicial") + '</section>';
  }

  function initialCase() {
    var feedback = "";
    if (state.completed.case) {
      feedback = state.answers.case === "A"
        ? '<p class="feedback correct">Correcto. Instagram es un activo critico del negocio; si se compromete puede afectar ventas, reputacion y clientes. Puntaje: 10/10.</p>'
        : '<p class="feedback incorrect">El riesgo prioritario debe relacionarse con impacto real sobre activos criticos, dinero, reputacion o continuidad. Puntaje: 0/10.</p>';
    }
    return '<section class="screen"><span class="tag">Caso inicial · 10 puntos</span><h2>Caso: La tienda virtual de Laura</h2>' +
      '<div class="simulation-grid"><div class="incident-panel">' +
      incidentRow("Activos", "Correo, Instagram, billetera digital, celular y facturas en la nube.") +
      incidentRow("Vulnerabilidades", "Contraseña repetida, Instagram sin MFA, celular sin bloqueo y documentos sin copia.") +
      incidentRow("Amenaza", "Mensaje falso de soporte de Instagram con urgencia de suspension.") +
      incidentRow("Decision", "Priorizar lo que afecte ventas, clientes y reputacion.") +
      '</div><div><p>Laura vende accesorios por Instagram, recibe pagos digitales y guarda facturas en Google Drive. Un dia recibe un mensaje falso de soporte que amenaza con suspender la cuenta si no confirma sus datos.</p><p>La matriz le ayuda a ver que no todos los problemas tienen el mismo impacto ni la misma probabilidad.</p><img class="lesson-image" src="assets/phishing-correo.png" alt="Ilustracion de mensaje sospechoso"></div></div>' +
      '<fieldset class="question"><legend>¿Cual riesgo deberia priorizar Laura?</legend>' +
      caseOption("A", "Que alguien tome control de Instagram y afecte ventas y clientes.") +
      caseOption("B", "Que cambie el fondo de pantalla del celular.") +
      caseOption("C", "Que tenga demasiadas fotos de productos.") +
      caseOption("D", "Que use una aplicacion de diseño.") +
      '</fieldset><button id="submit-case" class="button button-primary" type="button">Confirmar respuesta</button>' + feedback +
      nav(true, state.completed.case, "Que es matriz") + '</section>';
  }

  function matrixConcept() {
    return '<section class="screen"><span class="tag">Concepto clave</span><h2>¿Que es una matriz basica de riesgos?</h2>' +
      '<p class="lead">Una matriz de riesgos es una herramienta sencilla para organizar posibles problemas de seguridad y decidir que acciones aplicar primero.</p>' +
      '<div class="risk-chain">' +
      riskPiece("Activo", "¿Cual elemento tiene valor?") +
      riskPiece("Amenaza", "¿Que puede causar daño?") +
      riskPiece("Vulnerabilidad", "¿Que debilidad existe?") +
      riskPiece("Impacto", "¿Que pasaria si ocurre?") +
      riskPiece("Control", "¿Que accion reduce el riesgo?") +
      '</div><div class="notice asset"><strong>Mensaje clave:</strong> la matriz ayuda a pasar de la preocupacion a la accion.</div>' +
      nav(true, true, "Componentes") + '</section>';
  }

  function matrixComponents() {
    return '<section class="screen"><span class="tag">Componentes</span><h2>Componentes de una matriz de riesgos</h2>' +
      '<div class="card-grid">' +
      infoCard("A", "Activo", "Lo que tiene valor y se desea proteger. Ejemplo: correo principal.") +
      infoCard("T", "Amenaza", "Lo que puede causar daño. Ejemplo: phishing.") +
      infoCard("V", "Vulnerabilidad", "Debilidad que permite que la amenaza tenga exito. Ejemplo: sin MFA.") +
      infoCard("I", "Impacto", "Consecuencia si ocurre el incidente. Ejemplo: suplantacion o perdida de acceso.") +
      infoCard("P", "Probabilidad", "Que tan posible es que ocurra.") +
      infoCard("R", "Nivel de riesgo", "Resultado de combinar impacto y probabilidad.") +
      infoCard("C", "Control", "Accion que reduce el riesgo.") +
      infoCard("M", "Plan de mejora", "Accion concreta con fecha, prioridad y seguimiento.") +
      '</div>' + miniQuestionBlock(4) + nav(true, isMiniAnswered("components"), "Escala de impacto") + '</section>';
  }

  function impactScale() {
    return '<section class="screen"><span class="tag">Impacto</span><h2>Escala sencilla de impacto</h2>' +
      '<p class="lead">El impacto indica que tan grave seria la consecuencia si el incidente ocurre.</p>' +
      '<div class="status-grid">' +
      statusCard("Impacto bajo", "Molestia menor o facil de corregir. Ejemplo: cuenta de entretenimiento sin datos sensibles.", "level-low") +
      statusCard("Impacto medio", "Afecta actividades personales, academicas, laborales o reputacion de forma moderada.", "level-medium") +
      statusCard("Impacto alto", "Afecta dinero, cuentas criticas, informacion sensible, clientes o continuidad.", "level-high") +
      '</div>' + miniQuestionBlock(5) + nav(true, isMiniAnswered("impact"), "Probabilidad") + '</section>';
  }

  function probabilityScale() {
    return '<section class="screen"><span class="tag">Probabilidad</span><h2>Escala sencilla de probabilidad</h2>' +
      '<p class="lead">La probabilidad indica que tan posible es que el riesgo ocurra.</p>' +
      '<div class="status-grid">' +
      statusCard("Probabilidad baja", "Ocurre rara vez o existen buenos controles: clave unica, MFA y alertas.", "level-low") +
      statusCard("Probabilidad media", "Hay algunos controles, pero tambien debilidades: no se revisan sesiones o copias.", "level-medium") +
      statusCard("Probabilidad alta", "Existen debilidades claras: contraseña repetida, sin MFA o WiFi publica para banca.", "level-high") +
      '</div>' + miniQuestionBlock(6) + nav(true, isMiniAnswered("probability"), "Calcular riesgo") + '</section>';
  }

  function riskCalculation() {
    return '<section class="screen"><span class="tag">Calculo</span><h2>Impacto + probabilidad = nivel de riesgo</h2>' +
      '<p class="lead">La combinacion permite priorizar: no todo se corrige al mismo tiempo.</p>' +
      matrix3x3() +
      '<div class="status-grid">' +
      statusCard("Riesgo bajo", "Monitorear.", "level-low") +
      statusCard("Riesgo medio", "Mejorar cuando sea posible.", "level-medium") +
      statusCard("Riesgo alto", "Corregir pronto.", "level-high") +
      statusCard("Riesgo critico", "Actuar de inmediato.", "level-high") +
      '</div>' + miniQuestionBlock(7) + nav(true, isMiniAnswered("riskcalc"), "Actividad 1") + '</section>';
  }

  function buildRiskActivity() {
    var feedback = state.completed.buildRisks
      ? '<p class="feedback ' + feedbackClass(getBuildRiskScore(), 20) + '">Riesgos construidos. Puntaje: ' + getBuildRiskScore() + '/20.</p>' + buildRiskFeedback()
      : '<p class="muted">Relaciona cada activo con su amenaza y vulnerabilidad.</p>';
    return '<section class="screen"><span class="tag">Actividad 1 · 20 puntos</span><h2>Del activo al riesgo</h2>' +
      '<div class="select-list">' + riskBuildCases.map(function (item, index) {
        var current = state.answers.buildRisks[index] || {};
        return '<div class="select-row"><label><strong>' + item.asset + '</strong></label><div><select id="threat-' + index + '"><option value="">Amenaza...</option>' + threatOptions.map(function (option) { return selectOption(option, option, current.threat || ""); }).join("") + '</select><br><br><select id="vulnerability-' + index + '"><option value="">Vulnerabilidad...</option>' + vulnerabilityOptions.map(function (option) { return selectOption(option, option, current.vulnerability || ""); }).join("") + '</select></div></div>';
      }).join("") + '</div><button id="submit-build-risks" class="button button-primary" type="button">Calificar relaciones</button>' + feedback +
      nav(true, state.completed.buildRisks, "Actividad 2") + '</section>';
  }

  function valuationActivity() {
    var feedback = state.completed.valuations
      ? '<p class="feedback ' + feedbackClass(getValuationScore(), 20) + '">Valoracion revisada. Puntaje: ' + getValuationScore() + '/20.</p>'
      : '<p class="muted">Selecciona impacto y probabilidad. La OVA calcula el nivel automaticamente.</p>';
    return '<section class="screen"><span class="tag">Actividad 2 · 20 puntos</span><h2>Valora el riesgo</h2>' +
      '<div class="risk-matrix-wrap"><table class="risk-matrix-table"><thead><tr><th>Situacion</th><th>Impacto</th><th>Probabilidad</th><th>Nivel calculado</th></tr></thead><tbody>' +
      valuationCases.map(function (item, index) {
        var current = state.answers.valuations[index] || {};
        var level = current.impact && current.probability ? riskLevel(current.impact, current.probability) : "Pendiente";
        return '<tr><td>' + item.text + '</td><td><select id="impact-' + index + '" data-risk-calc="' + index + '">' + levelOptions(current.impact || "") + '</select></td><td><select id="probability-' + index + '" data-risk-calc="' + index + '">' + levelOptions(current.probability || "") + '</select></td><td id="risk-preview-' + index + '">' + riskBadge(level) + '</td></tr>';
      }).join("") + '</tbody></table></div><button id="submit-valuations" class="button button-primary" type="button">Calificar valoracion</button>' + feedback +
      nav(true, state.completed.valuations, "Actividad 3") + '</section>';
  }

  function controlsActivity() {
    var feedback = state.completed.controls
      ? '<p class="feedback ' + feedbackClass(getControlScore(), 15) + '">Controles revisados. Puntaje: ' + getControlScore() + '/15.</p>' + controlFeedback()
      : '<p class="muted">Selecciona el control mas adecuado para cada riesgo.</p>';
    return '<section class="screen"><span class="tag">Actividad 3 · 15 puntos</span><h2>Control adecuado para cada riesgo</h2>' +
      '<div class="select-list">' + controlCases.map(function (item, index) {
        var selected = state.answers.controls[index] || "";
        return '<div class="select-row"><label for="control-' + index + '"><strong>Riesgo ' + (index + 1) + ':</strong> ' + item.risk + '</label><select id="control-' + index + '"><option value="">Selecciona control...</option>' + controlOptions.map(function (option) { return selectOption(option, option, selected); }).join("") + '</select></div>';
      }).join("") + '</div><button id="submit-controls" class="button button-primary" type="button">Calificar controles</button>' + feedback +
      nav(true, state.completed.controls, "Actividad 4") + '</section>';
  }

  function planActivity() {
    var completeRows = getCompletePlanRows().length;
    var feedback = state.completed.plan
      ? '<p class="feedback ' + feedbackClass(getPlanScore(), 15) + '">Plan revisado. Puntaje: ' + getPlanScore() + '/15.</p>' + planFeedback()
      : '<p class="muted">Registra minimo 3 acciones. Al menos una debe tener prioridad alta.</p>';
    return '<section class="screen"><span class="tag">Actividad 4 · 15 puntos</span><h2>Mi plan de mejora priorizado</h2>' +
      '<p class="lead">Convierte la matriz en acciones concretas con prioridad, fecha y estado. No escribas claves, codigos, PIN, CVV ni datos sensibles.</p>' +
      '<p><span class="plan-count">Acciones completas: ' + completeRows + '</span></p>' +
      '<div id="plan-rows">' + state.answers.plan.map(function (row, index) { return planRowHtml(row, index); }).join("") + '</div>' +
      (state.answers.plan.length < 5 ? '<button id="add-plan-row" class="button button-secondary" type="button">Agregar accion</button>' : '') +
      '<button id="submit-plan" class="button button-primary" type="button">Guardar plan de mejora</button>' + feedback +
      nav(true, state.completed.plan, "Material de ayuda") + '</section>';
  }

  function helpMaterial() {
    return '<section class="screen"><span class="tag">Aprende mas · opcional</span><h2>Priorizar riesgos y actuar</h2>' +
      '<p class="subtitle">No todo riesgo se atiende al mismo tiempo. Primero se atiende lo que puede causar mas daño y tiene mayor probabilidad.</p>' +
      '<div class="accordion">' +
      detailsBlock("Que es riesgo digital", ["Posibilidad de que una amenaza aproveche una vulnerabilidad y cause impacto sobre un activo.", "Ejemplo: que un atacante tome control del correo principal mediante phishing por falta de MFA."]) +
      detailsBlock("Por que priorizar", ["No siempre se puede corregir todo al mismo tiempo.", "Primero va lo que afecta dinero, acceso a muchas cuentas, informacion sensible, reputacion, trabajo, estudio, clientes o familiares."]) +
      detailsBlock("Como estimar impacto", ["Bajo: consecuencia menor o facil de corregir.", "Medio: afecta actividades, pero se puede recuperar.", "Alto: afecta dinero, reputacion, informacion sensible, continuidad o servicios criticos."]) +
      detailsBlock("Como estimar probabilidad", ["Baja: buenos controles y poca exposicion.", "Media: algunos controles, pero tambien debilidades.", "Alta: debilidades claras como contraseña repetida, sin MFA, WiFi publica o sin copias."]) +
      detailsBlock("Como decidir controles", ["Preventivos: evitan que ocurra, como MFA o actualizaciones.", "Detectivos: ayudan a descubrir, como alertas y revision de movimientos.", "Correctivos: ayudan a recuperarse, como restaurar copia o cerrar sesiones."]) +
      detailsBlock("Opciones frente al riesgo", ["Reducir: aplicar controles.", "Evitar: dejar una practica riesgosa.", "Transferir: usar servicio o tercero confiable.", "Aceptar: decidir no actuar por ahora de forma consciente."]) +
      detailsBlock("Como hacer seguimiento", ["Cada accion debe tener riesgo, accion concreta, prioridad, fecha limite, estado, evidencia de avance y revision futura.", "Riesgos criticos: maximo 7 dias. Altos: durante el mes. Medios: en el trimestre. Bajos: monitorear."]) +
      detailsBlock("Errores frecuentes", ["Escribir riesgos demasiado generales.", "Confundir amenaza con vulnerabilidad.", "No asignar controles.", "No poner fechas.", "No priorizar.", "Incluir datos sensibles.", "No revisar despues."]) +
      detailsBlock("Glosario", ["Activo: elemento de valor.", "Amenaza: evento o actor que causa daño.", "Vulnerabilidad: debilidad aprovechable.", "Riesgo: amenaza + vulnerabilidad + impacto.", "Control: medida que reduce el riesgo.", "Plan de mejora: acciones para reducir riesgos.", "Riesgo residual: riesgo que queda tras aplicar controles."]) +
      '</div><div class="reading-block"><h3>Ejemplo completo</h3><p><strong>Correo principal:</strong> amenaza phishing, vulnerabilidad contraseña repetida y sin MFA, impacto alto, probabilidad alta, nivel critico, control MFA y contraseña unica, accion configurar MFA antes del viernes.</p><p><strong>Celular personal:</strong> amenaza perdida o robo, vulnerabilidad sin bloqueo automatico, impacto alto, probabilidad media, nivel alto, control PIN/biometria/localizacion remota, accion configurar bloqueo hoy.</p></div>' +
      resourcesBlock() + nav(true, true, "Evaluacion final") + '</section>';
  }

  function finalQuiz() {
    var feedback = state.completed.quiz
      ? '<p class="feedback ' + feedbackClass(getQuizScore(), 5) + '">Evaluacion calificada. Puntaje: ' + getQuizScore() + '/5.</p>'
      : "";
    return '<section class="screen"><span class="tag">Evaluacion final · 5 puntos</span><h2>Comprueba lo aprendido</h2><p>Cada respuesta correcta vale 1 punto.</p>' +
      quiz.map(function (item, qIndex) {
        return '<fieldset class="question"><legend>' + (qIndex + 1) + '. ' + item.q + '</legend>' + item.options.map(function (option, oIndex) {
          return '<label class="option"><input type="radio" name="q' + qIndex + '" value="' + oIndex + '"' + (String(state.answers.quiz[qIndex]) === String(oIndex) ? " checked" : "") + '><span>' + option + '</span></label>';
        }).join("") + '</fieldset>';
      }).join("") + '<button id="submit-quiz" class="button button-primary" type="button">Calificar evaluacion</button>' + feedback +
      nav(true, state.completed.quiz, "Ver resultados") + '</section>';
  }

  function results() {
    var complete = allRequiredComplete();
    var matrixRows = buildMatrixRows();
    var planRows = getCompletePlanRows();
    var highest = highestRisk(matrixRows);
    var recommendation = !complete
      ? "Completa caso, mini preguntas, matriz, valoracion, controles, plan y evaluacion."
      : state.score >= 85
        ? "Excelente. Tu matriz conecta activos, amenazas, vulnerabilidades, controles y acciones concretas."
        : state.score >= 70
          ? "Buen avance. Refuerza la valoracion de impacto/probabilidad y el seguimiento del plan."
          : "Completado con recomendaciones: revisa riesgos criticos, controles y fechas del plan.";
    return '<section class="screen center"><span class="tag">Resultados</span><h2>Tu resultado en OVA U2-04</h2>' +
      '<div class="result-score" style="--score:' + state.score + '%">' + state.score + '<small>/100</small></div><h3>Estado: ' + statusLabel() + '</h3><p class="lead">' + recommendation + '</p>' +
      '<div class="metric-grid">' +
      metric("Caso inicial", state.completed.case ? getCaseScore() + "/10" : "Pendiente") +
      metric("Mini preguntas", getMiniScore() + "/15") +
      metric("Riesgos construidos", state.completed.buildRisks ? getBuildRiskScore() + "/20" : "Pendiente") +
      metric("Valoracion", state.completed.valuations ? getValuationScore() + "/20" : "Pendiente") +
      metric("Controles", state.completed.controls ? getControlScore() + "/15" : "Pendiente") +
      metric("Plan de mejora", state.completed.plan ? getPlanScore() + "/15" : "Pendiente") +
      metric("Evaluacion", state.completed.quiz ? getQuizScore() + "/5" : "Pendiente") +
      metric("Mayor riesgo", highest || "Pendiente") +
      metric("Acciones alta", countHighPriority(planRows) + " acciones") +
      '</div><div class="reading-block"><h3>Recomendaciones personalizadas</h3>' + listItems(resultRecommendations()) + '</div>' +
      '<div class="reading-block"><h3>Matriz construida</h3>' + matrixTable(matrixRows) + '</div>' +
      '<div class="reading-block"><h3>Plan de mejora</h3>' + planTable(planRows) + '</div>' +
      nav(true, complete, "Exportar matriz") + '</section>';
  }

  function exportScreen() {
    return '<section class="screen"><span class="tag">Exportacion opcional</span><h2>Exportar mi matriz de riesgos</h2>' +
      '<p class="lead">Puedes descargar un archivo HTML local con tu matriz y plan. Esta descarga es opcional y no afecta la finalizacion SCORM.</p>' +
      '<div class="export-preview"><h3>El archivo incluira</h3><ul><li>Titulo y fecha.</li><li>Riesgos construidos con activo, amenaza, vulnerabilidad, impacto, probabilidad, nivel y control.</li><li>Plan de mejora con prioridad, fecha limite y estado.</li><li>Recomendaciones y nota de privacidad.</li></ul></div>' +
      '<div class="export-actions"><button id="download-html" class="button button-primary" type="button">Descargar matriz y plan en HTML</button>' +
      (state.exported ? '<span class="feedback correct">Archivo generado en este intento.</span>' : '<span class="muted">Aun no has descargado el archivo.</span>') + '</div>' +
      nav(true, true, "Finalizacion SCORM") + '</section>';
  }

  function finalization() {
    return '<section class="screen"><span class="tag">Finalizacion SCORM</span><h2>Registrar matriz y plan en Moodle</h2>' +
      '<p class="lead">Al finalizar se enviara el puntaje, la ubicacion, el estado de finalizacion y el progreso guardado al LMS.</p>' +
      '<div class="notice ' + (allRequiredComplete() ? "success" : "alert") + '"><strong>Estado actual:</strong> ' + statusLabel() + '. Puntaje: ' + state.score + '/100.</div>' +
      (allRequiredComplete() ? '<button id="finish-ova" class="button button-primary" type="button">' + (state.finished ? "OVA finalizada" : "Finalizar OVA") + '</button>' : '<p class="feedback incorrect">Aun faltan actividades obligatorias. Debes completar matriz y plan de mejora.</p>') +
      (state.finished ? '<p class="feedback correct">Tu matriz de riesgos y plan de mejora fueron registrados. Puedes cerrar esta ventana.</p>' : "") +
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

  function submitBuildRisks() {
    var answers = {};
    for (var i = 0; i < riskBuildCases.length; i += 1) {
      var threat = document.getElementById("threat-" + i).value;
      var vulnerability = document.getElementById("vulnerability-" + i).value;
      if (!threat || !vulnerability) return showInlineError("Relaciona amenaza y vulnerabilidad en los cinco casos.");
      answers[i] = { threat: threat, vulnerability: vulnerability };
    }
    state.answers.buildRisks = answers;
    state.completed.buildRisks = true;
    saveProgress();
    render();
  }

  function submitValuations() {
    var answers = {};
    for (var i = 0; i < valuationCases.length; i += 1) {
      var impact = document.getElementById("impact-" + i).value;
      var probability = document.getElementById("probability-" + i).value;
      if (!impact || !probability) return showInlineError("Selecciona impacto y probabilidad para las cinco situaciones.");
      answers[i] = { impact: impact, probability: probability, level: riskLevel(impact, probability) };
    }
    state.answers.valuations = answers;
    state.completed.valuations = true;
    saveProgress();
    render();
  }

  function submitControls() {
    var answers = {};
    for (var i = 0; i < controlCases.length; i += 1) {
      var select = document.getElementById("control-" + i);
      if (!select.value) return showInlineError("Selecciona un control para cada riesgo.");
      answers[i] = select.value;
    }
    state.answers.controls = answers;
    state.completed.controls = true;
    saveProgress();
    render();
  }

  function addPlanRow() {
    collectPlanIfPresent();
    if (state.answers.plan.length < 5) state.answers.plan.push({ risk: "", level: "", action: "", priority: "", date: "", status: "Pendiente" });
    saveProgress();
    render();
  }

  function submitPlan() {
    collectPlanIfPresent();
    var completeRows = getCompletePlanRows();
    if (completeRows.length < 3) return showInlineError("Registra minimo 3 acciones completas.");
    if (!completeRows.some(function (row) { return row.priority === "Alta"; })) return showInlineError("Incluye al menos una accion de prioridad alta.");
    if (!completeRows.every(function (row) { return row.date; })) return showInlineError("Todas las acciones completas deben tener fecha limite.");
    if (completeRows.some(function (row) { return containsSensitive(row.action); })) return showInlineError("No incluyas contraseñas, codigos, PIN, CVV ni datos sensibles en las acciones.");
    state.completed.plan = true;
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
    if (!allRequiredComplete()) return showInlineError("Completa matriz, plan y evaluacion antes de finalizar.");
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
      riesgosConstruidos: buildMatrixRows(),
      matrizBasica: buildMatrixRows(),
      planMejora: getCompletePlanRows(),
      completed: state.completed,
      exported: state.exported,
      finalStatus: state.finalStatus,
      finished: true
    });
    Scorm.commit();
    Scorm.finish();
    render();
  }

  function getCaseScore() {
    if (!state.completed.case) return 0;
    return state.answers.case === "A" ? 10 : 0;
  }

  function getMiniScore() {
    var correct = Object.keys(miniQuestions).reduce(function (sum, screenIndex) {
      var item = miniQuestions[screenIndex];
      return sum + (state.answers.mini[item.id] === item.correct ? 1 : 0);
    }, 0);
    return Math.round(correct * 3.75);
  }

  function getBuildRiskScore() {
    if (!state.completed.buildRisks) return 0;
    var correct = riskBuildCases.reduce(function (sum, item, index) {
      var answer = state.answers.buildRisks[index] || {};
      return sum + (answer.threat === item.threat && answer.vulnerability === item.vulnerability ? 1 : 0);
    }, 0);
    return correct * 4;
  }

  function getValuationScore() {
    if (!state.completed.valuations) return 0;
    var score = valuationCases.reduce(function (sum, item, index) {
      var answer = state.answers.valuations[index] || {};
      var level = answer.impact && answer.probability ? riskLevel(answer.impact, answer.probability) : "";
      var exact = answer.impact === item.impact && answer.probability === item.probability;
      var coherent = item.accepted.indexOf(level) >= 0;
      return sum + (exact ? 4 : coherent ? 3 : 0);
    }, 0);
    return Math.min(20, score);
  }

  function getControlScore() {
    if (!state.completed.controls) return 0;
    var correct = controlCases.reduce(function (sum, item, index) {
      return sum + (state.answers.controls[index] === item.control ? 1 : 0);
    }, 0);
    return correct * 3;
  }

  function getPlanScore() {
    if (!state.completed.plan) return 0;
    var rows = getCompletePlanRows();
    var raw = 0;
    if (rows.length >= 3) raw += 15;
    if (rows.some(function (row) { return row.priority === "Alta"; })) raw += 5;
    if (rows.length >= 3 && rows.every(function (row) { return row.date; })) raw += 5;
    if (rows.length >= 3 && rows.every(function (row) { return row.action.length >= 8 && !containsSensitive(row.action); })) raw += 5;
    return Math.round((raw / 30) * 15);
  }

  function getQuizScore() {
    if (!state.completed.quiz) return 0;
    return quiz.reduce(function (sum, item, index) {
      return sum + (state.answers.quiz[index] === item.correct ? 1 : 0);
    }, 0);
  }

  function isMiniAnswered(id) {
    return typeof state.answers.mini[id] === "number";
  }

  function riskLevel(impact, probability) {
    if (impact === "Bajo" && probability === "Bajo") return "Bajo";
    if (impact === "Bajo" && probability === "Medio") return "Bajo";
    if (impact === "Bajo" && probability === "Alto") return "Medio";
    if (impact === "Medio" && probability === "Bajo") return "Bajo";
    if (impact === "Medio" && probability === "Medio") return "Medio";
    if (impact === "Medio" && probability === "Alto") return "Alto";
    if (impact === "Alto" && probability === "Bajo") return "Medio";
    if (impact === "Alto" && probability === "Medio") return "Alto";
    if (impact === "Alto" && probability === "Alto") return "Critico";
    return "Pendiente";
  }

  function updateValuationPreview() {
    var index = this.getAttribute("data-risk-calc");
    var impact = document.getElementById("impact-" + index).value;
    var probability = document.getElementById("probability-" + index).value;
    document.getElementById("risk-preview-" + index).innerHTML = riskBadge(impact && probability ? riskLevel(impact, probability) : "Pendiente");
  }

  function collectPlanIfPresent() {
    if (!document.getElementById("plan-rows")) return;
    state.answers.plan = state.answers.plan.map(function (_row, index) {
      return {
        risk: valueOf("plan-risk-" + index),
        level: valueOf("plan-level-" + index),
        action: valueOf("plan-action-" + index).trim(),
        priority: valueOf("plan-priority-" + index),
        date: valueOf("plan-date-" + index),
        status: valueOf("plan-status-" + index) || "Pendiente"
      };
    });
  }

  function valueOf(id) {
    var element = document.getElementById(id);
    return element ? element.value : "";
  }

  function getCompletePlanRows() {
    return state.answers.plan.filter(function (row) {
      return row.risk && row.level && row.action && row.priority && row.date && row.status && !containsSensitive(row.action);
    });
  }

  function containsSensitive(text) {
    var value = String(text || "").toLowerCase();
    return sensitiveWords.some(function (word) { return value.indexOf(word) >= 0; });
  }

  function buildMatrixRows() {
    return riskBuildCases.map(function (item, index) {
      var valuation = state.answers.valuations[index] || {};
      var control = state.answers.controls[index] || controlCases[index] && controlCases[index].control || "";
      var impact = valuation.impact || "";
      var probability = valuation.probability || "";
      return {
        asset: item.asset,
        threat: (state.answers.buildRisks[index] && state.answers.buildRisks[index].threat) || item.threat,
        vulnerability: (state.answers.buildRisks[index] && state.answers.buildRisks[index].vulnerability) || item.vulnerability,
        impact: impact,
        probability: probability,
        level: impact && probability ? riskLevel(impact, probability) : "",
        control: control
      };
    });
  }

  function highestRisk(rows) {
    var order = { "Critico": 4, "Alto": 3, "Medio": 2, "Bajo": 1 };
    var highest = rows.reduce(function (best, row) {
      return (order[row.level] || 0) > (order[best] || 0) ? row.level : best;
    }, "");
    return highest;
  }

  function countHighPriority(rows) {
    return rows.filter(function (row) { return row.priority === "Alta"; }).length;
  }

  function downloadExport() {
    var html = exportHtml();
    var blob = new Blob([html], { type: "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "matriz-riesgos-plan-mejora.html";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    state.exported = true;
    saveProgress();
    render();
  }

  function exportHtml() {
    var rows = buildMatrixRows();
    var plan = getCompletePlanRows();
    return '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Matriz de riesgos y plan de mejora</title><style>body{font-family:Arial,sans-serif;line-height:1.5;color:#17202a;margin:2rem}table{width:100%;border-collapse:collapse;margin:1rem 0}th,td{border:1px solid #c9d3df;padding:.55rem;text-align:left;vertical-align:top}th{background:#12345b;color:#fff}.note{background:#fff7df;border-left:5px solid #f2a900;padding:1rem}</style></head><body>' +
      '<h1>Matriz basica de riesgos digitales y plan de mejora</h1><p><strong>Fecha:</strong> ' + new Date().toLocaleDateString("es-CO") + '</p><p class="note">Nota de privacidad: este archivo no debe incluir contraseñas, codigos, PIN, CVV ni datos bancarios completos.</p>' +
      '<h2>Riesgos construidos</h2>' + exportTable(["Activo", "Amenaza", "Vulnerabilidad", "Impacto", "Probabilidad", "Nivel", "Control"], rows.map(function (row) { return [row.asset, row.threat, row.vulnerability, row.impact, row.probability, row.level, row.control]; })) +
      '<h2>Plan de mejora</h2>' + exportTable(["Riesgo", "Nivel", "Accion", "Prioridad", "Fecha limite", "Estado"], plan.map(function (row) { return [row.risk, row.level, row.action, row.priority, row.date, row.status]; })) +
      '<h2>Recomendaciones</h2>' + listItems(resultRecommendations()) + '</body></html>';
  }

  function exportTable(headers, rows) {
    if (!rows.length) return "<p>Sin registros completos.</p>";
    return '<table><thead><tr>' + headers.map(function (h) { return '<th>' + h + '</th>'; }).join("") + '</tr></thead><tbody>' + rows.map(function (row) {
      return '<tr>' + row.map(function (cell) { return '<td>' + escapeHtml(cell || "") + '</td>'; }).join("") + '</tr>';
    }).join("") + '</tbody></table>';
  }

  function submitMiniFeedback(item, selected) {
    if (typeof selected !== "number") return "";
    return selected === item.correct
      ? '<p class="feedback correct">' + item.good + ' Puntaje de mini preguntas: ' + getMiniScore() + '/15.</p>'
      : '<p class="feedback incorrect">' + item.bad + ' Puntaje de mini preguntas: ' + getMiniScore() + '/15.</p>';
  }

  function miniQuestionBlock(screenIndex) {
    var item = miniQuestions[screenIndex];
    var selected = state.answers.mini[item.id];
    return '<fieldset class="question"><legend>' + item.q + '</legend>' + item.options.map(function (option, index) {
      return '<label class="option"><input type="radio" name="mini" value="' + index + '"' + (selected === index ? " checked" : "") + '><span><strong>' + String.fromCharCode(65 + index) + '.</strong> ' + option + '</span></label>';
    }).join("") + '</fieldset><button id="submit-mini" class="button button-primary" type="button">Confirmar mini pregunta</button>' + submitMiniFeedback(item, selected);
  }

  function matrix3x3() {
    var cells = [
      ["Impacto / Prob.", "Baja", "Media", "Alta"],
      ["Bajo", "Bajo", "Bajo", "Medio"],
      ["Medio", "Bajo", "Medio", "Alto"],
      ["Alto", "Medio", "Alto", "Critico"]
    ];
    return '<div class="matrix-3x3">' + cells.map(function (row, rIndex) {
      return row.map(function (cell, cIndex) {
        var cls = rIndex === 0 ? "head" : cIndex === 0 ? "axis" : "";
        return '<div class="' + cls + '">' + (rIndex > 0 && cIndex > 0 ? riskBadge(cell) : cell) + '</div>';
      }).join("");
    }).join("") + '</div>';
  }

  function matrixTable(rows) {
    if (!rows.length) return '<p class="muted">Matriz pendiente.</p>';
    return '<div class="risk-matrix-wrap"><table class="risk-matrix-table"><thead><tr><th>Activo</th><th>Amenaza</th><th>Vulnerabilidad</th><th>Impacto</th><th>Probabilidad</th><th>Nivel</th><th>Control</th></tr></thead><tbody>' +
      rows.map(function (row) {
        return '<tr><td>' + row.asset + '</td><td>' + row.threat + '</td><td>' + row.vulnerability + '</td><td>' + (row.impact || "Pendiente") + '</td><td>' + (row.probability || "Pendiente") + '</td><td>' + riskBadge(row.level || "Pendiente") + '</td><td>' + (row.control || "Pendiente") + '</td></tr>';
      }).join("") + '</tbody></table></div>';
  }

  function planTable(rows) {
    if (!rows.length) return '<p class="muted">Plan pendiente.</p>';
    return '<div class="risk-matrix-wrap"><table class="risk-matrix-table"><thead><tr><th>Riesgo</th><th>Nivel</th><th>Accion</th><th>Prioridad</th><th>Fecha limite</th><th>Estado</th></tr></thead><tbody>' +
      rows.map(function (row) {
        return '<tr><td>' + row.risk + '</td><td>' + riskBadge(row.level) + '</td><td>' + row.action + '</td><td>' + row.priority + '</td><td>' + row.date + '</td><td>' + row.status + '</td></tr>';
      }).join("") + '</tbody></table></div>';
  }

  function buildRiskFeedback() {
    return '<div class="reading-block"><h3>Retroalimentacion</h3><ul>' + riskBuildCases.map(function (item, index) {
      var answer = state.answers.buildRisks[index] || {};
      var ok = answer.threat === item.threat && answer.vulnerability === item.vulnerability;
      return '<li><strong>' + item.asset + ':</strong> ' + (ok ? "Correcto. " : "Revisa. ") + item.explanation + '</li>';
    }).join("") + '</ul></div>';
  }

  function controlFeedback() {
    return '<div class="reading-block"><h3>Retroalimentacion</h3><ul>' + controlCases.map(function (item, index) {
      var ok = state.answers.controls[index] === item.control;
      return '<li><strong>Riesgo ' + (index + 1) + ':</strong> ' + (ok ? "Correcto. " : "Revisa. ") + item.feedback + '</li>';
    }).join("") + '</ul></div>';
  }

  function planFeedback() {
    var rows = getCompletePlanRows();
    return '<div class="reading-block"><h3>Resumen del plan</h3><p>Acciones completas: ' + rows.length + '. Prioridad alta: ' + countHighPriority(rows) + '.</p></div>';
  }

  function resultRecommendations() {
    var rows = buildMatrixRows();
    var plan = getCompletePlanRows();
    var items = ["Atiende primero los riesgos criticos.", "Protege correo principal y cuentas financieras.", "Activa MFA en cuentas criticas.", "Cambia contraseñas repetidas.", "Asegura celular y computador.", "Verifica copias de seguridad.", "Revisa permisos de aplicaciones.", "No uses enlaces sospechosos para banca.", "Documenta incidentes.", "Revisa tu matriz cada tres meses."];
    if (highestRisk(rows) === "Critico") items.unshift("Hay al menos un riesgo critico: define accion inmediata y fecha cercana.");
    if (countHighPriority(plan) === 0) items.unshift("Incluye al menos una accion de prioridad alta para lo mas urgente.");
    if (getValuationScore() < 16) items.unshift("Refuerza impacto y probabilidad: el nivel debe ser coherente con la situacion.");
    return items;
  }

  function caseOption(value, text) {
    return '<label class="option"><input type="radio" name="case" value="' + value + '"' + (state.answers.case === value ? " checked" : "") + '><span><strong>' + value + '.</strong> ' + text + '</span></label>';
  }

  function planRowHtml(row, index) {
    return '<div class="plan-row">' +
      formSelect("plan-risk-" + index, "Riesgo", planRiskOptions, row.risk) +
      formSelect("plan-level-" + index, "Nivel", riskLevels, row.level) +
      '<div class="form-field"><label for="plan-action-' + index + '">Accion de mejora</label><input id="plan-action-' + index + '" type="text" value="' + escapeHtml(row.action || "") + '" maxlength="120"></div>' +
      formSelect("plan-priority-" + index, "Prioridad", priorities, row.priority) +
      '<div class="form-field"><label for="plan-date-' + index + '">Fecha limite</label><input id="plan-date-' + index + '" type="date" value="' + escapeHtml(row.date || "") + '"></div>' +
      formSelect("plan-status-" + index, "Estado", statuses, row.status || "Pendiente") +
      '</div>';
  }

  function formSelect(id, label, options, selected) {
    return '<div class="form-field"><label for="' + id + '">' + label + '</label><select id="' + id + '"><option value="">Selecciona...</option>' + options.map(function (option) { return selectOption(option, option, selected); }).join("") + '</select></div>';
  }

  function levelOptions(selected) {
    return '<option value="">Selecciona...</option>' + levels.map(function (level) { return selectOption(level, level, selected); }).join("");
  }

  function selectOption(value, label, selected) {
    return '<option value="' + escapeHtml(value) + '"' + (selected === value ? " selected" : "") + '>' + label + '</option>';
  }

  function riskBadge(level) {
    var cls = "risk-badge";
    if (level === "Bajo") cls += " risk-bajo";
    else if (level === "Medio") cls += " risk-medio";
    else if (level === "Alto") cls += " risk-alto";
    else if (level === "Critico") cls += " risk-critico";
    else cls += " risk-medio";
    return '<span class="' + cls + '">' + (level || "Pendiente") + '</span>';
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

  function incidentRow(title, value) {
    return '<div class="incident-row"><strong>' + title + '</strong><span>' + value + '</span></div>';
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

  function unique(items) {
    return items.filter(function (item, index) { return items.indexOf(item) === index; });
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
