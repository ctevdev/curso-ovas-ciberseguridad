(function (global) {
  "use strict";

  var api = null;
  var initialized = false;
  var localKey = "ova02_scorm_data";
  var localData = {};

  function loadLocal() {
    try { localData = JSON.parse(localStorage.getItem(localKey) || "{}"); }
    catch (error) { localData = {}; }
  }

  function saveLocal() {
    try { localStorage.setItem(localKey, JSON.stringify(localData)); }
    catch (error) { console.warn("No fue posible guardar el progreso local.", error); }
  }

  function findApi(win) {
    var attempts = 0;
    while (win && attempts < 10) {
      try {
        if (win.API) return win.API;
        if (win.parent && win.parent !== win) win = win.parent;
        else break;
      } catch (error) { break; }
      attempts += 1;
    }
    try {
      if (global.opener && global.opener.API) return global.opener.API;
    } catch (error) { /* Sin acción. */ }
    return null;
  }

  function initialize() {
    if (initialized) return true;
    api = findApi(global);
    loadLocal();
    if (api) {
      initialized = api.LMSInitialize("") === "true";
      if (!initialized) console.warn("SCORM: LMSInitialize no respondió correctamente.");
    } else {
      initialized = true;
      console.info("SCORM API no encontrada. OVA ejecutándose en modo local.");
    }
    return initialized;
  }

  function getValue(element) {
    if (!initialized) initialize();
    if (api) return api.LMSGetValue(element) || "";
    return localData[element] || "";
  }

  function setValue(element, value) {
    if (!initialized) initialize();
    var text = String(value);
    if (api) return api.LMSSetValue(element, text) === "true";
    localData[element] = text;
    saveLocal();
    return true;
  }

  function commit() {
    if (api) return api.LMSCommit("") === "true";
    saveLocal();
    return true;
  }

  function finish() {
    commit();
    if (api) {
      var result = api.LMSFinish("") === "true";
      initialized = false;
      return result;
    }
    return true;
  }

  function setScore(score) {
    setValue("cmi.core.score.min", "0");
    setValue("cmi.core.score.max", "100");
    return setValue("cmi.core.score.raw", Math.max(0, Math.min(100, Math.round(score))));
  }

  function setStatus(status) { return setValue("cmi.core.lesson_status", status); }
  function setLocation(location) { return setValue("cmi.core.lesson_location", location); }
  function getLocation() { return getValue("cmi.core.lesson_location"); }

  function saveSuspendData(data) { return setValue("cmi.suspend_data", JSON.stringify(data)); }
  function loadSuspendData() {
    var raw = getValue("cmi.suspend_data");
    if (!raw) return null;
    try { return JSON.parse(raw); }
    catch (error) { console.warn("No fue posible interpretar cmi.suspend_data.", error); return null; }
  }

  function resetLocal() {
    localData = {};
    try { localStorage.removeItem(localKey); } catch (error) { /* Sin acción. */ }
  }

  global.Scorm = {
    initialize: initialize,
    finish: finish,
    getValue: getValue,
    setValue: setValue,
    commit: commit,
    setScore: setScore,
    setStatus: setStatus,
    saveSuspendData: saveSuspendData,
    loadSuspendData: loadSuspendData,
    setLocation: setLocation,
    getLocation: getLocation,
    resetLocal: resetLocal
  };
}(window));

