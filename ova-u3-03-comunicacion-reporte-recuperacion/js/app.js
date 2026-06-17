(function () {
  "use strict";

  var totalScreens = 18;
  var app = document.getElementById("app");

  var defaultState = {
    screen: 0,
    score: 0,
    answers: {
      diagnostic: null,
      case: null,
      mini: {},
      reflection: null,
      channels: {},
      message: {
        choice: null,
        custom: "",
        sensitiveFlag: false
      },
      recoveryOrder: [],
      lessons: {
        asset: "",
        vulnerability: "",
        control: "",
        action: "",
        reviewDate: "",
        rawScore: 0,
        convertedScore: 0
      },
      quiz: {}
    },
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
    "documento",
    "cedula"
  ];

  var diagnosticQuestion = {
    q: "Si tu red social fue tomada y estan enviando mensajes falsos a tus contactos, que comunicacion seria mas segura?",
    options: [
      "Publicar tu contrasena para que otros vean que fue robada.",
      "Avisar por otro canal que la cuenta esta comprometida y pedir que no respondan mensajes sospechosos.",
      "Compartir el codigo de recuperacion para que alguien ayude.",
      "No decir nada a nadie."
    ],
    correct: 1,
    correctFeedback: "Correcto. Avisar por otro canal ayuda a proteger a tus contactos sin exponer datos sensibles.",
    incorrectFeedback: "Nunca se deben compartir contrasenas ni codigos. No avisar puede permitir que mas personas sean enganadas."
  };

  var caseQuestion = {
    q: "Cual deberia ser una de las primeras comunicaciones seguras de Andres?",
    options: [
      "Avisar a sus clientes por otro canal que la cuenta esta comprometida y que no realicen pagos por mensajes recientes.",
      "Enviar su contrasena a todos para demostrar que fue robada.",
      "Publicar codigos de recuperacion.",
      "Borrar todo sin reportar."
    ],
    correct: 0,
    correctFeedback: "Correcto. Cuando hay riesgo para terceros, se debe alertar por otro canal y evitar que mas personas caigan.",
    incorrectFeedback: "No se deben compartir contrasenas, codigos ni borrar evidencias sin reportar."
  };

  var miniQuestions = {
    3: {
      id: "alertar-clientes",
      q: "Si una cuenta de negocio esta enviando mensajes falsos a clientes, que se debe hacer con los clientes?",
      options: ["Alertarlos por otro canal.", "Enviarles la contrasena.", "Pedirles que ignoren todo sin explicar.", "Compartirles codigos de recuperacion."],
      correct: 0
    },
    4: {
      id: "banco-canal",
      q: "Si detectas un movimiento bancario no reconocido, a quien debes reportar primero?",
      options: ["Al banco o billetera digital por canal oficial.", "A un perfil desconocido en redes.", "A quien envio el SMS sospechoso.", "A ningun canal."],
      correct: 0
    },
    5: {
      id: "dato-reporte",
      q: "Que dato si puede incluirse en un reporte?",
      options: ["Fecha y hora aproximada.", "Contrasena.", "PIN bancario.", "Codigo SMS."],
      correct: 0
    },
    6: {
      id: "eliminar-reporte",
      q: "Cual elemento debe eliminarse de un reporte antes de enviarlo?",
      options: ["URL sospechosa.", "Fecha aproximada.", "Codigo de verificacion.", "Canal afectado."],
      correct: 2
    },
    7: {
      id: "recuperacion-correo",
      q: "Despues de recuperar un correo comprometido, que revision adicional es importante?",
      options: ["Revisar reglas de reenvio, sesiones y recuperacion.", "Compartir la nueva clave.", "Desactivar MFA.", "Borrar todas las alertas sin mirar."],
      correct: 0
    },
    8: {
      id: "canal-aviso",
      q: "Que canal es mas seguro para avisar si la red social afectada esta tomada?",
      options: ["La misma cuenta comprometida.", "Otro canal confiable, como llamada, correo alterno o WhatsApp verificado.", "El chat del atacante.", "Un enlace recibido por SMS."],
      correct: 1
    }
  };

  var reflectionQuestion = {
    q: "Cual es una buena leccion aprendida despues de controlar un incidente?",
    options: [
      "Activar MFA y no reutilizar contrasenas.",
      "Compartir codigos para recibir ayuda.",
      "Ignorar alertas.",
      "No reportar por verguenza."
    ],
    correct: 0,
    correctFeedback: "Muy bien. Una leccion util conecta la causa con un control concreto.",
    incorrectFeedback: "La recuperacion mejora cuando se corrige la causa y se evita compartir secretos."
  };

  var channelCases = [
    { id: "bank", text: "Transferencia no reconocida.", correct: "Banco o billetera digital por canal oficial." },
    { id: "email", text: "Correo institucional comprometido.", correct: "Area de TI o soporte institucional." },
    { id: "social", text: "Red social del emprendimiento tomada.", correct: "Plataforma y clientes afectados por otro canal." },
    { id: "phone", text: "Celular robado con cuentas abiertas.", correct: "Operador movil, banco, plataformas criticas y autoridad si aplica." },
    { id: "malware", text: "Malware en computador laboral.", correct: "Area de TI o soporte autorizado." },
    { id: "identity", text: "Suplantacion de identidad en redes.", correct: "Plataforma afectada y autoridad si hay fraude o dano." }
  ];

  var channelOptions = [
    "",
    "Banco o billetera digital por canal oficial.",
    "Area de TI o soporte institucional.",
    "Plataforma y clientes afectados por otro canal.",
    "Operador movil, banco, plataformas criticas y autoridad si aplica.",
    "Area de TI o soporte autorizado.",
    "Plataforma afectada y autoridad si hay fraude o dano."
  ];

  var messageOptions = [
    "Mi cuenta fue comprometida. Si recibiste mensajes recientes pidiendo dinero, datos o enlaces, no respondas ni realices pagos. Estoy reportando el caso por canales oficiales.",
    "Me hackearon. Mi contrasena era Camisetas2024, ayudenme a entrar.",
    "Si les llega un codigo, mandenmelo para recuperar la cuenta.",
    "No paso nada, sigan respondiendo los mensajes de mi cuenta."
  ];

  var recoveryActions = [
    { id: "password", text: "Cambiar contrasena desde dispositivo seguro." },
    { id: "mfa", text: "Activar MFA." },
    { id: "sessions", text: "Cerrar sesiones desconocidas." },
    { id: "recovery", text: "Revisar correo y telefono de recuperacion." },
    { id: "apps", text: "Revisar apps conectadas." },
    { id: "messages", text: "Revisar mensajes o publicaciones enviados." },
    { id: "contacts", text: "Avisar a contactos afectados." },
    { id: "lessons", text: "Registrar lecciones aprendidas." }
  ];

  var lessonAssets = ["", "Correo", "Red social", "Banco o billetera digital", "Celular", "Computador", "Nube", "Plataforma academica o laboral", "Otro"];
  var lessonVulnerabilities = ["", "Contrasena repetida", "Sin MFA", "Recuperacion desactualizada", "Sin bloqueo", "Sin copia de seguridad", "Permisos excesivos", "Clic en enlace sospechoso", "Otro"];
  var lessonControls = ["", "Activar MFA", "Cambiar contrasena por una unica", "Revisar sesiones", "Actualizar recuperacion", "Activar bloqueo", "Activar respaldo", "Revisar permisos", "Educar a contactos/familia/equipo", "Otro"];

  var quiz = [
    { id: "q1", q: "Que significa reportar un incidente?", options: ["Informarlo formalmente a la plataforma, banco, soporte o entidad correspondiente.", "Publicar contrasenas.", "Compartir codigos SMS.", "Borrar todo sin guardar evidencia."], correct: 0 },
    { id: "q2", q: "Que dato no debe incluirse en un reporte?", options: ["Fecha aproximada.", "Tipo de incidente.", "Codigo de verificacion.", "Activo afectado."], correct: 2 },
    { id: "q3", q: "Que debe hacerse despues de recuperar una cuenta comprometida?", options: ["Revisar sesiones, MFA, recuperacion y apps conectadas.", "Compartir la nueva contrasena.", "Ignorar contactos afectados.", "Desactivar alertas."], correct: 0 },
    { id: "q4", q: "Cual es una forma segura de avisar a contactos?", options: ["Usar un canal alterno y pedir que no respondan mensajes sospechosos.", "Enviar el PIN bancario.", "Mandar el codigo de recuperacion.", "Usar la cuenta comprometida sin revisar."], correct: 0 },
    { id: "q5", q: "Que busca el aprendizaje posterior al incidente?", options: ["Identificar que fallo y que control aplicar para evitar reincidencia.", "Culpar a la victima.", "Eliminar toda evidencia.", "Repetir la misma contrasena."], correct: 0 }
  ];

  var resources = [
    ["https://grow.google/certificates/cybersecurity/", "Google Cybersecurity Certificate", "Ruta para profundizar en riesgos, amenazas, vulnerabilidades, deteccion y respuesta."],
    ["https://www.coursera.org/learn/detection-and-response", "Sound the Alarm: Detection and Response", "Curso de Google/Coursera para ampliar deteccion, documentacion, investigacion basica y respuesta."],
    ["https://www.nist.gov/cyberframework", "NIST Cybersecurity Framework 2.0", "Marco para ordenar resultados de gobernar, identificar, proteger, detectar, responder y recuperar."],
    ["https://www.cisa.gov/report", "CISA - Report a cyber issue", "Referencia internacional para comprender canales de reporte y respuesta."],
    ["https://myaccount.google.com/intro/security-checkup", "Google Security Checkup", "Herramienta practica para revisar eventos recientes, dispositivos y protecciones de cuenta."],
    ["https://www.incibe.es/incibe-cert/incidentes/respuesta-incidentes", "INCIBE - Respuesta a incidentes", "Recurso en espanol sobre respuesta y notificacion de incidentes digitales."],
    ["https://caivirtual.policia.gov.co/", "Centro Cibernetico Policial", "Canal colombiano para orientacion, denuncia y prevencion del cibercrimen."]
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
    base.answers.mini = Object.assign({}, cloneDefault().answers.mini, base.answers.mini || {});
    base.answers.channels = Object.assign({}, cloneDefault().answers.channels, base.answers.channels || {});
    base.answers.message = Object.assign(cloneDefault().answers.message, base.answers.message || {});
    base.answers.recoveryOrder = Array.isArray(base.answers.recoveryOrder) ? base.answers.recoveryOrder : [];
    base.answers.lessons = Object.assign(cloneDefault().answers.lessons, base.answers.lessons || {});
    base.answers.quiz = Object.assign({}, cloneDefault().answers.quiz, base.answers.quiz || {});
    base.completed = Object.assign({}, saved.completed || {});
    base.finalStatus = saved.finalStatus || "incomplete";
    base.finished = Boolean(saved.finished);
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
      case 2: return renderCase();
      case 3: return renderCommunicateReport();
      case 4: return renderChannels();
      case 5: return renderClearReport();
      case 6: return renderNoSensitiveData();
      case 7: return renderRecovery();
      case 8: return renderSafeNotice();
      case 9: return renderLessons();
      case 10: return renderActivityChannels();
      case 11: return renderActivityMessage();
      case 12: return renderActivityRecoveryOrder();
      case 13: return renderActivityLessons();
      case 14: return renderHelpMaterial();
      case 15: return renderQuiz();
      case 16: return renderResults();
      case 17: return renderFinish();
      default: return renderWelcome();
    }
  }

  function renderWelcome() {
    return [
      '<section class="screen hero">',
      '<span class="tag">OVA 3 - Unidad 3</span>',
      '<h2>Bienvenido a la OVA 3 de la Unidad 3</h2>',
      '<p class="lead">En la OVA anterior aprendiste a organizar evidencias y construir una linea de tiempo. Ahora aprenderas que hacer con esa informacion.</p>',
      '<p class="subtitle">Despues de detectar y organizar evidencias, el siguiente paso es comunicar, reportar, recuperar y aprender.</p>',
      '<div class="brand-strip"><span>Universidad de Cartagena - CTEV</span><img src="assets/logo-unicartagena-ctev.png" alt="Logo Universidad de Cartagena y CTEV"></div>',
      '<div class="visual-lesson"><div>',
      '<p>Cuando ocurre un incidente digital, comunicar bien es tan importante como actuar rapido. Una comunicacion clara ayuda a solicitar apoyo, reportar a la plataforma correcta, alertar a contactos afectados, evitar que otras personas caigan, recuperar cuentas o servicios y registrar aprendizajes para mejorar.</p>',
      '<div class="card-grid">',
      card("Solicitar apoyo", "Pedir ayuda al canal adecuado sin exponer secretos."),
      card("Reportar", "Acudir a plataformas, bancos, soporte o areas de TI por canales oficiales."),
      card("Recuperar", "Volver a entrar no basta: hay que cerrar sesiones, revisar permisos y corregir la causa."),
      card("Aprender", "Registrar que paso, que fallo y que control se aplicara despues.")
      + '</div>',
      '</div><img class="lesson-image" src="assets/escudo-candado.png" alt="Escudo con candado digital"></div>',
      '<div class="button-row"><span></span><button class="button button-primary" type="button" data-go="1">Iniciar OVA</button></div>',
      '</section>'
    ].join("");
  }

  function renderObjective() {
    return [
      '<section class="screen">',
      '<span class="tag">Orientacion pedagogica</span>',
      '<h2>Objetivo de aprendizaje</h2>',
      '<p class="lead">En esta OVA aprenderas a comunicar y reportar incidentes digitales de forma clara y segura, aplicar acciones basicas de recuperacion y registrar aprendizajes para fortalecer tu proteccion digital.</p>',
      '<h3>Al finalizar podras:</h3>',
      '<ol>',
      '<li>Diferenciar comunicar, reportar, denunciar y alertar.</li>',
      '<li>Elegir el canal adecuado segun el incidente.</li>',
      '<li>Redactar un reporte breve sin exponer datos sensibles.</li>',
      '<li>Avisar a contactos afectados sin generar panico.</li>',
      '<li>Aplicar pasos basicos de recuperacion.</li>',
      '<li>Registrar lecciones aprendidas y acciones de mejora.</li>',
      '</ol>',
      '<h3>Ruta de aprendizaje</h3>',
      '<div class="card-grid learning-route">',
      routeCard(1, "Caso inicial", "La cuenta tomada del emprendimiento."),
      routeCard(2, "Conceptos", "Comunicar, reportar, denunciar y alertar."),
      routeCard(3, "Canales", "A quien acudir segun el incidente."),
      routeCard(4, "Reporte seguro", "Que incluir y que retirar."),
      routeCard(5, "Recuperacion", "Revisiones despues de volver a entrar."),
      routeCard(6, "Aviso", "Mensaje seguro a contactos afectados."),
      routeCard(7, "Lecciones", "Aprendizaje posterior al incidente."),
      routeCard(8, "Resultado", "Recomendaciones y cierre SCORM."),
      '</div>',
      '<div class="diagnostic-box">',
      '<h3>Pregunta diagnostica no calificable</h3>',
      renderQuestion("diagnostic", diagnosticQuestion, state.answers.diagnostic, state.completed.diagnostic, "Revisar respuesta", false),
      '</div>',
      navigation(0, 2, "Volver", "Continuar al caso inicial"),
      '</section>'
    ].join("");
  }

  function renderCase() {
    return [
      '<section class="screen">',
      '<span class="tag">Caso inicial - 10 puntos</span>',
      '<h2>Caso: La cuenta del emprendimiento fue tomada</h2>',
      '<div class="visual-lesson"><div>',
      '<p>Andres vende camisetas personalizadas por Instagram. Un dia recibe un mensaje falso de soporte y entrega sus credenciales. Horas despues pierde acceso a la cuenta.</p>',
      '<p>Los atacantes publican promociones falsas y escriben a sus clientes pidiendo transferencias para separar pedidos.</p>',
      '<div class="notice alert"><strong>Evidencias disponibles:</strong><ul><li>Captura del mensaje falso.</li><li>URL recibida.</li><li>Hora aproximada del acceso.</li><li>Captura de publicaciones falsas.</li><li>Lista de clientes que reportaron mensajes sospechosos.</li></ul></div>',
      '</div><img class="lesson-image" src="assets/celular-alerta-real.png" alt="Celular con alerta digital simulada"></div>',
      renderQuestion("case", caseQuestion, state.answers.case, state.completed.case, "Responder caso", true),
      navigation(1, 3, "Volver", "Continuar"),
      '</section>'
    ].join("");
  }

  function renderCommunicateReport() {
    return [
      '<section class="screen">',
      '<span class="tag">Conceptos clave</span>',
      '<h2>No todas las comunicaciones son iguales</h2>',
      '<p class="lead">Un incidente mal comunicado puede generar confusion. Un incidente bien reportado facilita la recuperacion, reduce el dano y ayuda a prevenir que vuelva a ocurrir.</p>',
      '<div class="status-grid">',
      statusCard("Comunicar", "Informar de forma clara a una persona, equipo, familiar, cliente o responsable. Ejemplo: avisar a un familiar que no responda mensajes desde una cuenta comprometida.", "level-safe"),
      statusCard("Reportar", "Informar formalmente a una plataforma, banco, soporte tecnico o area institucional. Ejemplo: reportar una cuenta tomada a la plataforma.", "level-low"),
      statusCard("Denunciar", "Poner en conocimiento de una autoridad un hecho que puede ser delito. Ejemplo: fraude, extorsion, suplantacion o perdida economica.", "level-high"),
      statusCard("Alertar", "Advertir rapidamente a personas que podrian verse afectadas. Ejemplo: avisar a clientes que no hagan transferencias solicitadas desde la cuenta comprometida.", "level-medium"),
      '</div>',
      renderMiniQuestion(3),
      navigation(2, 4, "Volver", "Continuar"),
      '</section>'
    ].join("");
  }

  function renderChannels() {
    var rows = [
      ["Cuenta bancaria o billetera digital afectada", "Banco, billetera digital, linea antifraude y autoridad competente si hubo perdida economica.", "Bloquear movimientos, tarjeta o cuenta."],
      ["Correo institucional comprometido", "Area de TI, mesa de ayuda, coordinador o responsable institucional.", "Cambiar contrasena, cerrar sesiones, activar MFA y revisar reglas."],
      ["Red social tomada", "Plataforma, contactos afectados y clientes si es cuenta comercial.", "Recuperar cuenta, activar MFA y avisar por otro canal."],
      ["Celular perdido o robado", "Operador movil, banco, plataformas criticas y autoridad si aplica.", "Bloquear SIM, cerrar sesiones, localizar o borrar remotamente."],
      ["Malware en equipo laboral o academico", "Area de TI, soporte autorizado y responsable del proceso.", "Desconectar de internet y evitar manipular mas el equipo."]
    ];
    return [
      '<section class="screen">',
      '<span class="tag">Canales adecuados</span>',
      '<h2>A quien debo acudir?</h2>',
      '<p class="lead">No todos los incidentes se reportan al mismo lugar. La primera accion debe proteger el activo afectado y evitar que el dano crezca.</p>',
      '<table class="channel-table"><thead><tr><th>Caso</th><th>Comunicar o reportar a</th><th>Accion inicial</th></tr></thead><tbody>',
      rows.map(function (row) { return '<tr><td><strong>' + escapeHtml(row[0]) + '</strong></td><td>' + escapeHtml(row[1]) + '</td><td>' + escapeHtml(row[2]) + '</td></tr>'; }).join(""),
      '</tbody></table>',
      renderMiniQuestion(4),
      navigation(3, 5, "Volver", "Continuar"),
      '</section>'
    ].join("");
  }

  function renderClearReport() {
    return [
      '<section class="screen">',
      '<span class="tag">Reporte claro</span>',
      '<h2>Reporte claro y seguro</h2>',
      '<p class="lead">Un buen reporte debe ser breve, ordenado y util. Debe explicar el hecho sin revelar secretos.</p>',
      '<div class="card-grid">',
      card("1. Tipo de incidente", "Phishing, cuenta comprometida, fraude, malware, suplantacion u otro."),
      card("2. Activo afectado", "Cuenta, servicio, dispositivo, red social, correo, banco o nube."),
      card("3. Tiempo aproximado", "Fecha y hora aproximada ayudan a revisar registros."),
      card("4. Que ocurrio", "Descripcion breve y concreta, sin suposiciones innecesarias."),
      card("5. Evidencias", "Capturas, URL, remitentes, alertas o registros disponibles."),
      card("6. Acciones y apoyo", "Que hiciste, estado actual y que ayuda solicitas."),
      '</div>',
      '<div class="report-template"><strong>Ejemplo seguro:</strong><code>El 15 de junio aproximadamente a las 8:30 p. m. recibi un mensaje que decia ser de soporte de una red social. Ingrese al enlace y luego perdi acceso a la cuenta. Guarde captura del mensaje, URL y publicaciones no autorizadas. Cambie contrasenas relacionadas desde otro dispositivo y solicito apoyo para recuperar la cuenta.</code></div>',
      renderMiniQuestion(5),
      navigation(4, 6, "Volver", "Continuar"),
      '</section>'
    ].join("");
  }

  function renderNoSensitiveData() {
    return [
      '<section class="screen">',
      '<span class="tag">No compartir secretos</span>',
      '<h2>Datos que nunca debes incluir</h2>',
      '<div class="notice risk"><strong>Un reporte debe ayudar a resolver el incidente, no crear uno nuevo.</strong></div>',
      '<div class="visual-lesson"><div>',
      '<ul class="no-share-list">',
      '<li>Contrasenas.</li>',
      '<li>Codigos SMS.</li>',
      '<li>Tokens.</li>',
      '<li>PIN.</li>',
      '<li>CVV.</li>',
      '<li>Numero completo de tarjeta.</li>',
      '<li>Fotos de documentos sin ocultar datos.</li>',
      '<li>Codigos de recuperacion.</li>',
      '<li>QR de autenticacion.</li>',
      '<li>Datos de terceros sin autorizacion.</li>',
      '<li>Capturas bancarias con informacion completa.</li>',
      '</ul>',
      '</div><img class="lesson-image" src="assets/candado-digital.png" alt="Candado digital de proteccion de datos"></div>',
      renderMiniQuestion(6),
      navigation(5, 7, "Volver", "Continuar"),
      '</section>'
    ].join("");
  }

  function renderRecovery() {
    var items = [
      "Cambiar contrasena desde dispositivo seguro.",
      "Activar MFA.",
      "Cerrar sesiones desconocidas.",
      "Revisar correo y telefono de recuperacion.",
      "Revisar reglas de reenvio.",
      "Revisar apps conectadas.",
      "Revisar dispositivos vinculados.",
      "Revisar publicaciones o mensajes enviados.",
      "Avisar a contactos afectados.",
      "Revisar movimientos financieros.",
      "Restaurar archivos si fueron eliminados.",
      "Cambiar contrasenas en cuentas relacionadas.",
      "Revisar permisos de archivos en la nube.",
      "Registrar acciones realizadas."
    ];
    return [
      '<section class="screen">',
      '<span class="tag">Recuperacion inicial</span>',
      '<h2>Recuperar no es solo volver a entrar</h2>',
      '<p class="lead">Despues de recuperar una cuenta, se deben revisar configuraciones para evitar que el atacante conserve acceso.</p>',
      '<div class="recovery-grid">',
      items.map(function (item, index) { return '<div class="recovery-item"><span>' + (index + 1) + '</span><span>' + escapeHtml(item) + '</span></div>'; }).join(""),
      '</div>',
      renderMiniQuestion(7),
      navigation(6, 8, "Volver", "Continuar"),
      '</section>'
    ].join("");
  }

  function renderSafeNotice() {
    return [
      '<section class="screen">',
      '<span class="tag">Aviso a terceros</span>',
      '<h2>Como avisar sin generar panico</h2>',
      '<p class="lead">Si una cuenta fue usada para enviar mensajes falsos, pedir dinero o publicar contenido enganoso, es importante avisar a contactos afectados por un canal alterno confiable.</p>',
      '<div class="card-grid">',
      card("Breve", "No hace falta narrar todo. Indica lo necesario para proteger a otros."),
      card("Accionable", "Pide no responder, no pagar y no abrir enlaces recientes."),
      card("Seguro", "No incluyas contrasenas, codigos, PIN ni datos privados."),
      card("Verificable", "Usa llamada, correo alterno, WhatsApp verificado u otro canal confiable."),
      '</div>',
      '<div class="message-preview"><strong>Ejemplo:</strong><div class="message-bubble">Hola. Mi cuenta de Instagram fue comprometida. Si recibiste mensajes recientes pidiendo dinero, datos o pagos, no respondas ni abras enlaces. Estoy reportando el caso y recuperando el acceso. Gracias por avisarme si recibiste algo extrano.<small>Mensaje simulado</small></div></div>',
      renderMiniQuestion(8),
      navigation(7, 9, "Volver", "Continuar"),
      '</section>'
    ].join("");
  }

  function renderLessons() {
    return [
      '<section class="screen">',
      '<span class="tag">Aprendizaje posterior</span>',
      '<h2>Despues del incidente: aprender para mejorar</h2>',
      '<p class="lead">Cuando el incidente este controlado, se debe revisar que permitio que ocurriera y que debe cambiar.</p>',
      '<div class="card-grid">',
      card("Que activo fue afectado?", "Correo, red social, banco, celular, computador, nube o plataforma institucional."),
      card("Que vulnerabilidad existia?", "Sin MFA, recuperacion desactualizada, contrasena repetida, permisos excesivos u otro punto debil."),
      card("Que control se aplicara?", "Activar MFA, cambiar contrasena, cerrar sesiones, revisar permisos o educar al equipo."),
      card("Cuando se revisara?", "Una fecha concreta evita que el aprendizaje quede en buenas intenciones."),
      '</div>',
      '<div class="notice success"><strong>Ejemplo:</strong> cuenta de Instagram tomada. Vulnerabilidad: sin MFA y contrasena repetida. Control: activar MFA, usar contrasena unica, revisar recuperacion y educar al equipo o familia.</div>',
      '<h3>Pregunta de refuerzo no calificable</h3>',
      renderQuestion("reflection", reflectionQuestion, state.answers.reflection, state.completed.reflection, "Revisar respuesta", false),
      navigation(8, 10, "Volver", "Ir a actividad 1"),
      '</section>'
    ].join("");
  }

  function renderActivityChannels() {
    var feedback = "";
    if (state.completed.channels) {
      var result = scoreChannels();
      feedback = feedbackHtml(result.score === 15 ? "correct" : result.score > 0 ? "partial" : "incorrect", "Resultado: " + result.correct + " de 6 relaciones correctas. Puntaje actividad: " + result.score + "/15.");
    }
    return [
      '<section class="screen">',
      '<span class="tag">Actividad 1 - 15 puntos</span>',
      '<h2>Actividad 1: A quien reporto?</h2>',
      '<p class="lead">Relaciona cada caso con el canal adecuado. Recuerda priorizar canales oficiales y proteccion de terceros afectados.</p>',
      '<div class="select-list">',
      channelCases.map(function (item) {
        return '<div class="select-row"><label for="channel-' + item.id + '">' + escapeHtml(item.text) + '</label>' + renderSelect("channel-" + item.id, channelOptions, state.answers.channels[item.id] || "") + '</div>';
      }).join(""),
      '</div>',
      '<div id="activity-feedback">' + feedback + '</div>',
      '<div class="button-row"><button class="button button-secondary" type="button" data-go="9">Volver</button><button class="button button-primary" type="button" id="check-channels">Calificar actividad</button><button class="button button-ghost" type="button" data-go="11">Continuar</button></div>',
      '</section>'
    ].join("");
  }

  function renderActivityMessage() {
    var selected = state.answers.message.choice;
    var custom = state.answers.message.custom || "";
    var feedback = "";
    if (state.completed.message) {
      var score = scoreMessage();
      feedback = feedbackHtml(score === 10 ? "correct" : "incorrect", score === 10 ? "Mensaje base correcto. Puntaje actividad: 10/10." : "El mensaje elegido no es seguro. Puntaje actividad: 0/10.");
    }
    if (state.answers.message.sensitiveFlag) {
      feedback += feedbackHtml("incorrect", "Evita incluir datos sensibles. El mensaje debe alertar sin revelar contrasenas, codigos ni informacion privada.");
    }
    return [
      '<section class="screen">',
      '<span class="tag">Actividad 2 - 10 puntos</span>',
      '<h2>Actividad 2: Comunicacion segura</h2>',
      '<p class="lead">Selecciona el mensaje mas adecuado para avisar a contactos sobre una cuenta comprometida. Luego, si quieres, redacta un mensaje simulado.</p>',
      '<fieldset class="question"><legend>Mensaje mas adecuado</legend>',
      messageOptions.map(function (option, index) {
        return '<label class="option"><input type="radio" name="message-choice" value="' + index + '"' + checked(selected === index) + '> <span>' + escapeHtml(option) + '</span></label>';
      }).join(""),
      '</fieldset>',
      '<div class="form-field"><label for="custom-message">Mensaje simulado opcional (maximo 300 caracteres)</label><textarea id="custom-message" maxlength="300" placeholder="Ejemplo: Mi cuenta fue comprometida. No respondas mensajes recientes ni abras enlaces.">' + escapeHtml(custom) + '</textarea></div>',
      '<div class="safe-note">Validacion: la OVA no guardara textos que contengan contrasena, clave, codigo, token, PIN o CVV.</div>',
      '<div id="activity-feedback">' + feedback + '</div>',
      '<div class="button-row"><button class="button button-secondary" type="button" data-go="10">Volver</button><button class="button button-primary" type="button" id="check-message">Calificar mensaje</button><button class="button button-ghost" type="button" data-go="12">Continuar</button></div>',
      '</section>'
    ].join("");
  }

  function renderActivityRecoveryOrder() {
    var feedback = "";
    if (state.completed.recoveryOrder) {
      var result = scoreRecoveryOrder();
      feedback = feedbackHtml(result.score === 20 ? "correct" : result.score > 0 ? "partial" : "incorrect", "Acciones bien ubicadas: " + result.correct + " de 8. Puntaje actividad: " + result.score + "/20.");
    }
    return [
      '<section class="screen">',
      '<span class="tag">Actividad 3 - 20 puntos</span>',
      '<h2>Actividad 3: Ordena la recuperacion</h2>',
      '<p class="lead">Ordena las acciones despues de recuperar una cuenta comprometida. Piensa primero en cortar acceso, luego revisar configuraciones y finalmente comunicar y aprender.</p>',
      '<div class="order-list">',
      recoveryActions.map(function (_, index) {
        var selected = state.answers.recoveryOrder[index] || "";
        return '<div class="order-row"><strong>Paso ' + (index + 1) + '</strong><span>Selecciona la accion que corresponde</span>' + renderSelect("order-" + index, ["", "Cambiar contrasena desde dispositivo seguro.", "Activar MFA.", "Cerrar sesiones desconocidas.", "Revisar correo y telefono de recuperacion.", "Revisar apps conectadas.", "Revisar mensajes o publicaciones enviados.", "Avisar a contactos afectados.", "Registrar lecciones aprendidas."], selected) + '</div>';
      }).join(""),
      '</div>',
      '<div id="activity-feedback">' + feedback + '</div>',
      '<div class="button-row"><button class="button button-secondary" type="button" data-go="11">Volver</button><button class="button button-primary" type="button" id="check-order">Calificar orden</button><button class="button button-ghost" type="button" data-go="13">Continuar</button></div>',
      '</section>'
    ].join("");
  }

  function renderActivityLessons() {
    var l = state.answers.lessons;
    var feedback = "";
    if (state.completed.lessons) {
      feedback = feedbackHtml(l.convertedScore === 15 ? "correct" : "partial", "Reflexion registrada. Puntaje actividad: " + l.convertedScore + "/15.");
    }
    if (state.completed.lessonsError) {
      feedback = feedbackHtml("incorrect", String(state.completed.lessonsError));
    }
    return [
      '<section class="screen">',
      '<span class="tag">Actividad 4 - 15 puntos</span>',
      '<h2>Actividad 4: Aprender para no repetir</h2>',
      '<p class="lead">Completa una reflexion simulada. No escribas datos reales ni informacion sensible.</p>',
      '<div class="lesson-plan">',
      '<div class="form-field"><label for="lesson-asset">Activo afectado</label>' + renderSelect("lesson-asset", lessonAssets, l.asset) + '</div>',
      '<div class="form-field"><label for="lesson-vulnerability">Vulnerabilidad identificada</label>' + renderSelect("lesson-vulnerability", lessonVulnerabilities, l.vulnerability) + '</div>',
      '<div class="form-field"><label for="lesson-control">Control que aplicare</label>' + renderSelect("lesson-control", lessonControls, l.control) + '</div>',
      '<div class="form-field"><label for="lesson-date">Fecha de revision</label><input id="lesson-date" type="date" value="' + escapeHtml(l.reviewDate || "") + '"></div>',
      '</div>',
      '<div class="form-field"><label for="lesson-action">Accion concreta (maximo 200 caracteres)</label><textarea id="lesson-action" maxlength="200" placeholder="Ejemplo: Activar MFA hoy y revisar sesiones el viernes.">' + escapeHtml(l.action || "") + '</textarea></div>',
      '<div class="safe-note">La accion concreta debe ser segura: no escribas contrasenas, codigos, PIN, CVV ni datos reales.</div>',
      '<div id="activity-feedback">' + feedback + '</div>',
      '<div class="button-row"><button class="button button-secondary" type="button" data-go="12">Volver</button><button class="button button-primary" type="button" id="check-lessons">Guardar leccion</button><button class="button button-ghost" type="button" data-go="14">Continuar</button></div>',
      '</section>'
    ].join("");
  }

  function renderHelpMaterial() {
    var helpBlocks = [
      ["Comunicar sin exponer", "Informa lo necesario para que otros actuen: que ocurrio, que cuenta o servicio fue afectado y que accion solicitas. Evita secretos, acusaciones sin evidencia y canales no oficiales."],
      ["Diferencia entre comunicar, reportar, denunciar y alertar", "Comunicar informa a quien necesita saberlo. Reportar formaliza ante plataforma, banco o soporte. Denunciar acude a una autoridad. Alertar advierte rapido a personas que podrian verse afectadas."],
      ["Como redactar un reporte claro", "Incluye tipo de incidente, activo afectado, fecha y hora aproximada, que ocurrio, evidencias disponibles, acciones realizadas, estado actual y apoyo solicitado."],
      ["Canales segun tipo de incidente", "Fraude financiero: banco o billetera. Correo institucional: TI. Red social tomada: plataforma y contactos. Celular robado: operador, bancos y plataformas criticas. Malware laboral: TI o soporte autorizado."],
      ["Recuperacion segura de cuentas", "Cambiar contrasena es solo el inicio. Revisa sesiones, dispositivos, recuperacion, reglas de reenvio, apps conectadas, permisos de nube y mensajes enviados."],
      ["Aviso a contactos afectados", "Usa canal alterno, explica que la cuenta estuvo comprometida y pide no responder, no pagar ni abrir enlaces recientes."],
      ["Lecciones aprendidas", "Identifica activo, amenaza, vulnerabilidad, impacto, evidencia util, accion que funciono, accion faltante, control a aplicar, habito que cambiara y fecha de revision."],
      ["Errores frecuentes", "Reportar con secretos, avisar desde la cuenta comprometida, no cerrar sesiones, no alertar a contactos, no registrar acciones y no corregir la vulnerabilidad."],
      ["Glosario", "Comunicar, reportar, denunciar, alertar, recuperacion, canal oficial, contacto afectado, MFA, sesion activa, reenvio automatico, app conectada, leccion aprendida, control correctivo y reincidencia."]
    ];
    return [
      '<section class="screen">',
      '<span class="tag">Material opcional</span>',
      '<h2>Aprende mas: comunicar, recuperar y aprender</h2>',
      '<p class="lead">Esta seccion no es obligatoria para finalizar la OVA. Sirve para ampliar conocimiento sin recargar la ruta principal.</p>',
      '<div class="accordion">',
      helpBlocks.map(function (block, index) {
        return '<details' + (index === 0 ? " open" : "") + '><summary>' + escapeHtml(block[0]) + '</summary><p>' + escapeHtml(block[1]) + '</p></details>';
      }).join(""),
      '<details><summary>Recursos externos opcionales</summary><div class="resource-grid">',
      resources.map(function (resource) {
        return '<div class="resource-card"><strong>' + escapeHtml(resource[1]) + '</strong><p>' + escapeHtml(resource[2]) + '</p><a href="' + escapeHtml(resource[0]) + '" target="_blank" rel="noopener">Ampliar conocimiento</a></div>';
      }).join(""),
      '</div><p class="muted">Estos enlaces son opcionales. El paquete SCORM funciona sin internet.</p></details>',
      '</div>',
      navigation(13, 15, "Volver", "Ir a evaluacion final"),
      '</section>'
    ].join("");
  }

  function renderQuiz() {
    var done = state.completed.quiz;
    var score = quizScore();
    return [
      '<section class="screen">',
      '<span class="tag">Evaluacion final - referencia de aprendizaje</span>',
      '<h2>Evaluacion final</h2>',
      '<p class="lead">Responde estas cinco preguntas para comprobar tu comprension. Esta evaluacion se muestra en resultados, pero el puntaje SCORM principal mantiene la ponderacion de actividades indicada para la OVA.</p>',
      quiz.map(function (item, index) {
        var selected = state.answers.quiz[item.id];
        return '<fieldset class="question"><legend>' + (index + 1) + '. ' + escapeHtml(item.q) + '</legend>' + item.options.map(function (option, optionIndex) {
          return '<label class="option"><input type="radio" name="quiz-' + item.id + '" value="' + optionIndex + '"' + checked(selected === optionIndex) + '> <span>' + escapeHtml(option) + '</span></label>';
        }).join("") + '</fieldset>';
      }).join(""),
      '<div id="quiz-live">' + (done ? feedbackHtml(score === 20 ? "correct" : "partial", "Resultado evaluacion final: " + score + "/20.") : "") + '</div>',
      '<div class="button-row"><button class="button button-secondary" type="button" data-go="14">Volver</button><button class="button button-primary" type="button" id="check-quiz">Calificar evaluacion</button><button class="button button-ghost" type="button" data-go="16">Ver resultados</button></div>',
      '</section>'
    ].join("");
  }

  function renderResults() {
    var status = mandatoryComplete() ? (state.score >= 70 ? "Aprobado" : "Completado con recomendaciones") : "Incompleto";
    var style = "--score:" + state.score + "%";
    var channelResult = scoreChannels();
    var orderResult = scoreRecoveryOrder();
    return [
      '<section class="screen">',
      '<span class="tag">Resultados</span>',
      '<h2>Resultado y recomendaciones</h2>',
      '<div class="result-score" style="' + style + '"><span>' + state.score + '<small>/100</small></span></div>',
      '<p class="center"><strong>Estado sugerido:</strong> ' + escapeHtml(status) + '</p>',
      '<div class="metric-grid">',
      metric("Caso inicial", state.answers.case === caseQuestion.correct ? "10/10" : "0/10"),
      metric("Mini preguntas", miniScore() + "/30"),
      metric("Canales", channelResult.score + "/15"),
      metric("Mensaje seguro", scoreMessage() + "/10"),
      metric("Recuperacion", orderResult.score + "/20"),
      metric("Lecciones", scoreLessons().converted + "/15"),
      '</div>',
      '<div class="card-grid">',
      '<div class="card"><h3>Canales seleccionados</h3>' + listHtml(channelSummary()) + '</div>',
      '<div class="card"><h3>Mensaje seguro construido</h3><p>' + escapeHtml(safeMessageSummary()) + '</p></div>',
      '<div class="card"><h3>Orden de recuperacion</h3>' + listHtml(orderSummary()) + '</div>',
      '<div class="card"><h3>Lecciones aprendidas</h3>' + listHtml(lessonSummary()) + '</div>',
      '</div>',
      '<h3>Recomendaciones personalizadas</h3>',
      listHtml(recommendations()),
      navigation(15, 17, "Volver", "Finalizar SCORM"),
      '</section>'
    ].join("");
  }

  function renderFinish() {
    var finishedMessage = state.finished
      ? '<div class="notice success"><strong>Tu avance fue registrado.</strong> Puedes cerrar esta ventana.</div>'
      : '<div class="notice"><strong>Ultimo paso:</strong> pulsa el boton para enviar score.raw, lesson_status y progreso final al LMS.</div>';
    var statusText = getCompletionStatus();
    return [
      '<section class="screen center">',
      '<span class="tag">Finalizacion SCORM</span>',
      '<h2>Finalizacion de la OVA</h2>',
      '<p class="lead">Puntaje final: <strong>' + state.score + '/100</strong>. Estado SCORM que se enviara: <strong>' + escapeHtml(statusText) + '</strong>.</p>',
      finishedMessage,
      '<div class="card-grid">',
      card("passed", "Se envia si el puntaje es 70 o mas y las actividades obligatorias estan completas."),
      card("completed", "Se envia si el puntaje es menor de 70 pero las actividades obligatorias estan completas."),
      card("incomplete", "Se conserva si faltan actividades obligatorias."),
      '</div>',
      '<div class="button-row"><button class="button button-secondary" type="button" data-go="16">Volver a resultados</button><button class="button button-primary" type="button" id="finish-ova">Finalizar OVA</button></div>',
      '</section>'
    ].join("");
  }

  function renderMiniQuestion(screenIndex) {
    var q = miniQuestions[screenIndex];
    var selected = state.answers.mini[q.id];
    var done = state.completed["mini-" + q.id];
    return renderQuestion("mini-" + q.id, q, selected, done, "Responder mini pregunta", true);
  }

  function renderQuestion(key, q, selected, done, buttonText, scored) {
    var correct = selected === q.correct;
    var feedback = "";
    if (done) {
      if (q.correctFeedback || q.incorrectFeedback) {
        feedback = feedbackHtml(correct ? "correct" : "incorrect", correct ? q.correctFeedback : q.incorrectFeedback);
      } else {
        feedback = feedbackHtml(correct ? "correct" : "incorrect", correct ? "Correcto. Esta es la opcion mas segura." : "Revisa la retroalimentacion y vuelve a intentarlo si lo necesitas.");
      }
    }
    return [
      '<fieldset class="question">',
      '<legend>' + escapeHtml(q.q) + (scored ? ' <span class="muted">(pregunta calificable)</span>' : "") + '</legend>',
      q.options.map(function (option, index) {
        return '<label class="option"><input type="radio" name="question-' + key + '" value="' + index + '"' + checked(selected === index) + '> <span>' + escapeHtml(option) + '</span></label>';
      }).join(""),
      '<button class="button button-primary" type="button" data-check-question="' + key + '">' + escapeHtml(buttonText) + '</button>',
      feedback,
      '</fieldset>'
    ].join("");
  }

  function bindScreenEvents(index) {
    bindNavControls();
    bindQuestionControls();
    if (index === 10) bindClick("check-channels", checkChannels);
    if (index === 11) bindClick("check-message", checkMessage);
    if (index === 12) bindClick("check-order", checkOrder);
    if (index === 13) bindClick("check-lessons", checkLessons);
    if (index === 15) bindClick("check-quiz", checkQuiz);
    if (index === 17) bindClick("finish-ova", finishOva);
  }

  function bindNavControls() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-go]"), function (button) {
      button.addEventListener("click", function () { goTo(Number(button.getAttribute("data-go"))); });
    });
  }

  function bindQuestionControls() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-check-question]"), function (button) {
      button.addEventListener("click", function () {
        var key = button.getAttribute("data-check-question");
        var selected = readRadio("question-" + key);
        if (selected === null) {
          inlineFeedback(button, "Selecciona una opcion para revisar la respuesta.", "incorrect");
          return;
        }
        if (key === "diagnostic") {
          state.answers.diagnostic = selected;
          state.completed.diagnostic = true;
        } else if (key === "case") {
          state.answers.case = selected;
          state.completed.case = true;
        } else if (key === "reflection") {
          state.answers.reflection = selected;
          state.completed.reflection = true;
        } else if (key.indexOf("mini-") === 0) {
          var id = key.replace("mini-", "");
          state.answers.mini[id] = selected;
          state.completed["mini-" + id] = true;
        }
        saveProgress();
        render();
      });
    });
  }

  function checkChannels() {
    channelCases.forEach(function (item) {
      var select = document.getElementById("channel-" + item.id);
      state.answers.channels[item.id] = select ? select.value : "";
    });
    state.completed.channels = true;
    saveProgress();
    render();
  }

  function checkMessage() {
    var selected = readRadio("message-choice");
    var custom = document.getElementById("custom-message") ? document.getElementById("custom-message").value.trim() : "";
    state.answers.message.sensitiveFlag = false;
    if (selected === null) {
      setActivityFeedback("Selecciona un mensaje base antes de calificar.", "incorrect");
      return;
    }
    if (custom && hasSensitiveData(custom)) {
      state.answers.message.sensitiveFlag = true;
      state.answers.message.custom = "";
      saveProgress();
      render();
      return;
    }
    state.answers.message.choice = selected;
    state.answers.message.custom = custom.slice(0, 300);
    state.completed.message = true;
    saveProgress();
    render();
  }

  function checkOrder() {
    state.answers.recoveryOrder = recoveryActions.map(function (_, index) {
      var select = document.getElementById("order-" + index);
      return select ? select.value : "";
    });
    state.completed.recoveryOrder = true;
    saveProgress();
    render();
  }

  function checkLessons() {
    var l = {
      asset: getValue("lesson-asset"),
      vulnerability: getValue("lesson-vulnerability"),
      control: getValue("lesson-control"),
      reviewDate: getValue("lesson-date"),
      action: document.getElementById("lesson-action") ? document.getElementById("lesson-action").value.trim().slice(0, 200) : "",
      rawScore: 0,
      convertedScore: 0
    };
    delete state.completed.lessonsError;
    if (!l.asset || !l.vulnerability || !l.control || !l.reviewDate) {
      state.completed.lessonsError = "Selecciona activo, vulnerabilidad, control y fecha de revision.";
      state.answers.lessons = Object.assign(state.answers.lessons, l);
      saveProgress();
      render();
      return;
    }
    if (!l.action) {
      state.completed.lessonsError = "Escribe una accion concreta segura.";
      state.answers.lessons = Object.assign(state.answers.lessons, l);
      saveProgress();
      render();
      return;
    }
    if (hasSensitiveData(l.action)) {
      state.completed.lessonsError = "La accion contiene datos sensibles. No se guardo ese texto.";
      l.action = "";
      state.answers.lessons = Object.assign(state.answers.lessons, l);
      saveProgress();
      render();
      return;
    }
    var score = scoreLessons(l);
    l.rawScore = score.raw;
    l.convertedScore = score.converted;
    state.answers.lessons = l;
    state.completed.lessons = true;
    saveProgress();
    render();
  }

  function checkQuiz() {
    var complete = true;
    quiz.forEach(function (item) {
      var selected = readRadio("quiz-" + item.id);
      if (selected === null) complete = false;
      else state.answers.quiz[item.id] = selected;
    });
    if (!complete) {
      var live = document.getElementById("quiz-live");
      if (live) live.innerHTML = feedbackHtml("incorrect", "Responde todas las preguntas de la evaluacion final.");
      return;
    }
    state.completed.quiz = true;
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
      miniScore() +
      scoreChannels().score +
      scoreMessage() +
      scoreRecoveryOrder().score +
      scoreLessons().converted
    ));
  }

  function scoreCase() { return state.answers.case === caseQuestion.correct ? 10 : 0; }

  function miniScore() {
    var score = 0;
    Object.keys(miniQuestions).forEach(function (screenIndex) {
      var q = miniQuestions[screenIndex];
      if (state.answers.mini[q.id] === q.correct) score += 5;
    });
    return Math.min(30, score);
  }

  function scoreChannels() {
    var correct = 0;
    channelCases.forEach(function (item) {
      if (state.answers.channels[item.id] === item.correct) correct += 1;
    });
    return { correct: correct, score: Math.round((correct * 3 / 18) * 15) };
  }

  function scoreMessage() { return state.answers.message.choice === 0 ? 10 : 0; }

  function scoreRecoveryOrder() {
    var correct = 0;
    recoveryActions.forEach(function (item, index) {
      if (state.answers.recoveryOrder[index] === item.text) correct += 1;
    });
    var score = 0;
    if (correct === 8) score = 20;
    else if (correct >= 6) score = 15;
    else if (correct >= 4) score = 10;
    return { correct: correct, score: score };
  }

  function scoreLessons(data) {
    var l = data || state.answers.lessons;
    var raw = 0;
    if (l.asset) raw += 3;
    if (l.vulnerability) raw += 3;
    if (l.control) raw += 4;
    if (l.action && !hasSensitiveData(l.action)) raw += 5;
    if (l.reviewDate) raw += 5;
    return { raw: raw, converted: Math.round((raw / 20) * 15) };
  }

  function quizScore() {
    return quiz.reduce(function (total, item) {
      return total + (state.answers.quiz[item.id] === item.correct ? 4 : 0);
    }, 0);
  }

  function mandatoryComplete() {
    var minisDone = Object.keys(miniQuestions).every(function (screenIndex) {
      return Boolean(state.completed["mini-" + miniQuestions[screenIndex].id]);
    });
    return Boolean(
      state.completed.case &&
      minisDone &&
      state.completed.channels &&
      state.completed.message &&
      state.completed.recoveryOrder &&
      state.completed.lessons
    );
  }

  function getCompletionStatus() {
    if (!mandatoryComplete()) return "incomplete";
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
      answers: state.answers,
      selectedReportChannel: state.answers.channels,
      communicationMessage: safeMessageSummary(),
      recoveryActions: state.answers.recoveryOrder,
      lessonsLearned: state.answers.lessons,
      improvementPlan: {
        control: state.answers.lessons.control,
        action: state.answers.lessons.action,
        reviewDate: state.answers.lessons.reviewDate
      },
      completed: state.completed,
      finalStatus: state.finalStatus,
      finished: state.finished
    };
  }

  function channelSummary() {
    return channelCases.map(function (item) {
      var selected = state.answers.channels[item.id] || "Sin seleccionar";
      var mark = selected === item.correct ? "Correcto" : "Revisar";
      return item.text + " -> " + selected + " (" + mark + ")";
    });
  }

  function safeMessageSummary() {
    if (state.answers.message.custom) return state.answers.message.custom;
    if (state.answers.message.choice === 0) return messageOptions[0];
    if (state.answers.message.choice !== null && state.answers.message.choice !== undefined) {
      return "Se selecciono un mensaje no seguro. Revisa la actividad de comunicacion.";
    }
    return "Aun no registras un mensaje seguro.";
  }

  function orderSummary() {
    if (!state.answers.recoveryOrder.length) return ["Aun no registras un orden de recuperacion."];
    return state.answers.recoveryOrder.map(function (item, index) { return "Paso " + (index + 1) + ": " + (item || "Sin seleccionar"); });
  }

  function lessonSummary() {
    var l = state.answers.lessons;
    if (!l.asset && !l.vulnerability && !l.control && !l.action) return ["Aun no registras lecciones aprendidas."];
    return [
      "Activo afectado: " + (l.asset || "Sin seleccionar"),
      "Vulnerabilidad: " + (l.vulnerability || "Sin seleccionar"),
      "Control: " + (l.control || "Sin seleccionar"),
      "Accion: " + (l.action || "Sin registrar"),
      "Fecha de revision: " + (l.reviewDate || "Sin fecha")
    ];
  }

  function recommendations() {
    var list = [
      "Reporta por canales oficiales.",
      "No incluyas contrasenas ni codigos.",
      "Usa mensajes breves y claros.",
      "Avisa a contactos por otro canal si la cuenta esta comprometida.",
      "Cambia contrasena desde dispositivo seguro.",
      "Activa MFA.",
      "Cierra sesiones desconocidas.",
      "Revisa recuperacion y apps conectadas.",
      "Documenta acciones realizadas.",
      "Registra lecciones aprendidas.",
      "Programa una revision posterior."
    ];
    if (scoreChannels().score < 15) list.unshift("Refuerza la seleccion del canal adecuado para cada incidente.");
    if (scoreRecoveryOrder().score < 20) list.unshift("Repasa el orden de recuperacion para cortar accesos antes de comunicar cierre.");
    if (scoreMessage() < 10) list.unshift("Vuelve a practicar mensajes de aviso que no expongan datos sensibles.");
    return list;
  }

  function goTo(index) {
    state.screen = Math.max(0, Math.min(totalScreens - 1, index));
    saveProgress();
    render();
  }

  function navigation(prev, next, prevLabel, nextLabel) {
    return '<div class="button-row"><button class="button button-secondary" type="button" data-go="' + prev + '">' + escapeHtml(prevLabel) + '</button><button class="button button-primary" type="button" data-go="' + next + '">' + escapeHtml(nextLabel) + '</button></div>';
  }

  function routeCard(number, title, body) {
    return '<div class="card"><span class="status-pill">' + number + '</span><h3>' + escapeHtml(title) + '</h3><p>' + escapeHtml(body) + '</p></div>';
  }

  function card(title, body) {
    return '<div class="card"><h3>' + escapeHtml(title) + '</h3><p>' + escapeHtml(body) + '</p></div>';
  }

  function statusCard(title, body, className) {
    return '<div class="status-card ' + className + '"><strong>' + escapeHtml(title) + '</strong><p>' + escapeHtml(body) + '</p></div>';
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

  function feedbackHtml(type, message) {
    return '<div class="feedback ' + type + '" role="status">' + escapeHtml(message) + '</div>';
  }

  function inlineFeedback(button, message, type) {
    var box = button.parentNode.querySelector(".feedback-live");
    if (!box) {
      box = document.createElement("div");
      box.className = "feedback-live";
      button.parentNode.appendChild(box);
    }
    box.innerHTML = feedbackHtml(type, message);
  }

  function setActivityFeedback(message, type) {
    var box = document.getElementById("activity-feedback");
    if (box) box.innerHTML = feedbackHtml(type, message);
  }

  function hasSensitiveData(textValue) {
    var normalized = normalizeText(textValue);
    return sensitiveWords.some(function (word) {
      if (word === "pin" || word === "cvv") {
        return new RegExp("\\b" + word + "\\b", "i").test(normalized);
      }
      return normalized.indexOf(word) !== -1;
    });
  }

  function normalizeText(textValue) {
    return String(textValue || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function getValue(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function readRadio(name) {
    var checkedInput = document.querySelector('input[name="' + name + '"]:checked');
    return checkedInput ? Number(checkedInput.value) : null;
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
