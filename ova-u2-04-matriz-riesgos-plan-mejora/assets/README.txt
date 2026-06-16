OVA U2-04 - Matriz basica de riesgos digitales y plan de mejora

Objetivo
Construir una matriz basica de riesgos digitales, relacionando activos,
amenazas, vulnerabilidades, impacto, probabilidad, nivel de riesgo, controles y
acciones de mejora.

Estructura del paquete
- index.html
- imsmanifest.xml
- css/styles.css
- js/scorm-api.js
- js/app.js
- assets/README.txt
- assets/MATERIAL_AYUDA_U2_OVA4.txt
- assets/imagenes institucionales y de apoyo

Como comprimir correctamente
1. Entre dentro de la carpeta ova-u2-04-matriz-riesgos-plan-mejora.
2. Seleccione index.html, imsmanifest.xml, css, js y assets.
3. Comprima esos elementos en un archivo ZIP.
4. No comprima la carpeta externa como raiz del ZIP.
5. Verifique que imsmanifest.xml quede directamente en la raiz del ZIP.

Como subir a Moodle
1. Active la edicion del curso.
2. Seleccione "Anadir una actividad o un recurso".
3. Seleccione "Paquete SCORM".
4. Suba el ZIP de esta OVA.
5. Configure calificacion maxima en 100.
6. Defina intentos permitidos segun el criterio docente.
7. Use como metodo de calificacion "Calificacion mas alta" o "Ultimo intento".
8. Active seguimiento de finalizacion.
9. Configure finalizacion cuando el SCORM reporte estado aprobado o completado.

Validacion SCORM
1. Ingrese con usuario estudiante de prueba.
2. Complete caso, mini preguntas, matriz, controles, plan, evaluacion y exportacion.
3. Pulse "Finalizar OVA".
4. Revise los reportes SCORM de Moodle.
5. Confirme que cmi.core.score.raw este entre 0 y 100.
6. Confirme lesson_status:
   - passed para puntaje mayor o igual a 70 con matriz y plan completos.
   - completed para puntaje menor a 70 con matriz y plan completos.
   - incomplete si faltan matriz o plan de mejora.
7. Cierre antes de finalizar y vuelva a entrar para confirmar que retoma la
   pantalla y conserva respuestas mediante cmi.suspend_data.

Privacidad
La OVA no solicita ni guarda contrasenas reales, datos bancarios completos,
telefonos, documentos, codigos de verificacion ni informacion privada
innecesaria. Las acciones de mejora se validan para evitar datos sensibles.

Exportacion
La OVA permite descargar un archivo HTML local con la matriz y el plan usando
Blob en JavaScript. La descarga es opcional y no requiere internet.
