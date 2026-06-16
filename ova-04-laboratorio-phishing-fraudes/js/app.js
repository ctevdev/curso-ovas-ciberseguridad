(function () {
  "use strict";

  var totalScreens = 14;
  var app = document.getElementById("app");
  var defaultState = {
    screen: 0,
    score: 0,
    answers: {
      trap: null,
      lab: {},
      camilo: null,
      stopOrder: {},
      challenge: [],
      quiz: {}
    },
    completed: {},
    finalStatus: "incomplete",
    finished: false
  };
  var state = cloneDefault();

  var trapQuestion = {
    q: "¿Qué emoción intenta activar un mensaje que dice “Tienes 30 minutos para evitar el bloqueo de tu cuenta”?",
    options: ["Urgencia.", "Alegría.", "Confianza.", "Curiosidad académica."],
    correct: 0
  };

  var modalities = [
    ["Phishing por correo", "Tu paquete está retenido. Paga $3.200 aquí.", "Enlace inesperado, urgencia y dominio sospechoso.", "No abrir el enlace. Verificar directamente en la empresa de transporte o plataforma oficial."],
    ["Smishing", "BANCO: compra sospechosa de $950.000. Responde NO y verifica en este enlace.", "SMS con enlace, urgencia y posible suplantación bancaria.", "No ingresar al enlace. Llamar al banco por canales oficiales."],
    ["Vishing", "Soy de la DIAN. Tiene una notificación urgente. Confirme su cédula y tarjeta.", "Llamada no solicitada que pide datos personales o financieros.", "Colgar y verificar directamente con la entidad."],
    ["Quishing", "Código QR pegado encima de un menú, parquímetro, cartel o datáfono.", "QR sin contexto claro, pegado encima de otro o URL rara.", "No escanear QR sospechosos. Preguntar al establecimiento o ingresar manualmente a la página oficial."],
    ["Tienda falsa online", "iPhone nuevo a $500.000. Solo transferencia. Oferta por una hora.", "Precio demasiado bajo, presión, pago por transferencia y vendedor sin reputación.", "Verificar reputación, usar medios de pago protegidos y desconfiar de ofertas exageradas."],
    ["Oferta de trabajo falsa", "Gana $3 millones desde casa. Solo necesitamos tus datos bancarios para el depósito.", "Promesa de dinero fácil, datos bancarios solicitados y proceso poco claro.", "Verificar la empresa y no enviar datos financieros."],
    ["Romance scam", "Persona desconocida crea confianza durante semanas y luego pide ayuda económica.", "Relación virtual rápida, excusas emocionales y solicitud de dinero.", "No enviar dinero a personas que no conoces presencialmente y verificar identidad."],
    ["Premio o sorteo falso", "Ganaste un televisor. Para recibirlo paga el envío de $45.000.", "Premio no solicitado y solicitud de pago previo.", "No pagar para reclamar premios no solicitados."]
  ];

  var labMessages = [
    {
      channel: "SMS — número desconocido",
      text: "DAVIPLATA: Su cuenta fue bloqueada por intento de fraude. Verifique en: daviplata-seguros.com",
      classification: "fraude",
      signal: "dominio",
      feedback: "El dominio no corresponde a un canal oficial. Los servicios financieros no deben pedir verificación mediante enlaces sospechosos por SMS."
    },
    {
      channel: "Correo electrónico — supuestamente de Google",
      text: "Alerta de seguridad: alguien intentó acceder a tu cuenta desde Rusia. Confirma tu identidad aquí.",
      classification: "sospechoso",
      signal: "verificar",
      feedback: "Algunas alertas pueden ser reales, pero lo seguro es entrar manualmente a la cuenta y revisar actividad de seguridad."
    },
    {
      channel: "WhatsApp — número desconocido",
      text: "Hola, soy Martha de Seguros Bolívar. Revisamos su póliza y tiene un saldo a favor de $450.000. ¿Le hago la transferencia?",
      classification: "fraude",
      signal: "oferta",
      feedback: "Una oferta no solicitada por WhatsApp puede buscar datos bancarios. Verifica por canales oficiales."
    },
    {
      channel: "Facebook — perfil nuevo con pocos amigos",
      text: "Hola, soy amiga de tu prima Laura. Tengo un negocio de inversión que genera $2 millones al mes desde casa.",
      classification: "fraude",
      signal: "dinero",
      feedback: "Las promesas de ganancias altas con poco esfuerzo suelen ser señales de fraude de inversión o perfil falso."
    },
    {
      channel: "Correo electrónico",
      text: "Factura pendiente. Descargue el archivo comprimido adjunto para evitar cobro jurídico.",
      classification: "fraude",
      signal: "adjunto",
      feedback: "Los adjuntos inesperados, especialmente comprimidos, pueden contener malware. Verifica remitente antes de abrir."
    },
    {
      channel: "Código QR en cartel",
      text: "Escanea y gana un bono de $200.000. Solo debes ingresar tus datos.",
      classification: "sospechoso",
      signal: "qr",
      feedback: "Un QR puede llevar a una página falsa. Verifica el origen antes de escanear o ingresar información."
    },
    {
      channel: "Llamada telefónica",
      text: "Soy asesor de su banco. Para reversar una compra necesito que me dicte el código que le llegó por SMS.",
      classification: "fraude",
      signal: "codigo",
      feedback: "Nunca compartas códigos SMS, tokens ni claves dinámicas. Cuelga y llama directamente al banco."
    },
    {
      channel: "Marketplace",
      text: "Portátil nuevo, precio de remate. Solo acepto transferencia inmediata. No hago entregas contra pago.",
      classification: "sospechoso",
      signal: "pago",
      feedback: "El precio demasiado bajo, la presión y la transferencia directa elevan el riesgo. Usa medios protegidos."
    }
  ];

  var signalOptions = [
    ["dominio", "Dominio falso o sospechoso"],
    ["verificar", "Debe verificarse desde app o sitio oficial"],
    ["oferta", "Oferta no solicitada y posible solicitud de datos"],
    ["dinero", "Perfil nuevo, dinero fácil o inversión irreal"],
    ["adjunto", "Adjunto inesperado, comprimido o amenazante"],
    ["qr", "QR no verificado, premio o solicitud de datos"],
    ["codigo", "Solicitud de código de verificación"],
    ["pago", "Precio demasiado bajo y pago riesgoso"]
  ];

  var stopSteps = ["STOP", "DESCONECTA", "CAMBIA", "REPORTA", "DOCUMENTA"];

  var challengeActions = [
    "No abrir enlaces bancarios enviados por SMS.",
    "No compartir códigos de verificación.",
    "Verificar remitente y dominio antes de hacer clic.",
    "Activar MFA en mi correo principal.",
    "Revisar alertas de inicio de sesión.",
    "Reportar mensajes sospechosos.",
    "No descargar adjuntos inesperados.",
    "Verificar tiendas antes de comprar.",
    "Desconfiar de premios no solicitados.",
    "Hablar con mi familia sobre fraudes comunes."
  ];

  var quiz = [
    {
      q: "1. ¿Qué es phishing?",
      options: ["Un método para mejorar la velocidad de internet.", "Un engaño digital para robar información o inducir una acción riesgosa.", "Un antivirus.", "Una copia de seguridad."],
      correct: 1
    },
    {
      q: "2. ¿Qué señal es más sospechosa en un SMS bancario?",
      options: ["Que no tenga emojis.", "Que pida ingresar a un enlace y entregar datos o códigos.", "Que llegue en la mañana.", "Que mencione el nombre del banco."],
      correct: 1
    },
    {
      q: "3. ¿Qué debes hacer si una llamada del banco pide un código SMS?",
      options: ["Dictarlo rápido.", "Compartirlo solo si suena amable.", "No compartirlo, colgar y llamar al banco por canales oficiales.", "Publicarlo en redes."],
      correct: 2
    },
    {
      q: "4. ¿Qué significa quishing?",
      options: ["Fraude mediante códigos QR.", "Fraude mediante impresoras.", "Copia de seguridad en la nube.", "Actualización del sistema."],
      correct: 0
    },
    {
      q: "5. ¿Cuál es el primer paso del protocolo STOP?",
      options: ["Reportar.", "Cambiar.", "Documentar.", "Parar y no seguir interactuando."],
      correct: 3
    }
  ];

  function cloneDefault() { return JSON.parse(JSON.stringify(defaultState)); }

  function initialize() {
    Scorm.initialize();
    var saved = Scorm.loadSuspendData();
    state = saved && typeof saved === "object" ? Object.assign(cloneDefault(), saved) : cloneDefault();
    normalizeState();
    var location = parseInt(Scorm.getLocation(), 10);
    if (!Number.isNaN(location) && location >= 0 && location < totalScreens) state.screen = location;
    if (!state.finished) Scorm.setStatus("incomplete");
    Scorm.setValue("cmi.core.score.min", "0");
    Scorm.setValue("cmi.core.score.max", "100");
    bindGlobalEvents();
    render();
  }

  function normalizeState() {
    state.answers = state.answers || {};
    state.answers.lab = state.answers.lab || {};
    state.answers.stopOrder = state.answers.stopOrder || {};
    state.answers.challenge = state.answers.challenge || [];
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
    window.addEventListener("beforeunload", function () { if (!state.finished) saveProgress(); });
  }

  function openHelpPanel() {
    document.getElementById("help-panel").classList.remove("hidden");
    document.getElementById("close-help").focus();
  }

  function closeHelpPanel() {
    document.getElementById("help-panel").classList.add("hidden");
    document.getElementById("help-button").focus();
  }

  function closeResetDialog() {
    document.getElementById("confirm-dialog").classList.add("hidden");
    document.getElementById("reset-button").focus();
  }

  function resetOva() {
    Scorm.resetLocal();
    state = cloneDefault();
    Scorm.setStatus("incomplete");
    Scorm.setScore(0);
    closeResetDialog();
    saveProgress();
    render();
  }

  function calculateScore() {
    state.score = Math.min(100, getTrapScore() + getLabScore().scorm + getCamiloScore() + getStopScore() + getChallengeScore() + getQuizScore());
  }

  function saveProgress() {
    calculateScore();
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

  function allRequiredComplete() {
    return Boolean(state.completed.trap && state.completed.lab && state.completed.camilo && state.completed.stopOrder && state.completed.challenge && state.completed.quiz);
  }

  function statusLabel() {
    if (!allRequiredComplete()) return "En proceso";
    return state.score >= 70 ? "Aprobado" : "Completado con recomendaciones";
  }

  function feedbackClass(score, max) {
    if (score === max) return "correct";
    if (score > 0) return "partial";
    return "incorrect";
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
      phishingIntro,
      fraudModalities,
      emotionalTraps,
      lab,
      stopProtocol,
      camiloCase,
      stopOrder,
      helpMaterial,
      practicalChallenge,
      evaluation,
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

    var trapButton = document.getElementById("submit-trap");
    if (trapButton) trapButton.addEventListener("click", submitTrap);
    var labButton = document.getElementById("submit-lab");
    if (labButton) labButton.addEventListener("click", submitLab);
    var camiloButton = document.getElementById("submit-camilo");
    if (camiloButton) camiloButton.addEventListener("click", submitCamilo);
    var stopButton = document.getElementById("submit-stop-order");
    if (stopButton) stopButton.addEventListener("click", submitStopOrder);
    var challengeButton = document.getElementById("submit-challenge");
    if (challengeButton) challengeButton.addEventListener("click", submitChallenge);
    var quizButton = document.getElementById("submit-quiz");
    if (quizButton) quizButton.addEventListener("click", submitQuiz);
    var finishButton = document.getElementById("finish-ova");
    if (finishButton) finishButton.addEventListener("click", finishOva);
  }

  function welcome() {
    return '<section class="screen hero">' +
      '<span class="tag">⚠ OVA 4 · Laboratorio interactivo · 100 puntos</span>' +
      '<h2>Laboratorio de Phishing, Fraudes y Mensajes Sospechosos</h2>' +
      '<p class="subtitle">“No es tecnología lo que falla. Somos nosotros. Y también somos nosotros quienes podemos aprender a detectarlos.”</p>' +
      '<p class="lead">Analizarás mensajes simulados, identificarás señales de alerta y tomarás decisiones frente a posibles fraudes digitales. El phishing puede llegar por correo, WhatsApp, SMS, llamadas, QR, redes sociales, tiendas falsas y ofertas demasiado buenas para ser verdad.</p>' +
      '<div class="notice"><strong>Mensaje central:</strong> caer en un fraude no significa ser tonto. Los estafadores son profesionales. Lo importante es actuar rápido, reportar y aprender.</div>' +
      '<div class="brand-strip"><img src="assets/logo-unicartagena-ctev.png" alt="Logo Universidad de Cartagena y CTEV"><span>Identidad institucional · Ruta de ciberhigiene personal</span></div>' +
      '<div class="identity-route" aria-label="Ruta de cinco OVAs">' +
      '<div class="identity-item" style="--identity:#087da5"><strong>🛡 OVA 1</strong>Fundamentos</div>' +
      '<div class="identity-item" style="--identity:#155ca2"><strong>🔑 OVA 2</strong>Cuentas</div>' +
      '<div class="identity-item" style="--identity:#18794e"><strong>📱 OVA 3</strong>Dispositivos</div>' +
      '<div class="identity-item current" style="--identity:#b45309"><strong>⚠ OVA 4</strong>Fraudes</div>' +
      '<div class="identity-item" style="--identity:#6941c6"><strong>☑ OVA 5</strong>Plan personal</div></div>' +
      nav(false, true, "Iniciar laboratorio") + '</section>';
  }

  function objective() {
    return '<section class="screen"><span class="tag">Objetivo de aprendizaje</span><h2>Detectar, decidir y responder</h2>' +
      '<p class="lead">Desarrollar la habilidad de identificar mensajes fraudulentos y aplicar un protocolo básico de respuesta ante incidentes de fraude digital.</p>' +
      '<div class="card-grid">' +
      infoCard("📧", "Modalidades", "Phishing, smishing, vishing, quishing, tiendas falsas, ofertas laborales falsas, perfiles falsos y sorteos falsos.") +
      infoCard("🧠", "Trampas emocionales", "Urgencia, miedo, autoridad, confianza, beneficio y simpatía.") +
      infoCard("🧪", "Laboratorio", "Clasificar mensajes como legítimos, fraude o sospechosos y elegir la señal principal.") +
      infoCard("🛑", "Protocolo STOP", "Parar, desconectar, cambiar, reportar y documentar sin entrar en pánico.") +
      '</div>' +
      '<div class="image-band"><div class="image-tile" style="background-image:url(assets/phishing-correo.png)"><span>Analizar mensajes</span></div><div class="image-tile" style="background-image:url(assets/celular-alerta-real.png)"><span>Decidir con calma</span></div><div class="image-tile" style="background-image:url(assets/escudo-candado.png)"><span>Responder rápido</span></div></div>' +
      nav(true, true, "Phishing y fraudes") + '</section>';
  }

  function phishingIntro() {
    return '<section class="screen"><span class="tag">Concepto clave</span><h2>Phishing: no es solo un correo raro</h2>' +
      '<div class="visual-lesson"><div><p class="lead">El phishing es un engaño digital que intenta que una persona entregue información, abra un enlace, descargue un archivo, comparta un código o realice una acción riesgosa.</p><p>Puede llegar por correo, SMS, WhatsApp, llamada, QR, redes sociales, formularios falsos, tiendas falsas, ofertas de empleo o perfiles falsos.</p><div class="notice alert"><strong>Clave:</strong> los estafadores no siempre atacan la tecnología. Muchas veces atacan nuestras emociones.</div></div><img class="lesson-image" src="assets/phishing-correo.png" alt="Representación de correo sospechoso"></div>' +
      '<div class="reading-block"><h3>Pregunta útil antes de actuar</h3><p>No preguntes solo “¿de dónde llegó el mensaje?”. Pregunta: <strong>¿qué me está pidiendo hacer y qué riesgo implica?</strong></p></div>' +
      nav(true, true, "Ver modalidades") + '</section>';
  }

  function fraudModalities() {
    return '<section class="screen"><span class="tag">Modalidades de fraude</span><h2>Fraudes frecuentes con ejemplos ciudadanos</h2>' +
      '<p class="lead">Los formatos cambian, pero las señales se repiten. Abre cada tarjeta para ver ejemplo, alerta y acción segura.</p>' +
      '<div class="accordion">' + modalities.map(function (item) {
        return '<details><summary>' + item[0] + '</summary><p><strong>Ejemplo:</strong> ' + item[1] + '</p><p><strong>Señal de alerta:</strong> ' + item[2] + '</p><p><strong>Acción segura:</strong> ' + item[3] + '</p></details>';
      }).join("") + '</div>' +
      nav(true, true, "Trampas emocionales") + '</section>';
  }

  function emotionalTraps() {
    var feedback = "";
    if (state.completed.trap) {
      feedback = getTrapScore() === 10
        ? '<p class="feedback correct">Correcto. Ese mensaje activa urgencia para que actúes sin verificar. Puntaje: 10/10.</p>'
        : '<p class="feedback incorrect">Revisa la señal: el límite de 30 minutos busca urgencia y presión. Puntaje: 0/10.</p>';
    }
    return '<section class="screen"><span class="tag">Trampas emocionales · 10 puntos</span><h2>Los estafadores no hackean computadores. Hackean emociones.</h2>' +
      '<div class="card-grid">' +
      infoCard("⏱", "Urgencia", "“Tienes dos horas o pierdes el acceso.” Actúas sin pensar.") +
      infoCard("😨", "Miedo", "“Tu cuenta fue hackeada.” Actúas en pánico.") +
      infoCard("🏛", "Autoridad", "“Soy del banco, la DIAN o la Policía.” No cuestionas.") +
      infoCard("🤝", "Confianza", "“Soy amigo de tu prima.” Bajas la guardia.") +
      infoCard("🎁", "Beneficio", "“Ganaste un premio o un trabajo soñado.” Actúas por ilusión.") +
      infoCard("🙂", "Simpatía", "“¿Puedes hacerme este pequeño favor?” No quieres decepcionar.") +
      '</div><div class="notice alert"><strong>Regla de oro:</strong> si sientes urgencia, miedo o presión extrema, para y verifica antes de actuar.</div>' +
      '<fieldset class="question"><legend>' + trapQuestion.q + '</legend>' + trapQuestion.options.map(function (option, index) {
        return '<label class="option"><input type="radio" name="trap" value="' + index + '"' +
          (String(state.answers.trap) === String(index) ? " checked" : "") + '><span>' + option + '</span></label>';
      }).join("") + '</fieldset><button id="submit-trap" class="button button-primary" type="button">Confirmar respuesta</button>' + feedback +
      nav(true, state.completed.trap, "Ir al laboratorio") + '</section>';
  }

  function submitTrap() {
    var checked = app.querySelector('input[name="trap"]:checked');
    if (!checked) return showInlineError("Selecciona una respuesta antes de continuar.");
    state.answers.trap = Number(checked.value);
    state.completed.trap = true;
    saveProgress();
    render();
  }

  function getTrapScore() {
    return state.completed.trap && state.answers.trap === trapQuestion.correct ? 10 : 0;
  }

  function lab() {
    var result = getLabScore();
    var feedback = state.completed.lab ? '<p class="feedback ' + feedbackClass(result.scorm, 40) + '">Laboratorio revisado: ' + result.raw + '/80 puntos internos. Aporte SCORM: ' + result.scorm + '/40.</p>' : "";
    return '<section class="screen"><span class="tag">Laboratorio · 40 puntos</span><h2>¿Real, fraude o sospechoso? Tú decides.</h2>' +
      '<p>Lee cada mensaje. Clasifícalo y selecciona la principal señal de alerta. Cada mensaje suma hasta 10 puntos internos: 6 por clasificación y 4 por señal. El laboratorio completo se convierte a 40 puntos SCORM.</p>' +
      '<div class="notice alert"><strong>Simulación educativa:</strong> los siguientes ambientes reconstruyen pantallas reales de SMS, correo, WhatsApp, redes, QR, llamada y marketplace. No uses enlaces ni datos de ejemplo como si fueran reales.</div>' +
      labMessages.map(function (message, index) { return labCard(message, index); }).join("") +
      '<button id="submit-lab" class="button button-primary" type="button">Calificar laboratorio</button>' + feedback +
      nav(true, state.completed.lab, "Protocolo STOP") + '</section>';
  }

  function labCard(message, index) {
    var answer = state.answers.lab[index] || {};
    var feedback = "";
    if (state.completed.lab) {
      var score = labItemRawScore(index);
      feedback = '<p class="feedback ' + feedbackClass(score, 10) + '">' + message.feedback + ' Puntaje interno: ' + score + '/10.</p>';
    }
    return '<article class="message-card"><div class="message-meta"><span class="pill channel">' + message.channel + '</span><span class="pill suspicious">Simulación visual</span></div>' +
      labMockup(message, index) +
      '<div class="select-row"><label>Clasificación<select name="class-' + index + '"><option value="">Selecciona...</option>' +
      selectOption("legitimo", "Legítimo", answer.classification) +
      selectOption("fraude", "Fraude", answer.classification) +
      selectOption("sospechoso", "Sospechoso / requiere verificación", answer.classification) +
      '</select></label><label>Señal principal<select name="signal-' + index + '"><option value="">Selecciona...</option>' +
      signalOptions.map(function (option) { return selectOption(option[0], option[1], answer.signal); }).join("") +
      '</select></label></div>' + feedback + '</article>';
  }

  function labMockup(message, index) {
    if (index === 0) return smsMockup("InfoPagos", "12:48", message.text, "daviplata-seguros.com");
    if (index === 1) return emailMockup("Alerta de seguridad", "alerta-seguridad@accounts-google.com", "Alerta de seguridad", "Alguien intentó acceder a tu cuenta desde Rusia. Para protegerla, confirma tu identidad en el botón inferior.", "Confirmar identidad", "accounts-security-check.info");
    if (index === 2) return whatsappMockup("Martha Seguros", "Hoy 9:41", message.text);
    if (index === 3) return socialMockup("Martha R.", "Perfil creado recientemente · 3 amigos", message.text, "Ver oportunidad");
    if (index === 4) return emailMockup("Factura pendiente", "cobros@notifica-legal.co", "Factura pendiente", "Descargue el archivo comprimido adjunto para evitar cobro jurídico. Plazo máximo: hoy.", "Descargar factura.zip", "facturas-pendientes.co");
    if (index === 5) return qrPosterMockup(message.text);
    if (index === 6) return callMockup("Asesor Banco", "Número desconocido", message.text);
    return marketplaceMockup(message.text);
  }

  function phoneStatus() {
    return '<div class="phone-status"><span>11:28</span><span>▮▮ WiFi 75%</span></div>';
  }

  function smsMockup(sender, time, text, linkText) {
    return '<div class="mock-phone sms-phone" role="img" aria-label="Simulación de mensaje SMS sospechoso">' +
      phoneStatus() +
      '<div class="sms-header"><span class="back-arrow">‹</span><span class="avatar">!</span><div><strong>' + sender + '</strong><small>Mensaje SMS</small></div></div>' +
      '<div class="phone-body sms-body"><div class="sms-bubble incoming">' + text.replace(linkText, '<span class="fake-link">' + linkText + '</span>') + '<span class="bubble-time">' + time + '</span></div></div>' +
      '<div class="sms-composer"><span>Mensaje de texto</span><strong>＋</strong></div></div>';
  }

  function whatsappMockup(sender, time, text) {
    return '<div class="mock-phone wa-phone" role="img" aria-label="Simulación de chat de WhatsApp sospechoso">' +
      phoneStatus() +
      '<div class="wa-header"><span class="back-arrow">‹</span><span class="avatar">M</span><div><strong>' + sender + '</strong><small>en línea</small></div><span class="wa-actions">☎ ⋮</span></div>' +
      '<div class="wa-wallpaper"><div class="wa-date">Hoy</div><div class="wa-bubble">' + text + '<span class="bubble-time">' + time + '</span></div><div class="wa-input"><span>Mensaje</span><strong>🎙</strong></div></div></div>';
  }

  function emailMockup(subject, from, title, body, button, domain) {
    return '<div class="mock-email" role="img" aria-label="Simulación de correo electrónico sospechoso">' +
      '<div class="mail-toolbar"><strong>Correo</strong><span>↻ ⋮</span></div>' +
      '<div class="mail-subject">' + subject + '</div>' +
      '<div class="mail-from"><span class="avatar mail-avatar">G</span><div><strong>' + from + '</strong><small>para ti · hace 3 min</small></div></div>' +
      '<div class="mail-content"><h3>' + title + '</h3><p>' + body + '</p><button class="fake-mail-button" type="button">' + button + '</button><p class="mail-domain">Destino visible: <span>' + domain + '</span></p></div>' +
      '</div>';
  }

  function socialMockup(name, meta, text, action) {
    return '<div class="mock-social" role="img" aria-label="Simulación de publicación o mensaje en red social">' +
      '<div class="social-top"><strong>social</strong><span>Inicio · Mensajes · Notificaciones</span></div>' +
      '<div class="social-post"><div class="social-author"><span class="avatar">M</span><div><strong>' + name + '</strong><small>' + meta + '</small></div></div>' +
      '<p>' + text + '</p><div class="investment-card"><strong>$2.000.000/mes</strong><span>Desde casa · cupos limitados</span></div><button class="fake-social-button" type="button">' + action + '</button></div></div>';
  }

  function qrPosterMockup(text) {
    return '<div class="mock-poster" role="img" aria-label="Simulación de cartel con código QR sospechoso">' +
      '<div class="poster-ribbon">BONO DIGITAL</div><h3>Escanea y gana</h3><p>' + text + '</p>' +
      '<div class="fake-qr" aria-hidden="true">' + Array(49).fill(0).map(function (_item, i) { return '<span class="' + ([0,1,2,7,14,5,6,13,35,42,43,48,36,37,44,20,22,24,26,30,32].indexOf(i) >= 0 ? "dark" : "") + '"></span>'; }).join("") + '</div>' +
      '<small>URL corta: promo-bono2026.info</small></div>';
  }

  function callMockup(caller, number, transcript) {
    return '<div class="mock-call" role="img" aria-label="Simulación de llamada sospechosa">' +
      '<div class="call-status">Llamada entrante</div><div class="call-avatar">☎</div><h3>' + caller + '</h3><p>' + number + '</p>' +
      '<div class="call-transcript">“' + transcript + '”</div><div class="call-buttons"><span class="decline">Rechazar</span><span class="accept">Aceptar</span></div></div>';
  }

  function marketplaceMockup(text) {
    return '<div class="mock-market" role="img" aria-label="Simulación de anuncio en marketplace sospechoso">' +
      '<div class="market-top"><strong>Marketplace</strong><span>Buscar productos</span></div><div class="product-card"><div class="product-photo">💻</div>' +
      '<div><h3>Portátil nuevo en caja</h3><p class="price">$650.000</p><p>' + text + '</p><div class="seller-row"><span class="avatar">V</span><small>Vendedor sin calificaciones · responde rápido</small></div></div></div></div>';
  }

  function selectOption(value, label, selected) {
    return '<option value="' + value + '"' + (selected === value ? " selected" : "") + '>' + label + '</option>';
  }

  function submitLab() {
    var answers = {};
    for (var i = 0; i < labMessages.length; i += 1) {
      var classSelect = app.querySelector('select[name="class-' + i + '"]');
      var signalSelect = app.querySelector('select[name="signal-' + i + '"]');
      if (!classSelect.value || !signalSelect.value) return showInlineError("Clasifica todos los mensajes y selecciona cada señal principal.");
      answers[i] = { classification: classSelect.value, signal: signalSelect.value };
    }
    state.answers.lab = answers;
    state.completed.lab = true;
    saveProgress();
    render();
  }

  function labItemRawScore(index) {
    var answer = state.answers.lab[index] || {};
    var message = labMessages[index];
    var classScore = answer.classification === message.classification ? 6 : 0;
    var signalScore = answer.signal === message.signal ? 4 : 0;
    return classScore + signalScore;
  }

  function getLabScore() {
    if (!state.completed.lab) return { raw: 0, scorm: 0 };
    var raw = labMessages.reduce(function (sum, _message, index) { return sum + labItemRawScore(index); }, 0);
    return { raw: raw, scorm: Math.round((raw / 80) * 40) };
  }

  function stopProtocol() {
    return '<section class="screen"><span class="tag">Protocolo STOP</span><h2>¿Qué hago si caí en un fraude?</h2>' +
      '<p class="lead">Si hiciste clic, entregaste datos o sospechas que caíste en un fraude, actúa rápido, pero sin pánico.</p>' +
      '<div class="stop-grid">' +
      stopCard("1", "STOP", "Para. No hagas más clics, no sigas instrucciones y no entregues más información.") +
      stopCard("2", "DESCONECTA", "Si diste datos bancarios, llama inmediatamente al banco o plataforma para bloquear movimientos.") +
      stopCard("3", "CAMBIA", "Cambia la contraseña del servicio afectado desde otro dispositivo seguro. Activa MFA.") +
      stopCard("4", "REPORTA", "Reporta al banco, plataforma, área de TI o autoridad correspondiente.") +
      stopCard("5", "DOCUMENTA", "Toma capturas del mensaje, URL, número, correo, perfil, comprobantes y movimientos.") +
      '</div><div class="notice success"><strong>Reportar no es vergonzoso.</strong> Es proteger a tu familia, amigos y contactos del mismo fraude.</div>' +
      nav(true, true, "Caso Camilo") + '</section>';
  }

  function stopCard(number, title, text) {
    return '<article class="stop-card"><span>Paso ' + number + '</span><strong>' + title + '</strong><p>' + text + '</p></article>';
  }

  function camiloCase() {
    var feedback = "";
    if (state.completed.camilo) {
      feedback = getCamiloScore() === 20
        ? '<p class="feedback correct">Correcto. Primero debe bloquear movimientos. Luego cambiar contraseña desde otro dispositivo seguro, activar MFA, reportar y documentar. Puntaje: 20/20.</p>'
        : '<p class="feedback incorrect">El tiempo es clave. Primero debe detener el daño: bloquear cuenta o movimientos. Puntaje: 0/20.</p>';
    }
    return '<section class="screen"><span class="tag">Caso práctico · 20 puntos</span><h2>Camilo y el SMS falso de Nequi</h2>' +
      '<p>Camilo recibió un SMS que decía que su cuenta de Nequi fue bloqueada. Hizo clic en el enlace e ingresó usuario y contraseña. Cinco minutos después recibió una notificación de una transferencia por $850.000 que él no hizo.</p>' +
      '<div class="case-simulation">' +
      smsMockup("NEQUI Alertas", "10:06", "NEQUI: su cuenta fue bloqueada temporalmente. Verifique sus datos en: nequi-seguridad.app", "nequi-seguridad.app") +
      '<div class="mock-bank-alert" role="img" aria-label="Simulación de notificación bancaria posterior al fraude"><div class="bank-alert-header"><span class="avatar">N</span><div><strong>Notificación de movimiento</strong><small>5 minutos después</small></div></div><p>Transferencia enviada por <strong>$850.000</strong></p><small>Si no fuiste tú, bloquea movimientos de inmediato por canales oficiales.</small></div></div>' +
      '<fieldset class="question"><legend>¿Qué debe hacer primero Camilo?</legend>' +
      caseOption("A", "Borrar el SMS para no preocuparse.", state.answers.camilo) +
      caseOption("B", "Llamar inmediatamente al banco o plataforma para bloquear movimientos.", state.answers.camilo) +
      caseOption("C", "Seguir intentando entrar al enlace para revisar qué pasó.", state.answers.camilo) +
      caseOption("D", "Publicar el caso en redes antes de bloquear la cuenta.", state.answers.camilo) +
      '</fieldset><button id="submit-camilo" class="button button-primary" type="button">Confirmar respuesta</button>' + feedback +
      nav(true, state.completed.camilo, "Ordenar STOP") + '</section>';
  }

  function caseOption(value, text, selected) {
    return '<label class="option"><input type="radio" name="camilo" value="' + value + '"' +
      (selected === value ? " checked" : "") + '> <span><strong>' + value + '.</strong> ' + text + '</span></label>';
  }

  function submitCamilo() {
    var checked = app.querySelector('input[name="camilo"]:checked');
    if (!checked) return showInlineError("Selecciona una respuesta antes de continuar.");
    state.answers.camilo = checked.value;
    state.completed.camilo = true;
    saveProgress();
    render();
  }

  function getCamiloScore() {
    return state.completed.camilo && state.answers.camilo === "B" ? 20 : 0;
  }

  function stopOrder() {
    var score = getStopScore();
    var feedback = state.completed.stopOrder
      ? '<p class="feedback ' + feedbackClass(score, 15) + '">Orden revisado. Puntaje: ' + score + '/15. Primero se detiene el daño; luego se recuperan accesos, se reporta y se documenta.</p>'
      : "";
    return '<section class="screen"><span class="tag">Actividad STOP · 15 puntos</span><h2>Ordena la respuesta correcta</h2>' +
      '<p>Selecciona qué paso corresponde a cada posición del protocolo.</p><div class="order-list">' +
      stopSteps.map(function (_step, index) {
        var selected = state.answers.stopOrder[index] || "";
        return '<label class="order-row"><strong>Posición ' + (index + 1) + '</strong><select name="stop-' + index + '"><option value="">Selecciona...</option>' +
          stopSteps.map(function (step) { return selectOption(step, step, selected); }).join("") + '</select></label>';
      }).join("") + '</div><button id="submit-stop-order" class="button button-primary" type="button">Calificar orden</button>' + feedback +
      nav(true, state.completed.stopOrder, "Material de ayuda") + '</section>';
  }

  function submitStopOrder() {
    var answers = {};
    for (var i = 0; i < stopSteps.length; i += 1) {
      var select = app.querySelector('select[name="stop-' + i + '"]');
      if (!select.value) return showInlineError("Completa las cinco posiciones del protocolo STOP.");
      answers[i] = select.value;
    }
    state.answers.stopOrder = answers;
    state.completed.stopOrder = true;
    saveProgress();
    render();
  }

  function getStopScore() {
    if (!state.completed.stopOrder) return 0;
    var correct = stopSteps.reduce(function (sum, step, index) {
      return sum + (state.answers.stopOrder[index] === step ? 1 : 0);
    }, 0);
    if (correct === 5) return 15;
    if (correct >= 3) return 8;
    return 0;
  }

  function helpMaterial() {
    return '<section class="screen"><span class="tag">Aprende más · opcional</span><h2>Detectar fraudes antes de interactuar</h2>' +
      '<p class="lead">Esta sección amplía el laboratorio. No suma ni resta puntos, pero te ayuda a construir criterio para fraudes nuevos.</p>' +
      '<div class="accordion">' +
      detailsBlock("Señales universales de phishing", ["Mensaje inesperado.", "Urgencia extrema.", "Amenaza de bloqueo.", "Premio no solicitado.", "Solicitud de claves o códigos.", "Dominio parecido pero no igual.", "Adjunto inesperado.", "Transferencia inmediata.", "Perfil recién creado.", "Solicitud de instalar una app."]) +
      detailsBlock("Anatomía de un mensaje sospechoso", ["Remitente.", "Canal.", "Enlace.", "Dominio.", "Tono emocional.", "Solicitud.", "Adjuntos.", "Consecuencia o amenaza.", "Beneficio prometido.", "Acción segura."]) +
      detailsBlock("Legítimo, sospechoso o fraude", ["Legítimo: esperado, canal oficial y sin solicitud sensible.", "Sospechoso: podría ser real, pero requiere verificación independiente.", "Fraude: pide datos, códigos, pagos, clics urgentes o interacción riesgosa."]) +
      detailsBlock("Qué nunca debes compartir", ["Contraseñas.", "PIN.", "Códigos SMS.", "Tokens.", "Claves dinámicas.", "Datos de tarjeta.", "CVV.", "Fotos de documentos.", "Capturas de apps bancarias.", "Códigos QR de autenticación."]) +
      detailsBlock("Cómo verificar sin caer", ["No usar el enlace recibido.", "Abrir la app oficial.", "Escribir manualmente la dirección web.", "Llamar al número oficial.", "Consultar desde otro canal.", "Verificar remitente y dominio.", "Pedir apoyo al área de TI."]) +
      '</div>' + resourcesBlock() + nav(true, true, "Mini reto práctico") + '</section>';
  }

  function detailsBlock(title, items) {
    return '<details><summary>' + title + '</summary><ul>' + items.map(function (item) { return '<li>' + item + '</li>'; }).join("") + '</ul></details>';
  }

  function practicalChallenge() {
    var selected = state.answers.challenge || [];
    var score = state.completed.challenge ? getChallengeScore() : 0;
    var feedback = state.completed.challenge
      ? '<p class="feedback ' + feedbackClass(score, 5) + '">Seleccionaste ' + selected.length + ' acciones. Puntaje: ' + score + '/5. Tu regla personal debe ser corta, clara y fácil de recordar.</p>'
      : "";
    return '<section class="screen"><span class="tag">Mini reto práctico · 5 puntos</span><h2>Mi regla personal contra el phishing</h2>' +
      '<p>Selecciona mínimo 3 acciones que aplicarás esta semana.</p><fieldset class="check-group"><legend>Acciones sugeridas</legend>' +
      challengeActions.map(function (item, index) {
        return '<label class="option"><input type="checkbox" name="challenge" value="' + index + '"' +
          (selected.indexOf(String(index)) >= 0 ? " checked" : "") + '><span>' + item + '</span></label>';
      }).join("") + '</fieldset><button id="submit-challenge" class="button button-primary" type="button">Guardar mi regla</button>' + feedback +
      '<div class="notice"><strong>Ejemplo:</strong> Pauso, verifico el canal oficial y nunca comparto códigos.</div>' +
      nav(true, state.completed.challenge, "Evaluación final") + '</section>';
  }

  function submitChallenge() {
    state.answers.challenge = Array.from(app.querySelectorAll('input[name="challenge"]:checked')).map(function (input) { return input.value; });
    state.completed.challenge = true;
    saveProgress();
    render();
  }

  function getChallengeScore() {
    if (!state.completed.challenge) return 0;
    var count = (state.answers.challenge || []).length;
    if (count >= 3) return 5;
    if (count >= 1) return 2;
    return 0;
  }

  function evaluation() {
    var answers = state.answers.quiz || {};
    var feedback = state.completed.quiz
      ? '<p class="feedback ' + feedbackClass(getQuizScore(), 10) + '">Obtuviste ' + getQuizScore() + '/10 en la evaluación.</p>'
      : "";
    return '<section class="screen"><span class="tag">Evaluación final · 10 puntos</span><h2>Comprueba lo aprendido</h2><p>Cada respuesta correcta vale 2 puntos.</p>' +
      quiz.map(function (item, qIndex) {
        return '<fieldset class="question"><legend>' + item.q + '</legend>' + item.options.map(function (option, oIndex) {
          return '<label class="option"><input type="radio" name="q' + qIndex + '" value="' + oIndex + '"' +
            (String(answers[qIndex]) === String(oIndex) ? " checked" : "") + '><span>' + option + '</span></label>';
        }).join("") + '</fieldset>';
      }).join("") + '<button id="submit-quiz" class="button button-primary" type="button">Calificar evaluación</button>' + feedback +
      nav(true, state.completed.quiz, "Ver resultados") + '</section>';
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

  function getQuizScore() {
    if (!state.completed.quiz) return 0;
    return quiz.reduce(function (sum, item, index) {
      return sum + (state.answers.quiz[index] === item.correct ? 2 : 0);
    }, 0);
  }

  function results() {
    var complete = allRequiredComplete();
    var labResult = getLabScore();
    var recommendation = !complete
      ? "Completa trampas emocionales, laboratorio, caso Camilo, STOP, mini reto y evaluación."
      : state.score >= 90
        ? "Excelente. Mantén tu regla personal y comparte estas señales con tu familia."
        : state.score >= 70
          ? "Buen avance. Refuerza verificación de dominios, códigos SMS y adjuntos inesperados."
          : "Acción urgente: no abras enlaces recibidos por SMS, no compartas códigos y verifica por canales oficiales.";
    return '<section class="screen results"><span class="tag">Resultados</span><h2>Tu resultado en la OVA 4</h2>' +
      '<div class="result-score" aria-label="Puntaje final">' + state.score + '<small>/100</small></div>' +
      '<h3>Estado: ' + statusLabel() + '</h3><p class="lead">' + recommendation + '</p>' +
      '<div class="card-grid">' +
      infoCard("🧠", "Trampas emocionales", state.completed.trap ? getTrapScore() + "/10" : "Pendiente") +
      infoCard("🧪", "Laboratorio", state.completed.lab ? labResult.scorm + "/40 · raw " + labResult.raw + "/80" : "Pendiente") +
      infoCard("📱", "Caso Camilo", state.completed.camilo ? getCamiloScore() + "/20" : "Pendiente") +
      infoCard("🛑", "Orden STOP", state.completed.stopOrder ? getStopScore() + "/15" : "Pendiente") +
      infoCard("☑", "Mini reto", state.completed.challenge ? getChallengeScore() + "/5" : "Pendiente") +
      infoCard("📝", "Evaluación", state.completed.quiz ? getQuizScore() + "/10" : "Pendiente") +
      '</div><div class="reading-block"><h3>Recomendaciones generales</h3><ul><li>No abras enlaces recibidos por SMS.</li><li>No compartas códigos de verificación.</li><li>Verifica remitentes y dominios.</li><li>No descargues adjuntos inesperados.</li><li>No hagas pagos por presión.</li><li>Desconfía de premios no solicitados.</li><li>Reporta fraudes y documenta evidencias.</li><li>Activa MFA en cuentas críticas.</li><li>Habla con tu familia sobre estas señales.</li></ul></div>' +
      '<div class="brand-strip"><img src="assets/logo-unicartagena-ctev.png" alt="Logo Universidad de Cartagena y CTEV"><span>Fin de contenidos · OVA 4</span></div>' +
      nav(true, true, "Finalización SCORM") + '</section>';
  }

  function finalization() {
    return '<section class="screen"><span class="tag">Finalización SCORM</span><h2>Registrar avance en Moodle</h2>' +
      '<p class="lead">Cuando presiones “Finalizar OVA”, se enviará el puntaje final, la ubicación, el estado de finalización y el progreso guardado al LMS.</p>' +
      '<div class="notice ' + (allRequiredComplete() ? "success" : "alert") + '"><strong>Estado actual:</strong> ' + statusLabel() + '. Puntaje: ' + state.score + '/100.</div>' +
      (allRequiredComplete()
        ? '<button id="finish-ova" class="button button-primary" type="button">' + (state.finished ? "OVA finalizada" : "Finalizar OVA") + '</button>'
        : '<p class="feedback incorrect">Aún hay actividades obligatorias pendientes. Regresa y complétalas para registrar el intento completo.</p>') +
      (state.finished ? '<p class="feedback correct">Tu avance fue registrado. Puedes cerrar esta ventana.</p>' : "") +
      nav(true, false) + '</section>';
  }

  function resourcesBlock() {
    return '<div class="reading-block"><h3>Para seguir aprendiendo</h3><p>Estos recursos son opcionales, requieren internet y no afectan el puntaje SCORM.</p><div class="resource-list">' +
      resourceLink("https://phishingquiz.withgoogle.com/", "Google Phishing Quiz", "Práctica interactiva para detectar mensajes de phishing.") +
      resourceLink("https://grow.google/certificates/cybersecurity/", "Google Cybersecurity Certificate", "Ruta para conocer fundamentos, riesgos, amenazas y habilidades iniciales.") +
      resourceLink("https://www.coursera.org/learn/foundations-of-cybersecurity", "Foundations of Cybersecurity", "Curso introductorio sobre ciberseguridad, roles, controles y ética.") +
      resourceLink("https://www.cisa.gov/secure-our-world/recognize-and-report-phishing", "CISA Recognize and Report Phishing", "Guía para reconocer señales de phishing y reportar mensajes sospechosos.") +
      resourceLink("https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams", "FTC Phishing Scams", "Recurso para reconocer estafas y proteger información personal.") +
      resourceLink("https://www.incibe.es/ciudadania", "INCIBE Ciudadanía", "Recursos en español sobre seguridad, phishing y ayuda ciudadana.") +
      resourceLink("https://www.phishtank.com/", "PhishTank", "Base comunitaria para verificar URLs reportadas como phishing.") +
      resourceLink("https://caivirtual.policia.gov.co/", "Centro Cibernético Policial / CAI Virtual", "Canal colombiano para orientación, denuncia y prevención del cibercrimen.") +
      '</div></div>';
  }

  function infoCard(icon, title, text) {
    return '<article class="card"><span class="icon" aria-hidden="true">' + icon + '</span><h3>' + title + '</h3><p>' + text + '</p></article>';
  }

  function resourceLink(url, title, description) {
    return '<a href="' + url + '" target="_blank" rel="noopener"><strong>' + title + '</strong><small>' + description + '</small></a>';
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
    error.scrollIntoView({ block: "center" });
  }

  function finishOva() {
    calculateScore();
    state.finalStatus = state.score >= 70 ? "passed" : "completed";
    state.finished = true;
    Scorm.setScore(state.score);
    Scorm.setStatus(state.finalStatus);
    Scorm.setLocation(state.screen);
    Scorm.saveSuspendData({
      screen: state.screen,
      score: state.score,
      answers: state.answers,
      completed: state.completed,
      finalStatus: state.finalStatus,
      finished: true
    });
    Scorm.commit();
    Scorm.finish();
    render();
  }

  initialize();
}());
