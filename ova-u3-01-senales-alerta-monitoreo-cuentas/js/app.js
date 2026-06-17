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
      classify: {},
      logEvents: [],
      logCritical: null,
      logAction: null,
      decisions: {},
      routine: [],
      quiz: {}
    },
    completed: {},
    finalStatus: "incomplete",
    finished: false
  };
  var state = cloneDefault();

  var signalLevels = ["Actividad normal", "Senal sospechosa", "Alerta critica"];

  var miniQuestions = {
    4: {
      id: "critical-signal",
      q: "Cual situacion es una alerta critica?",
      options: [
        "Tu inicias sesion desde tu computador habitual.",
        "Recibes un boletin que esperabas.",
        "Tus contactos reciben mensajes que tu no enviaste.",
        "Actualizas una aplicacion desde la tienda oficial."
      ],
      correct: 2,
      good: "Correcto. Los mensajes enviados sin autorizacion son una senal fuerte de compromiso.",
      bad: "Revisa la diferencia: lo critico muestra actividad no autorizada o perdida de control."
    },
    6: {
      id: "login-history",
      q: "Que registro ayuda a detectar si alguien entro desde un dispositivo desconocido?",
      options: [
        "Historial de inicio de sesion.",
        "Fondo de pantalla.",
        "Nivel de bateria.",
        "Nombre de la app de musica."
      ],
      correct: 0,
      good: "Correcto. El historial muestra fecha, hora, ubicacion aproximada y dispositivo.",
      bad: "El registro clave es el historial de inicio de sesion."
    },
    7: {
      id: "verification-code",
      q: "Si recibes varios codigos de verificacion sin haber intentado entrar a una cuenta, eso puede indicar:",
      options: [
        "Que alguien intenta acceder a tu cuenta.",
        "Que todo esta normal siempre.",
        "Que debes compartir el codigo.",
        "Que debes publicar el codigo para preguntar."
      ],
      correct: 0,
      good: "Correcto. Un codigo no solicitado puede indicar intento de acceso.",
      bad: "Nunca compartas codigos. Primero revisa la actividad de la cuenta desde la app oficial."
    }
  };

  var warningCards = [
    {
      title: "Inicio de sesion desconocido",
      signal: "Ciudad, pais, navegador o dispositivo que no reconoces.",
      action: "Cambia contrasena desde dispositivo seguro, cierra sesiones desconocidas y activa MFA."
    },
    {
      title: "Codigo de verificacion no solicitado",
      signal: "Recibes un codigo SMS o correo de verificacion sin estar entrando.",
      action: "No compartas el codigo. Revisa actividad y cambia contrasena si se repite."
    },
    {
      title: "Cambios de recuperacion",
      signal: "Cambio de correo, telefono o pregunta de recuperacion que no hiciste.",
      action: "Recupera control, actualiza datos y activa MFA."
    },
    {
      title: "Mensajes enviados sin autorizacion",
      signal: "Correos, chats o publicaciones que no escribiste.",
      action: "Cierra sesiones, cambia contrasena, advierte contactos y revisa reglas."
    },
    {
      title: "Dispositivo desconocido conectado",
      signal: "Aparece un equipo, navegador o celular que no reconoces.",
      action: "Cierra sesion en ese dispositivo y cambia credenciales."
    },
    {
      title: "Apps conectadas desconocidas",
      signal: "Aplicaciones externas tienen acceso a tu cuenta.",
      action: "Revoca accesos que no uses o no reconozcas."
    },
    {
      title: "Archivos compartidos sin permiso",
      signal: "Documentos en la nube compartidos con personas desconocidas.",
      action: "Revisa permisos, quita accesos y protege la cuenta."
    },
    {
      title: "Movimientos financieros no reconocidos",
      signal: "Compra, transferencia o pago que no realizaste.",
      action: "Contacta al banco o billetera digital por canal oficial inmediatamente."
    }
  ];

  var recordCards = [
    ["Historial de inicio de sesion", "Fecha, hora, ubicacion aproximada, navegador o dispositivo.", "Ubicaciones desconocidas, horarios extranos o dispositivos no reconocidos."],
    ["Dispositivos conectados", "Celulares, computadores o navegadores con sesion activa.", "Equipos antiguos, desconocidos o que ya no usas."],
    ["Actividad de seguridad", "Cambios de contrasena, MFA o intentos de recuperacion.", "Cambios que no realizaste."],
    ["Apps conectadas", "Aplicaciones externas con permisos sobre la cuenta.", "Apps desconocidas o que ya no usas."],
    ["Correos enviados y reglas", "Mensajes enviados, filtros y reglas de reenvio.", "Reenvios no autorizados o mensajes que no escribiste."],
    ["Archivos compartidos", "Documentos o carpetas con acceso para otras personas.", "Compartidos publicos o con usuarios desconocidos."]
  ];

  var compromiseCards = [
    ["Correo", ["Mensajes enviados que no reconoces.", "Reglas de reenvio desconocidas.", "Contactos reportan correos extranos.", "Alertas de inicio de sesion.", "Cambios en recuperacion."]],
    ["Redes sociales", ["Publicaciones que no hiciste.", "Mensajes a contactos.", "Cambios de foto, correo o numero.", "Promociones falsas.", "Perdida de acceso."]],
    ["Dispositivos", ["Lentitud inusual.", "Apps desconocidas.", "Ventanas emergentes.", "Antivirus desactivado.", "Archivos bloqueados o cifrados."]],
    ["Nube", ["Archivos eliminados.", "Carpetas compartidas sin autorizacion.", "Accesos desconocidos.", "Cambios en permisos."]],
    ["Banca y pagos", ["Movimientos no reconocidos.", "Codigos recibidos sin solicitud.", "Notificaciones de compra.", "Llamadas de supuesta verificacion."]]
  ];

  var classifyItems = [
    { id: "c1", text: "Inicias sesion desde tu celular habitual.", correct: "Actividad normal" },
    { id: "c2", text: "Recibes alerta de inicio de sesion desde otra ciudad.", correct: "Senal sospechosa" },
    { id: "c3", text: "Tus contactos reciben correos que tu no enviaste.", correct: "Alerta critica" },
    { id: "c4", text: "Aparece una app conectada a tu cuenta que no reconoces.", correct: "Senal sospechosa" },
    { id: "c5", text: "Se realiza una transferencia bancaria que no reconoces.", correct: "Alerta critica" },
    { id: "c6", text: "Cambiaste tu contrasena y recibes confirmacion.", correct: "Actividad normal" },
    { id: "c7", text: "Llega un codigo SMS sin que hayas intentado iniciar sesion.", correct: "Senal sospechosa" },
    { id: "c8", text: "No puedes entrar a tu cuenta porque la contrasena fue cambiada.", correct: "Alerta critica" }
  ];

  var logEvents = [
    { id: "e1", time: "Hoy, 8:15 a. m.", activity: "Inicio de sesion desde tu celular habitual.", location: "Ciudad habitual", level: "Normal" },
    { id: "e2", time: "Hoy, 9:02 a. m.", activity: "Intento de inicio de sesion desde navegador desconocido.", location: "Ciudad no reconocida", level: "Sospechoso" },
    { id: "e3", time: "Hoy, 9:05 a. m.", activity: "Codigo de verificacion enviado.", location: "No aplica", level: "Sospechoso" },
    { id: "e4", time: "Hoy, 9:07 a. m.", activity: "Cambio de correo de recuperacion.", location: "Navegador desconocido", level: "Critico" },
    { id: "e5", time: "Hoy, 9:12 a. m.", activity: "Regla de reenvio creada.", location: "Navegador desconocido", level: "Critico" },
    { id: "e6", time: "Hoy, 10:00 a. m.", activity: "Inicio de sesion desde tu computador habitual.", location: "Ciudad habitual", level: "Normal" }
  ];
  var attentionEvents = ["e2", "e3", "e4", "e5"];

  var decisionCases = [
    {
      id: "d1",
      title: "Inicio de sesion desconocido en correo principal.",
      options: ["Ignorar.", "Cambiar contrasena desde dispositivo seguro, cerrar sesiones y activar MFA.", "Compartir la alerta en redes.", "Borrar la alerta."],
      correct: 1
    },
    {
      id: "d2",
      title: "Aparece una app desconocida conectada a tu cuenta.",
      options: ["Revocar acceso y revisar actividad.", "Dejarla porque puede servir despues.", "Darle mas permisos.", "Compartir la contrasena con la app."],
      correct: 0
    },
    {
      id: "d3",
      title: "Recibes codigo de verificacion no solicitado.",
      options: ["Compartirlo con quien llame.", "No compartirlo y revisar actividad de cuenta.", "Publicarlo para pedir ayuda.", "Guardarlo en redes sociales."],
      correct: 1
    },
    {
      id: "d4",
      title: "Encuentras una regla de reenvio desconocida en tu correo.",
      options: ["Eliminarla, cambiar contrasena, revisar sesiones y documentar.", "Ignorarla.", "Crear mas reglas.", "Enviar la contrasena a soporte por chat."],
      correct: 0
    },
    {
      id: "d5",
      title: "Detectas una transferencia no reconocida.",
      options: ["Contactar inmediatamente al banco o billetera digital.", "Esperar una semana.", "Responder al SMS sospechoso.", "Borrar la notificacion."],
      correct: 0
    }
  ];

  var routineOptions = [
    "Revisar inicios de sesion recientes.",
    "Revisar dispositivos conectados.",
    "Cerrar sesiones desconocidas o antiguas.",
    "Revisar apps conectadas.",
    "Verificar alertas de seguridad.",
    "Revisar correo y telefono de recuperacion.",
    "Revisar movimientos bancarios.",
    "Revisar publicaciones y mensajes enviados.",
    "Revisar archivos compartidos en la nube.",
    "Revisar permisos de aplicaciones.",
    "Verificar copia de seguridad.",
    "Hablar con familiares o equipo sobre senales detectadas."
  ];

  var quiz = [
    {
      id: "q1",
      q: "Que es monitoreo basico?",
      options: ["Revisar senales simples de actividad para detectar posibles problemas.", "Vigilar todas las cuentas todo el dia.", "Instalar programas desconocidos.", "Borrar todas las alertas."],
      correct: 0
    },
    {
      id: "q2",
      q: "Cual es una senal sospechosa?",
      options: ["Inicio de sesion desde tu celular habitual.", "Codigo de verificacion recibido sin haberlo solicitado.", "Cambio de contrasena que tu hiciste.", "Compra que reconoces."],
      correct: 1
    },
    {
      id: "q3",
      q: "Cual es una alerta critica?",
      options: ["Correos enviados desde tu cuenta sin autorizacion.", "Actualizacion de una app oficial.", "Revision normal de la cuenta.", "Inicio de sesion esperado."],
      correct: 0
    },
    {
      id: "q4",
      q: "Que se debe revisar en dispositivos conectados?",
      options: ["Si hay equipos desconocidos o antiguos con sesion activa.", "El color del fondo de pantalla.", "El brillo de la pantalla.", "El nombre de la cancion reproducida."],
      correct: 0
    },
    {
      id: "q5",
      q: "Que accion es adecuada ante una app conectada desconocida?",
      options: ["Revocar acceso y revisar actividad.", "Darle mas permisos.", "Compartirle la contrasena.", "Ignorarla siempre."],
      correct: 0
    }
  ];

  var resources = [
    ["https://grow.google/certificates/cybersecurity/", "Google Cybersecurity Certificate", "Ruta para profundizar en deteccion, respuesta, riesgos y herramientas."],
    ["https://www.coursera.org/learn/detection-and-response", "Sound the Alarm: Detection and Response", "Curso para ampliar deteccion y respuesta ante incidentes."],
    ["https://myaccount.google.com/intro/security-checkup", "Google Security Checkup", "Revision practica de actividad, dispositivos y protecciones de cuenta."],
    ["https://passwords.google.com/intro", "Google Password Manager", "Revision de contrasenas guardadas, debiles, repetidas o comprometidas."],
    ["https://www.cisa.gov/secure-our-world", "CISA Secure Our World", "Buenas practicas sobre MFA, contrasenas fuertes, actualizaciones y reporte."],
    ["https://www.nist.gov/cyberframework", "NIST Cybersecurity Framework 2.0", "Marco para organizar gobernar, identificar, proteger, detectar, responder y recuperar."],
    ["https://www.incibe.es/ciudadania", "INCIBE - Seguridad para ciudadanos", "Recurso en espanol sobre privacidad, phishing y proteccion de cuentas."],
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
    base.answers.logEvents = Array.isArray(base.answers.logEvents) ? base.answers.logEvents : [];
    base.answers.decisions = Object.assign({}, base.answers.decisions || {});
    base.answers.routine = Array.isArray(base.answers.routine) ? base.answers.routine : [];
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
      case 3: return renderMonitoring();
      case 4: return renderLevels();
      case 5: return renderWarnings();
      case 6: return renderRecords();
      case 7: return renderCompromise();
      case 8: return renderClassify();
      case 9: return renderLogActivity();
      case 10: return renderDecisions();
      case 11: return renderRoutine();
      case 12: return renderHelpMaterial();
      case 13: return renderQuiz();
      case 14: return renderResults();
      case 15: return renderFinish();
      default: return renderWelcome();
    }
  }

  function renderWelcome() {
    return shell("Bienvenido a la Unidad 3",
      "Detectar a tiempo puede evitar que una alerta pequena se convierta en un incidente grave.",
      '<div class="visual-lesson">' +
        '<div>' +
          '<p>En la Unidad 1 aprendiste a proteger cuentas, dispositivos y habitos digitales. En la Unidad 2 aprendiste a identificar activos, vulnerabilidades, riesgos y acciones de respuesta inicial.</p>' +
          '<p>Ahora aprenderas a mirar senales. Una cuenta comprometida casi siempre deja rastros: un inicio de sesion desconocido, un dispositivo que no reconoces, un cambio de recuperacion, un correo enviado sin permiso o una alerta ignorada.</p>' +
          '<div class="notice success"><strong>Mensaje central:</strong> Monitorear no significa vigilar todo el dia. Significa saber donde mirar, que senales revisar y cuando actuar.</div>' +
        '</div>' +
        '<img class="lesson-image" src="assets/celular-alerta-real.png" alt="Celular con alerta de seguridad simulada">' +
      '</div>',
      "Iniciar OVA");
  }

  function renderObjective() {
    var topics = ["Monitoreo basico", "Actividad normal", "Senal sospechosa", "Alerta critica", "Inicios de sesion", "Dispositivos conectados", "Sesiones activas", "Cambios de seguridad", "Correos enviados", "Reglas de reenvio", "Archivos compartidos", "Indicadores de compromiso", "Rutina semanal"];
    return shell("Objetivo de aprendizaje",
      "Reconocer senales de alerta, revisar registros basicos de actividad y aplicar habitos de monitoreo en cuentas, dispositivos y servicios digitales.",
      '<div class="brand-strip"><span>Unidad 3 · Defensa digital aplicada</span><img src="assets/logo-unicartagena-ctev.png" alt="Logo institucional"></div>' +
      '<div class="card-grid">' + topics.map(function (item) {
        return '<div class="card"><span class="icon" aria-hidden="true">&#9679;</span><strong>' + esc(item) + '</strong></div>';
      }).join("") + '</div>' +
      '<div class="notice">Al finalizar, podras diferenciar actividad normal, senal sospechosa y alerta critica para tomar decisiones seguras.</div>');
  }

  function renderCase() {
    var selected = state.answers.case;
    var feedback = selected === null ? "" : feedbackBlock(selected === "B", "Una alerta de inicio de sesion desconocido debe verificarse. Puede ser una senal temprana de compromiso.", "Tener correo o contactos no es el problema. El error fue no revisar una senal sospechosa.");
    return shell("Caso: La alerta que parecia normal",
      "Maria recibe una alerta de inicio de sesion desde una ciudad que no reconoce y la ignora.",
      '<div class="account-panel">' +
        '<header><div><strong>Cuenta de correo de Maria</strong><span>Registro simulado de actividad reciente</span></div><span class="signal-badge signal-sospechosa">Requiere verificacion</span></header>' +
        '<div class="account-body">' +
          timeline([
            ["Dia 1", "Alerta de inicio de sesion desde ciudad desconocida."],
            ["Dia 2", "Contactos reciben correos extranos desde su cuenta."],
            ["Revision", "Aparece dispositivo desconocido, sesion abierta, regla de reenvio y mensajes enviados."]
          ]) +
        '</div>' +
      '</div>' +
      '<fieldset class="question"><legend>Cual fue el error principal de Maria?</legend>' +
        radio("case", "A", "Tener correo electronico.", selected) +
        radio("case", "B", "Ignorar una alerta de inicio de sesion desconocido.", selected) +
        radio("case", "C", "Usar internet en su celular.", selected) +
        radio("case", "D", "Tener contactos guardados.", selected) +
      '</fieldset>' + feedback +
      '<div class="notice">Esta actividad aporta hasta 10 puntos.</div>');
  }

  function renderMonitoring() {
    return shell("Monitorear no es vigilar todo el dia",
      "El monitoreo basico consiste en revisar senales simples que indican si una cuenta, dispositivo o servicio se comporta de forma normal o sospechosa.",
      '<div class="risk-chain">' +
        riskPiece("1. Mirar", "Alertas, sesiones, dispositivos, apps y cambios.") +
        riskPiece("2. Interpretar", "Distinguir normal, sospechoso o critico.") +
        riskPiece("3. Decidir", "Verificar, documentar, cerrar sesiones o reportar.") +
        riskPiece("4. Actuar", "Proteger la cuenta desde un dispositivo seguro.") +
        riskPiece("5. Revisar", "Repetir una rutina breve cada semana.") +
      '</div>' +
      '<div class="notice success"><strong>Clave:</strong> monitorear es crear el habito de mirar lo importante antes de que el incidente avance.</div>' +
      '<div class="card-grid">' +
        card("Puedes revisar", "Inicios de sesion, dispositivos conectados, sesiones activas, alertas de seguridad y cambios de contrasena.") +
        card("Tambien importa", "Correo o telefono de recuperacion, mensajes enviados, archivos compartidos, apps conectadas y movimientos no reconocidos.") +
      '</div>');
  }

  function renderLevels() {
    return shell("Actividad normal, senal sospechosa y alerta critica",
      "No todas las alertas son incidentes, pero toda alerta debe revisarse.",
      '<div class="status-grid">' +
        statusCard("Actividad normal", "Accion esperada, reconocida y coherente.", "Inicio desde tu celular habitual, compra reconocida o cambio que tu hiciste.", "level-low") +
        statusCard("Senal sospechosa", "No confirma un incidente, pero requiere verificacion.", "Codigo no solicitado, ubicacion no habitual o app conectada desconocida.", "level-medium") +
        statusCard("Alerta critica", "Senal fuerte de posible compromiso.", "Mensajes enviados sin permiso, transferencia no reconocida o perdida de acceso.", "level-high") +
      '</div>' +
      renderMiniQuestion(4));
  }

  function renderWarnings() {
    return shell("Senales de alerta que debes reconocer",
      "Estas senales aparecen en cuentas de correo, redes sociales, banca digital, nube y servicios cotidianos.",
      '<div class="accordion">' + warningCards.map(function (item) {
        return '<details><summary>' + esc(item.title) + '</summary>' +
          '<p><strong>Senal:</strong> ' + esc(item.signal) + '</p>' +
          '<p><strong>Accion:</strong> ' + esc(item.action) + '</p>' +
        '</details>';
      }).join("") + '</div>' +
      '<div class="notice alert">No uses enlaces de alertas sospechosas. Entra por la app oficial o escribe la direccion manualmente.</div>');
  }

  function renderRecords() {
    return shell("Donde puedo mirar?",
      "Un registro es una pista de actividad. Muchas plataformas guardan informacion sobre accesos, dispositivos, cambios y eventos de seguridad.",
      '<div class="card-grid">' + recordCards.map(function (row) {
        return '<div class="card"><h3>' + esc(row[0]) + '</h3><p><strong>Que muestra:</strong> ' + esc(row[1]) + '</p><p><strong>Que buscar:</strong> ' + esc(row[2]) + '</p></div>';
      }).join("") + '</div>' +
      renderMiniQuestion(6));
  }

  function renderCompromise() {
    return shell("Indicadores cotidianos de compromiso",
      "Un indicador de compromiso es una pista de que una cuenta, dispositivo o dato pudo haber sido afectado.",
      '<div class="monitor-map">' + compromiseCards.map(function (group) {
        return '<div class="card"><h3>' + esc(group[0]) + '</h3>' + list(group[1]) + '</div>';
      }).join("") + '</div>' +
      renderMiniQuestion(7));
  }

  function renderClassify() {
    var answered = classifyItems.filter(function (item) { return state.answers.classify[item.id]; }).length;
    return shell("Actividad 1: Clasifica la senal",
      "Clasifica cada situacion como actividad normal, senal sospechosa o alerta critica.",
      '<p><span class="routine-count">' + answered + ' de ' + classifyItems.length + ' clasificadas</span></p>' +
      '<div class="select-list">' + classifyItems.map(function (item) {
        return '<div class="select-row">' +
          '<label for="' + item.id + '">' + esc(item.text) + '</label>' +
          '<select id="' + item.id + '" data-classify="' + item.id + '">' +
            '<option value="">Selecciona...</option>' +
            signalLevels.map(function (level) {
              return '<option value="' + esc(level) + '"' + (state.answers.classify[item.id] === level ? " selected" : "") + '>' + esc(level) + '</option>';
            }).join("") +
          '</select>' +
        '</div>';
      }).join("") + '</div>' +
      classifyFeedback() +
      '<div class="notice">Cada clasificacion correcta suma. La actividad aporta hasta 20 puntos.</div>');
  }

  function renderLogActivity() {
    return shell("Actividad 2: Revision de actividad de cuenta",
      "Analiza el registro simulado y marca los eventos que requieren atencion.",
      '<div class="account-panel">' +
        '<header><div><strong>Registro simulado de cuenta</strong><span>No contiene datos reales.</span></div><span class="signal-badge signal-verificar">Modo practica</span></header>' +
        '<div class="account-body">' + logEvents.map(eventRow).join("") + '</div>' +
      '</div>' +
      '<fieldset class="question"><legend>Cuales eventos requieren atencion?</legend>' +
        logEvents.map(function (item) {
          var checked = state.answers.logEvents.indexOf(item.id) >= 0 ? " checked" : "";
          return '<label class="option"><input type="checkbox" data-log-event="' + item.id + '"' + checked + '> Evento ' + item.id.substring(1) + ': ' + esc(item.activity) + '</label>';
        }).join("") +
      '</fieldset>' +
      '<fieldset class="question"><legend>Cual evento es mas critico?</legend>' +
        radio("log-critical", "e4", "Evento 4: cambio de correo de recuperacion.", state.answers.logCritical) +
        radio("log-critical", "e5", "Evento 5: regla de reenvio creada.", state.answers.logCritical) +
        radio("log-critical", "e2", "Evento 2: intento de inicio de sesion.", state.answers.logCritical) +
      '</fieldset>' +
      '<fieldset class="question"><legend>Que accion inicial se debe tomar?</legend>' +
        radio("log-action", "secure", "Cambiar contrasena desde dispositivo seguro, cerrar sesiones, activar MFA y revisar recuperacion.", state.answers.logAction) +
        radio("log-action", "ignore", "Ignorar porque la cuenta todavia abre.", state.answers.logAction) +
        radio("log-action", "share", "Compartir el codigo de verificacion con soporte por chat.", state.answers.logAction) +
      '</fieldset>' +
      logFeedback() +
      '<div class="notice">Esta actividad aporta hasta 25 puntos.</div>');
  }

  function renderDecisions() {
    return shell("Actividad 3: Que hago con esta alerta?",
      "Selecciona la mejor decision para cada caso.",
      decisionCases.map(function (item, index) {
        var selected = state.answers.decisions[item.id];
        return '<fieldset class="question"><legend>Caso ' + (index + 1) + ': ' + esc(item.title) + '</legend>' +
          item.options.map(function (option, optIndex) {
            return radio("decision-" + item.id, String(optIndex), option, selected);
          }).join("") +
        '</fieldset>';
      }).join("") +
      decisionFeedback() +
      '<div class="notice">Cada respuesta correcta vale 4 puntos. Total: 20 puntos.</div>');
  }

  function renderRoutine() {
    var selected = state.answers.routine.length;
    return shell("Actividad 4: Mi rutina semanal de monitoreo",
      "Selecciona al menos cinco acciones que aplicaras semanal o mensualmente.",
      '<p><span class="routine-count">' + selected + ' acciones seleccionadas</span></p>' +
      routineOptions.map(function (item, index) {
        var checked = state.answers.routine.indexOf(index) >= 0 ? " checked" : "";
        return '<div class="monitor-check"><label><input type="checkbox" data-routine="' + index + '"' + checked + '> <span>' + esc(item) + '</span></label><span class="signal-badge signal-verificar">Revision</span></div>';
      }).join("") +
      routineFeedback() +
      '<div class="notice success">Una rutina corta y constante es mejor que una revision extensa que nunca se realiza.</div>');
  }

  function renderHelpMaterial() {
    return shell("Aprende mas: senales tempranas y monitoreo sin complicarse",
      "Esta seccion es opcional. Esta disponible para ampliar conocimiento sin recargar la ruta principal.",
      '<div class="accordion">' +
        helpDetails("Que es monitoreo basico", "Revisar periodicamente alertas, sesiones, dispositivos, apps conectadas, cambios de recuperacion, mensajes enviados, archivos compartidos y movimientos financieros.") +
        helpDetails("Senales tempranas", "Codigos no solicitados, alerta desde otra ciudad, solicitud de recuperacion, app que pide permisos inesperados o dispositivo desconocido conectado.") +
        helpDetails("Falso positivo o alerta real", "Un falso positivo tiene explicacion legitima. Una alerta real no se puede explicar o muestra actividad no autorizada.") +
        helpDetails("Como revisar sin exponerse", "No uses enlaces sospechosos. Entra desde la app oficial, no compartas codigos, cambia contrasena desde dispositivo seguro y documenta senales criticas.") +
        helpDetails("Mi revision de 10 minutos", "Cada semana revisa alertas, dispositivos, sesiones, apps, movimientos, archivos compartidos, MFA y copia de seguridad.") +
        helpDetails("Errores frecuentes", "Ignorar alertas, hacer clic en enlaces de la alerta, no cerrar sesiones antiguas, no revisar apps conectadas o borrar evidencia sin revisar.") +
        helpDetails("Glosario de monitoreo basico", "Monitoreo, registro, inicio de sesion, sesion activa, dispositivo conectado, alerta, indicador de compromiso, falso positivo, app conectada, regla de reenvio, MFA y evidencia digital.") +
      '</div>' +
      '<h3>Para seguir aprendiendo</h3>' + resourceList() +
      '<div class="notice">Los recursos externos son opcionales. La OVA funciona completa sin conexion a internet.</div>');
  }

  function renderQuiz() {
    return shell("Evaluacion final",
      "Responde estas cinco preguntas para consolidar los conceptos antes de revisar resultados.",
      quiz.map(function (item, index) {
        var selected = state.answers.quiz[item.id];
        return '<fieldset class="question"><legend>Pregunta ' + (index + 1) + ': ' + esc(item.q) + '</legend>' +
          item.options.map(function (option, optIndex) {
            return radio("quiz-" + item.id, String(optIndex), option, selected);
          }).join("") +
        '</fieldset>';
      }).join("") +
      quizFeedback() +
      '<div class="notice">Evaluacion de consolidacion. Debe completarse para finalizar la OVA.</div>');
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
        metric("Senales correctas", classifyCorrectCount() + " de " + classifyItems.length) +
        metric("Eventos detectados", logAttentionCount() + " de " + attentionEvents.length) +
        metric("Decisiones correctas", decisionsCorrectCount() + " de " + decisionCases.length) +
        metric("Rutina", state.answers.routine.length + " acciones") +
        metric("Evaluacion final", quizCorrectCount() + " de " + quiz.length) +
      '</div>' +
      '<h3>Recomendaciones</h3>' + list(resultRecommendations()) +
      (!complete ? '<div class="notice alert">Aun faltan actividades por completar. Revisa pantallas anteriores antes de finalizar.</div>' : '<div class="notice success">Puedes continuar a la pantalla final para registrar tu avance SCORM.</div>'));
  }

  function renderFinish() {
    var complete = allRequiredComplete();
    var score = calculateScore();
    var status = score >= 70 && complete ? "passed" : complete ? "completed" : "incomplete";
    return shell("Finalizacion SCORM",
      "Registra el avance en Moodle cuando termines la OVA.",
      '<div class="card-grid">' +
        card("Puntaje final", score + " / 100") +
        card("Estado que se enviara", status) +
        card("Actividades obligatorias", complete ? "Completas" : "Pendientes") +
      '</div>' +
      (state.finished ? '<div class="feedback correct">Tu avance fue registrado. Puedes cerrar esta ventana.</div>' : '') +
      (!complete ? '<div class="feedback partial">Para finalizar con estado aprobado o completado, responde las actividades obligatorias y la evaluacion final.</div>' : '') +
      '<div class="button-row"><button id="finish-ova" class="button button-primary" type="button"' + (!complete ? " disabled" : "") + '>Finalizar OVA</button></div>');
  }

  function shell(title, lead, body, firstButtonLabel) {
    return '<section class="screen hero">' +
      '<span class="tag">OVA U3-01</span>' +
      '<h2>' + esc(title) + '</h2>' +
      '<p class="lead">' + esc(lead) + '</p>' +
      body +
      nav(firstButtonLabel) +
    '</section>';
  }

  function nav(firstButtonLabel) {
    var back = state.screen === 0 ? "" : '<button id="prev-screen" class="button button-secondary" type="button">Anterior</button>';
    var nextLabel = state.screen === 0 ? (firstButtonLabel || "Continuar") : state.screen >= totalScreens - 1 ? "Ver finalizacion" : "Siguiente";
    var next = state.screen < totalScreens - 1 ? '<button id="next-screen" class="button button-primary" type="button">' + esc(nextLabel) + '</button>' : "";
    return '<div class="button-row">' + (back || '<span></span>') + next + '</div>';
  }

  function bindScreenEvents(index) {
    bindClick("prev-screen", function () { goTo(state.screen - 1); });
    bindClick("next-screen", function () {
      state.completed[index] = true;
      goTo(state.screen + 1);
    });
    if (index === 2) bindRadios("case", function (value) { state.answers.case = value; state.completed[2] = true; saveAndRender(); });
    if (miniQuestions[index]) bindRadios("mini-" + miniQuestions[index].id, function (value) { state.answers.mini[miniQuestions[index].id] = Number(value); state.completed[index] = true; saveAndRender(); });
    if (index === 8) bindClassify();
    if (index === 9) bindLog();
    if (index === 10) bindDecisions();
    if (index === 11) bindRoutine();
    if (index === 13) bindQuiz();
    if (index === 15) bindClick("finish-ova", finishOva);
  }

  function bindClassify() {
    qsa("[data-classify]").forEach(function (select) {
      select.addEventListener("change", function () {
        state.answers.classify[select.getAttribute("data-classify")] = select.value;
        state.completed[8] = classifyItems.every(function (item) { return state.answers.classify[item.id]; });
        saveAndRender();
      });
    });
  }

  function bindLog() {
    qsa("[data-log-event]").forEach(function (input) {
      input.addEventListener("change", function () {
        var id = input.getAttribute("data-log-event");
        toggleArrayValue(state.answers.logEvents, id, input.checked);
        state.completed[9] = isLogComplete();
        saveAndRender();
      });
    });
    bindRadios("log-critical", function (value) { state.answers.logCritical = value; state.completed[9] = isLogComplete(); saveAndRender(); });
    bindRadios("log-action", function (value) { state.answers.logAction = value; state.completed[9] = isLogComplete(); saveAndRender(); });
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

  function bindRoutine() {
    qsa("[data-routine]").forEach(function (input) {
      input.addEventListener("change", function () {
        var index = Number(input.getAttribute("data-routine"));
        toggleArrayValue(state.answers.routine, index, input.checked);
        state.completed[11] = state.answers.routine.length >= 5;
        saveAndRender();
      });
    });
  }

  function bindQuiz() {
    quiz.forEach(function (item) {
      bindRadios("quiz-" + item.id, function (value) {
        state.answers.quiz[item.id] = Number(value);
        state.completed[13] = quiz.every(function (row) { return state.answers.quiz[row.id] !== undefined; });
        saveAndRender();
      });
    });
  }

  function goTo(index) {
    state.screen = Math.max(0, Math.min(totalScreens - 1, index));
    saveProgress();
    render();
  }

  function saveAndRender() {
    saveProgress();
    render();
  }

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
    state.completed[15] = true;
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
      getLogScore() +
      getDecisionScore() +
      getRoutineScore()
    ));
  }

  function getCaseScore() { return state.answers.case === "B" ? 10 : 0; }

  function getMiniScore() {
    var correct = Object.keys(miniQuestions).filter(function (screen) {
      var q = miniQuestions[screen];
      return state.answers.mini[q.id] === q.correct;
    }).length;
    return correct * 5;
  }

  function getClassifyScore() {
    return Math.round((classifyCorrectCount() / classifyItems.length) * 20);
  }

  function classifyCorrectCount() {
    return classifyItems.filter(function (item) { return state.answers.classify[item.id] === item.correct; }).length;
  }

  function getLogScore() {
    var attention = logAttentionScore();
    var critical = ["e4", "e5"].indexOf(state.answers.logCritical) >= 0 ? 5 : 0;
    var action = state.answers.logAction === "secure" ? 10 : 0;
    return attention + critical + action;
  }

  function logAttentionScore() {
    var selected = state.answers.logEvents;
    var correct = attentionEvents.filter(function (id) { return selected.indexOf(id) >= 0; }).length;
    var wrong = selected.filter(function (id) { return attentionEvents.indexOf(id) < 0; }).length;
    return Math.max(0, Math.min(10, Math.round((correct / attentionEvents.length) * 10) - (wrong * 2)));
  }

  function logAttentionCount() {
    return attentionEvents.filter(function (id) { return state.answers.logEvents.indexOf(id) >= 0; }).length;
  }

  function getDecisionScore() { return decisionsCorrectCount() * 4; }

  function decisionsCorrectCount() {
    return decisionCases.filter(function (item) { return state.answers.decisions[item.id] === item.correct; }).length;
  }

  function getRoutineScore() {
    var count = state.answers.routine.length;
    if (count >= 8) return 10;
    if (count >= 5) return 7;
    return 0;
  }

  function quizCorrectCount() {
    return quiz.filter(function (item) { return state.answers.quiz[item.id] === item.correct; }).length;
  }

  function allRequiredComplete() {
    return state.answers.case !== null &&
      Object.keys(miniQuestions).every(function (screen) { return state.answers.mini[miniQuestions[screen].id] !== undefined; }) &&
      classifyItems.every(function (item) { return state.answers.classify[item.id]; }) &&
      isLogComplete() &&
      decisionCases.every(function (item) { return state.answers.decisions[item.id] !== undefined; }) &&
      state.answers.routine.length >= 5 &&
      quiz.every(function (item) { return state.answers.quiz[item.id] !== undefined; });
  }

  function isLogComplete() {
    return state.answers.logEvents.length > 0 && state.answers.logCritical !== null && state.answers.logAction !== null;
  }

  function renderMiniQuestion(screen) {
    var q = miniQuestions[screen];
    var selected = state.answers.mini[q.id];
    var feedback = selected === undefined ? "" : feedbackBlock(selected === q.correct, q.good, q.bad);
    return '<fieldset class="question"><legend>' + esc(q.q) + '</legend>' +
      q.options.map(function (option, index) {
        return radio("mini-" + q.id, String(index), option, selected);
      }).join("") +
    '</fieldset>' + feedback + '<div class="notice">Mini pregunta: 5 puntos.</div>';
  }

  function classifyFeedback() {
    var answered = classifyItems.filter(function (item) { return state.answers.classify[item.id]; }).length;
    if (!answered) return "";
    if (answered < classifyItems.length) return '<div class="feedback partial">Sigue clasificando. Ya tienes ' + answered + ' respuestas.</div>';
    var correct = classifyCorrectCount();
    var type = correct === classifyItems.length ? "correct" : correct >= 5 ? "partial" : "incorrect";
    return '<div class="feedback ' + type + '">Clasificaciones correctas: ' + correct + ' de ' + classifyItems.length + '.</div>';
  }

  function logFeedback() {
    if (!isLogComplete()) return "";
    var score = getLogScore();
    var type = score >= 22 ? "correct" : score >= 12 ? "partial" : "incorrect";
    return '<div class="feedback ' + type + '">Puntaje de revision del registro: ' + score + ' de 25. Eventos que requerian atencion: 2, 3, 4 y 5.</div>';
  }

  function decisionFeedback() {
    var answered = decisionCases.filter(function (item) { return state.answers.decisions[item.id] !== undefined; }).length;
    if (!answered) return "";
    var correct = decisionsCorrectCount();
    var type = correct === decisionCases.length ? "correct" : correct >= 3 ? "partial" : "incorrect";
    return '<div class="feedback ' + type + '">Decisiones correctas: ' + correct + ' de ' + decisionCases.length + '.</div>';
  }

  function routineFeedback() {
    var count = state.answers.routine.length;
    if (!count) return "";
    if (count >= 8) return '<div class="feedback correct">Excelente rutina. Tienes 8 o mas acciones: 10 puntos.</div>';
    if (count >= 5) return '<div class="feedback partial">Rutina suficiente. Tienes minimo cinco acciones: 7 puntos.</div>';
    return '<div class="feedback incorrect">Selecciona al menos cinco acciones para completar esta actividad.</div>';
  }

  function quizFeedback() {
    var answered = quiz.filter(function (item) { return state.answers.quiz[item.id] !== undefined; }).length;
    if (!answered) return "";
    var correct = quizCorrectCount();
    var type = correct === quiz.length ? "correct" : correct >= 3 ? "partial" : "incorrect";
    return '<div class="feedback ' + type + '">Evaluacion final: ' + correct + ' de ' + quiz.length + ' respuestas correctas.</div>';
  }

  function resultRecommendations() {
    var items = [];
    if (state.answers.mini["verification-code"] !== 0) items.push("No compartas codigos no solicitados; revisa actividad desde la app oficial.");
    if (classifyCorrectCount() < classifyItems.length) items.push("Refuerza la diferencia entre actividad normal, senal sospechosa y alerta critica.");
    if (logAttentionCount() < attentionEvents.length) items.push("Practica la lectura de registros: los eventos 2, 3, 4 y 5 requerian atencion.");
    if (decisionsCorrectCount() < decisionCases.length) items.push("Ante alertas fuertes, prioriza cerrar sesiones, cambiar contrasena, activar MFA y reportar por canales oficiales.");
    if (state.answers.routine.length < 8) items.push("Amplia tu rutina semanal: incluye dispositivos conectados, apps conectadas, movimientos bancarios y archivos compartidos.");
    items.push("Revisa alertas de inicio de sesion y no ignores cambios de recuperacion.");
    items.push("Revoca apps conectadas que no uses y revisa reglas de reenvio en el correo.");
    items.push("Documenta fecha, hora y canal cuando detectes una senal critica.");
    return unique(items);
  }

  function eventRow(item) {
    var cls = item.level === "Critico" ? "signal-critica" : item.level === "Sospechoso" ? "signal-sospechosa" : "signal-normal";
    return '<div class="event-row">' +
      '<strong>Evento ' + item.id.substring(1) + '</strong>' +
      '<span>' + esc(item.time) + '<br>' + esc(item.activity) + '</span>' +
      '<span>' + esc(item.location) + '</span>' +
      '<span class="signal-badge ' + cls + '">' + esc(item.level) + '</span>' +
    '</div>';
  }

  function statusCard(title, definition, examples, cls) {
    return '<div class="status-card ' + cls + '"><strong>' + esc(title) + '</strong><p>' + esc(definition) + '</p><p>' + esc(examples) + '</p></div>';
  }

  function riskPiece(title, textValue) {
    return '<div class="risk-piece"><strong>' + esc(title) + '</strong><span>' + esc(textValue) + '</span></div>';
  }

  function card(title, textValue) {
    return '<div class="card"><h3>' + esc(title) + '</h3><p>' + esc(textValue) + '</p></div>';
  }

  function metric(title, value) {
    return '<div class="metric"><strong>' + esc(value) + '</strong><span>' + esc(title) + '</span></div>';
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

  function timeline(items) {
    return '<div class="timeline">' + items.map(function (item) {
      return '<div class="timeline-item"><div class="timeline-dot" aria-hidden="true"></div><div class="timeline-card"><h3>' + esc(item[0]) + '</h3><p>' + esc(item[1]) + '</p></div></div>';
    }).join("") + '</div>';
  }

  function radio(name, value, label, selected) {
    var checked = String(selected) === String(value) ? " checked" : "";
    return '<label class="option"><input type="radio" name="' + esc(name) + '" value="' + esc(value) + '"' + checked + '> <span>' + esc(label) + '</span></label>';
  }

  function feedbackBlock(ok, good, bad) {
    return '<div class="feedback ' + (ok ? "correct" : "incorrect") + '">' + esc(ok ? good : bad) + '</div>';
  }

  function bindRadios(name, handler) {
    qsa('input[name="' + name + '"]').forEach(function (input) {
      input.addEventListener("change", function () { handler(input.value); });
    });
  }

  function bindClick(id, handler) {
    var element = document.getElementById(id);
    if (element) element.addEventListener("click", handler);
  }

  function toggleHelp(show) {
    var panel = document.getElementById("help-panel");
    if (!panel) return;
    panel.classList.toggle("hidden", !show);
  }

  function toggleReset(show) {
    var panel = document.getElementById("confirm-dialog");
    if (!panel) return;
    panel.classList.toggle("hidden", !show);
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
