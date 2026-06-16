(function () {
  "use strict";

  var totalScreens = 13;
  var app = document.getElementById("app");

  var sections = [
    {
      key: "accounts",
      title: "A. Cuentas y contraseñas",
      shortTitle: "Cuentas",
      max: 30,
      intro: "Evalúa si tus accesos principales están protegidos. No escribas contraseñas reales en esta OVA.",
      image: "assets/escudo-llave.png",
      items: [
        { id: "long_password", points: 8, text: "Mi correo principal y mis cuentas críticas usan contraseñas de más de 12 caracteres con símbolos o frases largas.", action: "Cambia primero la contraseña del correo principal por una frase larga, única y difícil de adivinar." },
        { id: "unique_passwords", points: 7, text: "Uso contraseñas diferentes para correo, banco, redes sociales, nube y plataformas académicas o laborales.", action: "Elimina contraseñas repetidas empezando por correo, banco, nube y redes sociales." },
        { id: "mfa_critical", points: 10, text: "Tengo MFA o doble factor activo, como mínimo, en Gmail/correo principal, banco y red social principal.", action: "Activa MFA en correo, banco y red social principal. Prioriza passkeys, app autenticadora o llave de seguridad cuando estén disponibles." },
        { id: "no_sharing", points: 5, text: "No comparto contraseñas, códigos SMS, tokens ni claves dinámicas por chat, llamada o correo.", action: "Define una regla personal: ningún código de verificación se dicta ni se reenvía, incluso si el mensaje parece urgente." }
      ]
    },
    {
      key: "devices",
      title: "B. Dispositivos y redes",
      shortTitle: "Dispositivos",
      max: 25,
      intro: "Revisa la protección básica de teléfono, computador, WiFi y navegación en redes públicas.",
      image: "assets/celular-alerta-real.png",
      items: [
        { id: "phone_lock", points: 7, text: "Mi celular se bloquea automáticamente en un minuto o menos y usa PIN, biometría o patrón seguro.", action: "Activa bloqueo automático corto y evita dejar el teléfono desbloqueado en espacios compartidos." },
        { id: "computer_protection", points: 6, text: "Mi computador tiene antivirus o protección del sistema activa y actualizada.", action: "Verifica que la protección del sistema esté activa y que las actualizaciones automáticas estén funcionando." },
        { id: "public_wifi", points: 6, text: "No entro al banco ni realizo pagos desde WiFi pública sin una protección confiable como VPN.", action: "Evita operaciones financieras en redes abiertas. Usa datos móviles o una red confiable." },
        { id: "router_password", points: 6, text: "Cambié la contraseña predeterminada del router o WiFi de mi casa/oficina.", action: "Cambia la clave del WiFi y la contraseña de administración del router si aún son las de fábrica." }
      ]
    },
    {
      key: "backups",
      title: "C. Copias de seguridad",
      shortTitle: "Backups",
      max: 20,
      intro: "Confirma si podrías recuperar fotos, documentos y evidencia importante si pierdes un equipo.",
      image: "assets/globo-digital.png",
      items: [
        { id: "photos_cloud", points: 10, text: "Las fotos importantes de mi celular se sincronizan automáticamente con una nube confiable.", action: "Activa copia automática de fotos y confirma que puedas entrar a esa nube desde otro dispositivo." },
        { id: "docs_cloud", points: 10, text: "Mis documentos importantes tienen copia de seguridad en nube, disco externo o repositorio institucional.", action: "Crea una carpeta de respaldo para documentos personales, académicos o laborales críticos." }
      ]
    },
    {
      key: "fraud",
      title: "D. Detección de fraudes",
      shortTitle: "Fraudes",
      max: 25,
      intro: "Mide tu preparación para reconocer mensajes sospechosos y responder sin pánico.",
      image: "assets/phishing-correo.png",
      items: [
        { id: "warning_signs", points: 8, text: "Puedo identificar al menos tres señales de phishing: urgencia, enlace extraño, solicitud de código, adjunto inesperado, premio o amenaza.", action: "Practica identificar señales en mensajes reales sin hacer clic: remitente, dominio, tono, solicitud y consecuencia." },
        { id: "stop_protocol", points: 10, text: "Sé aplicar el protocolo STOP: parar, desconectar o bloquear, cambiar accesos, reportar y documentar.", action: "Escribe el protocolo STOP en una nota visible para usarlo si caes o sospechas un fraude." },
        { id: "lab_completed", points: 7, text: "Completé el laboratorio de mensajes sospechosos y sé verificar por canales oficiales.", action: "Repite ejercicios de phishing y comparte una señal de alerta con alguien de tu familia o equipo." }
      ]
    }
  ];

  var resources = [
    ["https://grow.google/certificates/cybersecurity/", "Google Cybersecurity Certificate", "Ruta de profundización desde fundamentos hasta herramientas prácticas."],
    ["https://myaccount.google.com/security-checkup", "Google Security Checkup", "Revisión práctica de recuperación de cuenta, actividad sospechosa y protecciones."],
    ["https://passwords.google.com/", "Google Password Manager", "Gestión y revisión de contraseñas guardadas."],
    ["https://support.google.com/accounts/answer/13548313?hl=es", "Google Passkeys", "Referencia para iniciar sesión con passkeys y reducir riesgo de phishing."],
    ["https://www.nist.gov/cyberframework", "NIST Cybersecurity Framework 2.0", "Marco para organizar funciones de seguridad: govern, identify, protect, detect, respond y recover."],
    ["https://haveibeenpwned.com/", "Have I Been Pwned", "Consulta si un correo aparece en filtraciones públicas de datos."],
    ["https://bitwarden.com/", "Bitwarden", "Gestor de contraseñas que puede apoyar el uso de claves únicas."],
    ["https://2fa.directory/us/", "2FA Directory", "Directorio para revisar qué servicios soportan doble factor."],
    ["https://phishingquiz.withgoogle.com/", "Google Phishing Quiz", "Práctica opcional para reconocer phishing."],
    ["https://caivirtual.policia.gov.co/", "Centro Cibernético Policial / CAI Virtual", "Canal colombiano de orientación, prevención y denuncia de delitos informáticos."]
  ];

  var defaultState = {
    screen: 0,
    score: 0,
    profile: { alias: "", context: "", diagnosticDate: todayIso() },
    selected: { accounts: [], devices: [], backups: [], fraud: [] },
    commitments: ["", "", ""],
    dueDate: "",
    completed: {},
    finalStatus: "incomplete",
    finished: false,
    downloaded: false
  };
  var state = cloneDefault();

  function cloneDefault() { return JSON.parse(JSON.stringify(defaultState)); }

  function todayIso() {
    var now = new Date();
    var month = String(now.getMonth() + 1).padStart(2, "0");
    var day = String(now.getDate()).padStart(2, "0");
    return now.getFullYear() + "-" + month + "-" + day;
  }

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
    state.profile = Object.assign({ alias: "", context: "", diagnosticDate: todayIso() }, state.profile || {});
    state.selected = Object.assign({ accounts: [], devices: [], backups: [], fraud: [] }, state.selected || {});
    state.commitments = Array.isArray(state.commitments) ? state.commitments.slice(0, 3) : ["", "", ""];
    while (state.commitments.length < 3) state.commitments.push("");
    state.dueDate = state.dueDate || "";
    state.completed = state.completed || {};
    state.finalStatus = state.finalStatus || "incomplete";
    state.downloaded = Boolean(state.downloaded);
    state.finished = Boolean(state.finished);
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
    state.score = sections.reduce(function (total, section) {
      return total + sectionScore(section.key);
    }, 0);
    state.score = Math.max(0, Math.min(100, state.score));
    return state.score;
  }

  function sectionScore(key) {
    var section = findSection(key);
    if (!section) return 0;
    var selected = state.selected[key] || [];
    return section.items.reduce(function (sum, item) {
      return sum + (selected.indexOf(item.id) >= 0 ? item.points : 0);
    }, 0);
  }

  function findSection(key) {
    return sections.find(function (section) { return section.key === key; });
  }

  function saveProgress() {
    calculateScore();
    Scorm.setScore(state.score);
    Scorm.setLocation(state.screen);
    Scorm.saveSuspendData({
      screen: state.screen,
      score: state.score,
      checkedAnswers: state.selected,
      selected: state.selected,
      profile: state.profile,
      commitments: state.commitments,
      implementationDate: state.dueDate,
      dueDate: state.dueDate,
      completed: state.completed,
      finalStatus: state.finalStatus,
      finished: state.finished,
      downloaded: state.downloaded
    });
    Scorm.commit();
  }

  function allSectionsComplete() {
    return sections.every(function (section) { return Boolean(state.completed[section.key]); });
  }

  function commitmentCount() {
    return state.commitments.filter(function (item) { return item.trim().length > 0; }).length;
  }

  function commitmentsValid() {
    return commitmentCount() >= 2 && Boolean(state.dueDate) && state.dueDate >= todayIso();
  }

  function allRequiredComplete() {
    return allSectionsComplete() && commitmentsValid();
  }

  function statusLabel() {
    if (!allRequiredComplete()) return "En proceso";
    return state.score >= 70 ? "Aprobado" : "Completado con recomendaciones";
  }

  function levelInfo(score) {
    if (score >= 90) {
      return {
        title: "Excelente",
        cls: "level-excellent",
        text: "Tu base de ciberhigiene es sólida. El siguiente paso es mantenerla con revisión trimestral, actualización de contraseñas filtradas y conversación preventiva con tu entorno.",
        actions: ["Revisar el plan cada tres meses.", "Confirmar que MFA siga activo en cuentas críticas.", "Probar recuperación de cuenta y copias de seguridad.", "Compartir buenas prácticas con familia o equipo."]
      };
    }
    if (score >= 60) {
      return {
        title: "Bien con oportunidades",
        cls: "level-good",
        text: "Tienes avances importantes, pero algunas brechas podrían afectar tus cuentas, dispositivos o datos. Conviene priorizar acciones de alto impacto esta semana.",
        actions: ["Activar MFA donde falte.", "Eliminar contraseñas repetidas.", "Revisar privacidad de redes sociales.", "Confirmar copias de fotos y documentos.", "Repasar señales de phishing."]
      };
    }
    return {
      title: "Plan urgente",
      cls: "level-urgent",
      text: "Tu diagnóstico muestra riesgos que deben atenderse pronto. La prioridad es proteger correo principal, dinero, dispositivos y recuperación de información.",
      actions: ["Proteger el correo principal hoy.", "Activar MFA en correo y banco.", "Cambiar contraseñas repetidas.", "Activar bloqueo del celular.", "Crear copia de seguridad básica.", "Evitar WiFi pública para banca."]
    };
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
      instructions,
      profile,
      function () { return sectionScreen("accounts"); },
      function () { return sectionScreen("devices"); },
      function () { return sectionScreen("backups"); },
      function () { return sectionScreen("fraud"); },
      automaticResult,
      commitments,
      helpMaterial,
      planSummary,
      exportPlan,
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
        autoCollectCurrentScreen();
        state.screen = Math.max(0, Math.min(totalScreens - 1, state.screen + Number(button.dataset.nav)));
        saveProgress();
        render();
      });
    });

    var profileButton = document.getElementById("save-profile");
    if (profileButton) profileButton.addEventListener("click", function () {
      collectProfile();
      state.completed.profile = true;
      saveProgress();
      render();
    });

    var sectionButton = document.getElementById("save-section");
    if (sectionButton) sectionButton.addEventListener("click", function () {
      saveSection(sectionButton.dataset.section);
      saveProgress();
      render();
    });

    var commitmentsButton = document.getElementById("save-commitments");
    if (commitmentsButton) commitmentsButton.addEventListener("click", saveCommitments);

    var downloadButton = document.getElementById("download-plan");
    if (downloadButton) downloadButton.addEventListener("click", downloadPlan);

    var finishButton = document.getElementById("finish-ova");
    if (finishButton) finishButton.addEventListener("click", finishOva);
  }

  function autoCollectCurrentScreen() {
    if (state.screen === 2) collectProfile();
    if (state.screen >= 3 && state.screen <= 6) {
      var section = sections[state.screen - 3];
      if (state.completed[section.key]) saveSection(section.key);
    }
    if (state.screen === 8) collectCommitments();
  }

  function welcome() {
    return '<section class="screen hero">' +
      '<span class="tag">OVA 5 · Producto final · 100 puntos</span>' +
      '<h2>Plan Personal de Ciberhigiene</h2>' +
      '<p class="subtitle">Lista de Verificación de Cuentas, Dispositivos y Hábitos Digitales</p>' +
      '<p class="lead">Esta OVA integra lo aprendido en toda la ruta: vida digital, cuentas, contraseñas, MFA, dispositivos, WiFi, nube, copias de seguridad, phishing y respuesta ante fraude.</p>' +
      '<div class="notice plan"><strong>Mensaje central:</strong> un plan honesto vale más que uno perfecto. Evalúa tu situación real y traza acciones concretas.</div>' +
      '<div class="brand-strip"><img src="assets/logo-unicartagena-ctev.png" alt="Logo Universidad de Cartagena y CTEV"><span>Producto final · Ruta de ciberhigiene personal</span></div>' +
      '<div class="identity-route" aria-label="Ruta de cinco OVAs">' +
      '<div class="identity-item" style="--identity:#087da5"><strong>OVA 1</strong>Fundamentos</div>' +
      '<div class="identity-item" style="--identity:#155ca2"><strong>OVA 2</strong>Cuentas</div>' +
      '<div class="identity-item" style="--identity:#18794e"><strong>OVA 3</strong>Dispositivos</div>' +
      '<div class="identity-item" style="--identity:#b45309"><strong>OVA 4</strong>Fraudes</div>' +
      '<div class="identity-item current" style="--identity:#6941c6"><strong>OVA 5</strong>Plan personal</div></div>' +
      nav(false, true, "Iniciar mi plan") + '</section>';
  }

  function instructions() {
    return '<section class="screen"><span class="tag">Instrucciones</span><h2>Cómo construir tu plan</h2>' +
      '<p class="lead">Marca únicamente las prácticas que ya realizas de forma real. El valor de esta OVA está en identificar brechas y convertirlas en compromisos claros.</p>' +
      '<div class="card-grid">' +
      infoCard("1", "Diagnóstico honesto", "Completarás cuatro secciones: cuentas, dispositivos, copias de seguridad y detección de fraudes.") +
      infoCard("2", "Puntaje automático", "Cada práctica suma puntos. El resultado se interpreta como Excelente, Bien con oportunidades o Plan urgente.") +
      infoCard("3", "Compromisos", "Escribirás tres acciones concretas. Para finalizar, al menos dos deben estar diligenciadas y tener una fecha futura o de hoy.") +
      infoCard("4", "Privacidad", "No escribas contraseñas, códigos, números de cuenta, documentos de identidad ni información sensible.") +
      '</div>' +
      '<div class="visual-lesson"><div><h3>Producto esperado</h3><p>Al finalizar tendrás un plan descargable en HTML con diagnóstico, puntaje, nivel, recomendaciones y compromisos. La descarga es opcional; el paquete SCORM puede funcionar sin internet.</p><div class="notice success"><strong>Condición SCORM:</strong> con 70 puntos o más se reporta <em>passed</em>. Con menos de 70, pero con actividades completas, se reporta <em>completed</em>.</div></div><img class="lesson-image" src="assets/candado-digital.png" alt="Ilustración de seguridad digital"></div>' +
      nav(true, true, "Datos opcionales") + '</section>';
  }

  function profile() {
    return '<section class="screen"><span class="tag">Datos generales opcionales</span><h2>Identifica tu plan sin exponer datos sensibles</h2>' +
      '<p class="lead">Puedes usar un alias o dejar los campos en blanco. Esta información solo sirve para personalizar tu plan descargable.</p>' +
      '<div class="form-grid">' +
      '<label class="field">Alias o nombre corto<input id="alias" maxlength="60" value="' + escapeHtml(state.profile.alias) + '" placeholder="Ejemplo: Estudiante 01"></label>' +
      '<label class="field">Contexto de uso<select id="context"><option value="">Selecciona una opción...</option>' +
      option("personal", "Personal", state.profile.context) +
      option("academico", "Académico", state.profile.context) +
      option("laboral", "Laboral", state.profile.context) +
      option("mixto", "Mixto", state.profile.context) +
      '</select></label>' +
      '<label class="field">Fecha del diagnóstico<input id="diagnostic-date" type="date" value="' + escapeHtml(state.profile.diagnosticDate || todayIso()) + '"><span class="small-note">Puedes usar la fecha de hoy o la fecha en que realizas la revisión.</span></label>' +
      '</div>' +
      '<button id="save-profile" class="button button-secondary" type="button">Guardar datos opcionales</button>' +
      '<div class="notice alert"><strong>Recuerda:</strong> esta OVA nunca solicita contraseñas reales, códigos de verificación, números de tarjeta ni datos bancarios.</div>' +
      nav(true, true, "Sección A: Cuentas") + '</section>';
  }

  function sectionScreen(key) {
    var section = findSection(key);
    var selected = state.selected[key] || [];
    var score = sectionScore(key);
    var completed = Boolean(state.completed[key]);
    var feedback = completed
      ? '<p class="feedback ' + feedbackClass(score, section.max) + '">Sección guardada. Puntaje: ' + score + '/' + section.max + '. ' + sectionAdvice(section) + '</p>'
      : '<p class="muted">Marca lo que ya haces hoy. Si algo aún no lo haces, déjalo sin marcar y conviértelo luego en compromiso.</p>';

    return '<section class="screen"><span class="tag">Diagnóstico · ' + section.max + ' puntos</span>' +
      '<div class="section-head"><div><h2>' + section.title + '</h2><p class="lead">' + section.intro + '</p></div><span class="section-max">' + score + '/' + section.max + '</span></div>' +
      '<div class="visual-lesson"><div>' +
      '<div class="checklist">' + section.items.map(function (item) {
        return '<label class="check-item"><input type="checkbox" name="section-item" value="' + item.id + '"' + (selected.indexOf(item.id) >= 0 ? " checked" : "") + '><span>' + item.text + '</span><span class="points-badge">+' + item.points + '</span></label>';
      }).join("") + '</div>' +
      '<button id="save-section" class="button button-primary" type="button" data-section="' + section.key + '">Guardar sección</button>' + feedback +
      '</div><img class="lesson-image" src="' + section.image + '" alt="Ilustración de ' + section.shortTitle.toLowerCase() + '"></div>' +
      nav(true, completed, nextSectionLabel(key)) + '</section>';
  }

  function nextSectionLabel(key) {
    if (key === "accounts") return "Sección B: Dispositivos";
    if (key === "devices") return "Sección C: Copias";
    if (key === "backups") return "Sección D: Fraudes";
    return "Ver resultado automático";
  }

  function automaticResult() {
    var level = levelInfo(state.score);
    var complete = allSectionsComplete();
    return '<section class="screen"><span class="tag">Resultado automático</span><h2>Tu diagnóstico de ciberhigiene</h2>' +
      '<p class="lead">Este resultado no busca juzgarte. Sirve para ordenar prioridades y construir un plan realista.</p>' +
      '<div class="score-panel"><div class="score-gauge" style="--score:' + state.score + '%">' + state.score + '<small>/100</small></div>' +
      '<div class="level-card ' + level.cls + '"><h3>Nivel: ' + level.title + '</h3><p>' + level.text + '</p></div></div>' +
      '<div class="metric-grid">' + sections.map(function (section) {
        var score = sectionScore(section.key);
        var percent = Math.round((score / section.max) * 100);
        return '<article class="metric"><strong>' + score + '/' + section.max + '</strong><span>' + section.shortTitle + '</span><div class="mini-bar"><span style="--value:' + percent + '%"></span></div></article>';
      }).join("") + '</div>' +
      (complete ? '<div class="notice success"><strong>Diagnóstico completo:</strong> ya puedes pasar a tus compromisos.</div>' : '<div class="notice alert"><strong>Falta diagnóstico:</strong> guarda las cuatro secciones para continuar.</div>') +
      '<div class="reading-block"><h3>Recomendaciones inmediatas según tu nivel</h3><ul>' + level.actions.map(function (action) { return '<li>' + action + '</li>'; }).join("") + '</ul></div>' +
      nav(true, complete, "Mis tres compromisos") + '</section>';
  }

  function commitments() {
    var valid = commitmentsValid();
    return '<section class="screen"><span class="tag">Compromisos personales</span><h2>Mis tres compromisos de ciberhigiene</h2>' +
      '<p class="lead">Escribe acciones concretas, observables y con fecha. Debes diligenciar al menos dos compromisos para finalizar la OVA.</p>' +
      '<div class="commitment-grid">' +
      commitmentField(0, "Compromiso 1") +
      commitmentField(1, "Compromiso 2") +
      commitmentField(2, "Compromiso 3") +
      '<label class="field">Fecha de implementación<input id="due-date" type="date" min="' + todayIso() + '" value="' + escapeHtml(state.dueDate) + '"><span class="small-note">Debe ser hoy o una fecha futura.</span></label>' +
      '</div>' +
      '<button id="save-commitments" class="button button-primary" type="button">Guardar compromisos</button>' +
      (valid ? '<p class="feedback correct">Compromisos válidos: ' + commitmentCount() + '/3. Fecha de implementación: ' + escapeHtml(state.dueDate) + '.</p>' : '<p class="feedback partial">Pendiente: escribe al menos dos compromisos y selecciona una fecha válida.</p>') +
      '<div class="reading-block"><h3>Ejemplos bien escritos</h3><ul><li>Activaré doble factor en mi correo principal antes del viernes.</li><li>Cambiaré las contraseñas repetidas de banco y redes sociales esta semana.</li><li>Configuraré copia automática de fotos y documentos importantes antes del fin de mes.</li></ul></div>' +
      nav(true, valid, "Material de ayuda") + '</section>';
  }

  function helpMaterial() {
    return '<section class="screen"><span class="tag">Aprende más · opcional</span><h2>Convierte tu diagnóstico en hábitos</h2>' +
      '<p class="subtitle">La ciberhigiene no es una tarea de un solo día. Es una rutina de protección continua.</p>' +
      '<p class="lead">Esta sección amplía el plan final. No suma ni resta puntos, pero te ayuda a tomar mejores decisiones durante las próximas semanas.</p>' +
      '<div class="accordion">' +
      detailsBlock("Qué es ciberhigiene", ["Usar contraseñas únicas y largas.", "Activar MFA en cuentas críticas.", "No compartir códigos de verificación.", "Mantener equipos actualizados.", "Revisar permisos de aplicaciones.", "Hacer copias de seguridad.", "Verificar enlaces y remitentes.", "Reportar mensajes sospechosos.", "Cuidar la privacidad y hablar con la familia sobre riesgos."]) +
      detailsBlock("Cómo interpretar el puntaje", ["90 a 100: excelente. Mantén revisión trimestral, verifica MFA y comparte buenas prácticas.", "60 a 89: bien con oportunidades. Prioriza MFA, contraseñas únicas, privacidad social, copias y router.", "Menos de 60: plan urgente. Protege correo principal, banco, celular, copias y respuesta ante phishing."]) +
      detailsBlock("Errores comunes al hacer planes", ["Escribir metas vagas como ser más cuidadoso.", "Intentar resolver todo en un día.", "No poner fecha.", "No proteger primero el correo principal.", "Olvidar copias de seguridad.", "No hablar con quienes comparten dispositivos o cuentas."]) +
      detailsBlock("Glosario rápido", ["Ciberhigiene: hábitos cotidianos para reducir riesgos digitales.", "MFA: doble o múltiple factor de autenticación.", "Passkey: método de acceso resistente a phishing en servicios compatibles.", "Backup: copia de seguridad recuperable.", "Phishing: engaño digital para robar datos o inducir acciones riesgosas.", "Gestor de contraseñas: herramienta para guardar claves únicas y fuertes."]) +
      '</div>' +
      '<div class="timeline">' +
      timelineItem("24 horas", "Activa MFA en correo principal, cambia contraseñas repetidas, bloquea el celular, confirma backup de fotos y revisa sesiones abiertas.") +
      timelineItem("Semanal", "Actualiza equipos, revisa mensajes sospechosos, elimina apps innecesarias y confirma que las copias sigan funcionando.") +
      timelineItem("Mensual", "Revisa privacidad en redes, contraseñas guardadas, dispositivos conectados, permisos de aplicaciones y cuentas críticas.") +
      timelineItem("3 meses", "Cambia contraseñas filtradas, prueba recuperación de cuentas, valida MFA, revisa router y actualiza tu plan.") +
      '</div>' +
      '<div class="reading-block"><h3>Prioridades por riesgo</h3><div class="risk-ladder">' +
      riskStep("Primero protege el acceso a todo: correo principal, cuenta Google/Apple, Microsoft y WhatsApp.") +
      riskStep("Después protege el dinero: banco, billeteras digitales, apps de pago y compras.") +
      riskStep("Luego protege la reputación: redes sociales, cuentas institucionales, académicas y laborales.") +
      riskStep("Asegura la recuperación: copias de documentos, fotos, evidencias y nube.") +
      riskStep("Cierra con hábitos familiares: enseñar señales de fraude y reglas sobre códigos.") +
      '</div></div>' +
      resourcesBlock() +
      nav(true, true, "Resumen final del plan") + '</section>';
  }

  function planSummary() {
    var level = levelInfo(state.score);
    return '<section class="screen"><span class="tag">Resumen final</span><h2>Tu plan personal de ciberhigiene</h2>' +
      '<p class="lead">Revisa el plan antes de finalizar. Puedes regresar y ajustar el diagnóstico o los compromisos.</p>' +
      '<div class="export-preview">' +
      '<p><strong>Alias:</strong> ' + escapeHtml(state.profile.alias || "No indicado") + '</p>' +
      '<p><strong>Contexto:</strong> ' + escapeHtml(contextLabel(state.profile.context) || "No indicado") + ' · <strong>Fecha:</strong> ' + escapeHtml(state.profile.diagnosticDate || todayIso()) + '</p>' +
      '<p><strong>Puntaje:</strong> ' + state.score + '/100 · <strong>Nivel:</strong> ' + level.title + ' · <strong>Estado:</strong> ' + statusLabel() + '</p>' +
      '</div>' +
      '<div class="summary-list">' + sections.map(sectionSummary).join("") + '</div>' +
      '<div class="reading-block"><h3>Compromisos registrados</h3>' + listItems(state.commitments.filter(function (item) { return item.trim(); })) + '<p><strong>Fecha de implementación:</strong> ' + escapeHtml(state.dueDate || "Pendiente") + '</p></div>' +
      '<div class="notice plan"><strong>Nota de privacidad:</strong> este resumen no debe incluir contraseñas, códigos ni datos bancarios. Si agregaste información sensible por error, vuelve y edítala.</div>' +
      nav(true, allRequiredComplete(), "Exportar o descargar plan") + '</section>';
  }

  function exportPlan() {
    return '<section class="screen"><span class="tag">Exportar plan</span><h2>Descargar mi plan en HTML</h2>' +
      '<p class="lead">La descarga genera un archivo local llamado <strong>plan-personal-ciberhigiene.html</strong>. Es opcional: puedes finalizar la OVA aunque no descargues el archivo.</p>' +
      '<div class="visual-lesson"><div>' +
      '<div class="notice success"><strong>Incluye:</strong> título, fecha, alias si existe, puntaje, nivel, secciones, compromisos, recomendaciones y nota de privacidad.</div>' +
      '<button id="download-plan" class="button button-primary" type="button">Descargar mi plan en HTML</button>' +
      (state.downloaded ? '<p class="feedback correct">El plan fue generado en este intento. Puedes descargarlo nuevamente si hiciste cambios.</p>' : '<p class="muted">El archivo se genera en tu navegador mediante Blob. No se envía a ningún servidor.</p>') +
      '</div><img class="lesson-image" src="assets/escudo-candado.png" alt="Ilustración de plan protegido"></div>' +
      nav(true, allRequiredComplete(), "Finalización SCORM") + '</section>';
  }

  function finalization() {
    var complete = allRequiredComplete();
    return '<section class="screen"><span class="tag">Finalización SCORM</span><h2>Registrar el producto final en Moodle</h2>' +
      '<p class="lead">Al finalizar, se enviará el puntaje, la ubicación, el estado de finalización y el progreso guardado al LMS.</p>' +
      '<div class="score-panel"><div class="score-gauge" style="--score:' + state.score + '%">' + state.score + '<small>/100</small></div>' +
      '<div class="level-card ' + levelInfo(state.score).cls + '"><h3>Estado actual: ' + statusLabel() + '</h3><p>' + finalMessage() + '</p></div></div>' +
      (complete ? '<button id="finish-ova" class="button button-primary" type="button">' + (state.finished ? "OVA finalizada" : "Finalizar OVA") + '</button>' : '<p class="feedback incorrect">Aún faltan secciones guardadas o compromisos válidos. Completa el plan antes de registrar el intento.</p>') +
      (state.finished ? '<p class="feedback correct">Tu avance fue registrado. Puedes cerrar esta ventana.</p>' : "") +
      '<div class="brand-strip"><img src="assets/logo-unicartagena-ctev.png" alt="Logo Universidad de Cartagena y CTEV"><span>Cierre de ruta · Producto final OVA 5</span></div>' +
      nav(true, false) + '</section>';
  }

  function collectProfile() {
    var alias = document.getElementById("alias");
    var context = document.getElementById("context");
    var date = document.getElementById("diagnostic-date");
    if (alias) state.profile.alias = alias.value.trim();
    if (context) state.profile.context = context.value;
    if (date) state.profile.diagnosticDate = date.value || todayIso();
  }

  function saveSection(key) {
    state.selected[key] = Array.from(app.querySelectorAll('input[name="section-item"]:checked')).map(function (input) { return input.value; });
    state.completed[key] = true;
  }

  function collectCommitments() {
    for (var i = 0; i < 3; i += 1) {
      var input = document.getElementById("commitment-" + i);
      if (input) state.commitments[i] = input.value.trim();
    }
    var due = document.getElementById("due-date");
    if (due) state.dueDate = due.value;
  }

  function saveCommitments() {
    collectCommitments();
    if (commitmentCount() < 2) return showInlineError("Escribe al menos dos compromisos concretos antes de continuar.");
    if (!state.dueDate || state.dueDate < todayIso()) return showInlineError("Selecciona una fecha de implementación igual o posterior a hoy.");
    state.completed.commitments = true;
    saveProgress();
    render();
  }

  function downloadPlan() {
    if (!allRequiredComplete()) return showInlineError("Completa el diagnóstico y los compromisos antes de descargar el plan.");
    var html = buildExportHtml();
    var blob = new Blob(["\ufeff", html], { type: "text/html;charset=utf-8" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "plan-personal-ciberhigiene.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
    state.downloaded = true;
    saveProgress();
    render();
  }

  function finishOva() {
    if (!allRequiredComplete()) return showInlineError("Completa todas las secciones y al menos dos compromisos antes de finalizar.");
    calculateScore();
    state.finalStatus = state.score >= 70 ? "passed" : "completed";
    state.finished = true;
    Scorm.setScore(state.score);
    Scorm.setStatus(state.finalStatus);
    Scorm.setLocation(state.screen);
    Scorm.saveSuspendData({
      screen: state.screen,
      score: state.score,
      checkedAnswers: state.selected,
      selected: state.selected,
      profile: state.profile,
      commitments: state.commitments,
      implementationDate: state.dueDate,
      dueDate: state.dueDate,
      completed: state.completed,
      finalStatus: state.finalStatus,
      finished: true,
      downloaded: state.downloaded
    });
    Scorm.commit();
    Scorm.finish();
    render();
  }

  function buildExportHtml() {
    var level = levelInfo(state.score);
    var commitments = state.commitments.filter(function (item) { return item.trim(); });
    var generated = new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
    return '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Plan personal de ciberhigiene</title>' +
      '<style>body{font-family:Arial,sans-serif;line-height:1.55;color:#17202a;margin:2rem;background:#f7f9fc}main{max-width:920px;margin:auto;background:#fff;padding:2rem;border-radius:16px;border:1px solid #dce4ed}h1,h2{color:#12345b}.tag{display:inline-block;padding:.25rem .6rem;background:#f1e9ff;color:#3b1f75;border-radius:999px;font-weight:700}.box{padding:1rem;border-left:5px solid #6941c6;background:#f1e9ff;border-radius:8px;margin:1rem 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}.card{border:1px solid #dce4ed;border-radius:12px;padding:1rem;background:#fbfcff}.privacy{border-left-color:#b45309;background:#fff2df}li{margin:.35rem 0}</style></head><body><main>' +
      '<span class="tag">Producto final OVA 5</span><h1>Plan Personal de Ciberhigiene</h1>' +
      '<p><strong>Generado:</strong> ' + escapeHtml(generated) + '</p>' +
      '<p><strong>Alias:</strong> ' + escapeHtml(state.profile.alias || "No indicado") + '</p>' +
      '<p><strong>Contexto:</strong> ' + escapeHtml(contextLabel(state.profile.context) || "No indicado") + ' · <strong>Fecha del diagnóstico:</strong> ' + escapeHtml(state.profile.diagnosticDate || todayIso()) + '</p>' +
      '<div class="box"><h2>Resultado</h2><p><strong>Puntaje:</strong> ' + state.score + '/100</p><p><strong>Nivel:</strong> ' + level.title + '</p><p>' + escapeHtml(level.text) + '</p></div>' +
      '<h2>Diagnóstico por secciones</h2><div class="grid">' + sections.map(exportSection).join("") + '</div>' +
      '<h2>Compromisos</h2>' + listItems(commitments.map(escapeHtml)) +
      '<p><strong>Fecha de implementación:</strong> ' + escapeHtml(state.dueDate) + '</p>' +
      '<h2>Recomendaciones principales</h2>' + listItems(level.actions.map(escapeHtml)) +
      '<div class="box privacy"><h2>Nota de privacidad</h2><p>Este archivo no debe contener contraseñas, códigos de verificación, datos bancarios, documentos de identidad ni información sensible. Si detectas información sensible, elimínala antes de compartirlo.</p></div>' +
      '</main></body></html>';
  }

  function exportSection(section) {
    var selected = state.selected[section.key] || [];
    var selectedItems = section.items.filter(function (item) { return selected.indexOf(item.id) >= 0; });
    var pendingItems = section.items.filter(function (item) { return selected.indexOf(item.id) < 0; });
    return '<article class="card"><h2>' + escapeHtml(section.shortTitle) + '</h2><p><strong>Puntaje:</strong> ' + sectionScore(section.key) + '/' + section.max + '</p>' +
      '<h3>Fortalezas marcadas</h3>' + listItems((selectedItems.length ? selectedItems.map(function (item) { return escapeHtml(item.text); }) : ["Sin fortalezas marcadas en esta sección."])) +
      '<h3>Acciones sugeridas</h3>' + listItems((pendingItems.length ? pendingItems.map(function (item) { return escapeHtml(item.action); }) : ["Mantener y revisar esta sección cada tres meses."])) +
      '</article>';
  }

  function sectionSummary(section) {
    var selected = state.selected[section.key] || [];
    var pending = section.items.filter(function (item) { return selected.indexOf(item.id) < 0; });
    return '<article class="summary-item"><h3>' + section.title + ' · ' + sectionScore(section.key) + '/' + section.max + '</h3>' +
      '<p><strong>Fortalezas:</strong> ' + selected.length + ' de ' + section.items.length + ' prácticas marcadas.</p>' +
      '<p><strong>Prioridad sugerida:</strong> ' + (pending[0] ? pending[0].action : "Mantener esta práctica y revisarla trimestralmente.") + '</p></article>';
  }

  function sectionAdvice(section) {
    var score = sectionScore(section.key);
    if (score === section.max) return "Muy bien: mantén esta sección y revísala cada tres meses.";
    var missing = section.items.filter(function (item) {
      return (state.selected[section.key] || []).indexOf(item.id) < 0;
    });
    return "Prioridad recomendada: " + (missing[0] ? missing[0].action : "revisar y mantener.");
  }

  function feedbackClass(score, max) {
    if (score >= Math.ceil(max * 0.8)) return "correct";
    if (score > 0) return "partial";
    return "incorrect";
  }

  function finalMessage() {
    if (!allRequiredComplete()) return "El plan aún está incompleto. Guarda las cuatro secciones y registra al menos dos compromisos con fecha válida.";
    if (state.score >= 70) return "Tu plan cumple las condiciones para reportarse como aprobado.";
    return "Tu plan está completo y se reportará como completado con recomendaciones de mejora.";
  }

  function commitmentField(index, label) {
    return '<label class="field">' + label + '<textarea id="commitment-' + index + '" maxlength="260" placeholder="Ejemplo: Activaré MFA en mi correo principal antes del viernes.">' + escapeHtml(state.commitments[index] || "") + '</textarea></label>';
  }

  function infoCard(icon, title, text) {
    return '<article class="card"><span class="icon" aria-hidden="true">' + icon + '</span><h3>' + title + '</h3><p>' + text + '</p></article>';
  }

  function detailsBlock(title, items) {
    return '<details><summary>' + title + '</summary>' + listItems(items) + '</details>';
  }

  function timelineItem(title, text) {
    return '<div class="timeline-item"><strong>' + title + '</strong><span>' + text + '</span></div>';
  }

  function riskStep(text) {
    return '<div class="risk-step">' + text + '</div>';
  }

  function resourcesBlock() {
    return '<div class="reading-block"><h3>Recursos externos opcionales</h3><p>Estos botones requieren internet y no son obligatorios para completar el SCORM.</p><div class="resource-list">' +
      resources.map(function (item) { return resourceLink(item[0], item[1], item[2]); }).join("") +
      '</div></div>';
  }

  function resourceLink(url, title, description) {
    return '<a href="' + url + '" target="_blank" rel="noopener"><strong>' + title + '</strong><small>' + description + '</small></a>';
  }

  function option(value, label, selected) {
    return '<option value="' + value + '"' + (selected === value ? " selected" : "") + '>' + label + '</option>';
  }

  function contextLabel(value) {
    var labels = { personal: "Personal", academico: "Académico", laboral: "Laboral", mixto: "Mixto" };
    return labels[value] || "";
  }

  function listItems(items) {
    if (!items || !items.length) return '<p class="muted">Sin información registrada.</p>';
    return '<ul>' + items.map(function (item) { return '<li>' + item + '</li>'; }).join("") + '</ul>';
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
