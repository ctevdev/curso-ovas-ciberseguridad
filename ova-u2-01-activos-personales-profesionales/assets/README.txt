OVA U2-01 - Activos personales y profesionales
==============================================

Unidad:
- Unidad 2 - Gestion de riesgos y respuesta inicial.

Nombre:
- OVA 1 - Activos personales y profesionales: informacion, dispositivos,
  cuentas y servicios.

Objetivo:
- Identificar y clasificar activos digitales personales, academicos o laborales,
  reconociendo su importancia, dependencia, sensibilidad e impacto potencial
  frente a incidentes de seguridad.

Tipo de paquete:
- SCORM 1.2.
- HTML5, CSS3 y JavaScript vanilla.
- Sin backend, CDN, frameworks, npm ni dependencias externas obligatorias.
- Funciona localmente y dentro de Moodle.

Estructura:
- index.html
- imsmanifest.xml
- css/styles.css
- js/scorm-api.js
- js/app.js
- assets/README.txt
- assets/MATERIAL_AYUDA_U2_OVA1.txt
- assets/*.png / *.jpeg

Llave local:
- ova_u2_01_scorm_data

Seguimiento SCORM:
- cmi.core.score.raw entre 0 y 100.
- cmi.core.score.min = 0.
- cmi.core.score.max = 100.
- cmi.core.lesson_location guarda la pantalla actual.
- cmi.suspend_data guarda pantalla, puntaje, respuestas, activos seleccionados,
  clasificaciones, actividades completadas y estado final.
- lesson_status:
  - passed si el puntaje es igual o superior a 70.
  - completed si el puntaje es inferior a 70 pero la OVA esta completa.
  - incomplete si faltan actividades obligatorias.

Puntaje:
- Caso inicial: 15 puntos.
- Inventario de activos: 20 puntos.
- Clasificacion por criticidad: 25 puntos.
- Priorizacion de proteccion: 15 puntos.
- Evaluacion final: 25 puntos.
- Total: 100 puntos.

Privacidad:
- La OVA no solicita ni guarda contrasenas reales, datos bancarios, documentos
  de identidad, telefonos, direcciones, codigos de verificacion ni correos
  personales obligatorios.
- El inventario se trabaja por categorias, no por datos reales.

Como comprimir:
1. Entrar dentro de la carpeta ova-u2-01-activos-personales-profesionales.
2. Seleccionar index.html, imsmanifest.xml, css, js y assets.
3. Comprimir esos elementos en ZIP.
4. No comprimir la carpeta externa como raiz del ZIP.
5. imsmanifest.xml debe quedar directamente en la raiz del paquete.

Como subir a Moodle:
1. Activar edicion del curso.
2. Anadir una actividad o recurso.
3. Seleccionar Paquete SCORM.
4. Subir el ZIP.
5. Calificacion maxima: 100.
6. Intentos permitidos: segun criterio docente.
7. Metodo de calificacion: calificacion mas alta o ultimo intento.
8. Activar seguimiento de finalizacion cuando el SCORM reporte estado aprobado
   o completado.

Validacion:
1. Entrar con usuario estudiante.
2. Completar caso, inventario, clasificacion, priorizacion y evaluacion.
3. Pulsar Finalizar OVA.
4. Revisar en reportes SCORM:
   - score.raw.
   - lesson_status.
   - lesson_location.
5. Salir antes de finalizar y volver a entrar para confirmar que se retoma el
   progreso desde cmi.suspend_data.
