(function () {
  "use strict";

  var totalScreens = 17;
  var app = document.getElementById("app");

  var defaultState = {
    screen: 0,
    score: 0,
    answers: {
      diagnostic: null,
      case: null,
      mini: {},
      classify: {},
      timeline: {},
      decisions: {},
      folder: [],
      report: {
        type: "",
        asset: "",
        date: "",
        time: "",
        description: "",
        evidences: [],
        actions: [],
        sensitiveFlag: false
      },
      quiz: {}
    },
    completed: {},
    finalStatus: "incomplete",
    finished: false
  };
  var state = cloneDefault();

  var categories = ["Evidencia util", "Dato sensible", "Senal debil", "Senal critica"];
  var sensitiveWords = ["contrasena", "contraseña", "clave", "codigo", "código", "token", "pin", "cvv", "tarjeta completa", "cedula completa", "cédula completa"];

  var miniQuestions = {
    3: {
      id: "defensive-analysis",
      q: "Cual es el proposito principal del analisis defensivo basico?",
      options: ["Publicar el caso en redes sociales.", "Ordenar senales y evidencias para responder mejor.", "Guardar contrasenas en un reporte.", "Ignorar las alertas."],
      correct: 1
    },
    4: {
      id: "digital-evidence",
      q: "Cual de estos elementos es evidencia util y segura?",
      options: ["Captura del mensaje sospechoso con fecha y remitente.", "Contrasena actual.", "Codigo SMS recibido.", "PIN bancario."],
      correct: 0
    },
    5: {
      id: "critical-transfer",
      q: "Que categoria corresponde a transferencia bancaria que no reconozco?",
      options: ["Senal critica.", "Actividad normal.", "Dato que debe ignorarse.", "Contrasena segura."],
      correct: 0
    },
    6: {
      id: "timeline-data",
      q: "Que dato ayuda mas a ordenar una linea de tiempo?",
      options: ["Fecha y hora aproximada.", "Color del celular.", "Nombre de una cancion.", "Fondo de pantalla."],
      correct: 0
    },
    7: {
      id: "avoid-report",
      q: "Que se debe evitar al reportar un caso?",
      options: ["Incluir fecha y hora.", "Incluir capturas del mensaje.", "Incluir contrasenas o codigos.", "Incluir URL sospechosa."],
      correct: 2
    }
  };

  var evidenceItems = [
    { id: "ev1", text: "Captura de SMS sospechoso.", accepted: ["Evidencia util"] },
    { id: "ev2", text: "Codigo SMS de verificacion.", accepted: ["Dato sensible"] },
    { id: "ev3", text: "Inicio de sesion desde ciudad desconocida.", accepted: ["Senal debil"] },
    { id: "ev4", text: "Transferencia bancaria no reconocida.", accepted: ["Senal critica"] },
    { id: "ev5", text: "URL recibida en correo sospechoso.", accepted: ["Evidencia util"] },
    { id: "ev6", text: "Contrasena actual de la cuenta.", accepted: ["Dato sensible"] },
    { id: "ev7", text: "Contactos reciben mensajes que no enviaste.", accepted: ["Senal critica"] },
    { id: "ev8", text: "Perfil desconocido que ofrece soporte urgente.", accepted: ["Senal debil"] },
    { id: "ev9", text: "Captura de publicacion falsa desde tu red social.", accepted: ["Evidencia util", "Senal critica"] },
    { id: "ev10", text: "Numero desde el que llamaron.", accepted: ["Evidencia util"] }
  ];

  var timelineEvents = [
    "Sofia recibe mensaje falso de soporte.",
    "Sofia hace clic en el enlace.",
    "Sofia ingresa usuario y contrasena.",
    "Sofia pierde acceso a la cuenta.",
    "Los clientes reportan promociones falsas.",
    "Sofia toma captura del mensaje y de la URL.",
    "Sofia cambia contrasenas relacionadas desde un dispositivo seguro.",
    "Sofia reporta el caso a la plataforma."
  ];

  var decisionCases = [
    {
      id: "d1",
      title: "El usuario recibio una alerta de acceso desde una ciudad desconocida.",
      options: ["Ignorar siempre.", "Revisar actividad, cerrar sesiones desconocidas y cambiar contrasena si no reconoce el acceso.", "Compartir el codigo SMS.", "Borrar la alerta sin revisarla."],
      correct: 1
    },
    {
      id: "d2",
      title: "Una captura muestra una regla de reenvio desconocida en el correo.",
      options: ["Es posible evidencia de cuenta comprometida. Debe eliminarse, cambiar contrasena y revisar sesiones.", "No importa.", "Hay que crear mas reglas.", "Se debe publicar en redes."],
      correct: 0
    },
    {
      id: "d3",
      title: "El reporte contiene una contrasena escrita por el usuario.",
      options: ["Es correcto incluirla.", "Debe eliminarse del reporte porque es dato sensible.", "Debe enviarse a todos los contactos.", "Debe publicarse para pedir ayuda."],
      correct: 1
    },
    {
      id: "d4",
      title: "Una tienda virtual publico promociones falsas desde la cuenta del negocio.",
      options: ["Se debe avisar a clientes por otro canal y reportar a la plataforma.", "Se debe seguir vendiendo desde la cuenta comprometida.", "No se debe hacer nada.", "Se debe borrar todo sin documentar."],
      correct: 0
    },
    {
      id: "d5",
      title: "Hay una transferencia no reconocida.",
      options: ["Contactar al banco o billetera digital inmediatamente y conservar evidencia.", "Esperar varias semanas.", "Responder al SMS sospechoso.", "Compartir el PIN para validar."],
      correct: 0
    }
  ];

  var folderItems = [
    { id: "f1", name: "01_mensaje_sospechoso.png", safe: true },
    { id: "f2", name: "02_url_recibida.txt", safe: true },
    { id: "f3", name: "03_alerta_inicio_sesion.png", safe: true },
    { id: "f4", name: "04_publicacion_no_autorizada.png", safe: true },
    { id: "f5", name: "05_linea_tiempo.txt", safe: true },
    { id: "f6", name: "06_acciones_realizadas.txt", safe: true },
    { id: "f7", name: "contrasena_actual.txt", safe: false },
    { id: "f8", name: "codigo_sms.txt", safe: false },
    { id: "f9", name: "PIN_bancario.txt", safe: false },
    { id: "f10", name: "CVV_tarjeta.txt", safe: false },
    { id: "f11", name: "captura_con_datos_privados_sin_ocultar.png", safe: false }
  ];

  var reportTypes = ["", "Phishing ejecutado", "Cuenta comprometida", "Fraude financiero", "Suplantacion en red social", "Acceso no autorizado", "Malware sospechoso", "Otro"];
  var reportAssets = ["", "Correo", "Red social", "Banco o billetera digital", "Celular", "Computador", "Nube", "Plataforma academica o laboral", "Otro"];
  var reportEvidenceOptions = ["Captura de mensaje", "URL", "Remitente o numero", "Alerta de seguridad", "Registro de acceso", "Publicacion no autorizada", "Movimiento no reconocido", "Linea de tiempo", "Acciones realizadas"];
  var reportActionOptions = ["Cambie contrasena desde dispositivo seguro", "Active MFA", "Cerre sesiones desconocidas", "Reporte a la plataforma", "Reporte al banco", "Avise a contactos afectados", "Guarde evidencias", "Pedi apoyo tecnico"];

  var quiz = [
    { id: "q1", q: "Que es evidencia digital util?", options: ["Informacion que ayuda a entender o reportar un incidente sin exponer secretos.", "Una contrasena escrita en un archivo.", "Un codigo SMS compartido.", "Un PIN bancario."], correct: 0 },
    { id: "q2", q: "Que dato no debe incluirse en un reporte?", options: ["Fecha aproximada.", "URL sospechosa.", "Contrasena de la cuenta.", "Captura del mensaje."], correct: 2 },
    { id: "q3", q: "Para que sirve una linea de tiempo?", options: ["Para ordenar los hechos segun fecha y hora.", "Para guardar claves.", "Para borrar evidencias.", "Para compartir codigos."], correct: 0 },
    { id: "q4", q: "Cual es una senal critica?", options: ["Transferencia no reconocida.", "Inicio de sesion habitual.", "Compra que reconoces.", "Actualizacion oficial."], correct: 0 },
    { id: "q5", q: "Que debe hacerse antes de compartir una captura con soporte autorizado?", options: ["Revisar que no exponga datos sensibles innecesarios.", "Agregar la contrasena.", "Agregar el codigo SMS.", "Publicarla en redes."], correct: 0 }
  ];

  var resources = [
    ["https://grow.google/certificates/cybersecurity/", "Google Cybersecurity Certificate", "Ruta para profundizar en deteccion, respuesta, riesgos y herramientas."],
    ["https://www.coursera.org/learn/detection-and-response", "Sound the Alarm: Detection and Response", "Curso para ampliar deteccion, documentacion, investigacion basica y respuesta."],
    ["https://www.nist.gov/cyberframework", "NIST Cybersecurity Framework 2.0", "Marco para organizar identificar, proteger, detectar, responder y recuperar."],
    ["https://www.cisa.gov/resources-tools/resources/cyber-essentials", "CISA Cyber Essentials", "Guia practica para fortalecer controles basicos, preparacion y respuesta."],
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
    base.screen = typeof saved.screen === "number" ? saved.screen : base.screen;
    base.score = typeof saved.score === "number" ? saved.score : base.score;
    base.answers = Object.assign(base.answers, saved.answers || {});
    base.answers.mini = Object.assign({}, base.answers.mini || {});
    base.answers.classify = Object.assign({}, base.answers.classify || {});
    base.answers.timeline = Object.assign({}, base.answers.timeline || {});
    base.answers.decisions = Object.assign({}, base.answers.decisions || {});
    base.answers.folder = Array.isArray(base.answers.folder) ? base.answers.folder : [];
    base.answers.report = Object.assign(cloneDefault().answers.report, base.answers.report || {});
    base.answers.report.evidences = Array.isArray(base.answers.report.evidences) ? base.answers.report.evidences : [];
    base.answers.report.actions = Array.isArray(base.answers.report.actions) ? base.answers.report.actions : [];
    base.answers.quiz = Object.assign({}, base.answers.quiz || {});
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
      case 3: return renderDefensiveAnalysis();
      case 4: return renderDigitalEvidence();
      case 5: return renderEvidenceTypes();
      case 6: return renderTimelineConcept();
      case 7: return renderCommonErrors();
      case 8: return renderClassify();
      case 9: return renderTimelineActivity();
      case 10: return renderDecisions();
      case 11: return renderFolder();
      case 12: return renderReport();
      case 13: return renderHelpMaterial();
      case 14: return renderQuiz();
      case 15: return renderResults();
      case 16: return renderFinish();
      default: return renderWelcome();
    }
  }

  function renderWelcome() {
    return shell("Bienvenido a la OVA 2 de la Unidad 3",
      "Cuando algo ocurre, entender el orden de los hechos ayuda a responder mejor.",
      '<div class="visual-lesson">' +
        '<div><p>En la OVA anterior aprendiste a reconocer senales de alerta y revisar registros basicos de cuentas. Ahora aprenderas a ordenar lo que ocurrio.</p>' +
        '<p>Cuando una persona recibe un mensaje sospechoso, pierde acceso a una cuenta o detecta movimientos no reconocidos, necesita reunir informacion util sin exponer datos sensibles.</p>' +
        '<div class="notice success"><strong>Mensaje central:</strong> una evidencia organizada ayuda a entender que paso, cuando paso, que activo fue afectado y que accion debe tomarse.</div></div>' +
        '<img class="lesson-image" src="assets/phishing-correo.png" alt="Correo sospechoso simulado">' +
      '</div>' +
      '<div class="card-grid">' +
        card("Identificar", "Evidencias utiles y senales criticas.") +
        card("Proteger", "Datos sensibles que no deben compartirse.") +
        card("Ordenar", "Linea de tiempo y carpeta basica.") +
        card("Reportar", "Resumen claro por canales oficiales.") +
      '</div>',
      "Iniciar OVA");
  }

  function renderObjective() {
    var selected = state.answers.diagnostic;
    var feedback = "";
    if (selected === "C") feedback = '<div class="feedback correct">Correcto. Esa informacion ayuda a documentar sin exponer datos sensibles.</div>';
    else if (selected) feedback = '<div class="feedback partial">Esos datos no deben compartirse ni registrarse en reportes. Las evidencias utiles describen el hecho sin revelar claves, codigos, PIN ni informacion privada.</div>';
    return shell("Objetivo de aprendizaje",
      "En esta OVA aprenderas a analizar casos cotidianos de incidentes digitales, organizar evidencias basicas y construir una linea de tiempo simple para apoyar la respuesta, el reporte y la recuperacion inicial.",
      '<div class="brand-strip"><span>Unidad 3 - Defensa digital aplicada</span><img src="assets/logo-unicartagena-ctev.png" alt="Logo institucional"></div>' +
      '<h3>Al finalizar podras:</h3>' +
      '<ol class="reading-block">' +
        '<li>Diferenciar evidencia util, dato sensible, senal debil y senal critica.</li>' +
        '<li>Reconocer que datos ayudan a entender un incidente.</li>' +
        '<li>Organizar eventos por fecha y hora.</li>' +
        '<li>Preparar una carpeta basica de evidencias.</li>' +
        '<li>Redactar un resumen de reporte sin exponer contrasenas, codigos ni datos privados.</li>' +
      '</ol>' +
      '<h3>Ruta de aprendizaje</h3>' +
      '<div class="risk-chain learning-route">' +
        riskPiece("1. Caso", "El mensaje que se volvio incidente.") +
        riskPiece("2. Conceptos", "Evidencia, senal y dato sensible.") +
        riskPiece("3. Linea", "Linea de tiempo basica.") +
        riskPiece("4. Clasificar", "Clasificacion de evidencias.") +
        riskPiece("5. Analizar", "Analisis de caso.") +
        riskPiece("6. Organizar", "Carpeta segura.") +
        riskPiece("7. Reportar", "Resumen seguro.") +
        riskPiece("8. Cerrar", "Resultado y recomendaciones.") +
      '</div>' +
      '<fieldset class="question"><legend>Si recibes un mensaje sospechoso y luego pierdes acceso a una cuenta, que guardarias primero como evidencia?</legend>' +
        radio("diagnostic", "A", "La contrasena de la cuenta.", selected) +
        radio("diagnostic", "B", "El codigo SMS recibido.", selected) +
        radio("diagnostic", "C", "Captura del mensaje, URL, remitente, fecha y hora.", selected) +
        radio("diagnostic", "D", "El PIN bancario.", selected) +
      '</fieldset>' + feedback +
      '<div class="notice">Pregunta diagnostica no calificable.</div>',
      "Continuar al caso inicial");
  }

  function renderCase() {
    var selected = state.answers.case;
    var feedback = selected === null ? "" : feedbackBlock(selected === "A", "Esa informacion permite documentar lo ocurrido sin exponer claves ni codigos.", "Nunca se deben compartir contrasenas, codigos ni datos sensibles. Tampoco se debe borrar todo sin documentar.");
    return shell("Caso: El mensaje que se volvio incidente",
      "Sofia vende postres por redes sociales y recibe un supuesto mensaje de soporte urgente.",
      '<div class="account-panel"><header><div><strong>Caso simulado: red social de negocio</strong><span>No contiene datos reales.</span></div><span class="signal-badge signal-sospechosa">Requiere documentar</span></header>' +
      '<div class="account-body">' +
        timeline([
          ["Mensaje", "Su cuenta sera suspendida por incumplir normas. Verifique aqui antes de 2 horas."],
          ["Afectacion", "Sofia hace clic, ingresa credenciales y pierde acceso."],
          ["Impacto", "Clientes reportan promociones falsas y solicitudes de transferencia."]
        ]) +
      '</div></div>' +
      '<fieldset class="question"><legend>Que deberia guardar primero Sofia como evidencia util?</legend>' +
        radio("case", "A", "Captura del mensaje, perfil remitente, URL, fecha, hora y publicaciones falsas.", selected) +
        radio("case", "B", "Su contrasena para que soporte la revise.", selected) +
        radio("case", "C", "El codigo de recuperacion de su cuenta.", selected) +
        radio("case", "D", "Nada, debe borrar todo inmediatamente.", selected) +
      '</fieldset>' + feedback +
      '<div class="notice">Caso inicial: 10 puntos.</div>');
  }

  function renderDefensiveAnalysis() {
    return shell("Analisis defensivo basico",
      "Analizar defensivamente no significa hacer investigacion forense avanzada. Significa observar senales, ordenar hechos y tomar decisiones seguras.",
      '<div class="card-grid">' +
        card("Que ocurrio?", "Describe el evento sin suponer mas de lo que sabes.") +
        card("Cuando ocurrio?", "Registra fecha y hora exacta o aproximada.") +
        card("Que activo fue afectado?", "Cuenta, dispositivo, banco, nube o plataforma.") +
        card("Que evidencia existe?", "Capturas, URLs, alertas, registros y acciones realizadas.") +
      '</div>' +
      '<div class="notice success">El objetivo no es buscar culpables. El objetivo es entender el caso para reducir el dano y evitar que se repita.</div>' +
      renderMiniQuestion(3));
  }

  function renderDigitalEvidence() {
    return shell("Que es evidencia digital?",
      "Una evidencia digital es informacion que ayuda a entender, explicar o reportar un incidente.",
      '<div class="evidence-board">' +
        evidenceCard("Captura del mensaje", "Texto, remitente, fecha y hora.", "evidence-useful") +
        evidenceCard("URL recibida", "Enlace sospechoso sin abrirlo de nuevo.", "evidence-useful") +
        evidenceCard("Alerta de seguridad", "Inicio de sesion, cambio de recuperacion o dispositivo.", "evidence-useful") +
        evidenceCard("Acciones realizadas", "Cambio de contrasena, cierre de sesiones o reporte.", "evidence-useful") +
      '</div>' +
      '<div class="notice risk"><strong>Advertencia:</strong> contrasenas, codigos, PIN, CVV y datos bancarios completos no deben incluirse en reportes ni actividades.</div>' +
      renderMiniQuestion(4));
  }

  function renderEvidenceTypes() {
    return shell("Clasificar antes de reportar",
      "No toda informacion tiene el mismo valor ni el mismo riesgo.",
      '<div class="evidence-board">' +
        evidenceCard("Evidencia util", "Ayuda a entender o reportar el caso sin exponer secretos. Ejemplo: URL, remitente, alerta o movimiento no reconocido.", "evidence-useful") +
        evidenceCard("Dato sensible", "Informacion privada que no debe compartirse: contrasena, codigo SMS, token, PIN, CVV o documento completo.", "evidence-sensitive") +
        evidenceCard("Senal debil", "Indicio que requiere revision, como perfil desconocido, mensaje extrano o alerta aislada.", "evidence-weak") +
        evidenceCard("Senal critica", "Evidencia fuerte de afectacion: perdida de acceso, transferencia no reconocida o publicaciones falsas.", "evidence-critical") +
      '</div>' +
      renderMiniQuestion(5));
  }

  function renderTimelineConcept() {
    return shell("Linea de tiempo basica",
      "Una linea de tiempo organiza los hechos en orden para entender que paso primero, que paso despues y que acciones se tomaron.",
      timeline([
        ["8:10 a. m.", "Llego SMS sospechoso. Evidencia: captura y numero remitente."],
        ["8:12 a. m.", "Se abrio enlace. Evidencia: URL recibida."],
        ["8:15 a. m.", "Se ingresaron datos. Evidencia: relato, sin escribir contrasena."],
        ["8:20 a. m.", "Llego alerta de acceso desconocido. Evidencia: captura de alerta."],
        ["8:25 a. m.", "Se cambio contrasena desde otro dispositivo. Evidencia: accion realizada."]
      ]) +
      '<div class="notice success">Cuando los hechos estan ordenados, el reporte es mas claro y la respuesta mejora.</div>' +
      renderMiniQuestion(6));
  }

  function renderCommonErrors() {
    var errors = [
      ["Borrar todo inmediatamente", "Se pierde informacion util.", "Guardar evidencia minima antes de eliminar."],
      ["Compartir contrasenas o codigos", "Puede aumentar el dano.", "Nunca compartir claves, codigos, tokens, PIN ni CVV."],
      ["Publicar capturas con datos privados", "Expone informacion personal o financiera.", "Ocultar datos sensibles antes de compartir con soporte autorizado."],
      ["No registrar fecha y hora", "La linea de tiempo queda confusa.", "Anotar fecha y hora aproximada."],
      ["Mezclar rumores con hechos", "El reporte pierde claridad.", "Separar hechos comprobados de sospechas."],
      ["Guardar evidencias en lugares inseguros", "Aumenta la exposicion.", "Guardar en carpeta protegida y no compartir publicamente."]
    ];
    return shell("Errores que pueden complicar el caso",
      "Manejar evidencia tambien exige cuidado.",
      '<div class="card-grid">' + errors.map(function (item) {
        return '<div class="card"><h3>' + esc(item[0]) + '</h3><p><strong>Riesgo:</strong> ' + esc(item[1]) + '</p><p><strong>Accion correcta:</strong> ' + esc(item[2]) + '</p></div>';
      }).join("") + '</div>' +
      renderMiniQuestion(7));
  }

  function renderClassify() {
    return shell("Actividad 1: Clasifica cada elemento",
      "Clasifica cada elemento como evidencia util, dato sensible, senal debil o senal critica.",
      '<div class="select-list">' + evidenceItems.map(function (item) {
        var selected = state.answers.classify[item.id] || "";
        return '<div class="select-row"><label for="' + item.id + '">' + esc(item.text) + '</label>' +
          '<select id="' + item.id + '" data-classify="' + item.id + '"><option value="">Selecciona...</option>' +
          categories.map(function (cat) { return '<option value="' + esc(cat) + '"' + (selected === cat ? " selected" : "") + '>' + esc(cat) + '</option>'; }).join("") +
          '</select></div>';
      }).join("") + '</div>' +
      classifyFeedback() +
      '<div class="notice">Actividad 1: hasta 20 puntos.</div>');
  }

  function renderTimelineActivity() {
    return shell("Actividad 2: Ordena los hechos",
      "Ordena los eventos del caso de Sofia en una linea de tiempo.",
      '<div class="timeline-builder">' + timelineEvents.map(function (eventText, index) {
        var selected = state.answers.timeline[String(index)] || "";
        return '<div class="timeline-select-row"><strong>Paso ' + (index + 1) + '</strong><span>' + esc(eventText) + '</span>' +
          '<select data-timeline="' + index + '"><option value="">Ubicacion...</option>' +
          timelineEvents.map(function (_, pos) { return '<option value="' + (pos + 1) + '"' + (String(pos + 1) === String(selected) ? " selected" : "") + '>Lugar ' + (pos + 1) + '</option>'; }).join("") +
          '</select></div>';
      }).join("") + '</div>' +
      timelineFeedback() +
      '<div class="notice">Orden exacto: 20 puntos. 6 o 7 ubicaciones correctas: 15. 4 o 5: 10.</div>');
  }

  function renderDecisions() {
    return shell("Actividad 3: Que significa esta evidencia?",
      "Lee cada situacion y selecciona la decision correcta.",
      decisionCases.map(function (item, index) {
        var selected = state.answers.decisions[item.id];
        return '<fieldset class="question"><legend>Caso ' + (index + 1) + ': ' + esc(item.title) + '</legend>' +
          item.options.map(function (option, optIndex) { return radio("decision-" + item.id, String(optIndex), option, selected); }).join("") +
        '</fieldset>';
      }).join("") +
      decisionFeedback() +
      '<div class="notice">Actividad 3: hasta 15 puntos.</div>');
  }

  function renderFolder() {
    return shell("Actividad 4: Carpeta basica de evidencias",
      "Selecciona como organizarias una carpeta basica de evidencias para un caso.",
      '<div class="folder-sim"><h3>/caso_red_social_2026</h3>' + folderItems.map(function (item) {
        var checked = state.answers.folder.indexOf(item.id) >= 0 ? " checked" : "";
        return '<label class="folder-item"><input type="checkbox" data-folder="' + item.id + '"' + checked + '> <span>' + esc(item.name) + '</span></label>';
      }).join("") + '</div>' +
      folderFeedback() +
      '<div class="safe-note">Una carpeta de evidencias debe ayudar a reportar sin aumentar la exposicion.</div>');
  }

  function renderReport() {
    var report = state.answers.report;
    return shell("Actividad 5: Resumen seguro del caso",
      "Completa un resumen simulado. No escribas datos reales ni informacion sensible.",
      '<div class="report-form">' +
        '<div class="form-two">' +
          selectField("report-type", "Tipo de caso", reportTypes, report.type) +
          selectField("report-asset", "Activo afectado", reportAssets, report.asset) +
        '</div>' +
        '<div class="form-two">' +
          '<div class="form-field"><label for="report-date">Fecha aproximada</label><input id="report-date" type="date" value="' + esc(report.date) + '"></div>' +
          '<div class="form-field"><label for="report-time">Hora aproximada</label><input id="report-time" type="time" value="' + esc(report.time) + '"></div>' +
        '</div>' +
        '<div class="form-field"><label for="report-description">Descripcion breve (max. 300 caracteres)</label><textarea id="report-description" maxlength="300" placeholder="Describe el hecho sin contrasenas, codigos, PIN, CVV ni documentos completos.">' + esc(report.description) + '</textarea></div>' +
        '<fieldset class="check-group"><legend>Evidencias disponibles</legend>' + reportEvidenceOptions.map(function (item) {
          return checkbox("report-evidence", item, report.evidences.indexOf(item) >= 0);
        }).join("") + '</fieldset>' +
        '<fieldset class="check-group"><legend>Accion tomada</legend>' + reportActionOptions.map(function (item) {
          return checkbox("report-action", item, report.actions.indexOf(item) >= 0);
        }).join("") + '</fieldset>' +
      '</div>' +
      reportFeedback() +
      '<div class="notice">Actividad 5: hasta 5 puntos. La descripcion con datos sensibles no se guarda.</div>');
  }

  function renderHelpMaterial() {
    return shell("Aprende mas: organizar evidencias sin exponerse",
      "Esta seccion es opcional y prepara para comunicar, reportar y recuperar mejor despues de un incidente.",
      '<div class="accordion">' +
        helpDetails("Que es evidencia digital", "Informacion que ayuda a reconstruir un hecho ocurrido en una cuenta, dispositivo, servicio o plataforma.") +
        helpDetails("Evidencia util vs dato sensible", "Guarda capturas, fecha, hora, URL y remitente; no compartas contrasenas, codigos, PIN, CVV ni documentos completos.") +
        helpDetails("Como nombrar archivos", "Usa nombres como 01_mensaje_sospechoso.png o 06_linea_tiempo.txt. Evita nombres que revelen secretos.") +
        helpDetails("Linea de tiempo", "Registra fecha, hora aproximada, evento, evidencia asociada, accion realizada y estado.") +
        helpDetails("Hechos y sospechas", "No escribas como hecho algo que todavia no has confirmado.") +
        helpDetails("Resumen seguro", "Incluye tipo de caso, activo afectado, fecha, que ocurrio, evidencias, acciones y estado actual.") +
        helpDetails("Errores frecuentes", "Guardar contrasenas, no registrar fecha y hora, publicar capturas, borrar todo o mezclar hechos con opiniones.") +
        helpDetails("Glosario", "Evidencia digital, dato sensible, senal debil, senal critica, linea de tiempo, hecho, sospecha, conclusion inicial, reporte y activo afectado.") +
      '</div>' +
      '<h3>Para seguir aprendiendo</h3>' + resourceList() +
      '<div class="notice">Los recursos externos son opcionales. La OVA funciona completa sin conexion a internet.</div>');
  }

  function renderQuiz() {
    return shell("Evaluacion final",
      "Responde estas cinco preguntas para consolidar lo aprendido.",
      quiz.map(function (item, index) {
        var selected = state.answers.quiz[item.id];
        return '<fieldset class="question"><legend>Pregunta ' + (index + 1) + ': ' + esc(item.q) + '</legend>' +
          item.options.map(function (option, optIndex) { return radio("quiz-" + item.id, String(optIndex), option, selected); }).join("") +
        '</fieldset>';
      }).join("") +
      quizFeedback() +
      '<div class="notice">Evaluacion de cierre. No modifica el total principal de 100 puntos, pero debe completarse para finalizar.</div>');
  }

  function renderResults() {
    var score = calculateScore();
    var complete = allRequiredComplete();
    var status = score >= 70 && complete ? "Aprobado" : complete ? "Completado con recomendaciones" : "Incompleto";
    return shell("Resultados",
      "Este resumen muestra tu desempeno y recomendaciones personalizadas.",
      '<div class="result-score" style="--score:' + score + '%"><div>' + score + '<small>/100</small></div></div>' +
      '<div class="metric-grid">' +
        metric("Estado", status) +
        metric("Evidencias", classifyCorrectCount() + " de " + evidenceItems.length) +
        metric("Linea de tiempo", timelineCorrectCount() + " de 8") +
        metric("Decisiones", decisionsCorrectCount() + " de 5") +
        metric("Carpeta", folderScoreLabel()) +
        metric("Reporte", getReportScore() + " de 5") +
      '</div>' +
      '<h3>Recomendaciones</h3>' + list(resultRecommendations()) +
      (!complete ? '<div class="notice alert">Aun faltan actividades obligatorias o la evaluacion final.</div>' : '<div class="notice success">Puedes continuar a la pantalla final para registrar tu avance SCORM.</div>'));
  }

  function renderFinish() {
    var complete = allRequiredComplete();
    var score = calculateScore();
    var status = score >= 70 && complete ? "passed" : complete ? "completed" : "incomplete";
    return shell("Finalizacion SCORM",
      "Registra el avance en Moodle cuando termines la OVA.",
      '<div class="card-grid">' + card("Puntaje final", score + " / 100") + card("Estado que se enviara", status) + card("Actividades obligatorias", complete ? "Completas" : "Pendientes") + '</div>' +
      (state.finished ? '<div class="feedback correct">Tu avance fue registrado. Puedes cerrar esta ventana.</div>' : '') +
      (!complete ? '<div class="feedback partial">Para finalizar, completa las actividades y la evaluacion final.</div>' : '') +
      '<div class="button-row"><button id="finish-ova" class="button button-primary" type="button"' + (!complete ? " disabled" : "") + '>Finalizar OVA</button></div>');
  }

  function shell(title, lead, body, firstButtonLabel) {
    return '<section class="screen hero"><span class="tag">OVA U3-02</span><h2>' + esc(title) + '</h2><p class="lead">' + esc(lead) + '</p>' + body + nav(firstButtonLabel) + '</section>';
  }

  function nav(firstButtonLabel) {
    var back = state.screen === 0 ? "" : '<button id="prev-screen" class="button button-secondary" type="button">Anterior</button>';
    var nextLabel = firstButtonLabel || (state.screen === 0 ? "Continuar" : state.screen >= totalScreens - 1 ? "Ver finalizacion" : "Siguiente");
    var next = state.screen < totalScreens - 1 ? '<button id="next-screen" class="button button-primary" type="button">' + esc(nextLabel) + '</button>' : "";
    return '<div class="button-row">' + (back || '<span></span>') + next + '</div>';
  }

  function bindScreenEvents(index) {
    bindClick("prev-screen", function () { goTo(state.screen - 1); });
    bindClick("next-screen", function () { state.completed[index] = true; goTo(state.screen + 1); });
    if (index === 1) bindRadios("diagnostic", function (value) { state.answers.diagnostic = value; state.completed[1] = true; saveAndRender(); });
    if (index === 2) bindRadios("case", function (value) { state.answers.case = value; state.completed[2] = true; saveAndRender(); });
    if (miniQuestions[index]) bindRadios("mini-" + miniQuestions[index].id, function (value) { state.answers.mini[miniQuestions[index].id] = Number(value); state.completed[index] = true; saveAndRender(); });
    if (index === 8) bindClassify();
    if (index === 9) bindTimeline();
    if (index === 10) bindDecisions();
    if (index === 11) bindFolder();
    if (index === 12) bindReport();
    if (index === 14) bindQuiz();
    if (index === 16) bindClick("finish-ova", finishOva);
  }

  function bindClassify() {
    qsa("[data-classify]").forEach(function (select) {
      select.addEventListener("change", function () {
        state.answers.classify[select.getAttribute("data-classify")] = select.value;
        state.completed[8] = evidenceItems.every(function (item) { return state.answers.classify[item.id]; });
        saveAndRender();
      });
    });
  }

  function bindTimeline() {
    qsa("[data-timeline]").forEach(function (select) {
      select.addEventListener("change", function () {
        state.answers.timeline[select.getAttribute("data-timeline")] = select.value;
        state.completed[9] = Object.keys(state.answers.timeline).length >= timelineEvents.length && timelineEvents.every(function (_, i) { return state.answers.timeline[String(i)]; });
        saveAndRender();
      });
    });
  }

  function bindDecisions() {
    decisionCases.forEach(function (item) {
      bindRadios("decision-" + item.id, function (value) {
        state.answers.decisions[item.id] = Number(value);
        state.completed[10] = decisionCases.every(function (row) { return state.answers.decisions[row.id] !== undefined; });
        saveAndRender();
      });
    });
  }

  function bindFolder() {
    qsa("[data-folder]").forEach(function (input) {
      input.addEventListener("change", function () {
        toggleArrayValue(state.answers.folder, input.getAttribute("data-folder"), input.checked);
        state.completed[11] = state.answers.folder.length > 0;
        saveAndRender();
      });
    });
  }

  function bindReport() {
    bindChange("report-type", function (value) { state.answers.report.type = value; state.completed[12] = isReportComplete(); saveAndRender(); });
    bindChange("report-asset", function (value) { state.answers.report.asset = value; state.completed[12] = isReportComplete(); saveAndRender(); });
    bindChange("report-date", function (value) { state.answers.report.date = value; state.completed[12] = isReportComplete(); saveProgress(); });
    bindChange("report-time", function (value) { state.answers.report.time = value; state.completed[12] = isReportComplete(); saveProgress(); });
    var desc = document.getElementById("report-description");
    if (desc) {
      desc.addEventListener("change", function () {
        if (containsSensitive(desc.value)) {
          state.answers.report.description = "";
          state.answers.report.sensitiveFlag = true;
        } else {
          state.answers.report.description = desc.value.trim().slice(0, 300);
          state.answers.report.sensitiveFlag = false;
        }
        state.completed[12] = isReportComplete();
        saveAndRender();
      });
    }
    qsa('[data-check="report-evidence"]').forEach(function (input) {
      input.addEventListener("change", function () {
        toggleArrayValue(state.answers.report.evidences, input.value, input.checked);
        state.completed[12] = isReportComplete();
        saveAndRender();
      });
    });
    qsa('[data-check="report-action"]').forEach(function (input) {
      input.addEventListener("change", function () {
        toggleArrayValue(state.answers.report.actions, input.value, input.checked);
        state.completed[12] = isReportComplete();
        saveAndRender();
      });
    });
  }

  function bindQuiz() {
    quiz.forEach(function (item) {
      bindRadios("quiz-" + item.id, function (value) {
        state.answers.quiz[item.id] = Number(value);
        state.completed[14] = quiz.every(function (row) { return state.answers.quiz[row.id] !== undefined; });
        saveAndRender();
      });
    });
  }

  function goTo(index) {
    state.screen = Math.max(0, Math.min(totalScreens - 1, index));
    saveProgress();
    render();
  }

  function saveAndRender() { saveProgress(); render(); }

  function saveProgress() {
    state.score = calculateScore();
    Scorm.setScore(state.score);
    Scorm.setLocation(state.screen);
    Scorm.saveSuspendData({
      screen: state.screen,
      score: state.score,
      answers: state.answers,
      completed: state.completed,
      finalStatus: state.finalStatus,
      finished: state.finished
    });
    Scorm.commit();
  }

  function finishOva() {
    var complete = allRequiredComplete();
    var score = calculateScore();
    var status = score >= 70 && complete ? "passed" : complete ? "completed" : "incomplete";
    state.finalStatus = status;
    state.finished = complete;
    state.completed[16] = true;
    Scorm.setScore(score);
    Scorm.setStatus(status);
    saveProgress();
    Scorm.finish();
    render();
  }

  function calculateScore() {
    return Math.max(0, Math.min(100,
      getCaseScore() +
      getMiniScore() +
      getClassifyScore() +
      getTimelineScore() +
      getDecisionScore() +
      getFolderScore() +
      getReportScore()
    ));
  }

  function getCaseScore() { return state.answers.case === "A" ? 10 : 0; }
  function getMiniScore() {
    var correct = Object.keys(miniQuestions).filter(function (screen) {
      var q = miniQuestions[screen];
      return state.answers.mini[q.id] === q.correct;
    }).length;
    return correct * 4;
  }
  function getClassifyScore() { return classifyCorrectCount() * 2; }
  function classifyCorrectCount() {
    return evidenceItems.filter(function (item) { return item.accepted.indexOf(state.answers.classify[item.id]) >= 0; }).length;
  }
  function getTimelineScore() {
    var correct = timelineCorrectCount();
    if (correct === 8) return 20;
    if (correct >= 6) return 15;
    if (correct >= 4) return 10;
    return 0;
  }
  function timelineCorrectCount() {
    return timelineEvents.filter(function (_, index) { return Number(state.answers.timeline[String(index)]) === index + 1; }).length;
  }
  function getDecisionScore() { return decisionsCorrectCount() * 3; }
  function decisionsCorrectCount() {
    return decisionCases.filter(function (item) { return state.answers.decisions[item.id] === item.correct; }).length;
  }
  function getFolderScore() {
    var selected = state.answers.folder;
    var selectedItems = folderItems.filter(function (item) { return selected.indexOf(item.id) >= 0; });
    var unsafe = selectedItems.some(function (item) { return !item.safe; });
    if (unsafe) return 0;
    var safeSelected = selectedItems.filter(function (item) { return item.safe; }).length;
    if (safeSelected === 6) return 10;
    if (safeSelected >= 5) return 7;
    return 0;
  }
  function folderScoreLabel() {
    var score = getFolderScore();
    return score === 10 ? "Segura completa" : score === 7 ? "Segura parcial" : "Revisar";
  }
  function getReportScore() {
    var raw = getReportRawScore();
    return Math.round((raw / 20) * 5);
  }
  function getReportRawScore() {
    var report = state.answers.report;
    var score = 0;
    if (report.type) score += 2;
    if (report.asset) score += 2;
    if (report.date || report.time) score += 2;
    if (report.description && !containsSensitive(report.description)) score += 4;
    if (report.evidences.length >= 2) score += 5;
    if (report.actions.length >= 1) score += 5;
    return score;
  }
  function quizCorrectCount() {
    return quiz.filter(function (item) { return state.answers.quiz[item.id] === item.correct; }).length;
  }

  function allRequiredComplete() {
    return state.answers.case !== null &&
      Object.keys(miniQuestions).every(function (screen) { return state.answers.mini[miniQuestions[screen].id] !== undefined; }) &&
      evidenceItems.every(function (item) { return state.answers.classify[item.id]; }) &&
      timelineEvents.every(function (_, i) { return state.answers.timeline[String(i)]; }) &&
      decisionCases.every(function (item) { return state.answers.decisions[item.id] !== undefined; }) &&
      state.answers.folder.length > 0 &&
      isReportComplete() &&
      quiz.every(function (item) { return state.answers.quiz[item.id] !== undefined; });
  }

  function isReportComplete() {
    var r = state.answers.report;
    return Boolean(r.type && r.asset && r.evidences.length >= 2 && r.actions.length >= 1 && !r.sensitiveFlag);
  }

  function renderMiniQuestion(screen) {
    var q = miniQuestions[screen];
    var selected = state.answers.mini[q.id];
    var feedback = selected === undefined ? "" : feedbackBlock(selected === q.correct, "Correcto. Esta respuesta ayuda a documentar sin exponerse.", "Revisa el concepto: la respuesta segura evita publicar datos sensibles y ordena mejor el caso.");
    return '<fieldset class="question"><legend>' + esc(q.q) + '</legend>' +
      q.options.map(function (option, index) { return radio("mini-" + q.id, String(index), option, selected); }).join("") +
      '</fieldset>' + feedback + '<div class="notice">Mini pregunta: 4 puntos.</div>';
  }

  function classifyFeedback() {
    var answered = evidenceItems.filter(function (item) { return state.answers.classify[item.id]; }).length;
    if (!answered) return "";
    if (answered < evidenceItems.length) return '<div class="feedback partial">Sigue clasificando. Ya tienes ' + answered + ' de ' + evidenceItems.length + '.</div>';
    return '<div class="feedback ' + (classifyCorrectCount() >= 8 ? "correct" : "partial") + '">Clasificaciones correctas: ' + classifyCorrectCount() + ' de ' + evidenceItems.length + '.</div>';
  }

  function timelineFeedback() {
    var answered = timelineEvents.filter(function (_, i) { return state.answers.timeline[String(i)]; }).length;
    if (!answered) return "";
    var correct = timelineCorrectCount();
    return '<div class="feedback ' + (correct === 8 ? "correct" : correct >= 4 ? "partial" : "incorrect") + '">Eventos bien ubicados: ' + correct + ' de 8. La linea de tiempo permite entender inicio, afectacion, senales y acciones.</div>';
  }

  function decisionFeedback() {
    var answered = decisionCases.filter(function (item) { return state.answers.decisions[item.id] !== undefined; }).length;
    if (!answered) return "";
    return '<div class="feedback ' + (decisionsCorrectCount() >= 4 ? "correct" : "partial") + '">Decisiones correctas: ' + decisionsCorrectCount() + ' de 5.</div>';
  }

  function folderFeedback() {
    if (!state.answers.folder.length) return "";
    var unsafe = folderItems.some(function (item) { return !item.safe && state.answers.folder.indexOf(item.id) >= 0; });
    if (unsafe) return '<div class="feedback incorrect">Incluiste datos sensibles. Una carpeta de evidencias no debe contener contrasenas, codigos, PIN, CVV ni capturas sin ocultar datos.</div>';
    return '<div class="feedback ' + (getFolderScore() === 10 ? "correct" : "partial") + '">Carpeta segura. Puntaje: ' + getFolderScore() + ' de 10.</div>';
  }

  function reportFeedback() {
    var r = state.answers.report;
    if (r.sensitiveFlag) return '<div class="feedback incorrect">Evita escribir datos sensibles. Describe el hecho sin incluir contrasenas, codigos, PIN, CVV, documentos completos ni informacion privada.</div>';
    if (!r.type && !r.asset && !r.evidences.length && !r.actions.length && !r.description) return "";
    return '<div class="feedback ' + (isReportComplete() ? "correct" : "partial") + '">Resumen seguro: ' + getReportRawScore() + ' de 20 criterios internos. Puntaje convertido: ' + getReportScore() + ' de 5.</div>';
  }

  function quizFeedback() {
    var answered = quiz.filter(function (item) { return state.answers.quiz[item.id] !== undefined; }).length;
    if (!answered) return "";
    return '<div class="feedback ' + (quizCorrectCount() >= 4 ? "correct" : "partial") + '">Evaluacion final: ' + quizCorrectCount() + ' de 5 respuestas correctas.</div>';
  }

  function resultRecommendations() {
    var items = [];
    if (classifyCorrectCount() < evidenceItems.length) items.push("Refuerza la diferencia entre evidencia util, dato sensible, senal debil y senal critica.");
    if (timelineCorrectCount() < 8) items.push("Practica ordenar hechos por fecha y hora aproximada antes de reportar.");
    if (getFolderScore() < 10) items.push("La carpeta debe incluir evidencias utiles y excluir contrasenas, codigos, PIN, CVV y capturas con datos sin ocultar.");
    if (getReportScore() < 5) items.push("Completa reportes con tipo de caso, activo afectado, evidencias y acciones realizadas.");
    items.push("Guarda evidencias antes de borrar, pero no guardes secretos.");
    items.push("Separa hechos comprobados de sospechas y conclusiones iniciales.");
    items.push("Reporta por canales oficiales y conserva acciones realizadas.");
    return unique(items);
  }

  function containsSensitive(value) {
    var textValue = String(value || "").toLowerCase();
    return sensitiveWords.some(function (word) { return textValue.indexOf(word) >= 0; });
  }

  function card(title, textValue) {
    return '<div class="card"><h3>' + esc(title) + '</h3><p>' + esc(textValue) + '</p></div>';
  }

  function evidenceCard(title, textValue, cls) {
    return '<div class="evidence-card ' + cls + '"><strong>' + esc(title) + '</strong><p>' + esc(textValue) + '</p></div>';
  }

  function metric(title, value) {
    return '<div class="metric"><strong>' + esc(value) + '</strong><span>' + esc(title) + '</span></div>';
  }

  function riskPiece(title, textValue) {
    return '<div class="risk-piece"><strong>' + esc(title) + '</strong><span>' + esc(textValue) + '</span></div>';
  }

  function timeline(items) {
    return '<div class="timeline">' + items.map(function (item) {
      return '<div class="timeline-item"><div class="timeline-dot" aria-hidden="true"></div><div class="timeline-card"><h3>' + esc(item[0]) + '</h3><p>' + esc(item[1]) + '</p></div></div>';
    }).join("") + '</div>';
  }

  function helpDetails(title, textValue) {
    return '<details><summary>' + esc(title) + '</summary><p>' + esc(textValue) + '</p></details>';
  }

  function resourceList() {
    return '<div class="resource-list">' + resources.map(function (resource) {
      return '<a href="' + esc(resource[0]) + '" target="_blank" rel="noopener"><strong>' + esc(resource[1]) + '</strong><small>' + esc(resource[2]) + '</small></a>';
    }).join("") + '</div>';
  }

  function list(items) {
    return '<ul>' + items.map(function (item) { return '<li>' + esc(item) + '</li>'; }).join("") + '</ul>';
  }

  function radio(name, value, label, selected) {
    var checked = String(selected) === String(value) ? " checked" : "";
    return '<label class="option"><input type="radio" name="' + esc(name) + '" value="' + esc(value) + '"' + checked + '> <span>' + esc(label) + '</span></label>';
  }

  function checkbox(name, value, checked) {
    return '<label class="option"><input type="checkbox" data-check="' + esc(name) + '" value="' + esc(value) + '"' + (checked ? " checked" : "") + '> <span>' + esc(value) + '</span></label>';
  }

  function selectField(id, label, options, selected) {
    return '<div class="form-field"><label for="' + id + '">' + esc(label) + '</label><select id="' + id + '">' +
      options.map(function (item) {
        return '<option value="' + esc(item) + '"' + (item === selected ? " selected" : "") + '>' + esc(item || "Selecciona...") + '</option>';
      }).join("") + '</select></div>';
  }

  function feedbackBlock(ok, good, bad) {
    return '<div class="feedback ' + (ok ? "correct" : "incorrect") + '">' + esc(ok ? good : bad) + '</div>';
  }

  function bindRadios(name, handler) {
    qsa('input[name="' + name + '"]').forEach(function (input) {
      input.addEventListener("change", function () { handler(input.value); });
    });
  }

  function bindChange(id, handler) {
    var element = document.getElementById(id);
    if (element) element.addEventListener("change", function () { handler(element.value); });
  }

  function bindClick(id, handler) {
    var element = document.getElementById(id);
    if (element) element.addEventListener("click", handler);
  }

  function toggleHelp(show) {
    var panel = document.getElementById("help-panel");
    if (panel) panel.classList.toggle("hidden", !show);
  }

  function toggleReset(show) {
    var panel = document.getElementById("confirm-dialog");
    if (panel) panel.classList.toggle("hidden", !show);
  }

  function toggleArrayValue(array, value, enabled) {
    var index = array.indexOf(value);
    if (enabled && index < 0) array.push(value);
    if (!enabled && index >= 0) array.splice(index, 1);
  }

  function unique(items) {
    return items.filter(function (item, index) { return items.indexOf(item) === index; });
  }

  function qsa(selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); }

  function text(id, value) {
    var element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  document.addEventListener("DOMContentLoaded", initialize);
}());
