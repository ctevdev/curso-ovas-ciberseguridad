(function () {
  "use strict";

  var totalScreens = 18;
  var app = document.getElementById("app");

  var defaultState = {
    screen: 0,
    score: 0,
    diagnostic: null,
    selectedCase: "",
    assets: [],
    signals: {},
    evidences: [],
    timeline: [],
    analysis: {
      incidentType: "",
      threat: "",
      vulnerability: "",
      impact: ""
    },
    report: {
      incidentType: "",
      affectedAsset: "",
      date: "",
      time: "",
      whatHappened: "",
      evidences: [],
      actions: [],
      channel: "",
      support: "",
      sensitiveFlag: false
    },
    recovery: [],
    lessons: [],
    improvement: [
      { action: "", priority: "", date: "", status: "" },
      { action: "", priority: "", date: "", status: "" },
      { action: "", priority: "", date: "", status: "" }
    ],
    review: {},
    downloaded: false,
    completed: {},
    finalStatus: "incomplete",
    finished: false
  };
  var state = cloneDefault();

  var sensitiveWords = [
    "contrasena",
    "clave",
    "codigo",
    "token",
    "pin",
    "cvv",
    "tarjeta completa",
    "cedula completa",
    "documento completo",
    "qr de autenticacion"
  ];

  var cases = [
    {
      id: "social",
      title: "Caso A - Red social de emprendimiento tomada",
      description: "Una persona vende productos por Instagram. Recibe un mensaje falso de soporte, ingresa sus credenciales y pierde acceso. Luego aparecen promociones falsas solicitando transferencias a clientes.",
      assets: ["Red social", "Clientes", "Reputacion digital", "Correo principal", "Cuenta bancaria o billetera digital"]
    },
    {
      id: "email",
      title: "Caso B - Correo principal comprometido",
      description: "Una persona recibe alerta de inicio de sesion desde otra ciudad. Luego encuentra mensajes enviados sin autorizacion, regla de reenvio desconocida y dispositivo conectado que no reconoce.",
      assets: ["Correo principal", "Contactos", "Documentos personales", "Cuentas asociadas", "Nube"]
    },
    {
      id: "bank",
      title: "Caso C - Fraude por SMS bancario",
      description: "Una persona recibe un SMS que dice que su cuenta fue bloqueada. Ingresa al enlace, escribe sus datos y minutos despues observa un movimiento no reconocido.",
      assets: ["Cuenta bancaria o billetera digital", "Celular", "Correo principal", "Dinero", "WhatsApp o mensajeria"]
    },
    {
      id: "phone",
      title: "Caso D - Celular perdido con sesiones abiertas",
      description: "Una persona pierde su celular en transporte publico. El equipo tenia correo, WhatsApp, redes sociales y aplicaciones financieras abiertas.",
      assets: ["Celular", "Correo principal", "WhatsApp o mensajeria", "Cuenta bancaria o billetera digital", "Fotos o archivos", "Contactos"]
    }
  ];

  var assets = [
    "Correo principal",
    "Red social",
    "Cuenta bancaria o billetera digital",
    "Celular",
    "Computador",
    "Nube",
    "WhatsApp o mensajeria",
    "Contactos",
    "Clientes",
    "Reputacion digital",
    "Documentos personales",
    "Documentos laborales",
    "Fotos o archivos",
    "Plataforma academica o laboral",
    "Dinero"
  ];

  var signalItems = [
    { id: "urgency", text: "Mensaje de soporte con urgencia.", expected: ["sospechosa"] },
    { id: "domain", text: "Enlace con dominio extrano.", expected: ["sospechosa"] },
    { id: "lostAccess", text: "Perdida de acceso a la cuenta.", expected: ["critica"] },
    { id: "posts", text: "Publicaciones que el usuario no realizo.", expected: ["critica"] },
    { id: "transfer", text: "Transferencia no reconocida.", expected: ["critica"] },
    { id: "device", text: "Dispositivo desconocido conectado.", expected: ["sospechosa", "critica"] },
    { id: "forward", text: "Regla de reenvio desconocida.", expected: ["critica"] },
    { id: "code", text: "Codigo de verificacion no solicitado.", expected: ["sospechosa"] }
  ];

  var evidenceItems = [
    { id: "msg", text: "Captura del mensaje sospechoso.", safe: true },
    { id: "url", text: "URL recibida.", safe: true },
    { id: "datetime", text: "Fecha y hora aproximada.", safe: true },
    { id: "sender", text: "Remitente o numero de origen.", safe: true },
    { id: "login", text: "Captura de alerta de inicio de sesion.", safe: true },
    { id: "post", text: "Captura de publicacion no autorizada.", safe: true },
    { id: "device", text: "Registro de dispositivo desconocido.", safe: true },
    { id: "movement", text: "Registro de movimiento no reconocido.", safe: true },
    { id: "timeline", text: "Linea de tiempo.", safe: true },
    { id: "actions", text: "Acciones realizadas.", safe: true },
    { id: "password", text: "Contrasena actual.", safe: false },
    { id: "sms", text: "Codigo SMS.", safe: false },
    { id: "pin", text: "PIN bancario.", safe: false },
    { id: "cvv", text: "CVV.", safe: false },
    { id: "card", text: "Numero completo de tarjeta.", safe: false },
    { id: "document", text: "Documento completo sin ocultar.", safe: false },
    { id: "recovery", text: "Codigo de recuperacion.", safe: false },
    { id: "qr", text: "QR de autenticacion.", safe: false }
  ];

  var timelineEvents = [
    "El usuario recibe un mensaje sospechoso.",
    "El usuario hace clic en el enlace.",
    "El usuario ingresa credenciales o datos.",
    "Aparece una alerta o cambio sospechoso.",
    "El usuario pierde acceso o detecta afectacion.",
    "Otras personas reportan mensajes, publicaciones o movimientos.",
    "El usuario guarda evidencias.",
    "El usuario cambia contrasenas desde dispositivo seguro.",
    "El usuario reporta por canal oficial.",
    "El usuario registra lecciones aprendidas."
  ];

  var incidentTypes = ["", "Phishing ejecutado", "Cuenta comprometida", "Fraude financiero", "Perdida de dispositivo", "Suplantacion", "Acceso no autorizado", "Malware sospechoso"];
  var threats = ["", "Phishing", "Smishing", "Vishing", "Robo o perdida", "Malware", "Suplantacion", "Acceso no autorizado"];
  var vulnerabilities = ["", "Sin MFA", "Contrasena repetida", "Ingreso desde enlace sospechoso", "Celular sin bloqueo", "Recuperacion desactualizada", "Sin copia de seguridad", "Permisos excesivos"];
  var impacts = ["", "Perdida de dinero", "Perdida de acceso", "Suplantacion", "Exposicion de informacion", "Dano reputacional", "Afectacion a clientes o contactos", "Perdida de archivos"];

  var reportEvidenceOptions = ["Captura de mensaje", "URL", "Fecha y hora aproximada", "Alerta de seguridad", "Registro de acceso", "Publicacion no autorizada", "Movimiento no reconocido", "Linea de tiempo", "Acciones realizadas"];
  var reportActionOptions = ["Cambie contrasena desde dispositivo seguro", "Active MFA", "Cerre sesiones desconocidas", "Reporte a la plataforma", "Reporte al banco", "Avise a contactos afectados", "Guarde evidencias", "Bloquee SIM", "Pedi apoyo tecnico"];
  var reportChannels = ["", "Plataforma afectada", "Banco o billetera digital", "Area de TI o soporte institucional", "Operador movil", "Centro de atencion o autoridad competente", "Soporte tecnico autorizado"];

  var recoveryOptions = [
    { id: "p1", text: "Cambiar contrasena desde dispositivo seguro.", safe: true },
    { id: "p2", text: "Activar MFA.", safe: true },
    { id: "p3", text: "Cerrar sesiones desconocidas.", safe: true },
    { id: "p4", text: "Revisar recuperacion de cuenta.", safe: true },
    { id: "p5", text: "Revisar apps conectadas.", safe: true },
    { id: "p6", text: "Revisar reglas de reenvio.", safe: true },
    { id: "p7", text: "Avisar a contactos afectados por otro canal.", safe: true },
    { id: "p8", text: "Reportar a la plataforma.", safe: true },
    { id: "p9", text: "Reportar al banco si hay movimiento financiero.", safe: true },
    { id: "p10", text: "Bloquear SIM si se perdio el celular.", safe: true },
    { id: "p11", text: "Usar localizacion o borrado remoto.", safe: true },
    { id: "p12", text: "Revisar movimientos financieros.", safe: true },
    { id: "p13", text: "Restaurar archivos desde copia de seguridad.", safe: true },
    { id: "p14", text: "Documentar acciones realizadas.", safe: true },
    { id: "bad1", text: "Compartir contrasena.", safe: false },
    { id: "bad2", text: "Compartir codigo SMS.", safe: false },
    { id: "bad3", text: "Responder al atacante.", safe: false },
    { id: "bad4", text: "Seguir usando el enlace sospechoso.", safe: false },
    { id: "bad5", text: "Borrar todo sin evidencias.", safe: false },
    { id: "bad6", text: "Publicar capturas con datos sensibles.", safe: false }
  ];

  var lessonOptions = [
    "No ingresar credenciales desde enlaces recibidos por mensajes.",
    "Activar MFA en cuentas criticas.",
    "Usar contrasenas unicas.",
    "Revisar sesiones y dispositivos conectados.",
    "Mantener recuperacion de cuenta actualizada.",
    "No compartir codigos de verificacion.",
    "Verificar dominios antes de hacer clic.",
    "Reportar a tiempo.",
    "Guardar evidencias sin incluir datos sensibles.",
    "Avisar a contactos si hubo suplantacion.",
    "Revisar matriz de riesgos.",
    "Actualizar plan de ciberhigiene."
  ];

  var reviewItems = [
    "No inclui contrasenas.",
    "No inclui codigos SMS.",
    "No inclui PIN ni CVV.",
    "No inclui documentos completos.",
    "El reporte es claro y breve.",
    "La linea de tiempo tiene orden.",
    "El plan tiene tres acciones.",
    "Al menos una accion es prioritaria."
  ];

  var resources = [
    ["https://grow.google/certificates/cybersecurity/", "Google Cybersecurity Certificate", "Ruta para profundizar en ciberseguridad, deteccion, respuesta, riesgos y herramientas."],
    ["https://www.coursera.org/learn/detection-and-response", "Sound the Alarm: Detection and Response", "Curso para ampliar deteccion, documentacion y respuesta."],
    ["https://www.nist.gov/cyberframework", "NIST Cybersecurity Framework 2.0", "Marco para organizar identificar, proteger, detectar, responder y recuperar."],
    ["https://www.cisa.gov/resources-tools/resources/cyber-essentials", "CISA Cyber Essentials", "Guia practica para fortalecer controles basicos y respuesta."],
    ["https://myaccount.google.com/intro/security-checkup", "Google Security Checkup", "Herramienta para revisar actividad sospechosa y seguridad de cuenta."],
    ["https://www.incibe.es/ciudadania", "INCIBE - Seguridad para ciudadanos", "Recurso en espanol sobre fraudes, incidentes, privacidad y proteccion digital."],
    ["https://caivirtual.policia.gov.co/", "Centro Cibernetico Policial", "Canal colombiano para orientacion y reporte de fraudes o delitos digitales."]
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
    Object.keys(base).forEach(function (key) {
      if (saved[key] !== undefined) base[key] = saved[key];
    });
    base.analysis = Object.assign(cloneDefault().analysis, saved.analysis || {});
    base.report = Object.assign(cloneDefault().report, saved.report || {});
    base.improvement = Array.isArray(saved.improvement) ? saved.improvement.slice(0, 3) : cloneDefault().improvement;
    while (base.improvement.length < 3) base.improvement.push({ action: "", priority: "", date: "", status: "" });
    base.completed = Object.assign({}, saved.completed || {});
    base.review = Object.assign({}, saved.review || {});
    base.assets = Array.isArray(base.assets) ? base.assets : [];
    base.evidences = Array.isArray(base.evidences) ? base.evidences : [];
    base.timeline = Array.isArray(base.timeline) ? base.timeline : [];
    base.recovery = Array.isArray(base.recovery) ? base.recovery : [];
    base.lessons = Array.isArray(base.lessons) ? base.lessons : [];
    return base;
  }

  function normalizeState() {
    state.screen = Math.max(0, Math.min(totalScreens - 1, Number(state.screen) || 0));
    state.score = calculateScore();
  }

  function bindGlobalEvents() {
    bindClick("help-button", function () { toggleHelp(true); });
    bindClick("close-help", function () { toggleHelp(false); });
    bindClick("reset-button", function () { toggleReset(true); });
    bindClick("cancel-reset", function () { toggleReset(false); });
    bindClick("confirm-reset", function () {
      Scorm.resetLocal();
      state = cloneDefault();
      saveProgress();
      toggleReset(false);
      render();
    });
  }

  function render() {
    state.score = calculateScore();
    updateChrome();
    app.innerHTML = renderScreen(state.screen);
    bindScreenEvents(state.screen);
    app.focus({ preventScroll: true });
  }

  function updateChrome() {
    text("score", state.score);
    text("step-label", "Pantalla " + (state.screen + 1) + " de " + totalScreens);
    var progress = Math.round(((state.screen + 1) / totalScreens) * 100);
    text("progress-label", progress + " %");
    var bar = document.getElementById("progress-bar");
    if (bar) bar.style.width = progress + "%";
  }

  function renderScreen(index) {
    switch (index) {
      case 0: return renderWelcome();
      case 1: return renderObjective();
      case 2: return renderProjectIntro();
      case 3: return renderCaseSelection();
      case 4: return renderAssets();
      case 5: return renderSignals();
      case 6: return renderEvidences();
      case 7: return renderTimeline();
      case 8: return renderAnalysis();
      case 9: return renderReport();
      case 10: return renderRecovery();
      case 11: return renderLessons();
      case 12: return renderImprovement();
      case 13: return renderHelpMaterial();
      case 14: return renderReview();
      case 15: return renderExport();
      case 16: return renderResults();
      case 17: return renderFinish();
      default: return renderWelcome();
    }
  }

  function renderWelcome() {
    return [
      '<section class="screen hero">',
      '<span class="tag">Cierre integrador - Unidad 3</span>',
      '<h2>Bienvenido al Proyecto Integrador de Proteccion Digital</h2>',
      '<p class="lead">Has llegado al cierre de la Unidad 3. En esta OVA aplicaras lo aprendido sobre monitoreo, senales de alerta, evidencias, linea de tiempo, comunicacion, reporte, recuperacion y mejora.</p>',
      '<p class="subtitle">Analiza un caso, organiza evidencias, comunica el incidente y propone acciones de mejora.</p>',
      '<div class="brand-strip"><span>Universidad de Cartagena - CTEV</span><img src="assets/logo-unicartagena-ctev.png" alt="Logo Universidad de Cartagena y CTEV"></div>',
      '<div class="visual-lesson"><div>',
      '<p>Trabajaras con un caso simulado y construiras un informe final de proteccion digital. No necesitas datos reales: el objetivo es practicar decisiones seguras con orden.</p>',
      '<div class="card-grid">',
      card("Caso y activos", "Elige un caso simulado e identifica que cuentas, servicios o personas se ven afectadas."),
      card("Senales y evidencias", "Clasifica indicios y conserva solo informacion util, sin secretos."),
      card("Reporte y recuperacion", "Redacta un reporte seguro y define acciones iniciales."),
      card("Mejora", "Convierte lecciones aprendidas en acciones con prioridad y fecha."),
      '</div>',
      '</div><img class="lesson-image" src="assets/escudo-llave.png" alt="Escudo con llave digital"></div>',
      '<div class="button-row"><span></span><button class="button button-primary" type="button" data-go="1">Iniciar proyecto</button></div>',
      '</section>'
    ].join("");
  }

  function renderObjective() {
    var done = state.completed.diagnostic;
    var feedback = "";
    if (done) {
      feedback = feedbackHtml(state.diagnostic === 2 ? "correct" : "incorrect", state.diagnostic === 2
        ? "Correcto. Un informe debe documentar el caso sin exponer contrasenas, codigos, PIN, CVV ni datos sensibles."
        : "Fecha, URL y acciones pueden ser utiles si se manejan correctamente. Lo que nunca debe incluirse son secretos de acceso o datos sensibles.");
    }
    return [
      '<section class="screen">',
      '<span class="tag">Orientacion del proyecto</span>',
      '<h2>Objetivo del proyecto</h2>',
      '<p class="lead">En esta OVA construiras un informe integrador de proteccion digital aplicando analisis de caso, organizacion de evidencias, linea de tiempo, reporte seguro, recuperacion inicial y plan de mejora.</p>',
      '<h3>Al finalizar podras:</h3>',
      '<ol><li>Analizar un incidente digital simulado.</li><li>Identificar activos afectados.</li><li>Clasificar senales sospechosas y criticas.</li><li>Seleccionar evidencias utiles sin incluir datos sensibles.</li><li>Construir una linea de tiempo.</li><li>Redactar un reporte seguro.</li><li>Definir recuperacion y mejora posterior.</li></ol>',
      '<h3>Ruta del proyecto</h3>',
      '<div class="card-grid learning-route">',
      routeCard(1, "Caso", "Selecciona un escenario simulado."),
      routeCard(2, "Activos", "Identifica lo que puede verse afectado."),
      routeCard(3, "Senales", "Distingue sospechosas y criticas."),
      routeCard(4, "Evidencias", "Elige elementos utiles y seguros."),
      routeCard(5, "Linea de tiempo", "Ordena los hechos."),
      routeCard(6, "Reporte", "Comunica sin exponer datos."),
      routeCard(7, "Recuperacion", "Define acciones iniciales."),
      routeCard(8, "Mejora", "Crea acciones con prioridad y fecha."),
      '</div>',
      '<div class="diagnostic-box">',
      '<h3>Pregunta diagnostica no calificable</h3>',
      '<fieldset class="question"><legend>Que elemento NO debe incluirse en un informe de incidente?</legend>',
      diagnosticOption(0, "Fecha aproximada."),
      diagnosticOption(1, "URL sospechosa."),
      diagnosticOption(2, "Contrasena o codigo de verificacion."),
      diagnosticOption(3, "Acciones realizadas."),
      '<button class="button button-primary" type="button" id="check-diagnostic">Revisar respuesta</button>',
      feedback,
      '</fieldset>',
      '</div>',
      navigation(0, 2, "Volver", "Continuar al proyecto"),
      '</section>'
    ].join("");
  }

  function renderProjectIntro() {
    return [
      '<section class="screen">',
      '<span class="tag">Producto final</span>',
      '<h2>Producto final de la Unidad 3</h2>',
      '<p class="lead">Tu producto sera un informe aplicado de proteccion digital. No debes usar datos reales. Trabajaras con casos simulados.</p>',
      '<div class="project-panel">',
      '<h3>El informe debe responder:</h3>',
      '<ul><li>Que ocurrio?</li><li>Que activo fue afectado?</li><li>Que senales aparecieron?</li><li>Que evidencias son utiles?</li><li>En que orden ocurrieron los hechos?</li><li>A quien se debe reportar?</li><li>Como se recupera el acceso o servicio?</li><li>Que se aprendio?</li><li>Que acciones evitaran que se repita?</li></ul>',
      '</div>',
      '<div class="notice success"><strong>Mensaje clave:</strong> Este proyecto no busca memorizar definiciones. Busca aplicar decisiones seguras.</div>',
      navigation(1, 3, "Volver", "Seleccionar caso"),
      '</section>'
    ].join("");
  }

  function renderCaseSelection() {
    var feedback = state.completed.case ? feedbackHtml("correct", "Caso seleccionado. Puntaje: " + scoreCase() + "/5.") : "";
    return [
      '<section class="screen">',
      '<span class="tag">Proyecto - 5 puntos</span>',
      '<h2>Selecciona un caso de trabajo</h2>',
      '<p class="lead">Elige uno de los siguientes casos simulados para construir tu informe.</p>',
      '<div class="case-choice">',
      cases.map(function (item) {
        return '<label class="case-option"><input type="radio" name="case-choice" value="' + item.id + '"' + checked(state.selectedCase === item.id) + '><span><strong>' + escapeHtml(item.title) + '</strong>' + escapeHtml(item.description) + '<br><span class="muted">Activos posibles: ' + escapeHtml(item.assets.join(", ")) + '.</span></span></label>';
      }).join(""),
      '</div>',
      '<div id="activity-feedback">' + feedback + '</div>',
      '<div class="button-row"><button class="button button-secondary" type="button" data-go="2">Volver</button><button class="button button-primary" type="button" id="save-case">Guardar caso</button><button class="button button-ghost" type="button" data-go="4">Continuar</button></div>',
      '</section>'
    ].join("");
  }

  function renderAssets() {
    var result = scoreAssets();
    var feedback = state.completed.assets ? feedbackHtml(result.score === 10 ? "correct" : result.score > 0 ? "partial" : "incorrect", "Activos coherentes: " + result.coherent + ". Puntaje: " + result.score + "/10.") : "";
    return [
      '<section class="screen">',
      '<span class="tag">Activos afectados - 10 puntos</span>',
      '<h2>Activos afectados</h2>',
      '<p class="lead">Selecciona los activos que podrian verse afectados en el caso elegido. Debes marcar minimo tres activos coherentes.</p>',
      '<div class="checklist-grid">',
      assets.map(function (item) {
        return '<label class="check-card"><input type="checkbox" name="asset" value="' + escapeHtml(item) + '"' + checked(state.assets.indexOf(item) !== -1) + '> <span>' + escapeHtml(item) + '</span></label>';
      }).join(""),
      '</div>',
      '<div class="safe-note">Los activos ayudan a entender que puede verse afectado y que debe protegerse primero.</div>',
      '<div id="activity-feedback">' + feedback + '</div>',
      actionNav(3, "save-assets", "Guardar activos", 5),
      '</section>'
    ].join("");
  }

  function renderSignals() {
    var result = scoreSignals();
    var feedback = state.completed.signals ? feedbackHtml(result.score === 10 ? "correct" : result.score > 0 ? "partial" : "incorrect", "Clasificaciones correctas: " + result.correct + " de 8. Puntaje: " + result.score + "/10.") : "";
    return [
      '<section class="screen">',
      '<span class="tag">Senales - 10 puntos</span>',
      '<h2>Senales del caso</h2>',
      '<p class="lead">Clasifica cada senal como sospechosa o critica. Una senal sospechosa exige revisar; una critica indica posible afectacion fuerte.</p>',
      '<div class="classifier-list">',
      signalItems.map(function (item) {
        return '<div class="classifier-row"><strong>' + escapeHtml(item.text) + '</strong>' + renderSelect("signal-" + item.id, ["", "sospechosa", "critica"], state.signals[item.id] || "") + '</div>';
      }).join(""),
      '</div>',
      '<div id="activity-feedback">' + feedback + '</div>',
      actionNav(4, "save-signals", "Calificar senales", 6),
      '</section>'
    ].join("");
  }

  function renderEvidences() {
    var result = scoreEvidences();
    var feedback = state.completed.evidences ? feedbackHtml(result.score === 15 ? "correct" : result.score > 0 ? "partial" : "incorrect", result.unsafe ? "Seleccionaste datos sensibles. Puntaje: 0/15." : "Evidencias utiles seleccionadas: " + result.safeCount + ". Puntaje: " + result.score + "/15.") : "";
    return [
      '<section class="screen">',
      '<span class="tag">Evidencias - 15 puntos</span>',
      '<h2>Evidencias utiles y datos que no debes incluir</h2>',
      '<p class="lead">Selecciona que elementos incluirias en una carpeta o informe de evidencias. Si marcas datos sensibles, la actividad queda en cero.</p>',
      '<div class="checklist-grid">',
      evidenceItems.map(function (item) {
        return '<label class="check-card ' + (item.safe ? "safe" : "insecure") + '"><input type="checkbox" name="evidence" value="' + item.id + '"' + checked(state.evidences.indexOf(item.id) !== -1) + '> <span>' + escapeHtml(item.text) + (item.safe ? ' <span class="status-pill recovery">util</span>' : ' <span class="status-pill danger">no incluir</span>') + '</span></label>';
      }).join(""),
      '</div>',
      '<div class="safe-note">Una evidencia util ayuda a reportar. Un dato sensible puede abrir otro incidente.</div>',
      '<div id="activity-feedback">' + feedback + '</div>',
      actionNav(5, "save-evidences", "Calificar evidencias", 7),
      '</section>'
    ].join("");
  }

  function renderTimeline() {
    var result = scoreTimeline();
    var feedback = state.completed.timeline ? feedbackHtml(result.score === 15 ? "correct" : result.score > 0 ? "partial" : "incorrect", "Eventos bien ubicados: " + result.correct + " de 10. Puntaje: " + result.score + "/15.") : "";
    return [
      '<section class="screen">',
      '<span class="tag">Linea de tiempo - 15 puntos</span>',
      '<h2>Linea de tiempo del incidente</h2>',
      '<p class="lead">Ordena los hechos del caso. Primero aparecen los mensajes y decisiones iniciales; despues la afectacion, evidencias, reporte y aprendizaje.</p>',
      '<div class="order-list">',
      timelineEvents.map(function (_, index) {
        return '<div class="order-row"><strong>Paso ' + (index + 1) + '</strong><span>Selecciona el evento</span>' + renderSelect("timeline-" + index, [""].concat(timelineEvents), state.timeline[index] || "") + '</div>';
      }).join(""),
      '</div>',
      '<div id="activity-feedback">' + feedback + '</div>',
      actionNav(6, "save-timeline", "Calificar linea de tiempo", 8),
      '</section>'
    ].join("");
  }

  function renderAnalysis() {
    var score = scoreAnalysis();
    var feedback = state.completed.analysis ? feedbackHtml(score === 10 ? "correct" : "partial", "Analisis registrado. Puntaje: " + score + "/10.") : "";
    return [
      '<section class="screen">',
      '<span class="tag">Analisis - 10 puntos</span>',
      '<h2>Analisis basico del caso</h2>',
      '<p class="lead">Completa el analisis seleccionando opciones coherentes con el caso. Esta pantalla conecta hechos con una interpretacion inicial.</p>',
      '<div class="lesson-plan">',
      '<div class="form-field"><label for="analysis-type">Tipo de incidente</label>' + renderSelect("analysis-type", incidentTypes, state.analysis.incidentType) + '</div>',
      '<div class="form-field"><label for="analysis-threat">Amenaza principal</label>' + renderSelect("analysis-threat", threats, state.analysis.threat) + '</div>',
      '<div class="form-field"><label for="analysis-vulnerability">Vulnerabilidad probable</label>' + renderSelect("analysis-vulnerability", vulnerabilities, state.analysis.vulnerability) + '</div>',
      '<div class="form-field"><label for="analysis-impact">Impacto posible</label>' + renderSelect("analysis-impact", impacts, state.analysis.impact) + '</div>',
      '</div>',
      '<div id="activity-feedback">' + feedback + '</div>',
      actionNav(7, "save-analysis", "Guardar analisis", 9),
      '</section>'
    ].join("");
  }

  function renderReport() {
    var score = scoreReport();
    var feedback = state.completed.report ? feedbackHtml(score === 15 ? "correct" : score > 0 ? "partial" : "incorrect", state.report.sensitiveFlag ? "Evita incluir datos sensibles. El reporte debe describir el hecho sin contrasenas, codigos, PIN, CVV ni datos privados." : "Reporte guardado. Puntaje: " + score + "/15.") : "";
    return [
      '<section class="screen">',
      '<span class="tag">Reporte seguro - 15 puntos</span>',
      '<h2>Reporte seguro del caso</h2>',
      '<p class="lead">Completa un reporte simulado. No uses datos reales ni informacion sensible.</p>',
      '<div class="report-form">',
      '<div class="form-two"><div class="form-field"><label for="report-type">Tipo de incidente</label>' + renderSelect("report-type", incidentTypes, state.report.incidentType || state.analysis.incidentType) + '</div><div class="form-field"><label for="report-asset">Activo afectado</label>' + renderSelect("report-asset", [""].concat(assets), state.report.affectedAsset) + '</div></div>',
      '<div class="form-two"><div class="form-field"><label for="report-date">Fecha aproximada</label><input id="report-date" type="date" value="' + escapeHtml(state.report.date || "") + '"></div><div class="form-field"><label for="report-time">Hora aproximada</label><input id="report-time" type="time" value="' + escapeHtml(state.report.time || "") + '"></div></div>',
      '<div class="form-field"><label for="report-what">Que ocurrio</label><textarea id="report-what" maxlength="500" placeholder="Describe el hecho sin secretos ni datos reales.">' + escapeHtml(state.report.whatHappened) + '</textarea></div>',
      '<fieldset class="check-group"><legend>Evidencias disponibles</legend><div class="checklist-grid">' + reportEvidenceOptions.map(function (item) { return checkbox("report-evidence", item, state.report.evidences.indexOf(item) !== -1, "check-card safe"); }).join("") + '</div></fieldset>',
      '<fieldset class="check-group"><legend>Acciones realizadas</legend><div class="checklist-grid">' + reportActionOptions.map(function (item) { return checkbox("report-action", item, state.report.actions.indexOf(item) !== -1, "check-card"); }).join("") + '</div></fieldset>',
      '<div class="form-two"><div class="form-field"><label for="report-channel">Canal de reporte</label>' + renderSelect("report-channel", reportChannels, state.report.channel) + '</div><div class="form-field"><label for="report-support">Apoyo solicitado</label><input id="report-support" maxlength="220" value="' + escapeHtml(state.report.support || "") + '" placeholder="Ejemplo: apoyo para recuperar la cuenta"></div></div>',
      '</div>',
      '<div class="safe-note">Validacion: no se guardan textos con contrasena, clave, codigo, token, PIN, CVV, tarjeta completa o documento completo.</div>',
      '<div id="activity-feedback">' + feedback + '</div>',
      actionNav(8, "save-report", "Guardar reporte", 10),
      '</section>'
    ].join("");
  }

  function renderRecovery() {
    var result = scoreRecovery();
    var feedback = state.completed.recovery ? feedbackHtml(result.score === 10 ? "correct" : result.score > 0 ? "partial" : "incorrect", result.unsafe ? "Seleccionaste una accion insegura. Puntaje: 0/10." : "Acciones correctas: " + result.safeCount + ". Puntaje: " + result.score + "/10.") : "";
    return [
      '<section class="screen">',
      '<span class="tag">Recuperacion - 10 puntos</span>',
      '<h2>Recuperacion inicial</h2>',
      '<p class="lead">Selecciona las acciones de recuperacion adecuadas para el caso. Evita acciones que expongan datos o empeoren el incidente.</p>',
      '<div class="checklist-grid">',
      recoveryOptions.map(function (item) { return checkbox("recovery", item.id, state.recovery.indexOf(item.id) !== -1, "check-card " + (item.safe ? "safe" : "insecure"), item.text + (item.safe ? " " : " ") + (item.safe ? '<span class="status-pill recovery">segura</span>' : '<span class="status-pill danger">insegura</span>')); }).join(""),
      '</div>',
      '<div id="activity-feedback">' + feedback + '</div>',
      actionNav(9, "save-recovery", "Calificar recuperacion", 11),
      '</section>'
    ].join("");
  }

  function renderLessons() {
    var score = scoreLessons();
    var feedback = state.completed.lessons ? feedbackHtml(score === 5 ? "correct" : score > 0 ? "partial" : "incorrect", "Lecciones seleccionadas: " + state.lessons.length + ". Puntaje: " + score + "/5.") : "";
    return [
      '<section class="screen">',
      '<span class="tag">Lecciones - 5 puntos</span>',
      '<h2>Lecciones aprendidas</h2>',
      '<p class="lead">Selecciona las lecciones que aplican al caso. Debes seleccionar minimo tres.</p>',
      '<div class="checklist-grid">',
      lessonOptions.map(function (item) { return checkbox("lesson", item, state.lessons.indexOf(item) !== -1, "check-card safe"); }).join(""),
      '</div>',
      '<div id="activity-feedback">' + feedback + '</div>',
      actionNav(10, "save-lessons", "Guardar lecciones", 12),
      '</section>'
    ].join("");
  }

  function renderImprovement() {
    var score = scoreImprovement();
    var feedback = state.completed.improvement ? feedbackHtml(score === 5 ? "correct" : score > 0 ? "partial" : "incorrect", "Plan guardado. Puntaje: " + score + "/5.") : "";
    return [
      '<section class="screen">',
      '<span class="tag">Plan de mejora - 5 puntos</span>',
      '<h2>Plan de mejora</h2>',
      '<p class="lead">Define tres acciones concretas para evitar que el incidente se repita. Una accion de mejora debe tener verbo, objeto y fecha.</p>',
      '<div class="plan-table">',
      [0, 1, 2].map(function (index) {
        var item = state.improvement[index] || {};
        return '<div class="plan-action"><input id="plan-action-' + index + '" maxlength="180" value="' + escapeHtml(item.action || "") + '" placeholder="Accion de mejora ' + (index + 1) + '">' + renderSelect("plan-priority-" + index, ["", "Alta", "Media", "Baja"], item.priority || "") + '<input id="plan-date-' + index + '" type="date" value="' + escapeHtml(item.date || "") + '">' + renderSelect("plan-status-" + index, ["", "Pendiente", "En proceso", "Realizado"], item.status || "") + '</div>';
      }).join(""),
      '</div>',
      '<div class="safe-note">No escribas contrasenas, codigos, PIN, CVV ni datos sensibles en las acciones.</div>',
      '<div id="activity-feedback">' + feedback + '</div>',
      actionNav(11, "save-improvement", "Guardar plan", 13),
      '</section>'
    ].join("");
  }

  function renderHelpMaterial() {
    var blocks = [
      ["Que debe contener un informe de proteccion digital", "Caso, activos afectados, senales observadas, evidencias utiles, linea de tiempo, analisis, reporte seguro, acciones de recuperacion, lecciones y plan de mejora."],
      ["Como separar hechos, evidencias y conclusiones", "Un hecho describe algo ocurrido; una evidencia apoya el hecho; una conclusion inicial interpreta con base en lo disponible. No presentes sospechas como hechos confirmados."],
      ["Como redactar sin datos sensibles", "Puedes incluir fecha, hora, tipo de incidente, activo afectado, URL sospechosa, acciones realizadas y canal de reporte. No incluyas secretos de acceso ni datos que permitan mover dinero."],
      ["Como priorizar recuperacion", "Primero se detiene el dano: proteger correo, bloquear cuentas financieras si aplica, recuperar cuenta, cerrar sesiones, activar MFA, revisar recuperacion, avisar y documentar."],
      ["Como convertir lecciones en acciones", "Evita frases vagas como ser mas cuidadoso. Mejor: activar MFA en mi correo principal antes del viernes."],
      ["Como revisar el plan despues del incidente", "Confirma si la cuenta quedo recuperada, MFA activo, sesiones cerradas, apps revisadas, contactos avisados, reporte enviado y vulnerabilidad corregida."],
      ["Errores frecuentes", "Informe largo, secretos incluidos, hechos sin orden, sospechas como hechos, acciones sin fecha, falta de canal de reporte y ausencia de seguimiento."],
      ["Glosario", "Informe de proteccion digital, activo afectado, senal sospechosa, senal critica, evidencia util, dato sensible, linea de tiempo, reporte seguro, recuperacion, leccion aprendida, plan de mejora, MFA y control."]
    ];
    return [
      '<section class="screen">',
      '<span class="tag">Material opcional</span>',
      '<h2>Aprende mas: construir un informe de proteccion digital</h2>',
      '<p class="lead">Esta ayuda orienta la construccion del informe final. No es obligatoria para finalizar la OVA.</p>',
      '<div class="accordion">',
      blocks.map(function (block, index) {
        return '<details' + (index === 0 ? " open" : "") + '><summary>' + escapeHtml(block[0]) + '</summary><p>' + escapeHtml(block[1]) + '</p></details>';
      }).join(""),
      '<details><summary>Recursos externos opcionales</summary><div class="resource-grid">',
      resources.map(function (resource) {
        return '<div class="resource-card"><strong>' + escapeHtml(resource[1]) + '</strong><p>' + escapeHtml(resource[2]) + '</p><a href="' + escapeHtml(resource[0]) + '" target="_blank" rel="noopener">Ampliar conocimiento</a></div>';
      }).join(""),
      '</div><p class="muted">Estos enlaces son opcionales. El paquete SCORM funciona sin internet.</p></details>',
      '</div>',
      navigation(12, 14, "Volver", "Revisar informe"),
      '</section>'
    ].join("");
  }

  function renderReview() {
    var feedback = state.completed.review ? feedbackHtml(allReviewChecked() ? "correct" : "incorrect", allReviewChecked() ? "Revision completa. Puedes exportar o continuar." : "Marca todos los items de privacidad y seguridad para continuar.") : "";
    return [
      '<section class="screen">',
      '<span class="tag">Revision obligatoria</span>',
      '<h2>Revision final del informe</h2>',
      '<p class="lead">Revisa el resumen del informe antes de exportar o finalizar. La privacidad es obligatoria para continuar.</p>',
      renderReportSummary(),
      '<h3>Checklist final</h3>',
      '<div class="review-checks">',
      reviewItems.map(function (item, index) {
        return '<label><input type="checkbox" name="review" value="' + index + '"' + checked(Boolean(state.review[index])) + '> <span>' + escapeHtml(item) + '</span></label>';
      }).join(""),
      '</div>',
      '<div id="activity-feedback">' + feedback + '</div>',
      '<div class="button-row"><button class="button button-secondary" type="button" data-go="13">Volver</button><button class="button button-primary" type="button" id="save-review">Confirmar revision</button><button class="button button-ghost" type="button" data-go="15">Exportar informe</button></div>',
      '</section>'
    ].join("");
  }

  function renderExport() {
    return [
      '<section class="screen">',
      '<span class="tag">Exportacion opcional</span>',
      '<h2>Exportar informe final</h2>',
      '<p class="lead">Puedes descargar un archivo HTML local con el resumen del proyecto. La descarga es opcional y no requiere internet.</p>',
      '<div class="export-box"><h3>Informe de proteccion digital</h3><p>El archivo incluira caso, activos, senales, evidencias, linea de tiempo, analisis, reporte seguro, recuperacion, lecciones, plan de mejora y nota de privacidad.</p><button class="button" type="button" id="download-report">Descargar informe de proteccion digital en HTML</button></div>',
      state.downloaded ? '<div class="notice success"><strong>Informe generado.</strong> Si tu navegador lo permitio, el archivo se descargo como informe-proteccion-digital.html.</div>' : '',
      renderReportSummary(),
      navigation(14, 16, "Volver", "Ver resultados"),
      '</section>'
    ].join("");
  }

  function renderResults() {
    var status = projectComplete() ? (state.score >= 70 ? "Aprobado" : "Completado con recomendaciones") : "Incompleto";
    var style = "--score:" + state.score + "%";
    return [
      '<section class="screen">',
      '<span class="tag">Resultados</span>',
      '<h2>Resultados del proyecto integrador</h2>',
      '<div class="result-score" style="' + style + '"><span>' + state.score + '<small>/100</small></span></div>',
      '<p class="center"><strong>Estado sugerido:</strong> ' + escapeHtml(status) + '</p>',
      '<div class="metric-grid">',
      metric("Caso", scoreCase() + "/5"),
      metric("Activos", scoreAssets().score + "/10"),
      metric("Senales", scoreSignals().score + "/10"),
      metric("Evidencias", scoreEvidences().score + "/15"),
      metric("Linea de tiempo", scoreTimeline().score + "/15"),
      metric("Analisis", scoreAnalysis() + "/10"),
      metric("Reporte", scoreReport() + "/15"),
      metric("Recuperacion", scoreRecovery().score + "/10"),
      metric("Lecciones", scoreLessons() + "/5"),
      metric("Mejora", scoreImprovement() + "/5"),
      '</div>',
      '<div class="card-grid">',
      card("Caso seleccionado", selectedCaseTitle() || "Sin caso seleccionado."),
      card("Completitud", projectComplete() ? "El informe tiene las secciones obligatorias." : "Aun faltan secciones obligatorias."),
      card("Fortalezas", strengths().join(" ")),
      card("Por mejorar", improvements().join(" ")),
      '</div>',
      '<h3>Recomendaciones</h3>',
      listHtml(recommendations()),
      navigation(15, 17, "Volver", "Finalizar SCORM"),
      '</section>'
    ].join("");
  }

  function renderFinish() {
    var status = getCompletionStatus();
    var message = state.finished
      ? '<div class="notice success"><strong>Tu proyecto integrador fue registrado.</strong> Puedes cerrar esta ventana.</div>'
      : '<div class="notice"><strong>Ultimo paso:</strong> se enviara score.raw, lesson_status y progreso final al LMS.</div>';
    return [
      '<section class="screen center">',
      '<span class="tag">Finalizacion SCORM</span>',
      '<h2>Finalizacion de la OVA</h2>',
      '<p class="lead">Puntaje final: <strong>' + state.score + '/100</strong>. Estado SCORM: <strong>' + escapeHtml(status) + '</strong>.</p>',
      message,
      '<div class="card-grid">',
      card("passed", "Se envia si el puntaje es 70 o mas y el informe esta completo."),
      card("completed", "Se envia si el puntaje es menor de 70 pero el informe esta completo."),
      card("incomplete", "Se conserva si faltan secciones obligatorias del informe."),
      '</div>',
      '<div class="button-row"><button class="button button-secondary" type="button" data-go="16">Volver a resultados</button><button class="button button-primary" type="button" id="finish-ova">Finalizar OVA</button></div>',
      '</section>'
    ].join("");
  }

  function bindScreenEvents(index) {
    bindNavControls();
    if (index === 1) bindClick("check-diagnostic", checkDiagnostic);
    if (index === 3) bindClick("save-case", saveCase);
    if (index === 4) bindClick("save-assets", saveAssets);
    if (index === 5) bindClick("save-signals", saveSignals);
    if (index === 6) bindClick("save-evidences", saveEvidences);
    if (index === 7) bindClick("save-timeline", saveTimeline);
    if (index === 8) bindClick("save-analysis", saveAnalysis);
    if (index === 9) bindClick("save-report", saveReport);
    if (index === 10) bindClick("save-recovery", saveRecovery);
    if (index === 11) bindClick("save-lessons", saveLessons);
    if (index === 12) bindClick("save-improvement", saveImprovement);
    if (index === 14) bindClick("save-review", saveReview);
    if (index === 15) bindClick("download-report", downloadReport);
    if (index === 17) bindClick("finish-ova", finishOva);
  }

  function bindNavControls() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-go]"), function (button) {
      button.addEventListener("click", function () { goTo(Number(button.getAttribute("data-go"))); });
    });
  }

  function checkDiagnostic() {
    var selected = readRadio("diagnostic");
    if (selected === null) return setActivityFeedback("Selecciona una opcion.", "incorrect");
    state.diagnostic = selected;
    state.completed.diagnostic = true;
    saveProgress();
    render();
  }

  function saveCase() {
    var selected = readRadio("case-choice");
    if (selected === null) return setActivityFeedback("Selecciona un caso simulado.", "incorrect");
    state.selectedCase = selected;
    state.completed.case = true;
    saveProgress();
    render();
  }

  function saveAssets() {
    state.assets = readChecks("asset");
    state.completed.assets = true;
    saveProgress();
    render();
  }

  function saveSignals() {
    signalItems.forEach(function (item) { state.signals[item.id] = getValue("signal-" + item.id); });
    state.completed.signals = true;
    saveProgress();
    render();
  }

  function saveEvidences() {
    state.evidences = readChecks("evidence");
    state.completed.evidences = true;
    saveProgress();
    render();
  }

  function saveTimeline() {
    state.timeline = timelineEvents.map(function (_, index) { return getValue("timeline-" + index); });
    state.completed.timeline = true;
    saveProgress();
    render();
  }

  function saveAnalysis() {
    state.analysis.incidentType = getValue("analysis-type");
    state.analysis.threat = getValue("analysis-threat");
    state.analysis.vulnerability = getValue("analysis-vulnerability");
    state.analysis.impact = getValue("analysis-impact");
    state.completed.analysis = true;
    saveProgress();
    render();
  }

  function saveReport() {
    var what = getValue("report-what");
    var support = getValue("report-support");
    state.report.sensitiveFlag = hasSensitiveData(what) || hasSensitiveData(support);
    state.report.incidentType = getValue("report-type");
    state.report.affectedAsset = getValue("report-asset");
    state.report.date = getValue("report-date");
    state.report.time = getValue("report-time");
    state.report.evidences = readChecks("report-evidence");
    state.report.actions = readChecks("report-action");
    state.report.channel = getValue("report-channel");
    if (state.report.sensitiveFlag) {
      state.report.whatHappened = "";
      state.report.support = "";
    } else {
      state.report.whatHappened = what.slice(0, 500);
      state.report.support = support.slice(0, 220);
    }
    state.completed.report = true;
    saveProgress();
    render();
  }

  function saveRecovery() {
    state.recovery = readChecks("recovery");
    state.completed.recovery = true;
    saveProgress();
    render();
  }

  function saveLessons() {
    state.lessons = readChecks("lesson");
    state.completed.lessons = true;
    saveProgress();
    render();
  }

  function saveImprovement() {
    var items = [0, 1, 2].map(function (index) {
      var action = getValue("plan-action-" + index);
      return {
        action: hasSensitiveData(action) ? "" : action.slice(0, 180),
        priority: getValue("plan-priority-" + index),
        date: getValue("plan-date-" + index),
        status: getValue("plan-status-" + index)
      };
    });
    state.improvement = items;
    state.completed.improvement = true;
    saveProgress();
    render();
  }

  function saveReview() {
    state.review = {};
    readChecks("review").forEach(function (value) { state.review[value] = true; });
    state.completed.review = true;
    saveProgress();
    render();
  }

  function downloadReport() {
    var html = buildReportHtml();
    var blob = new Blob([html], { type: "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "informe-proteccion-digital.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    state.downloaded = true;
    saveProgress();
    render();
  }

  function finishOva() {
    state.score = calculateScore();
    state.finalStatus = getCompletionStatus();
    state.finished = true;
    Scorm.setScore(state.score);
    Scorm.setStatus(state.finalStatus);
    Scorm.setLocation(String(state.screen));
    Scorm.saveSuspendData(compactState());
    Scorm.commit();
    Scorm.finish();
    render();
  }

  function calculateScore() {
    return Math.max(0, Math.min(100,
      scoreCase() +
      scoreAssets().score +
      scoreSignals().score +
      scoreEvidences().score +
      scoreTimeline().score +
      scoreAnalysis() +
      scoreReport() +
      scoreRecovery().score +
      scoreLessons() +
      scoreImprovement()
    ));
  }

  function scoreCase() { return state.selectedCase ? 5 : 0; }

  function scoreAssets() {
    var selected = state.assets || [];
    var coherent = selected.filter(function (item) { return coherentAssets().indexOf(item) !== -1; }).length;
    var score = coherent >= 5 ? 10 : coherent >= 3 ? 7 : 0;
    return { coherent: coherent, score: score };
  }

  function scoreSignals() {
    var correct = 0;
    signalItems.forEach(function (item) {
      if (item.expected.indexOf(state.signals[item.id]) !== -1) correct += 1;
    });
    return { correct: correct, score: Math.round((correct * 2 / 16) * 10) };
  }

  function scoreEvidences() {
    var selected = state.evidences || [];
    var unsafe = selected.some(function (id) { return !evidenceById(id).safe; });
    var safeCount = selected.filter(function (id) { return evidenceById(id).safe; }).length;
    var score = unsafe ? 0 : safeCount >= 8 ? 15 : safeCount >= 5 ? 10 : 0;
    return { unsafe: unsafe, safeCount: safeCount, score: score };
  }

  function scoreTimeline() {
    var correct = 0;
    timelineEvents.forEach(function (event, index) {
      if (state.timeline[index] === event) correct += 1;
    });
    var score = correct >= 9 ? 15 : correct >= 7 ? 12 : correct >= 5 ? 8 : 0;
    return { correct: correct, score: score };
  }

  function scoreAnalysis() {
    var raw = 0;
    if (state.analysis.incidentType) raw += 3;
    if (state.analysis.threat) raw += 3;
    if (state.analysis.vulnerability) raw += 3;
    if (state.analysis.impact) raw += 3;
    return Math.round((raw / 12) * 10);
  }

  function scoreReport() {
    if (state.report.sensitiveFlag) return 0;
    var basics = state.report.incidentType && state.report.affectedAsset && state.report.date && state.report.whatHappened && state.report.channel ? 7 : 0;
    var evidence = state.report.evidences.length >= 2 && state.report.actions.length >= 1 ? 4 : 0;
    var safeText = state.report.whatHappened && !hasSensitiveData(state.report.whatHappened) && !hasSensitiveData(state.report.support) ? 4 : 0;
    return basics + evidence + safeText;
  }

  function scoreRecovery() {
    var selected = state.recovery || [];
    var unsafe = selected.some(function (id) { return !recoveryById(id).safe; });
    var safeCount = selected.filter(function (id) { return recoveryById(id).safe; }).length;
    var score = unsafe ? 0 : safeCount >= 5 ? 10 : safeCount >= 3 ? 7 : 0;
    return { unsafe: unsafe, safeCount: safeCount, score: score };
  }

  function scoreLessons() {
    return state.lessons.length >= 5 ? 5 : state.lessons.length >= 3 ? 4 : 0;
  }

  function scoreImprovement() {
    var complete = state.improvement.filter(function (item) { return item.action && item.priority && item.date && item.status; }).length;
    var hasHigh = state.improvement.some(function (item) { return item.priority === "Alta"; });
    var dates = state.improvement.every(function (item) { return Boolean(item.date); });
    return (complete >= 3 ? 3 : 0) + (hasHigh ? 1 : 0) + (dates ? 1 : 0);
  }

  function projectComplete() {
    return Boolean(
      state.selectedCase &&
      state.assets.length >= 3 &&
      scoreEvidences().safeCount >= 2 &&
      state.timeline.filter(Boolean).length >= 5 &&
      scoreReport() > 0 &&
      scoreRecovery().safeCount >= 3 &&
      state.lessons.length >= 3 &&
      scoreImprovement() >= 3 &&
      allReviewChecked()
    );
  }

  function getCompletionStatus() {
    if (!projectComplete()) return "incomplete";
    return state.score >= 70 ? "passed" : "completed";
  }

  function saveProgress() {
    state.score = calculateScore();
    Scorm.setScore(state.score);
    Scorm.setLocation(String(state.screen));
    Scorm.setStatus(state.finished ? state.finalStatus : "incomplete");
    Scorm.saveSuspendData(compactState());
    Scorm.commit();
  }

  function compactState() {
    return {
      screen: state.screen,
      score: state.score,
      selectedCase: state.selectedCase,
      assets: state.assets,
      signals: state.signals,
      evidences: safeEvidenceIds(),
      timeline: state.timeline,
      analysis: state.analysis,
      report: state.report,
      recovery: safeRecoveryIds(),
      lessons: state.lessons,
      improvement: state.improvement,
      review: state.review,
      downloaded: state.downloaded,
      completed: state.completed,
      finalStatus: state.finalStatus,
      finished: state.finished
    };
  }

  function coherentAssets() {
    var selected = cases.find(function (item) { return item.id === state.selectedCase; });
    if (!selected) return assets;
    return selected.assets;
  }

  function evidenceById(id) {
    return evidenceItems.find(function (item) { return item.id === id; }) || { text: id, safe: false };
  }

  function recoveryById(id) {
    return recoveryOptions.find(function (item) { return item.id === id; }) || { text: id, safe: false };
  }

  function safeEvidenceIds() {
    return state.evidences.filter(function (id) { return evidenceById(id).safe; });
  }

  function safeRecoveryIds() {
    return state.recovery.filter(function (id) { return recoveryById(id).safe; });
  }

  function selectedCaseTitle() {
    var selected = cases.find(function (item) { return item.id === state.selectedCase; });
    return selected ? selected.title : "";
  }

  function renderReportSummary() {
    return [
      '<div class="report-preview">',
      '<h3>Resumen del informe</h3>',
      '<div class="card-grid">',
      card("Caso seleccionado", selectedCaseTitle() || "Sin seleccionar."),
      card("Activos afectados", state.assets.length ? state.assets.join(", ") : "Sin registrar."),
      card("Senales clasificadas", signalSummary().join(" ")),
      card("Evidencias utiles", evidenceSummary().join(", ") || "Sin registrar."),
      card("Linea de tiempo", state.timeline.filter(Boolean).length + " eventos registrados."),
      card("Analisis", [state.analysis.incidentType, state.analysis.threat, state.analysis.vulnerability, state.analysis.impact].filter(Boolean).join(" / ") || "Sin registrar."),
      card("Reporte seguro", state.report.whatHappened || "Sin redactar."),
      card("Recuperacion", recoverySummary().join(", ") || "Sin registrar."),
      card("Lecciones", state.lessons.join(", ") || "Sin registrar."),
      card("Plan de mejora", state.improvement.map(function (item) { return item.action ? item.action + " (" + item.priority + ", " + item.date + ")" : ""; }).filter(Boolean).join(" | ") || "Sin registrar."),
      '</div>',
      '</div>'
    ].join("");
  }

  function signalSummary() {
    return signalItems.map(function (item) {
      return item.text + " -> " + (state.signals[item.id] || "sin clasificar") + ".";
    });
  }

  function evidenceSummary() {
    return safeEvidenceIds().map(function (id) { return evidenceById(id).text; });
  }

  function recoverySummary() {
    return safeRecoveryIds().map(function (id) { return recoveryById(id).text; });
  }

  function allReviewChecked() {
    return reviewItems.every(function (_, index) { return Boolean(state.review[index]); });
  }

  function buildReportHtml() {
    var date = new Date().toLocaleDateString("es-CO");
    return '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe de proteccion digital</title><style>body{font-family:Arial,sans-serif;line-height:1.5;margin:2rem;color:#17202a}h1,h2{color:#052e2b}.box{border:1px solid #c9d3df;border-radius:10px;padding:1rem;margin:1rem 0}.note{background:#f7fee7;border-left:5px solid #84cc16}</style></head><body>' +
      '<h1>Informe de proteccion digital</h1><p><strong>Fecha:</strong> ' + escapeHtml(date) + '</p>' +
      sectionHtml("Caso seleccionado", selectedCaseTitle()) +
      sectionHtml("Activos afectados", listHtmlPlain(state.assets)) +
      sectionHtml("Senales clasificadas", listHtmlPlain(signalSummary())) +
      sectionHtml("Evidencias utiles", listHtmlPlain(evidenceSummary())) +
      sectionHtml("Linea de tiempo", listHtmlPlain(state.timeline.filter(Boolean))) +
      sectionHtml("Analisis del incidente", listHtmlPlain([state.analysis.incidentType, state.analysis.threat, state.analysis.vulnerability, state.analysis.impact].filter(Boolean))) +
      sectionHtml("Reporte seguro", escapeHtml(state.report.whatHappened)) +
      sectionHtml("Acciones de recuperacion", listHtmlPlain(recoverySummary())) +
      sectionHtml("Lecciones aprendidas", listHtmlPlain(state.lessons)) +
      sectionHtml("Plan de mejora", listHtmlPlain(state.improvement.map(function (item) { return item.action ? item.action + " - " + item.priority + " - " + item.date + " - " + item.status : ""; }).filter(Boolean))) +
      '<div class="box note"><strong>Nota de privacidad:</strong> este informe fue construido con un caso simulado y no debe incluir contrasenas, codigos, PIN, CVV, documentos completos ni datos personales innecesarios.</div>' +
      '</body></html>';
  }

  function sectionHtml(title, body) {
    return '<div class="box"><h2>' + escapeHtml(title) + '</h2><div>' + (body || "Sin registrar.") + '</div></div>';
  }

  function listHtmlPlain(items) {
    if (!items || !items.length) return "Sin registrar.";
    return '<ul>' + items.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join("") + '</ul>';
  }

  function strengths() {
    var list = [];
    if (scoreEvidences().score === 15) list.push("Seleccionaste evidencias utiles sin datos sensibles.");
    if (scoreTimeline().score >= 12) list.push("La linea de tiempo tiene buen orden.");
    if (scoreReport() >= 11) list.push("El reporte es claro y seguro.");
    if (scoreImprovement() >= 4) list.push("El plan de mejora tiene acciones concretas.");
    return list.length ? list : ["Ya tienes una base para construir el informe."];
  }

  function improvements() {
    var list = [];
    if (scoreAssets().score < 10) list.push("Revisa si faltan activos afectados.");
    if (scoreSignals().score < 10) list.push("Repasa la diferencia entre senal sospechosa y critica.");
    if (scoreRecovery().score < 10) list.push("Fortalece la seleccion de acciones de recuperacion.");
    if (!allReviewChecked()) list.push("Completa el checklist de privacidad antes de finalizar.");
    return list.length ? list : ["Mantener seguimiento en la fecha definida."];
  }

  function recommendations() {
    return [
      "Revisa alertas de seguridad.",
      "No ingreses credenciales desde enlaces.",
      "Conserva evidencias utiles.",
      "No incluyas datos sensibles.",
      "Construye linea de tiempo.",
      "Reporta por canales oficiales.",
      "Recupera cuentas revisando sesiones y MFA.",
      "Avisa a contactos afectados.",
      "Registra lecciones aprendidas.",
      "Revisa tu plan de mejora en la fecha definida."
    ];
  }

  function goTo(index) {
    state.screen = Math.max(0, Math.min(totalScreens - 1, index));
    saveProgress();
    render();
  }

  function navigation(prev, next, prevLabel, nextLabel) {
    return '<div class="button-row"><button class="button button-secondary" type="button" data-go="' + prev + '">' + escapeHtml(prevLabel) + '</button><button class="button button-primary" type="button" data-go="' + next + '">' + escapeHtml(nextLabel) + '</button></div>';
  }

  function actionNav(prev, actionId, actionLabel, next) {
    return '<div class="button-row"><button class="button button-secondary" type="button" data-go="' + prev + '">Volver</button><button class="button button-primary" type="button" id="' + actionId + '">' + escapeHtml(actionLabel) + '</button><button class="button button-ghost" type="button" data-go="' + next + '">Continuar</button></div>';
  }

  function routeCard(number, title, body) {
    return '<div class="card"><span class="status-pill">' + number + '</span><h3>' + escapeHtml(title) + '</h3><p>' + escapeHtml(body) + '</p></div>';
  }

  function card(title, body) {
    return '<div class="card"><h3>' + escapeHtml(title) + '</h3><p>' + escapeHtml(body) + '</p></div>';
  }

  function metric(label, value) {
    return '<div class="metric"><strong>' + escapeHtml(value) + '</strong><span>' + escapeHtml(label) + '</span></div>';
  }

  function listHtml(items) {
    return '<ul>' + items.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join("") + '</ul>';
  }

  function renderSelect(id, options, value) {
    return '<select id="' + escapeHtml(id) + '">' + options.map(function (option) {
      var label = option || "Selecciona...";
      return '<option value="' + escapeHtml(option) + '"' + (option === value ? " selected" : "") + '>' + escapeHtml(label) + '</option>';
    }).join("") + '</select>';
  }

  function checkbox(name, value, isChecked, className, labelHtml) {
    var label = labelHtml || escapeHtml(value);
    return '<label class="' + className + '"><input type="checkbox" name="' + name + '" value="' + escapeHtml(value) + '"' + checked(isChecked) + '> <span>' + label + '</span></label>';
  }

  function diagnosticOption(value, label) {
    return '<label class="option"><input type="radio" name="diagnostic" value="' + value + '"' + checked(state.diagnostic === value) + '> <span>' + escapeHtml(label) + '</span></label>';
  }

  function feedbackHtml(type, message) {
    return '<div class="feedback ' + type + '" role="status">' + escapeHtml(message) + '</div>';
  }

  function setActivityFeedback(message, type) {
    var box = document.getElementById("activity-feedback");
    if (box) box.innerHTML = feedbackHtml(type, message);
  }

  function hasSensitiveData(textValue) {
    var normalized = normalizeText(textValue);
    return sensitiveWords.some(function (word) {
      if (word === "pin" || word === "cvv") return new RegExp("\\b" + word + "\\b", "i").test(normalized);
      return normalized.indexOf(word) !== -1;
    });
  }

  function normalizeText(textValue) {
    return String(textValue || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function getValue(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function readRadio(name) {
    var checkedInput = document.querySelector('input[name="' + name + '"]:checked');
    if (!checkedInput) return null;
    var value = checkedInput.value;
    var numeric = Number(value);
    return value !== "" && !Number.isNaN(numeric) ? numeric : value;
  }

  function readChecks(name) {
    return Array.prototype.map.call(document.querySelectorAll('input[name="' + name + '"]:checked'), function (input) { return input.value; });
  }

  function checked(condition) { return condition ? " checked" : ""; }

  function bindClick(id, handler) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", handler);
  }

  function toggleHelp(show) {
    var panel = document.getElementById("help-panel");
    if (panel) panel.classList.toggle("hidden", !show);
  }

  function toggleReset(show) {
    var panel = document.getElementById("confirm-dialog");
    if (panel) panel.classList.toggle("hidden", !show);
  }

  function text(id, value) {
    var element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  initialize();
}());
