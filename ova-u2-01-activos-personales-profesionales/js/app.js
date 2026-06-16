(function () {
  "use strict";

  var totalScreens = 14;
  var app = document.getElementById("app");

  var defaultState = {
    screen: 0,
    score: 0,
    answers: {
      case: null,
      classifications: {},
      priority: {},
      quiz: {}
    },
    selectedAssets: [],
    completed: {},
    finalStatus: "incomplete",
    finished: false
  };
  var state = cloneDefault();

  var assetGroups = [
    {
      title: "Cuentas",
      items: ["Correo principal", "Correo secundario", "Cuenta Google, Apple o Microsoft", "WhatsApp", "Redes sociales", "Banca digital", "Billetera digital", "Plataforma academica", "Plataforma laboral", "Tiendas en linea"]
    },
    {
      title: "Dispositivos",
      items: ["Celular personal", "Computador personal", "Tablet", "Router de casa", "Disco externo", "Memoria USB", "Equipo compartido", "Equipo del trabajo o estudio"]
    },
    {
      title: "Informacion",
      items: ["Fotos personales", "Documentos de identidad", "Documentos academicos", "Documentos laborales", "Informacion financiera", "Informacion familiar", "Contactos", "Comprobantes de pago", "Archivos en la nube", "Copias de seguridad"]
    },
    {
      title: "Servicios",
      items: ["Google Drive", "OneDrive", "iCloud", "Plataforma de estudio", "Plataforma de trabajo", "Aplicacion de pagos", "Servicio de hosting o pagina web", "Aplicaciones de mensajeria"]
    }
  ];

  var classificationCases = [
    {
      text: "Correo principal usado para recuperar banco, redes y nube.",
      answer: "critico",
      feedback: "Es critico porque abre la puerta a recuperar o controlar muchas otras cuentas."
    },
    {
      text: "Cuenta de streaming sin informacion sensible.",
      answer: "apoyo",
      feedback: "Es de apoyo: puede ser util, pero su perdida no suele causar dano alto."
    },
    {
      text: "Celular personal con banca, WhatsApp, correo y fotos.",
      answer: "critico",
      feedback: "Es critico porque concentra sesiones abiertas, dinero, identidad, mensajes y archivos."
    },
    {
      text: "Documento academico ya entregado y con copia de seguridad.",
      answer: "importante",
      feedback: "Es importante: tiene valor academico, pero su impacto baja si ya fue entregado y tiene copia."
    },
    {
      text: "Carpeta en la nube con contratos, facturas y datos de clientes.",
      answer: "critico",
      feedback: "Es critico por su impacto laboral, legal, economico y reputacional."
    },
    {
      text: "Aplicacion de juegos sin pagos ni datos personales relevantes.",
      answer: "apoyo",
      feedback: "Es de apoyo: no deberia priorizarse sobre correo, banco, celular o documentos clave."
    }
  ];

  var priorityAssets = ["Correo principal", "Cuenta bancaria", "Celular personal", "Cuenta de entretenimiento", "Documentos importantes en la nube", "Red social secundaria"];
  var priorityOrder = ["Correo principal", "Cuenta bancaria", "Celular personal", "Documentos importantes en la nube", "Red social secundaria", "Cuenta de entretenimiento"];

  var quiz = [
    {
      q: "¿Que es un activo digital?",
      options: ["Solo un computador.", "Cualquier cuenta, dispositivo, archivo, servicio o informacion que tiene valor.", "Unicamente una contrasena.", "Solo una red social."],
      correct: 1
    },
    {
      q: "¿Cual activo suele ser critico porque permite recuperar muchas otras cuentas?",
      options: ["Correo principal.", "Aplicacion de musica.", "Juego instalado.", "Fondo de pantalla."],
      correct: 0
    },
    {
      q: "¿Que es una vulnerabilidad?",
      options: ["Un activo muy protegido.", "Una debilidad que puede ser aprovechada por una amenaza.", "Una copia de seguridad.", "Una contrasena fuerte."],
      correct: 1
    },
    {
      q: "¿Cual es un ejemplo de impacto?",
      options: ["Activar MFA.", "Cambiar contrasena.", "Perdida economica o exposicion de informacion.", "Instalar actualizaciones."],
      correct: 2
    },
    {
      q: "¿Que es un control de seguridad?",
      options: ["Una accion que reduce un riesgo.", "Una amenaza nueva.", "Un dato filtrado.", "Un archivo sin importancia."],
      correct: 0
    }
  ];

  var resources = [
    ["https://grow.google/certificates/cybersecurity/", "Google Cybersecurity Certificate", "Ruta para profundizar en fundamentos, riesgos, amenazas, vulnerabilidades y controles."],
    ["https://www.coursera.org/learn/manage-security-risks", "Play It Safe: Manage Security Risks", "Curso de Google para ampliar riesgos, amenazas, controles y marcos de seguridad."],
    ["https://www.coursera.org/learn/assets-threats-and-vulnerabilities", "Assets, Threats, and Vulnerabilities", "Curso para profundizar en activos, clasificacion, amenazas, vulnerabilidades y controles."],
    ["https://www.nist.gov/cyberframework", "NIST Cybersecurity Framework 2.0", "Marco de referencia para gobernar, identificar, proteger, detectar, responder y recuperar."],
    ["https://csrc.nist.gov/projects/risk-management/about-rmf", "NIST Risk Management Framework", "Referencia para entender la gestion del riesgo como proceso continuo."],
    ["https://www.cisa.gov/resources-tools/resources/cyber-essentials", "CISA Cyber Essentials", "Guia practica para iniciar acciones de ciberseguridad en equipos no especializados."],
    ["https://haveibeenpwned.com/", "Have I Been Pwned", "Recurso para verificar si un correo aparece en filtraciones conocidas."],
    ["https://myaccount.google.com/security-checkup", "Google Security Checkup", "Herramienta para revisar seguridad de cuenta, dispositivos y actividad sospechosa."]
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
    state.answers.classifications = state.answers.classifications || {};
    state.answers.priority = state.answers.priority || {};
    state.answers.quiz = state.answers.quiz || {};
    state.selectedAssets = Array.isArray(state.selectedAssets) ? state.selectedAssets : [];
    state.completed = state.completed || {};
    state.finalStatus = state.finalStatus || "incomplete";
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
    state.score = getCaseScore() + getInventoryScore() + getClassificationScore() + getPriorityScore() + getQuizScore();
    state.score = Math.max(0, Math.min(100, Math.round(state.score)));
    return state.score;
  }

  function saveProgress() {
    calculateScore();
    Scorm.setScore(state.score);
    Scorm.setLocation(state.screen);
    Scorm.saveSuspendData({
      screen: state.screen,
      score: state.score,
      answers: state.answers,
      selectedAssets: state.selectedAssets,
      classifications: state.answers.classifications,
      completed: state.completed,
      finalStatus: state.finalStatus,
      finished: state.finished
    });
    Scorm.commit();
  }

  function allRequiredComplete() {
    return Boolean(state.completed.case && state.completed.inventory && state.completed.classification && state.completed.priority && state.completed.quiz);
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
      activeConcept,
      assetTypes,
      assetClassification,
      riskRelation,
      inventoryActivity,
      classificationActivity,
      priorityActivity,
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
    var caseButton = document.getElementById("submit-case");
    if (caseButton) caseButton.addEventListener("click", submitCase);
    var inventoryButton = document.getElementById("submit-inventory");
    if (inventoryButton) inventoryButton.addEventListener("click", submitInventory);
    var classificationButton = document.getElementById("submit-classification");
    if (classificationButton) classificationButton.addEventListener("click", submitClassification);
    var priorityButton = document.getElementById("submit-priority");
    if (priorityButton) priorityButton.addEventListener("click", submitPriority);
    var quizButton = document.getElementById("submit-quiz");
    if (quizButton) quizButton.addEventListener("click", submitQuiz);
    var finishButton = document.getElementById("finish-ova");
    if (finishButton) finishButton.addEventListener("click", finishOva);
  }

  function welcome() {
    return '<section class="screen hero">' +
      '<span class="tag">Unidad 2 · OVA 1 · 100 puntos</span>' +
      '<h2>Bienvenido a la Unidad 2</h2>' +
      '<p class="subtitle">Activos personales y profesionales: ¿que debo proteger primero?</p>' +
      '<p class="lead">En la Unidad 1 aprendiste habitos basicos de ciberhigiene: contrasenas, doble factor, dispositivos, copias de seguridad y deteccion de phishing. Ahora avanzaremos hacia la gestion basica del riesgo.</p>' +
      '<div class="notice asset"><strong>Pregunta de partida:</strong> ¿Que activos digitales debo proteger primero?</div>' +
      '<p>En esta OVA identificaras tus cuentas, dispositivos, documentos, servicios e informacion mas importante. Luego los clasificaras para priorizar acciones de proteccion.</p>' +
      '<div class="brand-strip"><img src="assets/logo-unicartagena-ctev.png" alt="Logo Universidad de Cartagena y CTEV"><span>Curso interactivo de formacion en ciberseguridad</span></div>' +
      nav(false, true, "Iniciar OVA") + '</section>';
  }

  function objective() {
    return '<section class="screen"><span class="tag">Objetivo de aprendizaje</span><h2>Identificar antes de evaluar el riesgo</h2>' +
      '<p class="lead">Identificar y clasificar activos digitales personales, academicos o laborales, reconociendo su importancia, dependencia, sensibilidad e impacto potencial frente a incidentes de seguridad.</p>' +
      '<div class="card-grid">' +
      infoCard("1", "Activo digital", "Que cuenta, dispositivo, archivo, servicio o informacion tiene valor.") +
      infoCard("2", "Tipos de activos", "Personales, academicos, laborales, financieros, dispositivos, nube y servicios.") +
      infoCard("3", "Criticidad", "Clasificar activos como criticos, importantes o de apoyo.") +
      infoCard("4", "Riesgo", "Relacionar activo, amenaza, vulnerabilidad, impacto y control.") +
      infoCard("5", "Inventario", "Construir una lista basica sin escribir informacion privada.") +
      infoCard("6", "Prioridad", "Decidir que proteger primero segun impacto y dependencia.") +
      '</div>' +
      nav(true, true, "Ver caso inicial") + '</section>';
  }

  function initialCase() {
    var feedback = "";
    if (state.completed.case) {
      var score = getCaseScore();
      if (state.answers.case === "B") feedback = '<p class="feedback correct">Correcto. El correo principal es critico porque permite recuperar otras cuentas, recibir alertas, acceder a documentos y controlar servicios asociados. Puntaje: ' + score + '/15.</p>';
      else if (state.answers.case === "A" || state.answers.case === "D") feedback = '<p class="feedback partial">Parcialmente correcto. Esos tambien son activos, pero el correo principal tiene mayor impacto porque conecta con muchas otras cuentas. Puntaje: ' + score + '/15.</p>';
      else feedback = '<p class="feedback incorrect">Incorrecto. Un cargador puede ser util, pero no representa el activo critico del caso. Puntaje: 0/15.</p>';
    }
    return '<section class="screen"><span class="tag">Caso inicial · 15 puntos</span><h2>Caso: El correo que daba acceso a todo</h2>' +
      '<div class="visual-lesson"><div><p>Marcela trabaja como independiente y tambien estudia virtualmente. Usa un solo correo principal para casi todo: banca digital, redes sociales, plataforma academica, almacenamiento en la nube, compras en linea y recuperacion de contrasenas.</p><p>Un dia pierde acceso a ese correo porque reutilizaba la misma contrasena en varios servicios. El atacante cambia el numero de recuperacion, revisa archivos en la nube y envia mensajes a sus contactos.</p><div class="notice risk"><strong>Marcela no tenia claro</strong> que su correo principal era el activo mas critico de su vida digital.</div></div><img class="lesson-image" src="assets/phishing-correo.png" alt="Ilustracion de correo y riesgo digital"></div>' +
      '<fieldset class="question"><legend>¿Cual era el activo mas critico en este caso?</legend>' +
      caseOption("A", "La aplicacion de compras en linea.") +
      caseOption("B", "El correo principal.") +
      caseOption("C", "El cargador del celular.") +
      caseOption("D", "Una red social secundaria.") +
      '</fieldset><button id="submit-case" class="button button-primary" type="button">Confirmar respuesta</button>' + feedback +
      nav(true, state.completed.case, "Concepto de activo") + '</section>';
  }

  function activeConcept() {
    return '<section class="screen"><span class="tag">Concepto clave</span><h2>¿Que es un activo digital?</h2>' +
      '<div class="visual-lesson"><div><p class="lead">Un activo digital es cualquier cuenta, dispositivo, archivo, servicio, dato o recurso tecnologico que tiene valor para una persona, familia, negocio, estudio o trabajo.</p><p>Puede tener valor porque contiene informacion personal, permite acceder a otros servicios, guarda documentos, afecta el dinero o la reputacion, es necesario para estudiar o trabajar, permite comunicarse o ayuda a recuperar cuentas.</p><div class="notice asset"><strong>Mensaje clave:</strong> no todo archivo o cuenta tiene el mismo nivel de importancia. Algunos activos, si se pierden o exponen, pueden afectar muchas areas de tu vida.</div></div><img class="lesson-image" src="assets/candado-digital.png" alt="Ilustracion de proteccion digital"></div>' +
      '<div class="card-grid">' +
      infoCard("✉", "Correo principal", "Suele recuperar otras cuentas y recibir alertas.") +
      infoCard("$", "Cuenta bancaria", "Afecta directamente el dinero.") +
      infoCard("☁", "Nube", "Puede guardar documentos, fotos y copias.") +
      infoCard("☎", "Celular", "Concentra sesiones, mensajes, fotos y autenticacion.") +
      '</div>' + nav(true, true, "Tipos de activos") + '</section>';
  }

  function assetTypes() {
    var types = [
      ["Cuentas de acceso", ["Correo principal", "Cuenta Google/Apple/Microsoft", "WhatsApp", "Redes sociales", "Banca digital", "Plataforma academica o laboral"], "Permiten entrar, recuperar o controlar otros servicios."],
      ["Dispositivos", ["Celular", "Computador", "Tablet", "Router", "Disco externo", "USB", "Equipo compartido"], "Guardan informacion, sesiones abiertas, documentos, fotos y accesos."],
      ["Informacion personal", ["Fotos de documentos", "Datos de contacto", "Informacion familiar", "Conversaciones privadas", "Ubicacion"], "Puede usarse para suplantacion, extorsion, fraude o exposicion."],
      ["Informacion academica", ["Trabajos", "Certificados", "Correo institucional", "Historial academico", "Evidencias"], "Puede afectar estudio, certificacion y reputacion academica."],
      ["Informacion laboral o profesional", ["Contratos", "Hojas de vida", "Datos de clientes", "Proyectos", "Comunicaciones laborales"], "Puede afectar ingresos, confianza, cumplimiento o continuidad."],
      ["Informacion financiera", ["Banca digital", "Billeteras", "Facturas", "Comprobantes", "Tarjetas", "Apps de pago"], "Puede generar perdida economica directa."],
      ["Servicios en la nube", ["Google Drive", "OneDrive", "iCloud", "Dropbox", "Respaldos"], "Pueden guardar fotos, documentos y archivos criticos."]
    ];
    return '<section class="screen"><span class="tag">Mapa de activos</span><h2>Tipos de activos que debes reconocer</h2><p class="lead">Abre cada tarjeta para revisar ejemplos y por que importan.</p><div class="accordion">' +
      types.map(function (item) {
        return '<details><summary>' + item[0] + '</summary><p><strong>Ejemplos:</strong></p>' + listItems(item[1]) + '<p><strong>Por que importan:</strong> ' + item[2] + '</p></details>';
      }).join("") + '</div>' + nav(true, true, "Clasificacion basica") + '</section>';
  }

  function assetClassification() {
    return '<section class="screen"><span class="tag">Criticidad</span><h2>Clasifica antes de proteger</h2><p class="lead">Para gestionar riesgos no basta con hacer una lista. Tambien debes clasificar los activos segun su importancia.</p>' +
      '<div class="asset-levels">' +
      '<article class="level-card level-critical"><strong>Activo critico</strong><p>Si se pierde, se bloquea, se altera o se expone, causa dano alto.</p><ul><li>Correo principal.</li><li>Cuenta bancaria.</li><li>Celular con cuentas abiertas.</li><li>Nube con documentos personales o profesionales.</li></ul></article>' +
      '<article class="level-card level-important"><strong>Activo importante</strong><p>Su perdida causa molestias, retrasos o impacto moderado, pero puede recuperarse con esfuerzo.</p><ul><li>Red social secundaria.</li><li>Documentos no confidenciales.</li><li>Archivos con copia de seguridad.</li></ul></article>' +
      '<article class="level-card level-support"><strong>Activo de apoyo</strong><p>Ayuda al funcionamiento diario, pero su perdida no genera dano grave.</p><ul><li>Cuenta de entretenimiento.</li><li>Aplicacion de notas sin datos sensibles.</li><li>Archivos temporales.</li></ul></article>' +
      '</div>' + nav(true, true, "Del activo al riesgo") + '</section>';
  }

  function riskRelation() {
    return '<section class="screen"><span class="tag">Gestion basica del riesgo</span><h2>Del activo al riesgo</h2>' +
      '<p class="lead">Una vez identificas un activo, puedes analizar que puede pasarle y que accion reduce el riesgo.</p>' +
      '<div class="risk-chain">' +
      riskPiece("Activo", "Lo que tiene valor. Ejemplo: correo principal.") +
      riskPiece("Amenaza", "Lo que podria causar dano. Ejemplo: phishing.") +
      riskPiece("Vulnerabilidad", "La debilidad que permite el dano. Ejemplo: contrasena repetida.") +
      riskPiece("Impacto", "Consecuencia del incidente. Ejemplo: suplantacion o perdida de acceso.") +
      riskPiece("Control", "Accion que reduce el riesgo. Ejemplo: MFA y contrasena unica.") +
      '</div><div class="formula-card"><strong>Activo + Amenaza + Vulnerabilidad = Riesgo</strong><strong>Control = accion que reduce el riesgo</strong></div>' +
      '<div class="notice asset"><strong>Ejemplo:</strong> correo principal + robo de credenciales mediante phishing + contrasena repetida sin doble factor = riesgo de perdida de cuentas, suplantacion y exposicion de documentos.</div>' +
      nav(true, true, "Actividad 1") + '</section>';
  }

  function inventoryActivity() {
    var count = state.selectedAssets.length;
    var feedback = state.completed.inventory
      ? '<p class="feedback ' + (count >= 8 ? "correct" : "incorrect") + '">Seleccionaste ' + count + ' activos. Puntaje: ' + getInventoryScore() + '/20. Mientras mas claro sea tu inventario, mas facil sera proteger lo importante.</p>'
      : '<p class="muted">Debes seleccionar minimo 8 activos para completar esta actividad. No escribas informacion privada; solo marca categorias.</p>';
    return '<section class="screen"><span class="tag">Actividad 1 · Inventario · 20 puntos</span><h2>Mi inventario de activos</h2>' +
      '<p class="lead">Selecciona los activos digitales que usas actualmente. No escribas nombres reales de cuentas, correos, documentos ni datos privados.</p><p><span class="asset-count">Activos seleccionados: ' + count + '</span></p>' +
      '<div class="inventory-grid">' + assetGroups.map(function (group) {
        return '<fieldset class="check-group"><legend>' + group.title + '</legend>' + group.items.map(function (item) {
          var id = group.title + "::" + item;
          return '<label class="option"><input type="checkbox" name="asset" value="' + escapeHtml(id) + '"' + (state.selectedAssets.indexOf(id) >= 0 ? " checked" : "") + '><span>' + item + '</span></label>';
        }).join("") + '</fieldset>';
      }).join("") + '</div><button id="submit-inventory" class="button button-primary" type="button">Guardar inventario</button>' + feedback +
      nav(true, state.completed.inventory, "Actividad 2") + '</section>';
  }

  function classificationActivity() {
    var score = getClassificationScore();
    var feedback = state.completed.classification
      ? '<p class="feedback ' + feedbackClass(score, 25) + '">Clasificacion revisada. Puntaje: ' + score + '/25.</p>' + classificationFeedbackList()
      : '<p class="muted">Clasifica cada caso como critico, importante o de apoyo.</p>';
    return '<section class="screen"><span class="tag">Actividad 2 · Criticidad · 25 puntos</span><h2>¿Que tan critico es este activo?</h2>' +
      '<div class="select-list">' + classificationCases.map(function (item, index) {
        var selected = state.answers.classifications[index] || "";
        return '<div class="select-row"><label for="classification-' + index + '"><strong>Caso ' + (index + 1) + ':</strong> ' + item.text + '</label><select id="classification-' + index + '" name="classification"><option value="">Selecciona...</option>' + levelOption("critico", "Critico", selected) + levelOption("importante", "Importante", selected) + levelOption("apoyo", "De apoyo", selected) + '</select></div>';
      }).join("") + '</div><button id="submit-classification" class="button button-primary" type="button">Calificar clasificacion</button>' + feedback +
      nav(true, state.completed.classification, "Actividad 3") + '</section>';
  }

  function priorityActivity() {
    var feedback = state.completed.priority
      ? '<p class="feedback ' + feedbackClass(getPriorityScore(), 15) + '">Priorizacion revisada. Puntaje: ' + getPriorityScore() + '/15. Los activos que dan acceso a otros servicios, dinero o informacion critica deben protegerse primero.</p>'
      : '<p class="muted">Ordena los activos del mas prioritario al menos prioritario. No repitas activos.</p>';
    return '<section class="screen"><span class="tag">Actividad 3 · Priorizacion · 15 puntos</span><h2>¿Que protejo primero?</h2>' +
      '<p class="lead">Piensa en impacto personal, economico, academico, laboral y reputacional.</p><div class="select-list">' +
      priorityOrder.map(function (_expected, index) {
        var selected = state.answers.priority[index] || "";
        return '<div class="select-row"><label for="priority-' + index + '"><strong>Prioridad ' + (index + 1) + '</strong></label><select id="priority-' + index + '" name="priority"><option value="">Selecciona...</option>' + priorityAssets.map(function (asset) { return levelOption(asset, asset, selected); }).join("") + '</select></div>';
      }).join("") + '</div><button id="submit-priority" class="button button-primary" type="button">Calificar priorizacion</button>' + feedback +
      '<div class="notice asset"><strong>Pista:</strong> primero van los activos que recuperan otros servicios, protegen dinero o concentran informacion sensible.</div>' +
      nav(true, state.completed.priority, "Material de ayuda") + '</section>';
  }

  function helpMaterial() {
    return '<section class="screen"><span class="tag">Aprende mas · opcional</span><h2>De los activos al riesgo</h2>' +
      '<p class="subtitle">Antes de proteger, hay que identificar. Antes de priorizar, hay que clasificar.</p><p class="lead">Esta seccion no es obligatoria para finalizar la OVA, pero prepara el camino para construir una matriz basica de riesgos.</p>' +
      '<div class="accordion">' +
      detailsBlock("¿Por que los activos son el punto de partida?", ["En ciberseguridad no se empieza preguntando que herramienta necesito, sino que necesito proteger.", "No todas las cuentas, archivos o dispositivos tienen el mismo valor.", "El correo principal puede ser mas critico que una cuenta de entretenimiento porque recupera muchas otras cuentas."]) +
      detailsBlock("Activo, dato, cuenta y servicio", ["Activo digital: elemento digital con valor.", "Dato: unidad de informacion como nombre, factura o comprobante.", "Cuenta: acceso a un servicio digital como Gmail, Moodle o banco.", "Servicio: plataforma que usas, como Drive, banca en linea o tienda virtual."]) +
      detailsBlock("Informacion critica y dependencia digital", ["Puede afectar dinero, estudio, trabajo, reputacion, privacidad, familia o continuidad de negocio.", "Pregunta guia: ¿que cuenta uso para recuperar las demas?", "Pregunta guia: ¿que archivo no puedo reconstruir facilmente?"]) +
      detailsBlock("Clasificacion de informacion", ["Publica: puede compartirse sin dano.", "Interna o personal limitada: no deberia publicarse ampliamente.", "Confidencial: causa dano si se expone.", "Critica: indispensable para operar, estudiar, trabajar o recuperar servicios."]) +
      detailsBlock("Errores frecuentes", ["Creer que solo los computadores son activos.", "No incluir el correo principal.", "Olvidar servicios en la nube.", "No considerar equipos compartidos.", "No valorar reputacion digital.", "No pensar en impacto economico.", "No revisar copias unicas."]) +
      detailsBlock("Preguntas para identificar activos criticos", ["¿Que activo afecta directamente mi dinero?", "¿Que servicio uso todos los dias?", "¿Que informacion no quisiera que se hiciera publica?", "¿Que activo afectaria a otras personas si se compromete?", "¿Que activo tiene sesiones abiertas en varios dispositivos?"]) +
      '</div><div class="reading-block"><h3>Ejemplo guiado: Carlos</h3><p>Carlos es estudiante y trabaja como independiente. Identifica correo principal, celular, cuenta bancaria, WhatsApp, plataforma educativa, Google Drive, facturas, red social del emprendimiento, computador y copias de seguridad.</p><p><strong>Criticos:</strong> correo principal, celular, cuenta bancaria, Google Drive y red social del emprendimiento. <strong>Controles iniciales:</strong> MFA, contrasenas unicas, revision de sesiones, copias y bloqueo automatico.</p></div>' +
      resourcesBlock() + nav(true, true, "Evaluacion final") + '</section>';
  }

  function finalQuiz() {
    var feedback = state.completed.quiz
      ? '<p class="feedback ' + feedbackClass(getQuizScore(), 25) + '">Evaluacion calificada. Puntaje: ' + getQuizScore() + '/25.</p>'
      : "";
    return '<section class="screen"><span class="tag">Evaluacion final · 25 puntos</span><h2>Comprueba lo aprendido</h2><p>Cada respuesta correcta vale 5 puntos.</p>' +
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
      ? "Completa el caso, inventario, clasificacion, priorizacion y evaluacion final."
      : state.score >= 85
        ? "Excelente. Tienes una lectura clara de tus activos y puedes avanzar hacia matriz de riesgos."
        : state.score >= 70
          ? "Buen avance. Refuerza clasificacion de activos criticos y priorizacion de proteccion."
          : "Completado con recomendaciones: vuelve a revisar que activos recuperan cuentas, afectan dinero o concentran informacion sensible.";
    return '<section class="screen center"><span class="tag">Resultados</span><h2>Tu resultado en OVA U2-01</h2>' +
      '<div class="result-score" style="--score:' + state.score + '%">' + state.score + '<small>/100</small></div><h3>Estado: ' + statusLabel() + '</h3><p class="lead">' + recommendation + '</p>' +
      '<div class="metric-grid">' +
      metric("Caso inicial", state.completed.case ? getCaseScore() + "/15" : "Pendiente") +
      metric("Activos identificados", state.selectedAssets.length + " activos") +
      metric("Inventario", state.completed.inventory ? getInventoryScore() + "/20" : "Pendiente") +
      metric("Clasificacion", state.completed.classification ? getClassificationScore() + "/25" : "Pendiente") +
      metric("Priorizacion", state.completed.priority ? getPriorityScore() + "/15" : "Pendiente") +
      metric("Evaluacion", state.completed.quiz ? getQuizScore() + "/25" : "Pendiente") +
      '</div><div class="reading-block"><h3>Recomendaciones personalizadas</h3>' + listItems(resultRecommendations()) + '</div>' +
      '<div class="notice asset"><strong>Proxima OVA:</strong> vulnerabilidades y configuraciones inseguras. Tu inventario sera la base para analizar riesgos.</div>' +
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

  function submitInventory() {
    state.selectedAssets = Array.from(app.querySelectorAll('input[name="asset"]:checked')).map(function (input) { return input.value; });
    if (state.selectedAssets.length < 8) {
      state.completed.inventory = false;
      saveProgress();
      render();
      return showInlineError("Selecciona minimo 8 activos para completar el inventario.");
    }
    state.completed.inventory = true;
    saveProgress();
    render();
  }

  function submitClassification() {
    var answers = {};
    for (var i = 0; i < classificationCases.length; i += 1) {
      var select = document.getElementById("classification-" + i);
      if (!select.value) return showInlineError("Clasifica los seis casos antes de calificar.");
      answers[i] = select.value;
    }
    state.answers.classifications = answers;
    state.completed.classification = true;
    saveProgress();
    render();
  }

  function submitPriority() {
    var answers = {};
    var values = [];
    for (var i = 0; i < priorityOrder.length; i += 1) {
      var select = document.getElementById("priority-" + i);
      if (!select.value) return showInlineError("Completa las seis posiciones de prioridad.");
      answers[i] = select.value;
      values.push(select.value);
    }
    if (new Set(values).size !== values.length) return showInlineError("No repitas activos en la priorizacion.");
    state.answers.priority = answers;
    state.completed.priority = true;
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
    Scorm.setLocation(state.screen);
    Scorm.saveSuspendData({
      screen: state.screen,
      score: state.score,
      answers: state.answers,
      selectedAssets: state.selectedAssets,
      classifications: state.answers.classifications,
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
    if (state.answers.case === "B") return 15;
    if (state.answers.case === "A" || state.answers.case === "D") return 4;
    return 0;
  }

  function getInventoryScore() {
    var count = state.selectedAssets.length;
    if (count >= 12) return 20;
    if (count >= 8) return 15;
    if (count >= 4) return 8;
    return 0;
  }

  function getClassificationScore() {
    if (!state.completed.classification) return 0;
    var correct = classificationCases.reduce(function (sum, item, index) {
      return sum + (state.answers.classifications[index] === item.answer ? 1 : 0);
    }, 0);
    return Math.round((correct / classificationCases.length) * 25);
  }

  function getPriorityScore() {
    if (!state.completed.priority) return 0;
    var selected = priorityOrder.map(function (_item, index) { return state.answers.priority[index]; });
    var exact = selected.every(function (item, index) { return item === priorityOrder[index]; });
    if (exact) return 15;
    var firstFour = selected.slice(0, 4).every(function (item, index) { return item === priorityOrder[index]; });
    if (firstFour) return 12;
    var critical = ["Correo principal", "Cuenta bancaria", "Celular personal"];
    var criticalInTopThree = critical.filter(function (item) { return selected.slice(0, 3).indexOf(item) >= 0; }).length;
    if (criticalInTopThree >= 2) return 8;
    var criticalInTopFour = critical.filter(function (item) { return selected.slice(0, 4).indexOf(item) >= 0; }).length;
    if (criticalInTopFour >= 2) return 6;
    return 0;
  }

  function getQuizScore() {
    if (!state.completed.quiz) return 0;
    return quiz.reduce(function (sum, item, index) {
      return sum + (state.answers.quiz[index] === item.correct ? 5 : 0);
    }, 0);
  }

  function caseOption(value, text) {
    return '<label class="option"><input type="radio" name="case" value="' + value + '"' + (state.answers.case === value ? " checked" : "") + '><span><strong>' + value + '.</strong> ' + text + '</span></label>';
  }

  function levelOption(value, label, selected) {
    return '<option value="' + escapeHtml(value) + '"' + (selected === value ? " selected" : "") + '>' + label + '</option>';
  }

  function classificationFeedbackList() {
    return '<div class="reading-block"><h3>Retroalimentacion por caso</h3><ul>' + classificationCases.map(function (item, index) {
      var answer = state.answers.classifications[index];
      var ok = answer === item.answer;
      return '<li><strong>Caso ' + (index + 1) + ':</strong> ' + (ok ? "Correcto. " : "Revisa. ") + item.feedback + '</li>';
    }).join("") + '</ul></div>';
  }

  function resultRecommendations() {
    var items = ["Protege primero tu correo principal.", "Activa MFA en cuentas criticas.", "Identifica donde estan tus documentos importantes.", "Evita tener copias unicas.", "Clasifica informacion sensible.", "Protege cuentas financieras.", "Revisa dispositivos con sesiones abiertas.", "Manten actualizado tu inventario digital.", "No guardes datos sensibles sin proteccion.", "Prepara la proxima OVA: vulnerabilidades y configuraciones inseguras."];
    if (state.selectedAssets.length < 12) items.unshift("Amplia tu inventario: intenta reconocer al menos 12 activos digitales relevantes.");
    if (getPriorityScore() < 12) items.unshift("Revisa la prioridad: correo, banco y celular suelen ir antes que entretenimiento o redes secundarias.");
    return items;
  }

  function feedbackClass(score, max) {
    if (score >= Math.ceil(max * 0.8)) return "correct";
    if (score > 0) return "partial";
    return "incorrect";
  }

  function infoCard(icon, title, text) {
    return '<article class="card"><span class="icon" aria-hidden="true">' + icon + '</span><h3>' + title + '</h3><p>' + text + '</p></article>';
  }

  function metric(title, value) {
    return '<article class="metric"><strong>' + value + '</strong><span>' + title + '</span></article>';
  }

  function riskPiece(title, text) {
    return '<article class="risk-piece"><strong>' + title + '</strong><p>' + text + '</p></article>';
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
