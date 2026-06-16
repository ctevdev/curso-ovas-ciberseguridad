(function () {
  "use strict";

  var totalScreens = 13;
  var app = document.getElementById("app");
  var contentKeys = ["usb", "wifi", "backup", "privacy"];
  var defaultState = {
    screen: 0,
    score: 0,
    answers: {
      content: {},
      riskPractice: {},
      diagnosis: [],
      challenge: [],
      quiz: {}
    },
    completed: {},
    finalStatus: "incomplete",
    finished: false
  };
  var state = cloneDefault();

  var contentQuestions = {
    usb: {
      title: "Centro comercial: necesitas cargar el celular. ¿Qué es más seguro?",
      options: [
        "Conectar el celular directamente al puerto USB público.",
        "Usar tu propio cargador conectado a una toma eléctrica.",
        "Conectar el celular a cualquier computador cercano.",
        "Aceptar cualquier permiso que aparezca."
      ],
      correct: 1,
      feedback: "Correcto. Tu cargador en una toma eléctrica evita que el puerto USB intercambie datos con el celular."
    },
    wifi: {
      title: "¿Cuál red es más recomendable para una transferencia bancaria desde el celular?",
      options: [
        "WiFi pública de un café.",
        "Datos móviles propios.",
        "Red abierta llamada Banco Gratis.",
        "Cualquier red sin contraseña."
      ],
      correct: 1,
      feedback: "Correcto. Para banca y pagos, los datos móviles propios suelen ser una opción más confiable que una red pública."
    },
    backup: {
      title: "¿Cuál es el error más común con las copias de seguridad?",
      options: [
        "Tener demasiadas copias verificadas.",
        "Creer que todo está respaldado sin comprobarlo.",
        "Guardar una copia fuera de casa.",
        "Usar nube y disco externo."
      ],
      correct: 1,
      feedback: "Correcto. Una copia que nunca se verifica puede fallar justo cuando más se necesita."
    },
    privacy: {
      title: "Una app de linterna pide contactos, micrófono, cámara y ubicación. ¿Qué indica esto?",
      options: [
        "Los permisos parecen excesivos.",
        "Es normal que una linterna pida todo.",
        "Debe aceptarse sin revisar.",
        "No existe ningún riesgo."
      ],
      correct: 0,
      feedback: "Correcto. Las apps deben pedir solo los permisos necesarios para cumplir su función."
    }
  };

  var riskSituations = [
    ["Camila tiene el celular sin PIN porque le parece incómodo desbloquearlo.", ["Riesgo de acceso no autorizado si pierde el celular.", "Riesgo de gastar más batería.", "Riesgo de perder señal.", "No hay ningún riesgo."], 0],
    ["Luis se conecta a una red llamada WiFi Gratis Centro Comercial y abre su banca digital.", ["Está usando una red confiable.", "Está asumiendo riesgo al usar banca en WiFi pública.", "Está protegiendo sus datos.", "Está usando una copia de seguridad."], 1],
    ["María nunca actualiza su celular porque teme que cambie la apariencia de las apps.", ["Puede dejar fallas de seguridad sin corregir.", "Mejora la privacidad.", "Aumenta la velocidad de internet.", "Protege mejor sus fotos."], 0],
    ["Andrés tiene todas sus fotos solo en el celular. Nunca activó copia en la nube.", ["Tiene buena protección.", "Si el celular se pierde o se daña, puede perder sus fotos.", "Tiene demasiadas copias.", "La nube se activa sola siempre."], 1],
    ["Una app de linterna pide acceso a contactos, micrófono, cámara y ubicación.", ["Los permisos parecen excesivos.", "Es normal que una linterna pida todo.", "Debe aceptarse sin revisar.", "No existe ningún riesgo."], 0]
  ];

  var diagnosisSections = [
    ["Mi celular", [
      "Tengo PIN, patrón o biometría activo.",
      "El bloqueo automático es de máximo 1 minuto.",
      "Tengo protección activa o configuración de seguridad básica.",
      "Actualicé el sistema operativo este mes."
    ]],
    ["Mi computador", [
      "Tiene contraseña de inicio de sesión.",
      "Se bloquea automáticamente cuando me alejo.",
      "El antivirus está activo y actualizado.",
      "Hago actualizaciones regularmente."
    ]],
    ["Mi red WiFi de casa", [
      "Cambié la clave predeterminada del router.",
      "Uso WPA2 o WPA3.",
      "Tengo red de invitados para visitas.",
      "No hago banca desde WiFi pública sin VPN."
    ]],
    ["Mis copias de seguridad", [
      "Mis fotos se sincronizan automáticamente.",
      "Tengo documentos importantes en la nube.",
      "Conozco la regla 3-2-1.",
      "He probado que puedo recuperar mis archivos."
    ]]
  ];

  var challengeActions = [
    "Revisar si el celular tiene PIN, patrón, huella o reconocimiento facial.",
    "Configurar bloqueo automático en máximo 1 minuto.",
    "Verificar si el sistema operativo está actualizado.",
    "Revisar permisos de tres aplicaciones instaladas.",
    "Activar copia automática de fotos por WiFi.",
    "Revisar si los documentos importantes están en la nube.",
    "Revisar si la red WiFi de casa usa WPA2 o WPA3.",
    "Cambiar la clave del router si todavía es la predeterminada.",
    "Eliminar una app que ya no se usa.",
    "Verificar que se puede recuperar al menos un archivo respaldado."
  ];

  var quiz = [
    {
      q: "1. ¿Cuál es una medida básica para proteger un celular si se pierde?",
      options: ["No usar ninguna clave para entrar rápido.", "Activar PIN, patrón, huella o reconocimiento facial.", "Compartir el PIN con todos los familiares.", "Desactivar el bloqueo automático."],
      correct: 1
    },
    {
      q: "2. ¿Por qué es importante actualizar el sistema operativo?",
      options: ["Porque cambia los colores de las aplicaciones.", "Porque puede corregir fallas de seguridad.", "Porque elimina automáticamente todos los archivos.", "Porque desactiva la conexión WiFi."],
      correct: 1
    },
    {
      q: "3. ¿Cuál red es más recomendable para banca digital en movimiento?",
      options: ["WiFi pública abierta.", "Red desconocida sin contraseña.", "Datos móviles propios.", "WiFi llamada Gratis Banco."],
      correct: 2
    },
    {
      q: "4. ¿Qué significa la regla 3-2-1?",
      options: ["Tres contraseñas, dos correos y una red social.", "Tres copias, dos medios distintos y una copia fuera de casa.", "Tres celulares, dos computadores y un router.", "Tres antivirus, dos USB y una contraseña."],
      correct: 1
    },
    {
      q: "5. ¿Qué indica que una app puede representar riesgo de privacidad?",
      options: ["Pide solo el permiso necesario para funcionar.", "Pide permisos excesivos como contactos, micrófono y ubicación sin necesitarlos.", "Se actualiza con frecuencia.", "Está instalada desde una tienda oficial."],
      correct: 1
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
    state.answers.content = state.answers.content || {};
    state.answers.riskPractice = state.answers.riskPractice || {};
    state.answers.diagnosis = state.answers.diagnosis || [];
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
    var caseScore = getCaseScore();
    var contentScore = contentKeys.reduce(function (sum, key) { return sum + getContentScore(key); }, 0);
    var diagnosisScore = state.completed.diagnosis ? getDiagnosisScore().scorm : 0;
    var challengeScore = state.completed.challenge ? getChallengeScore() : 0;
    var quizScore = state.completed.quiz ? getQuizScore() : 0;
    state.score = Math.min(100, caseScore + contentScore + diagnosisScore + challengeScore + quizScore);
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
    return Boolean(
      state.completed.case &&
      state.completed.content_usb &&
      state.completed.content_wifi &&
      state.completed.content_backup &&
      state.completed.content_privacy &&
      state.completed.diagnosis &&
      state.completed.challenge &&
      state.completed.quiz
    );
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
      initialCase,
      learnMore,
      deviceHabits,
      wifiNetworks,
      cloudBackup,
      privacy,
      diagnosis,
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

    var caseButton = document.getElementById("submit-case");
    if (caseButton) caseButton.addEventListener("click", submitCase);
    app.querySelectorAll("[data-content-question]").forEach(function (button) {
      button.addEventListener("click", function () { submitContent(button.dataset.contentQuestion); });
    });
    var riskButton = document.getElementById("submit-risk");
    if (riskButton) riskButton.addEventListener("click", submitRiskPractice);
    var diagnosisButton = document.getElementById("submit-diagnosis");
    if (diagnosisButton) diagnosisButton.addEventListener("click", submitDiagnosis);
    var challengeButton = document.getElementById("submit-challenge");
    if (challengeButton) challengeButton.addEventListener("click", submitChallenge);
    var quizButton = document.getElementById("submit-quiz");
    if (quizButton) quizButton.addEventListener("click", submitQuiz);
    var finishButton = document.getElementById("finish-ova");
    if (finishButton) finishButton.addEventListener("click", finishOva);
  }

  function welcome() {
    return '<section class="screen hero">' +
      '<span class="tag">📱 OVA 3 · Dispositivos y respaldos · 100 puntos</span>' +
      '<h2>Seguridad en Dispositivos, Redes WiFi, Nube y Copias de Seguridad</h2>' +
      '<p class="subtitle">“Cuida tus dispositivos como cuidas tu billetera. Son igual de valiosos o más.”</p>' +
      '<p class="lead">Aprenderás a proteger celular, computador, red WiFi, archivos en la nube y copias de seguridad. Tus dispositivos guardan fotos, conversaciones, accesos bancarios, documentos, códigos de verificación e información familiar.</p>' +
      '<div class="notice"><strong>Objetivo:</strong> evaluar y mejorar la seguridad de dispositivos personales, redes WiFi, servicios en la nube, copias de seguridad y hábitos básicos de privacidad digital.</div>' +
      '<div class="brand-strip"><img src="assets/logo-unicartagena-ctev.png" alt="Logo Universidad de Cartagena y CTEV"><span>Identidad institucional · Ruta de ciberhigiene personal</span></div>' +
      '<div class="identity-route" aria-label="Ruta de cinco OVAs">' +
      '<div class="identity-item" style="--identity:#087da5"><strong>🛡 OVA 1</strong>Fundamentos</div>' +
      '<div class="identity-item" style="--identity:#155ca2"><strong>🔑 OVA 2</strong>Cuentas</div>' +
      '<div class="identity-item current" style="--identity:#18794e"><strong>📱 OVA 3</strong>Dispositivos</div>' +
      '<div class="identity-item" style="--identity:#b45309"><strong>⚠ OVA 4</strong>Fraudes</div>' +
      '<div class="identity-item" style="--identity:#6941c6"><strong>☑ OVA 5</strong>Plan personal</div></div>' +
      nav(false, true, "Iniciar OVA") + '</section>';
  }

  function objective() {
    return '<section class="screen"><span class="tag">Objetivo de aprendizaje</span><h2>Lo que podrás hacer al finalizar</h2>' +
      '<p class="lead">Aplicar recomendaciones prácticas para proteger dispositivos, elegir redes más seguras, activar copias y revisar privacidad sin guardar datos sensibles dentro de la OVA.</p>' +
      '<div class="card-grid">' +
      infoCard("📱", "Celular y computador", "Bloqueo automático, actualizaciones, antivirus, USB desconocidas, puertos públicos y borrado seguro.") +
      infoCard("📶", "Redes WiFi", "Diferenciar WiFi de casa, datos móviles y WiFi pública para tomar decisiones seguras.") +
      infoCard("☁", "Nube y backups", "Comprender la regla 3-2-1 y verificar copias en Google Fotos, iCloud, Drive u otros servicios.") +
      infoCard("🔍", "Privacidad", "Identificar riesgos en permisos de apps, fotos con ubicación, historial, publicaciones y cuentas abandonadas.") +
      '</div>' +
      '<div class="image-band"><div class="image-tile" style="background-image:url(assets/candado-digital.png)"><span>Proteger dispositivos</span></div><div class="image-tile" style="background-image:url(assets/globo-digital.png)"><span>Elegir redes confiables</span></div><div class="image-tile" style="background-image:url(assets/escudo-candado.png)"><span>Respaldar y recuperar</span></div></div>' +
      nav(true, true, "Ver caso inicial") + '</section>';
  }

  function initialCase() {
    var selected = state.answers.caseChoice || "";
    var score = getCaseScore();
    var feedback = "";
    if (state.completed.case) {
      var text = selected === "B"
        ? "Correcto. Activar copia automática en la nube por WiFi permite recuperar fotos y archivos si el celular se daña, se pierde o es robado."
        : selected === "D"
          ? "Parcial. Enviar algunas fotos por WhatsApp puede salvar unas pocas, pero no reemplaza una copia automática organizada y verificable."
          : "Incorrecto. Un celular costoso también puede dañarse. Guardar todo solo en memoria interna aumenta el riesgo de pérdida total.";
      feedback = '<p class="feedback ' + feedbackClass(score, 20) + '">' + text + " Puntaje: " + score + "/20.</p>";
    }
    return '<section class="screen"><span class="tag">Caso inicial · 20 puntos</span><h2>Las fotos del viaje que nunca recuperaron</h2>' +
      '<div class="visual-lesson"><div><p>Juan y su esposa viajaron durante 15 días y tomaron más de 3.000 fotos con el celular. Al regresar, el celular se cayó, la pantalla se rompió y no fue posible encenderlo.</p><p>El almacenamiento interno estaba dañado. No tenían copia automática en Google Fotos ni iCloud porque pensaban que el respaldo consumía demasiados datos.</p><div class="notice risk"><strong>Resultado:</strong> perdieron 3.000 recuerdos importantes. Perder fotos duele, pero perder documentos de trabajo o datos bancarios puede costar mucho más.</div></div><img class="lesson-image" src="assets/celular-alerta-real.png" alt="Celular con alerta de seguridad"></div>' +
      '<fieldset class="question"><legend>¿Cuál era la acción preventiva más importante?</legend>' +
      caseOption("A", "Comprar un celular más costoso.", selected) +
      caseOption("B", "Activar copia automática en la nube usando WiFi.", selected) +
      caseOption("C", "Guardar todo solo en la memoria interna.", selected) +
      caseOption("D", "Enviar todas las fotos por WhatsApp.", selected) +
      '</fieldset><button id="submit-case" class="button button-primary" type="button">Confirmar respuesta</button>' + feedback +
      nav(true, state.completed.case, "Continuar") + '</section>';
  }

  function caseOption(value, text, selected) {
    return '<label class="option"><input type="radio" name="case" value="' + value + '"' +
      (selected === value ? " checked" : "") + '> <span><strong>' + value + '.</strong> ' + text + '</span></label>';
  }

  function getCaseScore() {
    if (!state.completed.case) return 0;
    if (state.answers.caseChoice === "B") return 20;
    if (state.answers.caseChoice === "D") return 8;
    return 0;
  }

  function submitCase() {
    var checked = app.querySelector('input[name="case"]:checked');
    if (!checked) return showInlineError("Selecciona una respuesta antes de continuar.");
    state.answers.caseChoice = checked.value;
    state.completed.case = true;
    saveProgress();
    render();
  }

  function learnMore() {
    return '<section class="screen"><span class="tag">Aprende más · material de ayuda</span><h2>Protege tus dispositivos y recupera tu información antes de perderla</h2>' +
      '<p class="lead">No basta con evitar fraudes. También hay que preparar los dispositivos para resistir fallas, pérdidas, robos, infecciones y errores humanos.</p>' +
      '<div class="accordion">' +
      detailsBlock("Tu celular es más que un teléfono", "Es billetera, cámara, agenda, oficina, memoria familiar y llave de acceso. Puede contener bancos, correos, fotos, conversaciones, documentos, códigos de doble factor, ubicación y contactos.") +
      detailsBlock("Actualizaciones: cerrar puertas abiertas", "Las actualizaciones corrigen fallas de seguridad. Actualiza sistema operativo, navegador, apps bancarias, mensajería, antivirus, router y herramientas de estudio o trabajo.") +
      detailsBlock("Antivirus y criterio", "El antivirus ayuda a detectar malware, pero no reemplaza tus decisiones. No instales apps desconocidas, programas piratas ni aceptes permisos innecesarios.") +
      detailsBlock("WiFi trampa", "Una red llamada WiFi Gratis, Free Airport o Universidad Invitados puede ser falsa. Evita escribir contraseñas, hacer pagos o abrir banca en redes públicas.") +
      detailsBlock("Copias verificadas", "No basta con creer que la copia está activa. Verifica que los archivos se suben y que puedes recuperarlos.") +
      detailsBlock("Privacidad y permisos", "Revisa qué apps acceden a ubicación, cámara, micrófono, contactos y archivos. Elimina cuentas y apps abandonadas.") +
      '</div>' +
      '<div class="reading-block"><h3>Detecta el riesgo en mi dispositivo</h3><p>Actividad de práctica no calificable. Selecciona el riesgo principal en cada situación.</p>' + riskPracticeMarkup() + '<button id="submit-risk" class="button button-primary" type="button">Revisar práctica</button>' + riskFeedback() + '</div>' +
      nav(true, true, "Buenos hábitos") + '</section>';
  }

  function detailsBlock(title, text) {
    return '<details><summary>' + title + '</summary><p>' + text + '</p></details>';
  }

  function riskPracticeMarkup() {
    return riskSituations.map(function (item, qIndex) {
      return '<fieldset class="question"><legend>' + item[0] + '</legend>' + item[1].map(function (option, oIndex) {
        return '<label class="option"><input type="radio" name="risk' + qIndex + '" value="' + oIndex + '"' +
          (String(state.answers.riskPractice[qIndex]) === String(oIndex) ? " checked" : "") + '><span>' + option + '</span></label>';
      }).join("") + '</fieldset>';
    }).join("");
  }

  function riskFeedback() {
    if (!state.completed.riskPractice) return "";
    var correct = riskSituations.reduce(function (sum, item, index) {
      return sum + (state.answers.riskPractice[index] === item[2] ? 1 : 0);
    }, 0);
    return '<p class="feedback success">Práctica revisada: ' + correct + ' de ' + riskSituations.length + ' riesgos identificados. Esta actividad no modifica tu puntaje SCORM.</p>';
  }

  function submitRiskPractice() {
    var answers = {};
    for (var i = 0; i < riskSituations.length; i += 1) {
      var checked = app.querySelector('input[name="risk' + i + '"]:checked');
      if (!checked) return showInlineError("Responde todas las situaciones para revisar la práctica.");
      answers[i] = Number(checked.value);
    }
    state.answers.riskPractice = answers;
    state.completed.riskPractice = true;
    saveProgress();
    render();
  }

  function deviceHabits() {
    return '<section class="screen"><span class="tag">Hábitos de protección · 5 puntos</span><h2>Buenos hábitos con celular y computador</h2>' +
      '<div class="card-grid">' +
      infoCard("🔒", "Bloqueo automático", "Configura bloqueo de pantalla en máximo 1 minuto en el celular y pocos minutos en el computador.") +
      infoCard("⬆", "Actualizaciones", "Instala actualizaciones de seguridad tan pronto como estén disponibles. Muchas corrigen fallas conocidas.") +
      infoCard("🛡", "Antivirus activo", "Mantén activo el sistema de protección. En Windows, Microsoft Defender puede ser suficiente si está actualizado.") +
      infoCard("💾", "USB desconocidas", "Una USB encontrada en la calle, salón u oficina puede estar infectada. No conectes dispositivos desconocidos.") +
      infoCard("🔌", "Puertos USB públicos", "Evita cargar el celular en puertos USB públicos. Usa tu propio cargador en una toma eléctrica.") +
      infoCard("♻", "Borrado seguro", "Antes de vender o entregar un equipo, restablece de fábrica y elimina cuentas asociadas.") +
      '</div>' + contentQuestion("usb") + nav(true, state.completed.content_usb, "Redes WiFi") + '</section>';
  }

  function wifiNetworks() {
    return '<section class="screen"><span class="tag">Redes WiFi · 5 puntos</span><h2>¿A qué red me conecto?</h2>' +
      '<div class="network-grid">' +
      networkCard("safe", "WiFi de casa", "Segura si está bien configurada.", ["Cambia la clave predeterminada del router.", "Usa WPA2 o WPA3.", "Crea una red de invitados.", "No compartas la clave con desconocidos."]) +
      networkCard("safe", "Datos móviles", "Muy segura para banca y pagos.", ["Prefiere datos móviles para trámites sensibles.", "No compartas hotspot con desconocidos.", "Apaga el punto de acceso cuando no lo uses."]) +
      networkCard("risk", "WiFi pública", "Riesgosa.", ["No hagas pagos ni banca.", "No escribas contraseñas importantes.", "Desactiva conexión automática.", "Usa VPN si es estrictamente necesario."]) +
      '</div><div class="notice alert"><strong>WiFi trampa:</strong> una red abierta con nombre genérico puede imitar un lugar real. Si debes conectarte, evita bancos, correos y plataformas donde escribas contraseña.</div>' +
      contentQuestion("wifi") + nav(true, state.completed.content_wifi, "Nube y copias") + '</section>';
  }

  function networkCard(type, title, level, items) {
    return '<article class="network-card ' + type + '"><h3>' + title + '</h3><p><strong>Nivel:</strong> ' + level + '</p><ul>' +
      items.map(function (item) { return '<li>' + item + '</li>'; }).join("") + '</ul></article>';
  }

  function cloudBackup() {
    return '<section class="screen"><span class="tag">Nube y backups · 5 puntos</span><h2>La nube y las copias de seguridad</h2>' +
      '<p class="lead">Los accidentes no avisan. Un celular puede perderse, dañarse, ser robado o quedar inutilizable. Una copia de seguridad permite recuperar información importante.</p>' +
      '<div class="rule-321"><div class="rule-item"><span class="rule-number">3</span><strong>copias</strong><p>de tus datos importantes.</p></div><div class="rule-item"><span class="rule-number">2</span><strong>medios</strong><p>diferentes, por ejemplo computador y disco externo.</p></div><div class="rule-item"><span class="rule-number">1</span><strong>copia fuera de casa</strong><p>por ejemplo en la nube.</p></div></div>' +
      '<div class="card-grid">' +
      infoCard("📷", "Fotos familiares", "Celular + Google Fotos o iCloud + copia adicional en computador o disco externo.") +
      infoCard("📄", "Documentos importantes", "Computador + Google Drive, OneDrive o iCloud + disco externo o USB segura.") +
      infoCard("✅", "Verificación", "Toma una foto de prueba o recupera un archivo pequeño para confirmar que la copia funciona.") +
      '</div>' +
      '<div class="accordion"><details><summary>Guía rápida: Android con Google Fotos</summary><ol><li>Abre Google Fotos.</li><li>Toca la foto de perfil.</li><li>Entra a configuración de Fotos.</li><li>Selecciona copia de seguridad.</li><li>Activa copia solo por WiFi si quieres ahorrar datos.</li><li>Verifica que aparezca copia completada.</li></ol></details><details><summary>Guía rápida: iPhone con iCloud</summary><ol><li>Ve a Ajustes.</li><li>Toca tu nombre.</li><li>Entra a iCloud.</li><li>Selecciona Fotos.</li><li>Activa Fotos en iCloud.</li><li>Revisa el espacio disponible y la sincronización.</li></ol></details></div>' +
      contentQuestion("backup") + nav(true, state.completed.content_backup, "Privacidad digital") + '</section>';
  }

  function privacy() {
    return '<section class="screen"><span class="tag">Privacidad digital · 5 puntos</span><h2>Lo que dejas sin querer</h2>' +
      '<p class="lead">Una foto, una publicación o una app con demasiados permisos puede revelar más de lo necesario.</p>' +
      '<div class="card-grid">' +
      infoCard("📍", "Geolocalización en fotos", "Las fotos pueden contener la ubicación exacta donde fueron tomadas. Revisa configuración antes de compartir.") +
      infoCard("🧭", "Historial de búsqueda", "El navegador y el celular guardan actividad. Revisa y limpia el historial periódicamente.") +
      infoCard("🎙", "Permisos excesivos", "Una app sencilla no debería necesitar micrófono, contactos, cámara y ubicación al mismo tiempo.") +
      infoCard("👪", "Información familiar", "Publicar colegio, barrio o rutina diaria entrega información valiosa a personas malintencionadas.") +
      infoCard("⏱", "Ubicación en tiempo real", "Compártela con conciencia, con personas confiables y por tiempo limitado.") +
      infoCard("🧹", "Cuentas abandonadas", "Elimina apps y cuentas que ya no usas. Una cuenta abandonada también puede ser tomada.") +
      '</div>' + contentQuestion("privacy") + nav(true, state.completed.content_privacy, "Diagnóstico") + '</section>';
  }

  function contentQuestion(key) {
    var item = contentQuestions[key];
    var selected = state.answers.content[key];
    var completedKey = "content_" + key;
    var score = getContentScore(key);
    var feedback = "";
    if (state.completed[completedKey]) {
      feedback = selected === item.correct
        ? '<p class="feedback correct">' + item.feedback + ' Puntaje: 5/5.</p>'
        : '<p class="feedback incorrect">Revisa la recomendación: ' + item.feedback + ' Puntaje: 0/5.</p>';
    }
    return '<fieldset class="question"><legend>' + item.title + '</legend>' +
      item.options.map(function (option, index) {
        return '<label class="option"><input type="radio" name="content-' + key + '" value="' + index + '"' +
          (String(selected) === String(index) ? " checked" : "") + '><span>' + option + '</span></label>';
      }).join("") + '</fieldset><button class="button button-primary" data-content-question="' + key + '" type="button">Confirmar mini pregunta</button>' + feedback;
  }

  function getContentScore(key) {
    if (!state.completed["content_" + key]) return 0;
    return Number(state.answers.content[key]) === contentQuestions[key].correct ? 5 : 0;
  }

  function submitContent(key) {
    var checked = app.querySelector('input[name="content-' + key + '"]:checked');
    if (!checked) return showInlineError("Selecciona una respuesta antes de continuar.");
    state.answers.content[key] = Number(checked.value);
    state.completed["content_" + key] = true;
    saveProgress();
    render();
  }

  function diagnosis() {
    var selected = state.answers.diagnosis || [];
    var result = state.completed.diagnosis ? getDiagnosisScore() : null;
    var feedback = result ? '<p class="feedback ' + feedbackClass(result.scorm, 25) + '">' + result.label + '. ' + result.text + ' Puntaje: ' + result.scorm + '/25.</p>' : "";
    var indexBase = 0;
    return '<section class="screen"><span class="tag">Actividad principal · 25 puntos</span><h2>Diagnóstico de mis dispositivos y red</h2>' +
      '<p>Marca los elementos que cumples actualmente. Sé honesto: este diagnóstico es para mejorar tus hábitos y no guarda datos privados.</p>' +
      '<div class="diagnosis-panel">' + diagnosisSections.map(function (section) {
        var start = indexBase;
        indexBase += section[1].length;
        return '<fieldset class="check-group"><legend>' + section[0] + '</legend>' + section[1].map(function (item, offset) {
          var idx = start + offset;
          return '<label class="option"><input type="checkbox" name="diagnosis" value="' + idx + '"' +
            (selected.indexOf(String(idx)) >= 0 ? " checked" : "") + '><span>' + item + '</span></label>';
        }).join("") + '</fieldset>';
      }).join("") + '</div><button id="submit-diagnosis" class="button button-primary" type="button">Calcular diagnóstico</button>' + feedback +
      nav(true, state.completed.diagnosis, "Mini reto práctico") + '</section>';
  }

  function submitDiagnosis() {
    var selected = Array.from(app.querySelectorAll('input[name="diagnosis"]:checked')).map(function (input) { return input.value; });
    state.answers.diagnosis = selected;
    state.completed.diagnosis = true;
    saveProgress();
    render();
  }

  function getDiagnosisScore() {
    var count = (state.answers.diagnosis || []).length;
    if (count >= 14) return { count: count, scorm: 25, label: "Excelente", text: "Mantén tus hábitos y revisa tu seguridad cada tres meses." };
    if (count >= 9) return { count: count, scorm: 18, label: "Bien, con oportunidades de mejora", text: "Elige dos acciones para mejorar esta semana." };
    if (count >= 5) return { count: count, scorm: 10, label: "Acción necesaria esta semana", text: "Prioriza bloqueo, actualizaciones y copias de seguridad." };
    return { count: count, scorm: 5, label: "Urgente, plan de acción hoy", text: "Empieza con tres acciones: bloquear celular, activar copia de seguridad y actualizar dispositivos." };
  }

  function practicalChallenge() {
    var selected = state.answers.challenge || [];
    var score = state.completed.challenge ? getChallengeScore() : 0;
    var feedback = state.completed.challenge
      ? '<p class="feedback ' + feedbackClass(score, 10) + '">Seleccionaste ' + selected.length + ' acciones. Puntaje: ' + score + '/10. Empieza por una acción concreta esta semana.</p>'
      : "";
    return '<section class="screen"><span class="tag">Mini reto práctico · 10 puntos</span><h2>Mi dispositivo seguro en 10 minutos</h2>' +
      '<p>Selecciona mínimo tres acciones que te comprometes a revisar esta semana. No tienes que asegurar todo en un solo día.</p>' +
      '<fieldset class="check-group"><legend>Acciones sugeridas</legend>' + challengeActions.map(function (item, index) {
        return '<label class="option"><input type="checkbox" name="challenge" value="' + index + '"' +
          (selected.indexOf(String(index)) >= 0 ? " checked" : "") + '><span>' + item + '</span></label>';
      }).join("") + '</fieldset><button id="submit-challenge" class="button button-primary" type="button">Guardar compromiso</button>' + feedback +
      nav(true, state.completed.challenge, "Evaluación final") + '</section>';
  }

  function submitChallenge() {
    var selected = Array.from(app.querySelectorAll('input[name="challenge"]:checked')).map(function (input) { return input.value; });
    state.answers.challenge = selected;
    state.completed.challenge = true;
    saveProgress();
    render();
  }

  function getChallengeScore() {
    var count = (state.answers.challenge || []).length;
    if (count >= 3) return 10;
    if (count >= 1) return 5;
    return 0;
  }

  function evaluation() {
    var answers = state.answers.quiz || {};
    var feedback = state.completed.quiz
      ? '<p class="feedback ' + feedbackClass(getQuizScore(), 25) + '">Obtuviste ' + getQuizScore() + '/25 en la evaluación.</p>'
      : "";
    return '<section class="screen"><span class="tag">Evaluación final · 25 puntos</span><h2>Comprueba lo aprendido</h2><p>Cada respuesta correcta vale 5 puntos.</p>' +
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
      return sum + (state.answers.quiz[index] === item.correct ? 5 : 0);
    }, 0);
  }

  function results() {
    var complete = allRequiredComplete();
    var diagnosisResult = state.completed.diagnosis ? getDiagnosisScore() : null;
    var recommendation = !complete
      ? "Completa el caso, las mini preguntas, el diagnóstico, el reto práctico y la evaluación."
      : state.score >= 90
        ? "Excelente. Mantén revisión trimestral de dispositivos, permisos, WiFi y copias."
        : state.score >= 70
          ? "Buen avance. Prioriza verificación de backups, actualizaciones y permisos esta semana."
          : "Acción urgente: bloquea dispositivos, actualiza sistemas, evita WiFi pública y activa copias verificadas.";
    return '<section class="screen results"><span class="tag">Resultados</span><h2>Tu resultado en la OVA 3</h2>' +
      '<div class="result-score" aria-label="Puntaje final">' + state.score + '<small>/100</small></div>' +
      '<h3>Estado: ' + statusLabel() + '</h3><p class="lead">' + recommendation + '</p>' +
      '<div class="card-grid">' +
      infoCard("📷", "Caso inicial", state.completed.case ? "Completado · " + getCaseScore() + "/20" : "Pendiente") +
      infoCard("🧩", "Mini preguntas", contentKeys.reduce(function (sum, key) { return sum + getContentScore(key); }, 0) + "/20") +
      infoCard("📋", "Diagnóstico", diagnosisResult ? diagnosisResult.label + " · " + diagnosisResult.count + "/16 ítems" : "Pendiente") +
      infoCard("✅", "Mini reto", state.completed.challenge ? (state.answers.challenge.length + " acciones seleccionadas") : "Pendiente") +
      infoCard("📝", "Evaluación", state.completed.quiz ? getQuizScore() + "/25" : "Pendiente") +
      '</div>' +
      '<div class="reading-block"><h3>Recomendaciones personalizadas</h3><ul><li>Activa bloqueo automático.</li><li>Mantén dispositivos actualizados.</li><li>No conectes USB desconocidas.</li><li>Evita puertos USB públicos.</li><li>Usa datos móviles para banca y pagos.</li><li>Activa copia automática por WiFi.</li><li>Verifica que puedas recuperar archivos.</li><li>Revisa permisos de aplicaciones.</li></ul></div>' +
      resourcesBlock() +
      '<div class="brand-strip"><img src="assets/logo-unicartagena-ctev.png" alt="Logo Universidad de Cartagena y CTEV"><span>Fin de contenidos · OVA 3</span></div>' +
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
      resourceLink("https://grow.google/certificates/cybersecurity/", "Google Cybersecurity Certificate", "Ruta para comprender riesgos, amenazas, vulnerabilidades y controles.") +
      resourceLink("https://www.coursera.org/learn/assets-threats-and-vulnerabilities", "Assets, Threats, and Vulnerabilities", "Curso de Google/Coursera sobre protección de activos y controles.") +
      resourceLink("https://support.google.com/photos/answer/6193313?hl=es", "Google Photos · Copia de seguridad", "Guía para activar respaldo automático de fotos y videos.") +
      resourceLink("https://myaccount.google.com/security-checkup", "Google Security Checkup", "Revisión de cuenta, dispositivos conectados y eventos recientes.") +
      resourceLink("https://www.cisa.gov/secure-our-world", "CISA Secure Our World", "Hábitos para actualizar software, usar MFA y proteger cuentas.") +
      resourceLink("https://www.cisa.gov/news-events/news/protecting-data-stored-your-devices", "CISA · Datos en dispositivos", "Material sobre malware, copias de seguridad y cifrado.") +
      resourceLink("https://www.incibe.es/ciudadania/blog/protege-tu-router-y-wifi-de-intrusos", "INCIBE · WiFi seguro", "Recurso en español para proteger router y red WiFi.") +
      resourceLink("https://www.apple.com/privacy/", "Apple Privacy", "Privacidad, ubicación y protección de datos en iPhone, iPad y Mac.") +
      resourceLink("https://caivirtual.policia.gov.co/", "CAI Virtual · Policía Nacional", "Orientación colombiana para incidentes y delitos informáticos.") +
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
