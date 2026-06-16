OVA 5 - Producto Final: Plan Personal de Ciberhigiene
======================================================

Tipo de paquete:
- SCORM 1.2
- HTML, CSS y JavaScript vanilla
- Sin backend, CDN, npm ni dependencias externas obligatorias

Estructura:
- index.html: entrada principal de la OVA.
- imsmanifest.xml: manifiesto SCORM 1.2.
- css/styles.css: identidad visual, componentes de diagnostico, resumen y exportacion.
- js/scorm-api.js: adaptador SCORM con persistencia local de respaldo.
- js/app.js: navegacion, puntaje, compromisos, suspend_data y descarga del plan.
- assets/MATERIAL_AYUDA_OVA5.txt: material de ampliacion local.
- assets/*.png / *.jpeg: logos, fondo e imagenes de apoyo.

Llave local:
- ova05_scorm_data

Seguimiento SCORM:
- cmi.core.score.raw entre 0 y 100.
- cmi.core.lesson_status:
  - passed si el plan esta completo y el puntaje es igual o superior a 70.
  - completed si el plan esta completo y el puntaje es inferior a 70.
  - incomplete si faltan secciones o compromisos.
- cmi.core.lesson_location guarda la pantalla actual.
- cmi.suspend_data guarda pantalla, puntaje, respuestas marcadas, compromisos,
  fecha de implementacion, estado final y marca de descarga.

Privacidad:
- La OVA no solicita contrasenas reales, codigos, numeros de tarjeta, cuentas
  bancarias ni documentos de identidad.
- El alias es opcional.
- La descarga del plan se genera localmente en el navegador mediante Blob.

Puntaje:
- A. Cuentas y contrasenas: 30 puntos.
- B. Dispositivos y redes: 25 puntos.
- C. Copias de seguridad: 20 puntos.
- D. Deteccion de fraudes: 25 puntos.

Resultado:
- 90 a 100: Excelente.
- 60 a 89: Bien con oportunidades.
- Menos de 60: Plan urgente.

Empaquetado:
- Comprimir index.html, imsmanifest.xml, css, js y assets directamente en la raiz
  del ZIP.
- No comprimir la carpeta externa como raiz del paquete.
