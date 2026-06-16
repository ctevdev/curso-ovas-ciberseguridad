(function () {
  "use strict";

  var totalScreens = 12;
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

  var passphraseCriteria = [
    "Usar 4 palabras no relacionadas",
    "Agregar un símbolo",
    "Agregar un número",
    "Superar 12 caracteres",
    "No usar nombre propio ni fecha de nacimiento"
  ];

  var auditItems = [
    ["Mi contraseña más importante tiene más de 12 caracteres.", 10],
    ["No uso la misma contraseña en más de una cuenta importante.", 15],
    ["Tengo MFA activo en al menos una cuenta crítica.", 20],
    ["Nunca comparto mi contraseña ni códigos de verificación.", 10],
    ["Verifico el remitente antes de abrir correos sospechosos.", 10],
    ["Mis perfiles en redes sociales tienen privacidad configurada.", 10],
    ["Reviso HTTPS, candado y dominio antes de comprar online.", 10],
    ["No instalo apps sin revisar permisos.", 15]
  ];

  var quiz = [
    {
      q: "1. ¿Cuál es una característica clave de una contraseña segura?",
      options: ["Usar el nombre y año de nacimiento", "Ser larga, única y sin datos personales", "Repetirse en todas las cuentas", "Guardarse en un chat"],
      correct: 1
    },
    {
      q: "2. Si recibes un mensaje urgente sobre tu cuenta de Instagram, lo más seguro es:",
      options: ["Entrar desde la app oficial y revisar alertas internas", "Responder al mensaje", "Enviar usuario y contraseña", "Hacer clic rápido para evitar bloqueo"],
      correct: 0
    },
    {
      q: "3. ¿Qué aporta el doble factor de autenticación?",
      options: ["Una segunda capa de verificación", "Un cambio de color al sitio", "Una copia de seguridad automática", "Eliminar todas las contraseñas débiles"],
      correct: 0
    },
    {
      q: "4. ¿Qué indica un dominio sospechoso?",
      options: ["Que tiene HTTPS", "Que agrega palabras raras o imita a la entidad", "Que carga rápido", "Que tiene un formulario bonito"],
      correct: 1
    },
    {
      q: "5. ¿Qué debes revisar antes de instalar una app?",
      options: ["Solo el color del ícono", "Si pide permisos necesarios y viene de fuente confiable", "Si tiene muchos anuncios", "Si promete premios"],
      correct: 1
    }
  ];

  var miniSituations = [
    ["Laura usa la misma contraseña para correo, Facebook, Instagram y tienda online.", ["No tiene antivirus", "Reutiliza la misma contraseña", "Tiene muchas redes sociales", "Usa correo electrónico"], 1, "Si una cuenta se filtra, las demás quedan en riesgo."],
    ["Pedro recibe un correo del banco. El enlace dice banco-seguridad-pagos.net y pide usuario y clave.", ["El sitio tiene un nombre sospechoso", "El correo es seguro porque habla del banco", "Debe ingresar rápido", "Debe responder con su clave"], 0, "Los dominios falsos imitan nombres conocidos para robar credenciales."],
    ["Ana tiene MFA activo, pero entrega el código a alguien que llamó diciendo ser del banco.", ["Actuó correctamente", "El MFA no sirve", "El error fue compartir el código", "Debe desactivar MFA"], 2, "Los códigos de verificación nunca deben compartirse."],
    ["Carlos instala una app de fotos que pide contactos, micrófono, ubicación y SMS.", ["Los permisos parecen excesivos", "Todas las apps necesitan todo", "Debe aceptar rápido", "No hay riesgo"], 0, "Una app debe solicitar solo los permisos necesarios para funcionar."],
    ["María publica: “Salimos de viaje por 10 días, la casa queda sola”.", ["Expone información sensible", "Protege su cuenta", "Está usando MFA", "Está navegando seguro"], 0, "La información publicada en redes puede ser usada para engaños o riesgos físicos."]
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
    var passScore = state.answers.passphraseScore || 0;
    var auditScore = state.answers.auditScore || 0;
    var quizScore = state.answers.quizScore || 0;
    state.score = Math.min(100, caseScore + passScore + auditScore + quizScore);
  }

  function allRequiredComplete() {
    return Boolean(state.completed.case && state.completed.passphrase && state.completed.audit && state.completed.quiz);
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
    var screens = [welcome, initialCase, learnMore, passwords, passphraseActivity, mfa, emailSocial, browsingApps, audit, detectError, evaluation, results];
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
    var passButton = document.getElementById("submit-passphrase");
    if (passButton) passButton.addEventListener("click", submitPassphrase);
    var auditButton = document.getElementById("submit-audit");
    if (auditButton) auditButton.addEventListener("click", submitAudit);
    var miniButton = document.getElementById("submit-mini");
    if (miniButton) miniButton.addEventListener("click", submitMini);
    var quizButton = document.getElementById("submit-quiz");
    if (quizButton) quizButton.addEventListener("click", submitQuiz);
    var finishButton = document.getElementById("finish-ova");
    if (finishButton) finishButton.addEventListener("click", finishOva);
  }

  function welcome() {
    return '<section class="screen hero">' +
      '<span class="tag">🔑 OVA 2 · Cuentas y navegación · 100 puntos</span>' +
      '<h2>Protección de Cuentas, Contraseñas, Correo, Redes Sociales y Navegación</h2>' +
      '<p class="subtitle">“Tu contraseña es la llave de tu vida digital. ¿Con qué tanta seguridad la guardas?”</p>' +
      '<p class="lead">Esta OVA te ayuda a proteger tus cuentas digitales mediante contraseñas largas y únicas, doble factor de autenticación, revisión de remitentes, navegación segura, privacidad en redes sociales y cuidado con permisos de aplicaciones.</p>' +
      '<div class="notice"><strong>Objetivo:</strong> aplicar buenas prácticas para proteger cuentas, contraseñas, correo, redes sociales y navegación web sin pedir datos sensibles ni contraseñas reales.</div>' +
      '<div class="brand-strip"><img src="assets/logo-unicartagena-ctev.png" alt="Logo Universidad de Cartagena y CTEV"><span>Identidad institucional · Ruta de ciberhigiene personal</span></div>' +
      '<div class="identity-route" aria-label="Ruta de cinco OVAs">' +
      '<div class="identity-item" style="--identity:#087da5"><strong>🛡 OVA 1</strong>Fundamentos</div>' +
      '<div class="identity-item current" style="--identity:#155ca2"><strong>🔑 OVA 2</strong>Cuentas</div>' +
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
        ? "Correcto. Valentina debía abrir Instagram desde la app oficial, revisar alertas internas y activar MFA."
        : selected === "D"
          ? "Pedir más información no entrega la contraseña, pero mantiene abierta la conversación con el atacante. La vía segura es la app oficial."
          : "Esa acción entrega credenciales en un sitio falso y facilita la toma de la cuenta.";
      feedback = '<p class="feedback ' + feedbackClass(score, 25) + '">' + text + " Puntaje: " + score + "/25.</p>";
    }
    return '<section class="screen"><span class="tag">📱 Caso inicial · 25 puntos</span><h2>La cuenta de Instagram que perdió todo en 2 horas</h2>' +
      '<div class="visual-lesson"><div><p>Valentina tiene 15.000 seguidores y vende manualidades por Instagram. Su contraseña era <strong>valentina2020</strong>. Recibió un mensaje: “Tu cuenta fue reportada. Haz clic aquí para verificarla o será eliminada”.</p><p>Hizo clic, ingresó usuario y contraseña en un sitio falso. En dos horas cambiaron correo, número de recuperación y contraseña. Después le pidieron $800.000 para devolver la cuenta.</p><div class="notice risk"><strong>Errores:</strong> contraseña débil, sin MFA, no verificó el enlace, ingresó datos en sitio falso y no tenía recuperación alterna protegida.</div></div><img class="lesson-image" src="assets/celular-alerta-real.png" alt="Celular con alerta roja"></div>' +
      '<fieldset class="question"><legend>¿Qué debió hacer Valentina?</legend>' +
      caseOption("A", "Hacer clic de inmediato para evitar perder la cuenta.", selected) +
      caseOption("B", "Ingresar usuario y contraseña porque el mensaje era urgente.", selected) +
      caseOption("C", "Abrir Instagram desde la aplicación oficial, revisar alertas internas y activar MFA.", selected) +
      caseOption("D", "Responder al mensaje pidiendo más información.", selected) +
      '</fieldset><button id="submit-case" class="button button-primary" type="button">Confirmar respuesta</button>' + feedback +
      nav(true, state.completed.case, "Continuar") + '</section>';
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

  function learnMore() {
    return '<section class="screen"><span class="tag">Aprende más</span><h2>Protege tus cuentas antes de que alguien intente tomarlas</h2>' +
      '<div class="visual-lesson"><div><p class="lead">Tu correo principal no es solo un buzón. En muchos casos es la llave para recuperar redes sociales, banca digital, plataformas educativas, compras en línea, documentos en la nube y aplicaciones personales.</p><p>Si alguien toma control de tu correo, puede restablecer contraseñas, leer información privada, suplantar tu identidad o enviar mensajes fraudulentos a tus contactos. Por eso, la cuenta más importante que debes proteger suele ser tu correo principal.</p></div><img class="lesson-image" src="assets/escudo-llave.png" alt="Escudo con llave que representa protección de cuenta"></div>' +
      '<div class="card-grid">' +
      infoCard("📧", "Correo principal", "Es la puerta de recuperación para muchas plataformas. Protégelo primero.") +
      infoCard("🔁", "No reutilizar", "Si una clave filtrada se repite, los atacantes la probarán en otros servicios.") +
      infoCard("🧰", "Gestor de contraseñas", "Permite crear y guardar claves largas y únicas sin memorizarlas todas.") +
      infoCard("🧬", "Passkeys", "Usan el bloqueo del dispositivo, huella, rostro o PIN y reducen riesgo de phishing.") +
      '</div>' +
      '<details class="notice"><summary><strong>Pregunta de reflexión:</strong> ¿Qué podría hacer un atacante si entra a tu correo principal?</summary><p>Leer mensajes privados, restablecer contraseñas de otras cuentas y enviar correos en tu nombre. La respuesta completa es: todas las anteriores.</p></details>' +
      nav(true, true, "Continuar a contraseñas") + '</section>';
  }

  function passwords() {
    return '<section class="screen"><span class="tag">🔐 Lección</span><h2>Contraseña larga, única y fácil de recordar</h2>' +
      '<p class="lead">Una buena contraseña no tiene que ser imposible de recordar. Lo importante es que sea larga, única y difícil de adivinar.</p>' +
      '<div class="card-grid">' +
      infoCard("❌", "Inseguras", "123456, password, qwerty, nombre + año, mascota, cédula, fecha de nacimiento o la misma clave en varias cuentas.") +
      infoCard("✅", "Más seguras", "Mínimo 12 caracteres, frase de contraseña, símbolos, números, una por servicio y sin datos personales.") +
      infoCard("🧠", "Regla ciudadana", "Más longitud, menos repetición y cero datos personales.") +
      '</div>' +
      '<div class="reading-block"><h3>Ejemplo educativo</h3><p><strong>CafeLunaRioZapato#2026</strong> es más larga y memorable que una palabra corta con números al final. No uses este ejemplo como contraseña real.</p></div>' +
      '<div class="notice alert"><strong>Importante:</strong> esta OVA nunca te pedirá escribir una contraseña real. Trabajaremos con estructuras seguras, no con tus claves.</div>' +
      nav(true, true, "Ir a actividad") + '</section>';
  }

  function passphraseActivity() {
    var selected = state.answers.passphrase || [];
    var feedback = state.completed.passphrase
      ? '<p class="feedback ' + feedbackClass(state.answers.passphraseScore, 20) + '">Seleccionaste ' + selected.length + ' criterios seguros. Puntaje: ' + state.answers.passphraseScore + '/20.</p>'
      : "";
    return '<section class="screen"><span class="tag">Actividad · 20 puntos</span><h2>Construye una estructura de frase de contraseña</h2>' +
      '<p>Selecciona los elementos que debe tener una estructura segura. No escribas ninguna contraseña real.</p>' +
      '<fieldset class="check-group"><legend><strong>Criterios de estructura segura</strong></legend>' +
      passphraseCriteria.map(function (item) {
        return '<label class="option"><input type="checkbox" name="passphrase" value="' + item + '"' +
          (selected.indexOf(item) >= 0 ? " checked" : "") + '><span>' + item + '</span></label>';
      }).join("") + '</fieldset>' +
      '<div class="notice"><strong>Ejemplo educativo:</strong> TacoLuna#Rio2026! No lo uses como contraseña real.</div>' +
      '<button id="submit-passphrase" class="button button-primary" type="button">Guardar estructura</button>' + feedback +
      nav(true, state.completed.passphrase, "Continuar") + '</section>';
  }

  function submitPassphrase() {
    var selected = Array.from(app.querySelectorAll('input[name="passphrase"]:checked')).map(function (input) { return input.value; });
    if (selected.length === 0) return showInlineError("Selecciona al menos un criterio antes de continuar.");
    state.answers.passphrase = selected;
    state.answers.passphraseScore = selected.length === passphraseCriteria.length ? 20 : selected.length >= 3 ? 10 : 0;
    state.completed.passphrase = true;
    saveProgress();
    render();
  }

  function mfa() {
    return '<section class="screen"><span class="tag">🛡 Lección</span><h2>Doble factor de autenticación — MFA/2FA</h2>' +
      '<div class="visual-lesson"><div><p class="lead">El doble factor agrega una segunda capa de protección. Aunque alguien robe tu contraseña, necesitará un segundo elemento para entrar.</p><p>Funciona como un cajero automático: la tarjeta es algo que tienes y el PIN es algo que sabes. En una cuenta digital, la contraseña es algo que sabes; el código, app autenticadora, huella, llave de seguridad o passkey son una capa adicional.</p></div><img class="lesson-image" src="assets/candado-digital.png" alt="Candado digital"></div>' +
      '<div class="card-grid">' +
      infoCard("💬", "SMS", "Mejor que no tener MFA, pero puede ser vulnerable a suplantación de SIM o engaños.") +
      infoCard("📲", "App autenticadora", "Genera códigos temporales desde una app. No compartas esos códigos.") +
      infoCard("👆", "Biometría", "Huella o rostro para desbloquear el acceso desde tu dispositivo.") +
      infoCard("🔑", "Llave o passkey", "Opciones modernas y más resistentes al phishing cuando están disponibles.") +
      '</div><div class="notice success"><strong>Activa MFA primero en:</strong> correo principal, banco, WhatsApp, Instagram/Facebook, plataforma educativa y nube.</div>' +
      nav(true, true) + '</section>';
  }

  function emailSocial() {
    return '<section class="screen"><span class="tag">📧 Lección</span><h2>Correo electrónico y redes sociales</h2>' +
      '<div class="image-band"><div class="image-tile" style="background-image:url(assets/phishing-correo.png)"><span>Revisa remitente y adjuntos</span></div><div class="image-tile" style="background-image:url(assets/globo-digital.png)"><span>Cuida privacidad y relaciones</span></div></div>' +
      '<div class="reading-block"><h3>Antes de hacer clic en un correo</h3><ol><li>Revisa el remitente real.</li><li>Mira el dominio después de @.</li><li>Desconfía de enlaces acortados o extraños.</li><li>No abras adjuntos inesperados.</li><li>Detecta urgencia, amenazas o premios.</li><li>No entregues contraseñas, códigos ni datos personales.</li></ol></div>' +
      '<div class="reading-block"><h3>Privacidad en redes sociales</h3><p>Las redes muestran rutinas, relaciones, ubicación, familiares, gustos y lugares frecuentes. Esa información puede usarse para mensajes personalizados, perfiles falsos, suplantación o preguntas de recuperación.</p><ul><li>Configura quién ve publicaciones y lista de amigos.</li><li>No publiques ubicación en tiempo real.</li><li>No aceptes solicitudes de desconocidos.</li><li>Revisa apps conectadas que ya no usas.</li><li>Activa MFA en la red social principal.</li></ul></div>' +
      nav(true, true) + '</section>';
  }

  function browsingApps() {
    return '<section class="screen"><span class="tag">🌐 Lección</span><h2>Navegación segura, dominios falsos y permisos</h2>' +
      '<p class="lead">Una página puede verse muy parecida a la original y aun así ser falsa. Los delincuentes copian logos, colores y formularios para que entregues información.</p>' +
      '<div class="reading-block domain-list"><h3>Ejemplo comparativo</h3><p><strong>Dominio legítimo:</strong> <code>bancolombia.com.co</code></p><p><strong>Dominios sospechosos:</strong> <code>bancolombia-pagos.com</code> <code>bancolombia.co.com</code> <code>seguridad-bancolombia.xyz</code> <code>bancolombia-verificacion.net</code></p><p>El candado y HTTPS ayudan, pero no son suficientes. También debes revisar que el dominio sea realmente el de la entidad.</p></div>' +
      '<div class="card-grid">' +
      infoCard("🔎", "Antes de ingresar datos", "Revisa dirección, dominio, palabras agregadas, errores mínimos y origen del enlace.") +
      infoCard("📦", "Permisos de apps", "Una app de linterna no debería pedir contactos, ubicación, SMS o micrófono.") +
      infoCard("🧹", "Limpieza", "Elimina apps que ya no usas y revisa permisos de las que conservas.") +
      '</div>' +
      nav(true, true, "Ir a auditoría") + '</section>';
  }

  function audit() {
    var selected = state.answers.audit || [];
    var raw = state.answers.auditRaw || 0;
    var feedback = state.completed.audit
      ? '<p class="feedback ' + feedbackClass(state.answers.auditScore, 30) + '">Resultado de auditoría: ' + raw + '/100. Aporte a la OVA: ' + state.answers.auditScore + '/30.</p>'
      : "";
    return '<section class="screen"><span class="tag">Actividad · 30 puntos</span><h2>Auditoría Express de mis Cuentas</h2>' +
      '<p>Marca las prácticas que ya cumples. No escribas contraseñas ni datos privados.</p><fieldset class="check-group"><legend><strong>Checklist de seguridad</strong></legend>' +
      auditItems.map(function (item, index) {
        return '<label class="option"><input type="checkbox" name="audit" value="' + index + '"' +
          (selected.indexOf(String(index)) >= 0 ? " checked" : "") + '><span>' + item[0] + ' <strong>(' + item[1] + ' pts)</strong></span></label>';
      }).join("") + '</fieldset><button id="submit-audit" class="button button-primary" type="button">Calcular auditoría</button>' + feedback +
      nav(true, state.completed.audit, "Continuar") + '</section>';
  }

  function submitAudit() {
    var selected = Array.from(app.querySelectorAll('input[name="audit"]:checked')).map(function (input) { return input.value; });
    var raw = selected.reduce(function (sum, value) { return sum + auditItems[Number(value)][1]; }, 0);
    state.answers.audit = selected;
    state.answers.auditRaw = raw;
    state.answers.auditScore = Math.round((raw / 100) * 30);
    state.completed.audit = true;
    saveProgress();
    render();
  }

  function detectError() {
    var answers = state.answers.mini || {};
    var feedback = state.completed.mini
      ? '<p class="feedback success">Reto revisado. Cada acción segura reduce el riesgo; estas decisiones pequeñas se repiten todos los días.</p>'
      : "";
    return '<section class="screen"><span class="tag">Reto práctico · no calificable</span><h2>Detecta el error de seguridad</h2><p>Lee cada situación y selecciona el error principal. Este reto no cambia tu puntaje SCORM.</p>' +
      miniSituations.map(function (item, qIndex) {
        return '<fieldset class="question"><legend>' + item[0] + '</legend>' + item[1].map(function (option, oIndex) {
          return '<label class="option"><input type="radio" name="m' + qIndex + '" value="' + oIndex + '"' +
            (String(answers[qIndex]) === String(oIndex) ? " checked" : "") + '><span>' + option + '</span></label>';
        }).join("") + '</fieldset>';
      }).join("") + '<button id="submit-mini" class="button button-primary" type="button">Revisar reto</button>' + feedback + nav(true, true, "Ir a evaluación") + '</section>';
  }

  function submitMini() {
    var answers = {};
    for (var i = 0; i < miniSituations.length; i += 1) {
      var checked = app.querySelector('input[name="m' + i + '"]:checked');
      if (!checked) return showInlineError("Responde todas las situaciones para revisar el reto.");
      answers[i] = Number(checked.value);
    }
    state.answers.mini = answers;
    state.completed.mini = true;
    saveProgress();
    render();
  }

  function evaluation() {
    var answers = state.answers.quiz || {};
    var feedback = state.completed.quiz
      ? '<p class="feedback ' + feedbackClass(state.answers.quizScore, 25) + '">Obtuviste ' + state.answers.quizScore + '/25 en la evaluación.</p>'
      : "";
    return '<section class="screen"><span class="tag">Evaluación · 25 puntos</span><h2>Comprueba lo aprendido</h2><p>Cada respuesta correcta vale 5 puntos.</p>' +
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
    var correct = quiz.reduce(function (sum, item, index) { return sum + (answers[index] === item.correct ? 1 : 0); }, 0);
    state.answers.quiz = answers;
    state.answers.quizScore = correct * 5;
    state.completed.quiz = true;
    saveProgress();
    render();
  }

  function results() {
    var complete = allRequiredComplete();
    var recommendation = !complete
      ? "Completa el caso, la frase de contraseña, la auditoría y la evaluación."
      : state.score >= 90
        ? "Excelente. Revisa tus cuentas cada tres meses y conserva MFA activo."
        : state.score >= 70
          ? "Buen avance. Prioriza MFA, contraseñas únicas y revisión de privacidad esta semana."
          : "Acción urgente: protege tu correo principal, deja de reutilizar contraseñas y activa MFA.";
    return '<section class="screen results"><span class="tag">Resultados</span><h2>Tu resultado en la OVA 2</h2>' +
      '<div class="result-score" aria-label="Puntaje final">' + state.score + '<small>/100</small></div>' +
      '<h3>Estado: ' + statusLabel() + '</h3><p class="lead">' + recommendation + '</p>' +
      '<div class="card-grid">' +
      infoCard("📱", "Caso Valentina", state.completed.case ? "Completado" : "Pendiente") +
      infoCard("🔐", "Frase de contraseña", state.completed.passphrase ? "Completada" : "Pendiente") +
      infoCard("🧭", "Auditoría", state.completed.audit ? "Completada" : "Pendiente") +
      infoCard("📝", "Evaluación", state.completed.quiz ? "Completada" : "Pendiente") +
      '</div>' +
      '<div class="reading-block"><h3>Recursos externos opcionales</h3><p>Requieren internet y no afectan el puntaje SCORM.</p><div class="resource-list">' +
      resourceLink("https://grow.google/certificates/cybersecurity/", "Google Cybersecurity Professional Certificate", "Ruta de profundización desde fundamentos hasta herramientas prácticas.") +
      resourceLink("https://www.coursera.org/learn/foundations-of-cybersecurity", "Foundations of Cybersecurity — Google/Coursera", "Conecta amenazas, controles, ética, marcos y habilidades del analista.") +
      resourceLink("https://myaccount.google.com/security-checkup", "Google Security Checkup", "Revisar recuperación de cuenta, actividad sospechosa y protecciones adicionales.") +
      resourceLink("https://support.google.com/accounts/answer/185839?hl=es", "Google 2-Step Verification", "Explica MFA, códigos, notificaciones, llaves, passkeys y códigos de respaldo.") +
      resourceLink("https://passwords.google.com/", "Google Password Manager", "Gestión de contraseñas, revisión de claves guardadas y Password Checkup.") +
      resourceLink("https://pages.nist.gov/800-63-4/sp800-63b.html", "NIST SP 800-63B", "Soporte técnico sobre autenticación, contraseñas y autenticadores resistentes a phishing.") +
      '</div></div>' +
      '<div class="brand-strip"><img src="assets/logo-unicartagena-ctev.png" alt="Logo Universidad de Cartagena y CTEV"><span>Fin de la OVA 2 · Protección de cuentas y navegación</span></div>' +
      (complete ? '<button id="finish-ova" class="button button-primary" type="button">' + (state.finished ? "OVA finalizada" : "Finalizar OVA") + '</button>' : '<p class="notice alert">Aún hay actividades obligatorias pendientes.</p>') +
      nav(true, false) + '</section>';
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

