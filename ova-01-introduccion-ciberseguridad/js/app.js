(function () {
  "use strict";

  var totalScreens = 10;
  var app = document.getElementById("app");
  var defaultState = {
    screen: 0,
    score: 0,
    answers: {},
    completed: {},
    finalStatus: "incomplete",
    finished: false
  };
  var state = defaultState;

  var threats = [
    ["Phishing", "Mensajes o sitios falsos que imitan organizaciones para robar información."],
    ["Ransomware", "Programa malicioso que bloquea archivos y exige dinero para recuperarlos."],
    ["Suplantación", "Uso de la identidad de una persona u organización para engañar."],
    ["Ingeniería social", "Manipulación emocional para lograr que una persona entregue datos o actúe."],
    ["Malware", "Software diseñado para dañar, espiar o tomar control de un dispositivo."],
    ["WiFi trampa", "Red falsa o insegura creada para interceptar información."],
    ["Fraude en compras", "Tiendas, vendedores u ofertas falsas que buscan pagos o datos."],
    ["Smishing", "Phishing enviado por mensaje SMS."],
    ["Vishing", "Fraude realizado mediante llamadas telefónicas."]
  ];

  var quiz = [
    {
      q: "1. ¿Cuál es una señal clara de ingeniería social?",
      options: ["Una aplicación actualizada", "Urgencia y presión para actuar", "Una contraseña larga", "Una copia de seguridad"],
      correct: 1
    },
    {
      q: "2. ¿Qué significa confidencialidad?",
      options: ["Que los datos siempre estén impresos", "Que solo personas autorizadas accedan", "Que nadie haga copias", "Que todo sea público"],
      correct: 1
    },
    {
      q: "3. ¿Cuál amenaza busca robar datos mediante mensajes falsos?",
      options: ["Phishing", "Actualización", "Copia 3-2-1", "Antivirus"],
      correct: 0
    },
    {
      q: "4. ¿Qué se debe hacer ante una alerta bancaria sospechosa?",
      options: ["Entregar el código SMS", "Responder al mensaje", "Verificar por canales oficiales", "Reenviarla a contactos"],
      correct: 2
    },
    {
      q: "5. ¿Cuál es el primer paso del mapa ciudadano de protección?",
      options: ["Recuperar", "Responder", "Identificar", "Detectar"],
      correct: 2
    }
  ];

  function cloneDefault() { return JSON.parse(JSON.stringify(defaultState)); }

  function initialize() {
    Scorm.initialize();
    var saved = Scorm.loadSuspendData();
    state = saved && typeof saved === "object" ? Object.assign(cloneDefault(), saved) : cloneDefault();
    var location = parseInt(Scorm.getLocation(), 10);
    if (!Number.isNaN(location) && location >= 0 && location < totalScreens) state.screen = location;
    if (!state.finished) Scorm.setStatus("incomplete");
    Scorm.setValue("cmi.core.score.min", "0");
    Scorm.setValue("cmi.core.score.max", "100");
    bindGlobalEvents();
    render();
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

  function closeResetDialog() {
    document.getElementById("confirm-dialog").classList.add("hidden");
    document.getElementById("reset-button").focus();
  }

  function openHelpPanel() {
    document.getElementById("help-panel").classList.remove("hidden");
    document.getElementById("close-help").focus();
  }

  function closeHelpPanel() {
    document.getElementById("help-panel").classList.add("hidden");
    document.getElementById("help-button").focus();
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

  function calculateScore() {
    var caseScore = state.answers.caseChoice === "C" ? 25 : state.answers.caseChoice === "D" ? 10 : 0;
    var inventoryScore = state.answers.inventoryScore || 0;
    var quizScore = state.answers.quizScore || 0;
    state.score = Math.min(100, caseScore + inventoryScore + quizScore);
  }

  function allRequiredComplete() {
    return Boolean(state.completed.case && state.completed.inventory && state.completed.quiz);
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
    var screens = [welcome, initialCase, concept, cia, commonThreats, learnMore, protectionMap, inventory, evaluation, results];
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
    var inventoryButton = document.getElementById("submit-inventory");
    if (inventoryButton) inventoryButton.addEventListener("click", submitInventory);
    var quizButton = document.getElementById("submit-quiz");
    if (quizButton) quizButton.addEventListener("click", submitQuiz);
    var finishButton = document.getElementById("finish-ova");
    if (finishButton) finishButton.addEventListener("click", finishOva);
  }

  function welcome() {
    return '<section class="screen hero">' +
      '<span class="tag">🛡 OVA 1 · Fundamentos · 100 puntos</span>' +
      '<h2>Introducción a la Ciberseguridad y Amenazas Comunes</h2>' +
      '<p class="subtitle">“En internet, no conocer las reglas del juego es jugar con los ojos cerrados.”</p>' +
      '<p class="lead">Todos somos un objetivo potencial porque usamos banca digital, redes sociales, compras en línea, WhatsApp y correo. La mayoría de los ataques no comienza con una tecnología extraordinaria: comienza con un mensaje convincente, una contraseña reutilizada o una decisión tomada con prisa.</p>' +
      '<p>Esta OVA te ayudará a leer mejor las señales del entorno digital: quién te escribe, qué te pide, por qué te presiona y qué puedes verificar antes de responder. No se trata de vivir con miedo, sino de construir hábitos que protejan tu dinero, tu identidad, tus recuerdos y tu tranquilidad.</p>' +
      '<div class="notice"><strong>Objetivo:</strong> reconocer la importancia de la ciberseguridad e identificar amenazas que afectan cuentas, dispositivos, dinero, información, reputación y familia.</div>' +
      '<div class="brand-strip"><img src="assets/logo-unicartagena-ctev.png" alt="Logo Universidad de Cartagena y CTEV"><span>Identidad visual institucional · Diplomado en ciberseguridad</span></div>' +
      '<div class="image-band" aria-label="Temas visuales de la OVA"><div class="image-tile" style="background-image:url(assets/escudo-llave.png)"><span>Protección de identidad</span></div><div class="image-tile" style="background-image:url(assets/globo-digital.png)"><span>Vida digital conectada</span></div><div class="image-tile" style="background-image:url(assets/phishing-correo.png)"><span>Fraudes y mensajes sospechosos</span></div></div>' +
      '<div class="identity-route" aria-label="Ruta de cinco OVAs">' +
      '<div class="identity-item current" style="--identity:#087da5"><strong>🛡 OVA 1</strong>Fundamentos</div>' +
      '<div class="identity-item" style="--identity:#155ca2"><strong>🔑 OVA 2</strong>Cuentas</div>' +
      '<div class="identity-item" style="--identity:#18794e"><strong>📱 OVA 3</strong>Dispositivos</div>' +
      '<div class="identity-item" style="--identity:#b45309"><strong>⚠ OVA 4</strong>Fraudes</div>' +
      '<div class="identity-item" style="--identity:#6941c6"><strong>☑ OVA 5</strong>Plan personal</div></div>' +
      nav(false, true, "Iniciar") + '</section>';
  }

  function initialCase() {
    var selected = state.answers.caseChoice || "";
    var score = selected === "C" ? 25 : selected === "D" ? 10 : 0;
    var feedback = "";
    if (state.completed.case) {
      var text = selected === "C"
        ? "Correcto. Andrés debe cerrar la conversación y llamar al banco usando un canal oficial."
        : selected === "D"
          ? "Es prudente pedir ayuda, pero reenviar el mensaje puede propagar el engaño. Lo mejor es contactar directamente al banco."
          : "Esa acción expone la cuenta. Nunca entregues códigos SMS ni sigas instrucciones de un contacto no verificado.";
      feedback = '<p class="feedback ' + feedbackClass(score, 25) + '">' + text + " Puntaje: " + score + "/25.</p>";
    }
    return '<section class="screen"><span class="tag">📲 Caso inicial · Simulación educativa</span><h2>La estafa que vaciaron en 10 minutos</h2>' +
      '<div class="whatsapp-wrap">' + whatsappMockup() + '<div><p>Andrés recibe un WhatsApp de un supuesto funcionario de fraudes de Bancolombia. Le informan de una compra de $1.200.000 desde México y le piden responder SÍ o NO. Después solicitan el código que llegará por SMS para “verificar su identidad”.</p>' +
      '<p>El mensaje parece oportuno y profesional. Sin embargo, el código SMS no cancela una compra: normalmente autoriza un acceso o una transacción. El atacante intenta convertir el miedo de Andrés en una acción rápida.</p>' +
      '<p class="muted"><strong>Nota:</strong> esta conversación es ficticia y se usa solo para aprender a detectar señales de suplantación.</p></div></div>' +
      '<div class="notice alert"><strong>Señales de alerta:</strong> número desconocido, urgencia artificial, solicitud de código SMS y suplantación bancaria. Un banco no pide códigos por WhatsApp.</div>' +
      '<fieldset class="question"><legend>¿Qué debería hacer Andrés?</legend>' +
      caseOption("A", "Enviar el código SMS para cancelar la compra.", selected) +
      caseOption("B", "Responder NO y seguir las instrucciones.", selected) +
      caseOption("C", "No entregar códigos, cerrar la conversación y llamar al banco por canales oficiales.", selected) +
      caseOption("D", "Reenviar el mensaje a familiares para que opinen.", selected) +
      '</fieldset><button id="submit-case" class="button button-primary" type="button">Confirmar respuesta</button>' + feedback +
      nav(true, state.completed.case, "Continuar") + '</section>';
  }

  function whatsappMockup() {
    return '<div class="whatsapp-phone" role="img" aria-label="Simulación de conversación de WhatsApp sospechosa">' +
      '<div class="wa-status"><span>11:28</span><span>▴ ▴ WiFi 75%</span></div>' +
      '<div class="wa-header"><span class="wa-back">‹</span><span class="wa-avatar">🏦</span><span class="wa-title"><strong>Bancolombia Fraudes</strong><span>+57 318 000 4412 · número desconocido</span></span><span class="wa-icons">☎ ⋮</span></div>' +
      '<div class="wa-chat"><div class="wa-day">Hoy</div>' +
      '<div class="wa-encryption">🔒 Los mensajes y llamadas están cifrados de extremo a extremo. Toca para obtener más información.</div>' +
      '<div class="wa-bubble in"><p>⚠️ <strong>Alerta de seguridad</strong></p><p>Detectamos una compra por <strong>$1.200.000</strong> desde México.</p><p>Responda <strong>SÍ</strong> si reconoce la compra o <strong>NO</strong> para cancelarla.</p><span class="wa-time">10:03</span></div>' +
      '<div class="wa-bubble out"><p>NO</p><span class="wa-time">10:04 ✓✓</span></div>' +
      '<div class="wa-bubble in"><p>Para anular el movimiento debe validar su identidad.</p><p>Enviaremos un código por SMS. Escríbalo aquí para bloquear la compra.</p><span class="wa-time">10:04</span></div>' +
      '<div class="wa-bubble in"><p>Ingrese también a <span class="wa-link">bancolombia-seguridad24.com</span> y confirme sus datos.</p><span class="wa-time">10:05</span></div>' +
      '</div><div class="wa-input"><span class="wa-input-pill">Mensaje</span><span>📎</span><span>📷</span><span class="wa-mic">🎙</span></div></div>';
  }

  function caseOption(value, text, selected) {
    return '<label class="option"><input type="radio" name="case" value="' + value + '"' +
      (selected === value ? " checked" : "") + '> <span><strong>' + value + '.</strong> ' + text + '</span></label>';
  }

  function submitCase() {
    var checked = app.querySelector('input[name="case"]:checked');
    if (!checked) return showInlineError("Selecciona una respuesta antes de continuar.");
    state.answers.caseChoice = checked.value;
    state.completed.case = true;
    saveProgress();
    render();
  }

  function concept() {
    return '<section class="screen"><span class="tag">🔐 Concepto</span><h2>La ciberseguridad es el candado de tu vida digital</h2>' +
      '<div class="visual-lesson"><div><p class="lead">Es el conjunto de decisiones, hábitos y herramientas que protege lo que valoras cuando utilizas tecnología.</p>' +
      '<p>Así como cierras la puerta de casa, revisas quién llama y guardas documentos importantes, en el entorno digital debes controlar accesos, verificar solicitudes y conservar copias. La ciberseguridad no busca generar miedo: busca que puedas aprovechar la tecnología con confianza.</p>' +
      '<p>En palabras sencillas, protege lo que tienes, lo que sabes, lo que haces en internet, tu identidad y tu capacidad de recuperarte si algo falla. No depende únicamente de antivirus o herramientas especializadas; también depende de tus decisiones: detenerte, leer, confirmar y actuar por canales oficiales.</p></div><img class="lesson-image" src="assets/escudo-candado.png" alt="Escudo azul con candado que simboliza protección digital"></div>' +
      '<div class="card-grid">' +
      infoCard("💰", "Dinero", "Cuentas bancarias y medios de pago.") +
      infoCard("📱", "Dispositivos", "Celular, computador y tablet.") +
      infoCard("🔑", "Accesos", "Contraseñas y cuentas digitales.") +
      infoCard("📁", "Información", "Fotos, videos, documentos y datos personales.") +
      infoCard("👥", "Personas", "Familia, contactos y comunidad.") +
      infoCard("⭐", "Reputación", "Identidad, trabajo y presencia en línea.") +
      '</div><div class="reading-block"><h3>La ciberseguridad como habilidad de vida</h3><p>Hoy una cuenta de correo puede abrir la puerta a redes sociales, bancos, fotos, documentos, plataformas educativas y servicios laborales. Por eso, una contraseña filtrada o un código compartido puede afectar mucho más que una sola aplicación.</p><p>La meta es que desarrolles criterio: si un mensaje te pide datos, dinero, códigos, contraseñas o acciones urgentes, antes de actuar revisa el canal, el remitente, el enlace y la intención.</p></div>' +
      '<div class="notice success"><strong>Recomendación:</strong> proteger tu vida digital no exige ser especialista; exige detenerse, verificar y mantener buenos hábitos.</div>' +
      nav(true, true) + '</section>';
  }

  function infoCard(icon, title, text) {
    return '<article class="card"><span class="icon" aria-hidden="true">' + icon + '</span><h3>' + title + '</h3><p>' + text + '</p></article>';
  }

  function cia() {
    return '<section class="screen"><span class="tag">🔷 Tres principios</span><h2>Tríada CIA en lenguaje ciudadano</h2>' +
      '<p class="lead">Una buena protección digital no consiste solamente en ocultar información. También debe impedir cambios no autorizados y permitir que puedas recuperar tus datos cuando algo falla.</p>' +
      '<div class="card-grid">' +
      infoCard("🔒", "Confidencialidad", "Solo tú y las personas autorizadas pueden acceder a tus datos.") +
      infoCard("✅", "Integridad", "La información permanece correcta y nadie la altera sin permiso.") +
      infoCard("🟢", "Disponibilidad", "Tus datos y servicios están accesibles cuando los necesitas.") +
      '</div><div class="reading-block"><h3>Ejemplo cotidiano</h3><p>Imagina tus fotografías familiares en la nube. La contraseña y el MFA ayudan a que solo tú accedas; el historial de cambios ayuda a detectar alteraciones; y una copia adicional permite recuperar los archivos si pierdes el celular.</p><p>Si alguien roba tu contraseña y entra a tu correo, puede leer información privada, cambiar configuraciones, enviar mensajes en tu nombre y bloquearte el acceso. Por eso un solo incidente puede afectar los tres pilares a la vez.</p></div>' +
      '<details class="notice"><summary><strong>Pregunta de reflexión:</strong> ¿qué pilar se afecta si alguien entra a tu correo?</summary><p>La respuesta más completa es: confidencialidad, integridad y posiblemente disponibilidad. Puede ver información, modificar datos y dejarte sin acceso.</p></details>' +
      nav(true, true) + '</section>';
  }

  function commonThreats() {
    return '<section class="screen"><span class="tag">⚠ Explora</span><h2>Amenazas que debes reconocer desde hoy</h2><p class="lead">Las amenazas cambian de canal y apariencia, pero suelen repetir las mismas estrategias: engañar, presionar, robar accesos, instalar programas dañinos o impedir que uses tu información.</p><p>Abre cada tarjeta para reconocer definición, ejemplo y acción preventiva. Lo importante no es memorizar nombres, sino identificar patrones: urgencia, miedo, autoridad falsa, enlaces extraños, adjuntos inesperados y solicitudes de códigos.</p>' +
      '<div class="image-band" aria-label="Imágenes de amenazas comunes"><div class="image-tile" style="background-image:url(assets/phishing-correo.png)"><span>Phishing por correo</span></div><div class="image-tile" style="background-image:url(assets/celular-alerta-real.png)"><span>Smishing y mensajes</span></div><div class="image-tile" style="background-image:url(assets/sello-virus.png)"><span>Malware y virus</span></div></div>' +
      '<div class="accordion">' + expandedThreats().map(function (item) {
        return '<details><summary>' + item.name + '</summary><p><strong>Definición:</strong> ' + item.definition + '</p><p><strong>Ejemplo:</strong> ' + item.example + '</p><p><strong>Acción preventiva:</strong> ' + item.action + '</p></details>';
      }).join("") + '</div>' + nav(true, true) + '</section>';
  }

  function expandedThreats() {
    return [
      { name: "Phishing", definition: "Mensaje, correo o sitio falso que intenta engañarte para robar tus datos.", example: "Un supuesto banco te pide actualizar tus datos mediante un enlace urgente.", action: "No abras enlaces sospechosos. Entra desde la app o página oficial." },
      { name: "Smishing", definition: "Phishing enviado por SMS o mensaje de texto.", example: "“Su cuenta fue bloqueada. Verifique aquí.”", action: "No ingreses a enlaces recibidos por SMS. Verifica con la entidad." },
      { name: "Vishing", definition: "Fraude mediante llamada telefónica donde alguien se hace pasar por una entidad confiable.", example: "Una persona dice ser del banco y pide códigos de verificación.", action: "Cuelga y llama tú mismo al número oficial." },
      { name: "Ingeniería social", definition: "Manipulación psicológica para que una persona entregue información o realice una acción riesgosa.", example: "Un atacante genera miedo, urgencia o confianza falsa para que reveles un código.", action: "Detente, verifica y no actúes bajo presión." },
      { name: "Malware", definition: "Programa malicioso que puede robar datos, espiar, dañar archivos o tomar control del equipo.", example: "Un archivo adjunto falso instala un programa oculto.", action: "No abras archivos inesperados y mantén el sistema actualizado." },
      { name: "Ransomware", definition: "Tipo de malware que bloquea archivos o dispositivos y exige dinero para devolver el acceso.", example: "Un computador queda cifrado y aparece un mensaje pidiendo pago.", action: "Mantén copias de seguridad y evita archivos sospechosos." },
      { name: "Suplantación de identidad", definition: "Cuando alguien se hace pasar por otra persona o institución.", example: "Una cuenta falsa de WhatsApp usa la foto de un familiar para pedir dinero.", action: "Verifica por otro canal antes de enviar dinero o información." },
      { name: "WiFi trampa", definition: "Red inalámbrica falsa creada para capturar información de quienes se conectan.", example: "Una red llamada “WiFi Gratis Centro Comercial” puede estar controlada por un atacante.", action: "Evita ingresar a bancos o correos desde redes públicas no confiables." }
    ];
  }

  function learnMore() {
    return '<section class="screen help-section"><div class="help-section-header"><span class="tag">Aprende más</span><h2>Conecta esta lección con el mundo real de la ciberseguridad</h2><p>Este material es complementario. Puedes leerlo ahora o volver desde el botón “Ayuda / Aprende más”.</p></div>' +
      '<div class="visual-lesson"><div class="reading-block"><h3>¿Por qué la ciberseguridad es una habilidad de vida?</h3><p>La ciberseguridad no es solo un tema para ingenieros, técnicos o expertos. Hoy cualquier persona que use celular, correo, redes sociales, apps bancarias o tiendas en línea necesita comprender los riesgos básicos de la vida digital.</p><p>Así como aprendemos a cerrar la puerta de la casa, cuidar la billetera o no entregar las llaves a un desconocido, también debemos proteger cuentas, dispositivos, información e identidad digital.</p><p>En esta OVA aprenderás a mirar tu vida digital con más conciencia. No se trata de tener miedo, sino de desarrollar hábitos seguros y repetibles.</p></div><img class="lesson-image" src="assets/globo-digital.png" alt="Globo digital azul que representa la vida conectada"></div>' +
      '<div class="reading-block"><h3>Concepto ampliado de ciberseguridad</h3><p>La ciberseguridad es el conjunto de prácticas, decisiones, herramientas y hábitos que ayudan a proteger la información, los dispositivos, las cuentas y los servicios digitales frente a accesos no autorizados, fraudes, robos, daños o interrupciones.</p><ul><li>Protege lo que tienes: dispositivos, archivos, fotos y dinero.</li><li>Protege lo que sabes: contraseñas, códigos, preguntas de recuperación y datos personales.</li><li>Protege lo que haces: compras, pagos, estudios, trabajo y comunicación.</li><li>Protege tu identidad: evita que otros actúen en tu nombre.</li><li>Protege tu recuperación: copias, canales oficiales y reportes.</li></ul></div>' +
      '<div class="reading-block"><h3>Los tres pilares de la seguridad de la información</h3><div class="card-grid">' +
      infoCard("🔒", "Confidencialidad", "Solo las personas autorizadas pueden ver la información. Ejemplo: tu clave bancaria no debe ser conocida por nadie más.") +
      infoCard("✅", "Integridad", "La información no ha sido alterada sin permiso. Ejemplo: que el valor de una transferencia no sea cambiado.") +
      infoCard("🟢", "Disponibilidad", "Puedes acceder a tu información cuando la necesitas. Ejemplo: recuperar archivos o entrar a tu correo.") +
      '</div><p><strong>Reflexión:</strong> si alguien roba tu contraseña y entra a tu correo, puede afectar confidencialidad, integridad y disponibilidad al mismo tiempo.</p></div>' +
      '<div class="reading-block"><h3>Conoce el rol de quienes protegen sistemas y personas</h3><p>Un analista de ciberseguridad ayuda a proteger redes, dispositivos, personas y datos. Su trabajo incluye observar señales de riesgo, investigar incidentes, aplicar controles, documentar hallazgos y responder cuando ocurre una amenaza.</p></div>' +
      '<div class="reading-block"><h3>Marcos de trabajo: una brújula para protegernos</h3><p>Los profesionales usan marcos de trabajo para ordenar decisiones. El NIST Cybersecurity Framework 2.0 organiza resultados en funciones como Gobernar, Identificar, Proteger, Detectar, Responder y Recuperar. En lenguaje ciudadano, esto significa definir reglas, saber qué proteger, aplicar medidas, reconocer señales, actuar ante incidentes y volver a la normalidad.</p></div>' +
      '<div class="reading-block"><h3>Relaciona el concepto con la acción segura</h3><div class="concept-match">' +
      infoCard("🏦", "Mensaje urgente del banco", "Verificar por canales oficiales.") +
      infoCard("🖼", "Fotos importantes en el celular", "Activar copia de seguridad.") +
      infoCard("🔑", "Misma contraseña en varias cuentas", "Crear contraseñas diferentes y usar gestor.") +
      infoCard("📎", "Archivo inesperado", "No abrirlo sin verificar.") +
      infoCard("🚨", "Inicio de sesión desconocido", "Cambiar contraseña, cerrar sesiones y activar MFA.") +
      '</div><p class="resource-note">Cada acción segura reduce el riesgo. La ciberseguridad se construye con decisiones pequeñas, repetidas todos los días.</p></div>' +
      '<div class="reading-block"><h3>Para ampliar tu conocimiento</h3><p>Estos recursos son opcionales y requieren internet; no son necesarios para completar el SCORM. Sirven como ruta de profundización para quien quiera aprender fundamentos, riesgos, amenazas, vulnerabilidades, herramientas y buenas prácticas.</p><div class="resource-list">' +
      resourceLink("https://grow.google/certificates/cybersecurity/", "Google Cybersecurity Certificate", "Ruta de profundización para seguir aprendiendo fundamentos, riesgos, amenazas, herramientas y buenas prácticas.") +
      resourceLink("https://www.coursera.org/learn/foundations-of-cybersecurity", "Foundations of Cybersecurity — Google/Coursera", "Amplía profesión, ataques, tríada CIA, marcos, controles, ética y herramientas comunes.") +
      resourceLink("https://grow.google/certificates/cybersecurity/", "Google Skills / Grow with Google", "Referencia breve para cursos introductorios y ruta de aprendizaje inicial.") +
      resourceLink("https://www.nist.gov/cyberframework", "NIST Cybersecurity Framework 2.0", "Sustenta el mapa de funciones de seguridad: Govern, Identify, Protect, Detect, Respond y Recover.") +
      resourceLink("https://phishingquiz.withgoogle.com/", "Google Phishing Quiz", "Práctica opcional para probar si detectas phishing; encaja especialmente con la OVA 4.") +
      '</div></div>' +
      '<div class="notice success"><strong>Cierre:</strong> la mejor defensa no es saberlo todo, sino detenerse, observar y verificar antes de actuar. Si un mensaje genera urgencia, miedo o presión, tómate un minuto.</div>' +
      nav(true, true, "Continuar al mapa de protección") + '</section>';
  }

  function resourceLink(url, title, description) {
    return '<a class="resource-card" href="' + url + '" target="_blank" rel="noopener"><strong>' + title + '</strong><small>' + description + '</small></a>';
  }

  function protectionMap() {
    return '<section class="screen"><span class="tag">⬡ Mapa ciudadano</span><h2>Cinco pasos para protegerte</h2>' +
      '<p class="lead">La protección funciona como un ciclo. Primero reconoces lo valioso; luego reduces riesgos, observas señales, actúas ante incidentes y recuperas lo necesario. Después incorporas lo aprendido y vuelves a mejorar.</p>' +
      '<p>Este mapa está inspirado en el enfoque del NIST Cybersecurity Framework. En su versión 2.0 aparece también la función <strong>Gobernar</strong>, que para una persona significa definir reglas simples: qué cuentas son críticas, quién puede usar tus dispositivos, dónde guardas copias y qué harás si algo sale mal.</p>' +
      '<div class="steps">' +
      '<article class="step"><h3>Identificar</h3><p>¿Qué tengo que proteger?</p></article>' +
      '<article class="step"><h3>Proteger</h3><p>¿Cómo reduzco el riesgo?</p></article>' +
      '<article class="step"><h3>Detectar</h3><p>¿Cómo sé si algo falla?</p></article>' +
      '<article class="step"><h3>Responder</h3><p>¿Qué hago si me atacan?</p></article>' +
      '<article class="step"><h3>Recuperar</h3><p>¿Cómo vuelvo a la normalidad?</p></article>' +
      '</div><div class="reading-block"><h3>Ejemplo ciudadano</h3><ul><li><strong>Identificar:</strong> reconozco que mi correo, WhatsApp, banco y fotos son activos valiosos.</li><li><strong>Proteger:</strong> uso contraseñas fuertes, MFA y bloqueo de pantalla.</li><li><strong>Detectar:</strong> reviso alertas de inicio de sesión y movimientos extraños.</li><li><strong>Responder:</strong> cambio claves, bloqueo cuentas y reporto por canales oficiales.</li><li><strong>Recuperar:</strong> restauro accesos, recupero copias de seguridad y mejoro hábitos.</li></ul></div>' +
      '<div class="visual-lesson"><div class="notice success"><strong>Acción útil:</strong> empieza identificando tus cuentas y dispositivos más importantes. Lo que conoces, puedes protegerlo. Prioriza aquello cuya pérdida afectaría tu dinero, tu trabajo, tus estudios o tus recuerdos.</div><img class="lesson-image" src="assets/candado-digital.png" alt="Candado digital azul sostenido por dos manos"></div>' +
      nav(true, true) + '</section>';
  }

  function inventory() {
    var selected = state.answers.inventory || [];
    var feedback = state.completed.inventory
      ? '<p class="feedback ' + feedbackClass(state.answers.inventoryScore, 30) + '">Marcaste ' + selected.length + ' elementos. Puntaje: ' + state.answers.inventoryScore + '/30. Tu inventario muestra por qué tu vida digital merece protección.</p>'
      : "";
    return '<section class="screen"><span class="tag">Actividad · 30 puntos</span><h2>¿Cuánto vale mi vida digital?</h2>' +
      '<p>Marca los elementos que forman parte de tu vida cotidiana. Debes seleccionar al menos 6 para completar la actividad.</p>' +
      checkGroup("Cuentas que manejo", ["Correo personal", "Banca digital o apps de pago", "Redes sociales", "WhatsApp o Telegram", "Tiendas online"], selected) +
      checkGroup("Dispositivos que uso", ["Celular personal", "Computador personal", "Tablet", "Dispositivos del trabajo o estudio", "Dispositivos compartidos en casa"], selected) +
      checkGroup("Información que guardo", ["Fotos y videos personales", "Documentos de identidad", "Información financiera", "Datos de salud", "Datos de mi familia"], selected) +
      '<button id="submit-inventory" class="button button-primary" type="button">Guardar inventario</button>' + feedback +
      nav(true, state.completed.inventory, "Ir a evaluación") + '</section>';
  }

  function checkGroup(title, items, selected) {
    return '<fieldset class="check-group"><legend><strong>' + title + '</strong></legend>' + items.map(function (item) {
      return '<label class="option"><input type="checkbox" name="inventory" value="' + item + '"' +
        (selected.indexOf(item) >= 0 ? " checked" : "") + '><span>' + item + '</span></label>';
    }).join("") + '</fieldset>';
  }

  function submitInventory() {
    var selected = Array.from(app.querySelectorAll('input[name="inventory"]:checked')).map(function (input) { return input.value; });
    if (selected.length < 6) return showInlineError("Marca al menos 6 elementos para completar la actividad.");
    state.answers.inventory = selected;
    state.answers.inventoryScore = selected.length >= 6 ? 30 : selected.length >= 3 ? 15 : 5;
    state.completed.inventory = true;
    saveProgress();
    render();
  }

  function evaluation() {
    var answers = state.answers.quiz || {};
    var feedback = state.completed.quiz
      ? '<p class="feedback ' + feedbackClass(state.answers.quizScore, 45) + '">Obtuviste ' + state.answers.quizScore + '/45 en la evaluación. Revisa las respuestas y continúa a resultados.</p>'
      : "";
    return '<section class="screen"><span class="tag">Evaluación · 45 puntos</span><h2>Comprueba lo aprendido</h2><p>Cada respuesta correcta vale 9 puntos. Responde las cinco preguntas.</p>' +
      quiz.map(function (item, qIndex) {
        return '<fieldset class="question"><legend>' + item.q + '</legend>' + item.options.map(function (option, oIndex) {
          return '<label class="option"><input type="radio" name="q' + qIndex + '" value="' + oIndex + '"' +
            (String(answers[qIndex]) === String(oIndex) ? " checked" : "") + '><span>' + option + '</span></label>';
        }).join("") + '</fieldset>';
      }).join("") +
      '<button id="submit-quiz" class="button button-primary" type="button">Calificar evaluación</button>' + feedback +
      nav(true, state.completed.quiz, "Ver resultados") + '</section>';
  }

  function submitQuiz() {
    var answers = {};
    for (var i = 0; i < quiz.length; i += 1) {
      var checked = app.querySelector('input[name="q' + i + '"]:checked');
      if (!checked) return showInlineError("Responde las cinco preguntas antes de calificar.");
      answers[i] = Number(checked.value);
    }
    var correct = quiz.reduce(function (sum, item, index) { return sum + (answers[index] === item.correct ? 1 : 0); }, 0);
    state.answers.quiz = answers;
    state.answers.quizScore = correct * 9;
    state.completed.quiz = true;
    saveProgress();
    render();
  }

  function results() {
    var complete = allRequiredComplete();
    var recommendation = !complete
      ? "Completa el caso, el inventario y la evaluación."
      : state.score >= 70
        ? "Buen trabajo. Mantén el hábito de verificar canales, enlaces y solicitudes inesperadas."
        : "Repasa las señales de ingeniería social y practica verificar antes de actuar.";
    return '<section class="screen results"><span class="tag">Resultados</span><h2>Tu resultado en la OVA 1</h2>' +
      '<div class="result-score" aria-label="Puntaje final">' + state.score + '<small>/100</small></div>' +
      '<h3>Estado: ' + statusLabel() + '</h3><p class="lead">' + recommendation + '</p>' +
      '<div class="card-grid">' +
      infoCard("💬", "Caso inicial", (state.answers.caseChoice ? "Completado" : "Pendiente")) +
      infoCard("🧭", "Inventario", (state.completed.inventory ? "Completado" : "Pendiente")) +
      infoCard("📝", "Evaluación", (state.completed.quiz ? "Completada" : "Pendiente")) +
      '</div>' +
      '<div class="reading-block"><h3>Lincografía opcional para profundizar</h3><p>Estos recursos requieren internet y no afectan el puntaje SCORM. Úsalos después de terminar la OVA si quieres seguir aprendiendo.</p><div class="resource-list">' +
      resourceLink("https://grow.google/certificates/cybersecurity/", "Google Cybersecurity Certificate", "Ruta de aprendizaje completa en fundamentos de ciberseguridad.") +
      resourceLink("https://www.coursera.org/learn/foundations-of-cybersecurity", "Foundations of Cybersecurity", "Curso introductorio sobre profesión, amenazas, marcos y controles.") +
      resourceLink("https://www.nist.gov/cyberframework", "NIST Cybersecurity Framework 2.0", "Marco de referencia para organizar funciones de seguridad.") +
      resourceLink("https://phishingquiz.withgoogle.com/", "Google Phishing Quiz", "Práctica opcional para reconocer señales de phishing.") +
      '</div></div>' +
      '<div class="brand-strip"><img src="assets/logo-unicartagena-ctev.png" alt="Logo Universidad de Cartagena y CTEV"><span>Fin de la OVA 1 · Fundamentos y ciberhigiene personal</span></div>' +
      (complete ? '<button id="finish-ova" class="button button-primary" type="button">' + (state.finished ? "OVA finalizada" : "Finalizar OVA") + '</button>' : '<p class="notice alert">Aún hay actividades obligatorias pendientes.</p>') +
      nav(true, false) + '</section>';
  }

  function showInlineError(message) {
    var old = app.querySelector(".validation-error");
    if (old) old.remove();
    var error = document.createElement("p");
    error.className = "feedback incorrect validation-error";
    error.setAttribute("role", "alert");
    error.textContent = message;
    var firstButton = app.querySelector(".button-primary");
    firstButton.insertAdjacentElement("afterend", error);
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
