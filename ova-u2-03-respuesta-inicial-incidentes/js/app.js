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
      classifications: {},
      decisions: {},
      rapidOrder: {},
      report: {
        type: "",
        asset: "",
        date: "",
        time: "",
        description: "",
        signals: [],
        evidences: [],
        channels: []
      },
      quiz: {}
    },
    completed: {},
    finalStatus: "incomplete",
    finished: false
  };
  var state = cloneDefault();

  var miniQuestions = {
    3: {
      id: "concepts",
      q: "¿Cual opcion representa mejor un incidente?",
      options: ["Recibir una notificacion esperada de una app.", "Alguien envia correos desde tu cuenta sin autorizacion.", "Actualizar el sistema operativo.", "Cambiar el fondo de pantalla."],
      correct: 1,
      good: "Correcto. Ya hay afectacion de una cuenta y posible suplantacion.",
      bad: "Un incidente implica afectacion real o alta probabilidad de afectacion sobre cuentas, dispositivos o informacion."
    },
    4: {
      id: "signals",
      q: "¿Cual es una señal clara de cuenta comprometida?",
      options: ["Cambiaste tu foto de perfil.", "Tus contactos reciben mensajes que tu no enviaste.", "Activaste MFA.", "Actualizaste el navegador."],
      correct: 1,
      good: "Correcto. Mensajes enviados sin autorizacion son una señal fuerte de compromiso.",
      bad: "La señal de compromiso es una accion no autorizada: mensajes, cambios, sesiones o accesos que no reconoces."
    },
    6: {
      id: "first10",
      q: "Si sospechas que descargaste malware en el computador, ¿que accion inicial es mas prudente?",
      options: ["Seguir abriendo archivos para confirmar.", "Desconectar el equipo de internet y pedir apoyo tecnico.", "Enviar el archivo a todos tus contactos.", "Borrar evidencias sin registrar nada."],
      correct: 1,
      good: "Correcto. Aislar el equipo reduce propagacion y evita mas daño.",
      bad: "Si sospechas malware, contiene primero: desconecta internet y busca apoyo tecnico confiable."
    },
    7: {
      id: "errors",
      q: "¿Por que no conviene borrar todo inmediatamente?",
      options: ["Porque se pierde evidencia util para reporte y analisis.", "Porque el equipo se apaga.", "Porque mejora la seguridad.", "Porque cambia la contraseña."],
      correct: 0,
      good: "Correcto. Documentar antes de eliminar ayuda al reporte y a entender que ocurrio.",
      bad: "Borrar sin documentar puede destruir evidencia necesaria para soporte, banco, plataforma o autoridad."
    }
  };

  var classificationCases = [
    ["Recibes una notificacion esperada porque acabas de iniciar sesion en tu correo.", "Evento"],
    ["Recibes una alerta de inicio de sesion desde una ciudad que no reconoces.", "Alerta"],
    ["Te llega un SMS del banco con un enlace extraño y amenaza de bloqueo.", "Sospecha"],
    ["Tus contactos reciben mensajes enviados desde tu cuenta sin autorizacion.", "Incidente"],
    ["Encuentras una transferencia que no realizaste.", "Incidente"],
    ["Un correo trae un archivo inesperado de una persona que no reconoces.", "Sospecha"]
  ];
  var classificationOptions = ["Evento", "Alerta", "Sospecha", "Incidente"];

  var decisionCases = [
    {
      text: "Ingresaste tus datos en un enlace falso de correo.",
      options: ["Seguir intentando entrar al enlace.", "Cambiar la contraseña desde un dispositivo seguro y activar MFA.", "Borrar el navegador y no contarle a nadie.", "Publicarlo primero en redes."],
      correct: 1,
      feedback: "La prioridad es proteger la cuenta desde un dispositivo confiable y activar MFA."
    },
    {
      text: "Recibes notificacion de una transferencia bancaria que no hiciste.",
      options: ["Llamar inmediatamente al banco para bloquear movimientos.", "Esperar hasta el dia siguiente.", "Responder al SMS del supuesto banco.", "Borrar la notificacion."],
      correct: 0,
      feedback: "En fraude financiero, el tiempo importa: reporta por canal oficial y bloquea movimientos."
    },
    {
      text: "Pierdes el celular con cuentas abiertas.",
      options: ["Esperar a ver si aparece.", "Bloquear SIM, cerrar sesiones, cambiar contraseñas criticas y usar localizacion o borrado remoto.", "Publicar el numero en redes.", "No hacer nada si tenia bateria baja."],
      correct: 1,
      feedback: "Un celular perdido concentra sesiones, MFA, mensajes y apps; contencion rapida reduce el daño."
    },
    {
      text: "Tu red social publica promociones falsas sin autorizacion.",
      options: ["Recuperar acceso, cambiar contraseña, activar MFA, cerrar sesiones y avisar a contactos por otro canal.", "Responder a compradores desde la misma cuenta comprometida.", "Ignorar porque es solo una red social.", "Borrar la app."],
      correct: 0,
      feedback: "Recupera y asegura la cuenta, pero avisa por otro canal para evitar mas victimas."
    },
    {
      text: "Descargaste un archivo sospechoso y el computador empieza a comportarse raro.",
      options: ["Desconectar internet, no abrir mas archivos y pedir apoyo tecnico.", "Enviar el archivo para que otros lo prueben.", "Instalar mas programas desconocidos.", "Seguir trabajando normalmente."],
      correct: 0,
      feedback: "Aislar el equipo y detener acciones reduce propagacion y perdida de informacion."
    }
  ];

  var rapidSteps = ["Reconoce", "Aisla", "Protege", "Informa", "Documenta", "Ordena recuperacion"];
  var incidentTypes = ["Cuenta comprometida", "Fraude financiero", "Phishing ejecutado", "Perdida de dispositivo", "Malware sospechoso", "Suplantacion en redes", "Otro"];
  var assets = ["Correo", "Banco o billetera digital", "Red social", "Celular", "Computador", "Nube", "Plataforma academica o laboral", "Otro"];
  var reportSignals = ["Inicio de sesion desconocido", "Movimiento no reconocido", "Mensajes enviados sin autorizacion", "Archivo sospechoso", "Perdida de acceso", "Dispositivo perdido", "App desconocida instalada", "Cambio de contraseña no autorizado", "Otro"];
  var evidenceItems = ["Captura del mensaje", "URL sospechosa", "Correo o remitente", "Numero telefonico", "Fecha y hora", "Comprobante o movimiento", "Captura de alerta", "Lista de acciones realizadas"];
  var reportChannels = ["Banco", "Plataforma afectada", "Area de TI", "Soporte institucional", "Operador movil", "Contactos afectados", "Autoridad competente", "Centro Cibernetico Policial"];
  var sensitiveWords = ["contraseña", "contrasena", "clave", "codigo", "código", "token", "pin", "cvv"];

  var quiz = [
    {
      q: "¿Que es un incidente digital?",
      options: ["Un evento que afecta o puede afectar la seguridad de una cuenta, dispositivo o informacion.", "Una actualizacion normal del sistema.", "Una contraseña fuerte.", "Una copia de seguridad."],
      correct: 0
    },
    {
      q: "¿Que debes hacer si entregaste tu contraseña en una pagina falsa?",
      options: ["Cambiarla desde un dispositivo seguro y activar MFA.", "Seguir usando la misma contraseña.", "Responder al atacante.", "Borrar todo sin documentar."],
      correct: 0
    },
    {
      q: "¿Que evidencia puede ser util en un reporte?",
      options: ["Captura del mensaje, URL, fecha, hora y remitente.", "La contraseña de la cuenta.", "El codigo SMS recibido.", "El PIN bancario."],
      correct: 0
    },
    {
      q: "¿Que accion ayuda a contener un posible malware?",
      options: ["Enviar el archivo a todos los contactos.", "Desconectar el equipo de internet y pedir apoyo tecnico.", "Seguir abriendo archivos.", "Desactivar todas las alertas."],
      correct: 1
    },
    {
      q: "¿Cual es una buena practica despues de recuperar una cuenta?",
      options: ["Revisar sesiones, MFA, recuperacion, reglas y apps conectadas.", "No revisar nada mas.", "Compartir la nueva contraseña.", "Desactivar las alertas de seguridad."],
      correct: 0
    }
  ];

  var resources = [
    ["https://grow.google/certificates/cybersecurity/", "Google Cybersecurity Certificate", "Ruta para profundizar en deteccion, respuesta, riesgos y herramientas."],
    ["https://www.coursera.org/learn/detection-and-response", "Sound the Alarm: Detection and Response", "Curso de Google sobre deteccion, documentacion, respuesta y recuperacion."],
    ["https://csrc.nist.gov/pubs/sp/800/61/r3/final", "NIST SP 800-61 Rev. 3", "Guia de recomendaciones de respuesta a incidentes integrada a gestion de riesgo."],
    ["https://www.nist.gov/cyberframework", "NIST Cybersecurity Framework 2.0", "Marco para gobernar, identificar, proteger, detectar, responder y recuperar."],
    ["https://www.cisa.gov/resources-tools/services/incident-response", "CISA Incident Response", "Recursos de apoyo para preparacion y respuesta ante incidentes."],
    ["https://myaccount.google.com/security-checkup", "Google Security Checkup", "Herramienta para revisar actividad sospechosa y dispositivos conectados."],
    ["https://caivirtual.policia.gov.co/", "CAI Virtual / Centro Cibernetico Policial", "Canal colombiano para orientacion y reporte de delitos digitales."],
    ["https://www.incibe.es/ciudadania", "INCIBE Ciudadania", "Recursos en español sobre fraudes, incidentes y seguridad digital."]
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
    base.answers.classifications = Object.assign({}, base.answers.classifications || {});
    base.answers.decisions = Object.assign({}, base.answers.decisions || {});
    base.answers.rapidOrder = Object.assign({}, base.answers.rapidOrder || {});
    base.answers.report = Object.assign(cloneDefault().answers.report, base.answers.report || {});
    base.answers.quiz = Object.assign({}, base.answers.quiz || {});
    base.completed = Object.assign({}, saved.completed || {});
    base.finalStatus = saved.finalStatus || "incomplete";
    base.finished = Boolean(saved.finished);
    return base;
  }

  function normalizeState() {
    state.answers = state.answers || {};
    state.answers.mini = state.answers.mini || {};
    state.answers.classifications = state.answers.classifications || {};
    state.answers.decisions = state.answers.decisions || {};
    state.answers.rapidOrder = state.answers.rapidOrder || {};
    state.answers.report = Object.assign(cloneDefault().answers.report, state.answers.report || {});
    state.answers.report.signals = Array.isArray(state.answers.report.signals) ? state.answers.report.signals : [];
    state.answers.report.evidences = Array.isArray(state.answers.report.evidences) ? state.answers.report.evidences : [];
    state.answers.report.channels = Array.isArray(state.answers.report.channels) ? state.answers.report.channels : [];
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
    state.score = getCaseScore() + getMiniScore() + getClassificationScore() + getDecisionScore() + getRapidScore() + getReportScore() + getQuizScore();
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
      decisionesTomadas: state.answers.decisions,
      tipoIncidente: state.answers.report.type,
      accionesPriorizadas: state.answers.rapidOrder,
      reporteInicial: state.answers.report,
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
    return Boolean(state.completed.case && allMiniComplete() && state.completed.classification && state.completed.decisions && state.completed.rapid && state.completed.report && state.completed.quiz);
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
      concepts,
      signals,
      rapidProtocol,
      firstTenMinutes,
      avoidErrors,
      classificationActivity,
      decisionActivity,
      rapidOrderActivity,
      reportActivity,
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
    bindClick("submit-case", submitCase);
    bindClick("submit-mini", submitMini);
    bindClick("submit-classification", submitClassification);
    bindClick("submit-decisions", submitDecisions);
    bindClick("submit-rapid", submitRapidOrder);
    bindClick("submit-report", submitReport);
    bindClick("submit-quiz", submitQuiz);
    bindClick("finish-ova", finishOva);
  }

  function bindClick(id, handler) {
    var element = document.getElementById(id);
    if (element) element.addEventListener("click", handler);
  }

  function welcome() {
    return '<section class="screen hero"><span class="tag">Unidad 2 · OVA 3 · 100 puntos</span>' +
      '<h2>Bienvenido a la OVA 3 de la Unidad 2</h2>' +
      '<p class="subtitle">Respuesta inicial ante incidentes digitales: ¿que hago en los primeros minutos?</p>' +
      '<p class="lead">En las OVAs anteriores identificaste activos digitales y reconociste vulnerabilidades. Ahora aprenderas que hacer cuando algo ya ocurrio o parece estar ocurriendo.</p>' +
      '<div class="status-grid">' +
      statusCard("Inicio desconocido", "Una alerta desde otra ciudad no se ignora: se revisa y se contiene.", "level-medium") +
      statusCard("Transferencia no reconocida", "El banco o billetera debe contactarse por canal oficial de inmediato.", "level-high") +
      statusCard("Phishing ejecutado", "Si ya hiciste clic o entregaste datos, protege accesos desde dispositivo seguro.", "level-high") +
      '</div><div class="notice asset"><strong>Mensaje central:</strong> actuar rapido no significa actuar con panico. La clave es detener el daño, proteger accesos, reportar y documentar.</div>' +
      '<div class="brand-strip"><img src="assets/logo-unicartagena-ctev.png" alt="Logo Universidad de Cartagena y CTEV"><span>Curso interactivo de formacion en ciberseguridad</span></div>' +
      nav(false, true, "Iniciar OVA") + '</section>';
  }

  function objective() {
    return '<section class="screen"><span class="tag">Objetivo de aprendizaje</span><h2>Responder con calma, orden y evidencia</h2>' +
      '<p class="lead">Aplicar un protocolo basico de respuesta inicial ante incidentes digitales, identificando señales de alerta, acciones prioritarias, canales de reporte, documentacion de evidencias y medidas iniciales de recuperacion.</p>' +
      '<div class="card-grid">' +
      infoCard("1", "Evento, alerta, sospecha e incidente", "Aprenderas a nombrar la situacion antes de actuar.") +
      infoCard("2", "Señales de compromiso", "Reconoceras pistas en cuentas, dispositivos, finanzas, redes y nube.") +
      infoCard("3", "Primeros 10 minutos", "Aplicaras acciones de contencion sin destruir evidencia.") +
      infoCard("4", "Protocolo RAPIDO", "Reconoce, aisla, protege, informa, documenta y ordena recuperacion.") +
      infoCard("5", "Reporte inicial", "Construiras un reporte simulado sin datos sensibles.") +
      infoCard("6", "Recuperacion", "Revisaras sesiones, MFA, reglas, apps, permisos y copias.") +
      '</div><div class="notice alert"><strong>Privacidad:</strong> no escribas contraseñas, codigos, datos bancarios, telefonos reales ni capturas reales.</div>' +
      nav(true, true, "Ver caso inicial") + '</section>';
  }

  function initialCase() {
    var feedback = "";
    if (state.completed.case) {
      if (state.answers.case === "B") feedback = '<p class="feedback correct">Correcto. Ante acceso desconocido se debe proteger la cuenta, cerrar sesiones, cambiar contraseña desde un dispositivo seguro y activar MFA. Puntaje: 10/10.</p>';
      else if (state.answers.case === "D") feedback = '<p class="feedback partial">Parcialmente correcto. Avisar puede ser necesario, pero primero se contiene el daño y se protege la cuenta. Puntaje: 3/10.</p>';
      else feedback = '<p class="feedback incorrect">Ignorar alertas permite que el atacante continue. Borrar evidencias puede dificultar el analisis y reporte. Puntaje: 0/10.</p>';
    }
    return '<section class="screen"><span class="tag">Caso inicial · 10 puntos</span><h2>Caso: La alerta que Carlos ignoro</h2>' +
      '<div class="simulation-grid">' + incidentPhone() +
      '<div><p>Carlos recibio una alerta de inicio de sesion en su correo desde otra ciudad. Penso que era un error y la ignoro.</p><p>Horas despues, varios contactos le escribieron diciendo que recibieron correos extraños desde su cuenta. Al revisar, encontro sesiones abiertas en dispositivos desconocidos, reglas de reenvio que no habia creado y mensajes enviados sin autorizacion.</p><div class="notice risk"><strong>Dilema:</strong> Carlos no sabia si borrar todo, cambiar la contraseña, llamar a alguien o reportar.</div></div></div>' +
      '<fieldset class="question"><legend>¿Cual debio ser la primera accion de Carlos al recibir la alerta sospechosa?</legend>' +
      caseOption("A", "Ignorar la alerta porque tal vez fue un error.") +
      caseOption("B", "Cambiar la contraseña desde un dispositivo seguro, cerrar sesiones desconocidas y activar MFA.") +
      caseOption("C", "Borrar todos los correos enviados.") +
      caseOption("D", "Publicar en redes que alguien lo hackeo.") +
      '</fieldset><button id="submit-case" class="button button-primary" type="button">Confirmar respuesta</button>' + feedback +
      nav(true, state.completed.case, "Conceptos clave") + '</section>';
  }

  function concepts() {
    return '<section class="screen"><span class="tag">Conceptos clave</span><h2>No todo es igual: evento, alerta, sospecha e incidente</h2>' +
      '<p class="lead">Nombrar bien la situacion ayuda a decidir mejor. No toda alerta confirma un incidente, pero toda alerta sospechosa merece revision.</p>' +
      '<div class="status-grid">' +
      statusCard("Evento", "Algo ocurre en una cuenta o sistema. Ejemplo: una notificacion esperada de inicio de sesion.", "level-safe") +
      statusCard("Alerta", "Señal que indica revision. Ejemplo: inicio de sesion desde ubicacion desconocida.", "level-medium") +
      statusCard("Sospecha", "No esta confirmado, pero hay señales de riesgo. Ejemplo: SMS bancario con enlace raro.", "level-medium") +
      statusCard("Incidente", "Afecta o puede afectar confidencialidad, integridad o disponibilidad. Ejemplo: correos enviados sin autorizacion.", "level-high") +
      '</div>' + miniQuestionBlock(3) + nav(true, isMiniAnswered("concepts"), "Señales de compromiso") + '</section>';
  }

  function signals() {
    var groups = [
      ["Cuenta comprometida", ["Alertas de inicio de sesion desconocido.", "Contraseña cambiada sin autorizacion.", "Correos o mensajes enviados que no reconoces.", "Sesiones en dispositivos desconocidos.", "Cambios en recuperacion de cuenta."]],
      ["Dispositivo comprometido", ["Lentitud repentina.", "Ventanas extrañas.", "Programas desconocidos.", "Antivirus desactivado.", "Archivos cifrados o bloqueados."]],
      ["Fraude financiero", ["Movimientos no reconocidos.", "Compras que no hiciste.", "Transferencias no autorizadas.", "Codigos SMS que no solicitaste."]],
      ["Red social comprometida", ["Publicaciones que no hiciste.", "Mensajes enviados a contactos.", "Cambio de correo o numero.", "Promociones falsas desde tu cuenta."]],
      ["Phishing ejecutado", ["Hiciste clic en enlace sospechoso.", "Escribiste usuario y contraseña.", "Entregaste un codigo.", "Descargaste un archivo inesperado."]]
    ];
    return '<section class="screen"><span class="tag">Señales de compromiso</span><h2>Señales de que algo puede estar comprometido</h2>' +
      '<div class="visual-lesson"><div><p class="lead">Una señal aislada no siempre confirma un incidente, pero varias señales juntas requieren respuesta inmediata.</p><p>El objetivo no es investigar todo en profundidad, sino reconocer lo suficiente para contener el daño y reportar.</p></div><img class="lesson-image" src="assets/phishing-correo.png" alt="Ilustracion de alerta por correo sospechoso"></div>' +
      '<div class="accordion">' + groups.map(function (group) { return detailsBlock(group[0], group[1]); }).join("") + '</div>' +
      miniQuestionBlock(4) + nav(true, isMiniAnswered("signals"), "Protocolo RAPIDO") + '</section>';
  }

  function rapidProtocol() {
    return '<section class="screen"><span class="tag">Protocolo RAPIDO</span><h2>Una secuencia clara para los primeros minutos</h2>' +
      '<p class="lead">El protocolo RAPIDO ayuda a actuar sin panico durante un incidente digital.</p>' +
      '<div class="rapid-grid">' +
      rapidCard("R", "Reconoce", "Identifica señales del incidente. No minimices alertas sospechosas.") +
      rapidCard("A", "Aisla", "Deten el posible daño: no sigas haciendo clic, cierra sesiones o desconecta internet si hay malware.") +
      rapidCard("P", "Protege", "Cambia contraseñas desde un dispositivo seguro, activa MFA y bloquea cuentas o tarjetas si aplica.") +
      rapidCard("I", "Informa", "Reporta a banco, plataforma, TI, soporte institucional, operador, autoridad o contactos afectados.") +
      rapidCard("D", "Documenta", "Guarda capturas, fechas, horas, URLs, remitentes, numeros, movimientos y acciones.") +
      rapidCard("O", "Ordena recuperacion", "Recupera accesos, revisa configuraciones, elimina apps sospechosas y aprende del incidente.") +
      '</div><div class="notice asset"><strong>Mensaje clave:</strong> primero se contiene el daño. Despues se recupera y se aprende.</div>' +
      nav(true, true, "Primeros 10 minutos") + '</section>';
  }

  function firstTenMinutes() {
    return '<section class="screen"><span class="tag">Primeros 10 minutos</span><h2>Que hacer en los primeros 10 minutos</h2>' +
      '<div class="timeline">' +
      timelineItem("1", "Minuto 1", "Detente. No hagas mas clics, no respondas al atacante y no sigas instrucciones.") +
      timelineItem("2", "Minutos 2 a 3", "Identifica que activo esta afectado: correo, banco, red social, celular, computador, nube o plataforma.") +
      timelineItem("3", "Minutos 3 a 5", "Aisla o contiene: cierra sesiones, desconecta internet si hay malware, bloquea cuenta o tarjeta si hay fraude.") +
      timelineItem("4", "Minutos 5 a 7", "Protege accesos: cambia contraseña desde dispositivo seguro, activa MFA y revisa recuperacion.") +
      timelineItem("5", "Minutos 7 a 9", "Documenta: capturas, URLs, numeros, correos, fechas, horas, movimientos y acciones.") +
      timelineItem("6", "Minuto 10", "Reporta por canal oficial: banco, plataforma, TI, soporte institucional, operador o autoridad.") +
      '</div>' + miniQuestionBlock(6) + nav(true, isMiniAnswered("first10"), "Errores a evitar") + '</section>';
  }

  function avoidErrors() {
    var items = [
      ["Seguir interactuando con el atacante", "Puedes entregar mas informacion.", "Detener la interaccion."],
      ["Borrar todo de inmediato", "Puedes perder evidencias utiles.", "Documentar antes de eliminar."],
      ["Cambiar contraseña desde equipo infectado", "El atacante podria capturar la nueva clave.", "Usar un dispositivo seguro."],
      ["No reportar por verguenza", "El atacante puede afectar a mas personas.", "Reportar a tiempo."],
      ["Avisar tarde a contactos", "Pueden caer en mensajes enviados desde tu cuenta.", "Advertir por otro canal."],
      ["Creer que recuperar acceso basta", "Pueden quedar sesiones, reglas o apps maliciosas.", "Revisar sesiones, recuperacion, reglas, apps y MFA."]
    ];
    return '<section class="screen"><span class="tag">Errores que agravan</span><h2>Errores comunes durante un incidente</h2>' +
      '<div class="status-grid">' + items.map(function (item) {
        return statusCard(item[0], "Riesgo: " + item[1] + " Accion correcta: " + item[2], "level-high");
      }).join("") + '</div>' + miniQuestionBlock(7) + nav(true, isMiniAnswered("errors"), "Actividad 1") + '</section>';
  }

  function classificationActivity() {
    var feedback = state.completed.classification
      ? '<p class="feedback ' + feedbackClass(getClassificationScore(), 15) + '">Clasificacion revisada. Puntaje: ' + getClassificationScore() + '/15.</p>' + classificationFeedback()
      : '<p class="muted">Clasifica cada situacion como evento, alerta, sospecha o incidente.</p>';
    return '<section class="screen"><span class="tag">Actividad 1 · 15 puntos</span><h2>¿Evento, alerta, sospecha o incidente?</h2>' +
      '<div class="select-list">' + classificationCases.map(function (item, index) {
        var selected = state.answers.classifications[index] || "";
        return '<div class="select-row"><label for="classification-' + index + '"><strong>Situacion ' + (index + 1) + ':</strong> ' + item[0] + '</label><select id="classification-' + index + '"><option value="">Selecciona...</option>' + classificationOptions.map(function (option) { return selectOption(option, option, selected); }).join("") + '</select></div>';
      }).join("") + '</div><button id="submit-classification" class="button button-primary" type="button">Calificar clasificacion</button>' + feedback +
      nav(true, state.completed.classification, "Actividad 2") + '</section>';
  }

  function decisionActivity() {
    var feedback = state.completed.decisions
      ? '<p class="feedback ' + feedbackClass(getDecisionScore(), 20) + '">Decisiones revisadas. Puntaje: ' + getDecisionScore() + '/20.</p>' + decisionFeedback()
      : "";
    return '<section class="screen"><span class="tag">Actividad 2 · 20 puntos</span><h2>¿Que hago primero?</h2><p class="lead">Selecciona la mejor primera accion para cada caso.</p>' +
      decisionCases.map(function (item, qIndex) {
        return '<fieldset class="question"><legend>' + (qIndex + 1) + '. ' + item.text + '</legend>' + item.options.map(function (option, oIndex) {
          return '<label class="option"><input type="radio" name="decision-' + qIndex + '" value="' + oIndex + '"' + (String(state.answers.decisions[qIndex]) === String(oIndex) ? " checked" : "") + '><span><strong>' + String.fromCharCode(65 + oIndex) + '.</strong> ' + option + '</span></label>';
        }).join("") + '</fieldset>';
      }).join("") + '<button id="submit-decisions" class="button button-primary" type="button">Calificar decisiones</button>' + feedback +
      nav(true, state.completed.decisions, "Actividad 3") + '</section>';
  }

  function rapidOrderActivity() {
    var feedback = state.completed.rapid
      ? '<p class="feedback ' + feedbackClass(getRapidScore(), 15) + '">Protocolo revisado. Puntaje: ' + getRapidScore() + '/15. Primero se reconoce y contiene; luego se protegen accesos, se reporta, se documenta y se recupera.</p>'
      : '<p class="muted">Ordena correctamente los pasos del protocolo RAPIDO.</p>';
    return '<section class="screen"><span class="tag">Actividad 3 · 15 puntos</span><h2>Ordena la respuesta</h2>' +
      '<div class="select-list">' + rapidSteps.map(function (_step, index) {
        var selected = state.answers.rapidOrder[index] || "";
        return '<div class="select-row"><label for="rapid-' + index + '"><strong>Paso ' + (index + 1) + '</strong></label><select id="rapid-' + index + '"><option value="">Selecciona...</option>' + rapidSteps.map(function (step) { return selectOption(step, step, selected); }).join("") + '</select></div>';
      }).join("") + '</div><button id="submit-rapid" class="button button-primary" type="button">Calificar protocolo</button>' + feedback +
      nav(true, state.completed.rapid, "Actividad 4") + '</section>';
  }

  function reportActivity() {
    var report = state.answers.report;
    var feedback = state.completed.report
      ? '<p class="feedback ' + feedbackClass(getReportScore(), 20) + '">Reporte simulado revisado. Puntaje: ' + getReportScore() + '/20.</p>' + reportSummary()
      : '<p class="muted">Completa un reporte simulado. No escribas datos reales ni informacion sensible.</p>';
    return '<section class="screen"><span class="tag">Actividad 4 · 20 puntos</span><h2>Reporte inicial del incidente</h2>' +
      '<div class="report-box"><strong>Advertencia:</strong> no incluyas contraseñas, claves, codigos, token, PIN, CVV ni datos bancarios completos.</div>' +
      '<div class="report-form"><div class="form-grid">' +
      formSelect("report-type", "Tipo de incidente", incidentTypes, report.type) +
      formSelect("report-asset", "Activo afectado", assets, report.asset) +
      formInput("report-date", "Fecha aproximada", "date", report.date) +
      formInput("report-time", "Hora aproximada", "time", report.time) +
      '</div><div class="form-field"><label for="report-description">¿Que ocurrio? Maximo 300 caracteres.</label><textarea id="report-description" maxlength="300">' + escapeHtml(report.description) + '</textarea></div>' +
      '<div class="inventory-grid">' +
      checkboxGroup("Señales observadas", "signal", reportSignals, report.signals) +
      checkboxGroup("Evidencias que deberia guardar", "evidence", evidenceItems, report.evidences) +
      checkboxGroup("A quien deberia reportar", "channel", reportChannels, report.channels) +
      '</div></div><button id="submit-report" class="button button-primary" type="button">Guardar reporte simulado</button>' + feedback +
      nav(true, state.completed.report, "Material de ayuda") + '</section>';
  }

  function helpMaterial() {
    return '<section class="screen"><span class="tag">Aprende mas · opcional</span><h2>Responder sin panico y con evidencia</h2>' +
      '<p class="subtitle">Actuar rapido no significa improvisar. Significa aplicar una secuencia clara para reducir daño.</p>' +
      '<div class="accordion">' +
      detailsBlock("Que es un incidente digital", ["Situacion que afecta o puede afectar una cuenta, dispositivo, servicio, archivo o informacion.", "Puede afectar confidencialidad, integridad, disponibilidad, reputacion, economia o continuidad."]) +
      detailsBlock("Evento, alerta, sospecha e incidente", ["Evento: algo ocurre, no necesariamente peligroso.", "Alerta: señal que debe revisarse.", "Sospecha: hay indicios de fraude o acceso indebido.", "Incidente: el daño ocurrio o existe alta probabilidad de afectacion."]) +
      detailsBlock("Señales de compromiso", ["Cuentas: sesiones desconocidas, reglas de reenvio, mensajes sin permiso.", "Dispositivos: lentitud, ventanas emergentes, apps desconocidas, antivirus desactivado.", "Finanzas: movimientos no reconocidos, codigos no solicitados.", "Redes sociales: publicaciones falsas, mensajes y perdida de acceso."]) +
      detailsBlock("Que evidencias conservar", ["Captura del mensaje.", "URL sospechosa.", "Correo del remitente.", "Numero telefonico.", "Fecha y hora.", "Movimiento no reconocido.", "Alerta de seguridad.", "Acciones realizadas."]) +
      detailsBlock("Que no se debe hacer", ["No seguir interactuando con el atacante.", "No entregar mas codigos.", "No borrar todo sin documentar.", "No cambiar contraseña desde equipo infectado.", "No ocultar el incidente por verguenza.", "No instalar herramientas desconocidas."]) +
      detailsBlock("A quien reportar", ["Fraude bancario: banco, billetera digital o linea antifraude.", "Correo comprometido: proveedor o soporte institucional.", "Red social tomada: plataforma y contactos afectados por otro canal.", "Celular perdido: operador movil, cuentas criticas y autoridad si aplica.", "Malware: area de TI o soporte tecnico confiable."]) +
      detailsBlock("Recuperacion inicial", ["Cambiar contraseña.", "Activar MFA.", "Cerrar sesiones desconocidas.", "Revisar recuperacion, reglas y apps conectadas.", "Avisar a contactos si hubo suplantacion.", "Restaurar archivos desde copia.", "Ajustar configuraciones para evitar repeticion."]) +
      detailsBlock("Glosario de respuesta inicial", ["Contencion: acciones para detener o limitar el daño.", "Evidencia digital: informacion que ayuda a documentar un incidente.", "Compromiso: cuenta, dispositivo o dato afectado.", "Suplantacion: uso de identidad ajena para engañar.", "Reporte: comunicacion formal del incidente.", "Linea de tiempo: orden cronologico de lo ocurrido."]) +
      '</div><div class="reading-block"><h3>Reporte inicial recomendado</h3><p>Incluye fecha y hora aproximada, tipo de incidente, activo afectado, que ocurrio, señales observadas, acciones realizadas, evidencias disponibles, canal usado, estado actual y proxima accion.</p><p><strong>Ejemplo seguro:</strong> Recibi una alerta de inicio de sesion desconocido. Revise la cuenta y encontre una sesion que no reconozco. Cambie la contraseña desde otro dispositivo, active MFA y guarde captura de la alerta.</p></div>' +
      resourcesBlock() + nav(true, true, "Evaluacion final") + '</section>';
  }

  function finalQuiz() {
    var feedback = state.completed.quiz
      ? '<p class="feedback ' + feedbackClass(getQuizScore(), 10) + '">Evaluacion calificada. Puntaje: ' + getQuizScore() + '/10.</p>'
      : "";
    return '<section class="screen"><span class="tag">Evaluacion final · 10 puntos</span><h2>Comprueba lo aprendido</h2><p>Cada respuesta correcta vale 2 puntos.</p>' +
      quiz.map(function (item, qIndex) {
        return '<fieldset class="question"><legend>' + (qIndex + 1) + '. ' + item.q + '</legend>' + item.options.map(function (option, oIndex) {
          return '<label class="option"><input type="radio" name="q' + qIndex + '" value="' + oIndex + '"' + (String(state.answers.quiz[qIndex]) === String(oIndex) ? " checked" : "") + '><span>' + option + '</span></label>';
        }).join("") + '</fieldset>';
      }).join("") + '<button id="submit-quiz" class="button button-primary" type="button">Calificar evaluacion</button>' + feedback +
      nav(true, state.completed.quiz, "Ver resultados") + '</section>';
  }

  function results() {
    var complete = allRequiredComplete();
    var recommendation = !complete
      ? "Completa caso, mini preguntas, clasificacion, decisiones, protocolo, reporte y evaluacion."
      : state.score >= 85
        ? "Excelente. Tu respuesta inicial combina calma, contencion, proteccion, reporte y evidencia."
        : state.score >= 70
          ? "Buen avance. Refuerza especialmente el orden del protocolo y el reporte sin datos sensibles."
          : "Completado con recomendaciones: vuelve a revisar primeros 10 minutos, evidencias y canales de reporte.";
    return '<section class="screen center"><span class="tag">Resultados</span><h2>Tu resultado en OVA U2-03</h2>' +
      '<div class="result-score" style="--score:' + state.score + '%">' + state.score + '<small>/100</small></div><h3>Estado: ' + statusLabel() + '</h3><p class="lead">' + recommendation + '</p>' +
      '<div class="metric-grid">' +
      metric("Caso inicial", state.completed.case ? getCaseScore() + "/10" : "Pendiente") +
      metric("Mini preguntas", getMiniScore() + "/10") +
      metric("Clasificacion", state.completed.classification ? getClassificationScore() + "/15" : "Pendiente") +
      metric("Primeras acciones", state.completed.decisions ? getDecisionScore() + "/20" : "Pendiente") +
      metric("Protocolo RAPIDO", state.completed.rapid ? getRapidScore() + "/15" : "Pendiente") +
      metric("Reporte inicial", state.completed.report ? getReportScore() + "/20" : "Pendiente") +
      metric("Evaluacion", state.completed.quiz ? getQuizScore() + "/10" : "Pendiente") +
      '</div><div class="reading-block"><h3>Recomendaciones personalizadas</h3>' + listItems(resultRecommendations()) + '</div>' +
      '<div class="reading-block"><h3>Resumen del reporte simulado</h3>' + compactReportSummary() + '</div>' +
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

  function submitClassification() {
    var answers = {};
    for (var i = 0; i < classificationCases.length; i += 1) {
      var select = document.getElementById("classification-" + i);
      if (!select.value) return showInlineError("Clasifica las seis situaciones antes de calificar.");
      answers[i] = select.value;
    }
    state.answers.classifications = answers;
    state.completed.classification = true;
    saveProgress();
    render();
  }

  function submitDecisions() {
    var answers = {};
    for (var i = 0; i < decisionCases.length; i += 1) {
      var checked = app.querySelector('input[name="decision-' + i + '"]:checked');
      if (!checked) return showInlineError("Selecciona una accion para cada caso.");
      answers[i] = Number(checked.value);
    }
    state.answers.decisions = answers;
    state.completed.decisions = true;
    saveProgress();
    render();
  }

  function submitRapidOrder() {
    var answers = {};
    var values = [];
    for (var i = 0; i < rapidSteps.length; i += 1) {
      var select = document.getElementById("rapid-" + i);
      if (!select.value) return showInlineError("Completa los seis pasos del protocolo.");
      answers[i] = select.value;
      values.push(select.value);
    }
    if (new Set(values).size !== values.length) return showInlineError("No repitas pasos del protocolo RAPIDO.");
    state.answers.rapidOrder = answers;
    state.completed.rapid = true;
    saveProgress();
    render();
  }

  function submitReport() {
    var description = document.getElementById("report-description").value.trim();
    if (containsSensitive(description)) {
      return showInlineError("Evita escribir datos sensibles en el reporte. Describe el hecho sin incluir claves, codigos ni informacion privada.");
    }
    state.answers.report = {
      type: document.getElementById("report-type").value,
      asset: document.getElementById("report-asset").value,
      date: document.getElementById("report-date").value,
      time: document.getElementById("report-time").value,
      description: description,
      signals: checkedValues("signal"),
      evidences: checkedValues("evidence"),
      channels: checkedValues("channel")
    };
    state.completed.report = true;
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
      decisionesTomadas: state.answers.decisions,
      tipoIncidente: state.answers.report.type,
      accionesPriorizadas: state.answers.rapidOrder,
      reporteInicial: state.answers.report,
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
    if (state.answers.case === "B") return 10;
    if (state.answers.case === "D") return 3;
    return 0;
  }

  function getMiniScore() {
    var correct = Object.keys(miniQuestions).reduce(function (sum, screenIndex) {
      var item = miniQuestions[screenIndex];
      return sum + (state.answers.mini[item.id] === item.correct ? 1 : 0);
    }, 0);
    return Math.round(correct * 2.5);
  }

  function getClassificationScore() {
    if (!state.completed.classification) return 0;
    var correct = classificationCases.reduce(function (sum, item, index) {
      return sum + (state.answers.classifications[index] === item[1] ? 1 : 0);
    }, 0);
    return Math.round(correct * 2.5);
  }

  function getDecisionScore() {
    if (!state.completed.decisions) return 0;
    return decisionCases.reduce(function (sum, item, index) {
      return sum + (state.answers.decisions[index] === item.correct ? 4 : 0);
    }, 0);
  }

  function getRapidScore() {
    if (!state.completed.rapid) return 0;
    var selected = rapidSteps.map(function (_step, index) { return state.answers.rapidOrder[index]; });
    var positions = selected.reduce(function (sum, value, index) { return sum + (value === rapidSteps[index] ? 1 : 0); }, 0);
    if (positions === 6) return 15;
    if (positions >= 4) return 10;
    if (positions >= 2) return 5;
    return 0;
  }

  function getReportScore() {
    if (!state.completed.report) return 0;
    var report = state.answers.report;
    var raw = 0;
    if (report.type) raw += 3;
    if (report.asset) raw += 3;
    if (report.date || report.time) raw += 3;
    if (report.description && !containsSensitive(report.description)) raw += 4;
    if (report.signals.length >= 2) raw += 3;
    if (report.evidences.length >= 2) raw += 3;
    if (report.channels.length >= 1) raw += 3;
    return Math.round((raw / 22) * 20);
  }

  function getQuizScore() {
    if (!state.completed.quiz) return 0;
    return quiz.reduce(function (sum, item, index) {
      return sum + (state.answers.quiz[index] === item.correct ? 2 : 0);
    }, 0);
  }

  function isMiniAnswered(id) {
    return typeof state.answers.mini[id] === "number";
  }

  function containsSensitive(text) {
    var value = String(text || "").toLowerCase();
    return sensitiveWords.some(function (word) { return value.indexOf(word) >= 0; });
  }

  function checkedValues(name) {
    return Array.from(app.querySelectorAll('input[name="' + name + '"]:checked')).map(function (input) { return input.value; });
  }

  function miniQuestionBlock(screenIndex) {
    var item = miniQuestions[screenIndex];
    var selected = state.answers.mini[item.id];
    var answered = typeof selected === "number";
    var feedback = "";
    if (answered) feedback = selected === item.correct
      ? '<p class="feedback correct">' + item.good + ' Puntaje de mini preguntas: ' + getMiniScore() + '/10.</p>'
      : '<p class="feedback incorrect">' + item.bad + ' Puntaje de mini preguntas: ' + getMiniScore() + '/10.</p>';
    return '<fieldset class="question"><legend>' + item.q + '</legend>' + item.options.map(function (option, index) {
      return '<label class="option"><input type="radio" name="mini" value="' + index + '"' + (selected === index ? " checked" : "") + '><span><strong>' + String.fromCharCode(65 + index) + '.</strong> ' + option + '</span></label>';
    }).join("") + '</fieldset><button id="submit-mini" class="button button-primary" type="button">Confirmar mini pregunta</button>' + feedback;
  }

  function incidentPhone() {
    return '<div class="phone-shell" aria-label="Simulacion de alerta de inicio de sesion">' +
      '<div class="phone-top"><span>08:30</span><span class="phone-contact"><span class="avatar">C</span>Correo Seguro</span><span>76%</span></div>' +
      '<div class="phone-chat">' +
      '<div class="bubble in"><strong>Alerta de seguridad</strong><br>Nuevo inicio de sesion detectado desde otra ciudad.<small>08:30</small></div>' +
      '<div class="bubble out">No reconozco ese acceso.<small>08:31</small></div>' +
      '<div class="bubble in">Accion recomendada: revisa actividad, cierra sesiones desconocidas y cambia contraseña desde un dispositivo seguro.<small>08:31</small></div>' +
      '<div class="bubble in"><strong>Evita:</strong> ignorar, borrar evidencias o responder mensajes sospechosos.<small>08:32</small></div>' +
      '</div><div class="phone-input"><span>Mensaje</span><strong>Enviar</strong></div></div>';
  }

  function reportSummary() {
    return '<div class="reading-block"><h3>Resumen guardado</h3>' + compactReportSummary() + '</div>';
  }

  function compactReportSummary() {
    var report = state.answers.report;
    if (!state.completed.report) return '<p class="muted">Reporte pendiente.</p>';
    return '<div class="incident-panel">' +
      incidentRow("Tipo", report.type || "No seleccionado") +
      incidentRow("Activo", report.asset || "No seleccionado") +
      incidentRow("Fecha/hora", (report.date || "Sin fecha") + " " + (report.time || "Sin hora")) +
      incidentRow("Descripcion", report.description || "Sin descripcion") +
      incidentRow("Señales", chips(report.signals)) +
      incidentRow("Evidencias", chips(report.evidences)) +
      incidentRow("Canales", chips(report.channels)) +
      '</div>';
  }

  function classificationFeedback() {
    return '<div class="reading-block"><h3>Retroalimentacion</h3><ul>' + classificationCases.map(function (item, index) {
      var ok = state.answers.classifications[index] === item[1];
      return '<li><strong>Situacion ' + (index + 1) + ':</strong> ' + (ok ? "Correcto. " : "Revisa. ") + 'Respuesta esperada: ' + item[1] + '.</li>';
    }).join("") + '</ul></div>';
  }

  function decisionFeedback() {
    return '<div class="reading-block"><h3>Retroalimentacion</h3><ul>' + decisionCases.map(function (item, index) {
      var ok = state.answers.decisions[index] === item.correct;
      return '<li><strong>Caso ' + (index + 1) + ':</strong> ' + (ok ? "Correcto. " : "Revisa. ") + item.feedback + '</li>';
    }).join("") + '</ul></div>';
  }

  function resultRecommendations() {
    var items = ["No actues bajo panico.", "No sigas interactuando con el atacante.", "Cambia contraseñas desde un dispositivo seguro.", "Activa MFA.", "Cierra sesiones desconocidas.", "Bloquea cuentas o tarjetas si hay fraude financiero.", "Documenta antes de borrar.", "Reporta por canales oficiales.", "Avisa a contactos si hubo suplantacion.", "Revisa configuraciones despues de recuperar acceso."];
    if (getRapidScore() < 10) items.unshift("Repasa el orden RAPIDO: reconoce, aisla, protege, informa, documenta y ordena recuperacion.");
    if (getReportScore() < 15) items.unshift("Fortalece el reporte: tipo, activo, fecha/hora, señales, evidencias y canal oficial sin datos sensibles.");
    if (getDecisionScore() < 16) items.unshift("En decisiones urgentes, primero contiene el daño y protege cuentas criticas.");
    return items;
  }

  function caseOption(value, text) {
    return '<label class="option"><input type="radio" name="case" value="' + value + '"' + (state.answers.case === value ? " checked" : "") + '><span><strong>' + value + '.</strong> ' + text + '</span></label>';
  }

  function formSelect(id, label, options, selected) {
    return '<div class="form-field"><label for="' + id + '">' + label + '</label><select id="' + id + '"><option value="">Selecciona...</option>' + options.map(function (option) { return selectOption(option, option, selected); }).join("") + '</select></div>';
  }

  function formInput(id, label, type, value) {
    return '<div class="form-field"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + type + '" value="' + escapeHtml(value || "") + '"></div>';
  }

  function checkboxGroup(title, name, items, selected) {
    return '<fieldset class="check-group"><legend>' + title + '</legend>' + items.map(function (item) {
      return '<label class="option"><input type="checkbox" name="' + name + '" value="' + escapeHtml(item) + '"' + (selected.indexOf(item) >= 0 ? " checked" : "") + '><span>' + item + '</span></label>';
    }).join("") + '</fieldset>';
  }

  function selectOption(value, label, selected) {
    return '<option value="' + escapeHtml(value) + '"' + (selected === value ? " selected" : "") + '>' + label + '</option>';
  }

  function rapidCard(letter, title, text) {
    return '<article class="rapid-card"><strong>' + letter + '</strong><h3>' + title + '</h3><p>' + text + '</p></article>';
  }

  function timelineItem(number, title, text) {
    return '<article class="timeline-item"><div class="timeline-dot">' + number + '</div><div class="timeline-card"><h3>' + title + '</h3><p>' + text + '</p></div></article>';
  }

  function incidentRow(title, value) {
    return '<div class="incident-row"><strong>' + title + '</strong><span>' + value + '</span></div>';
  }

  function chips(items) {
    if (!items || !items.length) return "Sin seleccion";
    return items.map(function (item) { return '<span class="evidence-chip">' + item + '</span>'; }).join("");
  }

  function infoCard(icon, title, text) {
    return '<article class="card"><span class="icon" aria-hidden="true">' + icon + '</span><h3>' + title + '</h3><p>' + text + '</p></article>';
  }

  function statusCard(title, text, levelClass) {
    return '<article class="status-card ' + levelClass + '"><strong>' + title + '</strong><p>' + text + '</p></article>';
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
