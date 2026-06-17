OVA U3-02 - Analisis defensivo de casos cotidianos y organizacion de evidencias
================================================================================

Objetivo
--------
Analizar casos cotidianos de incidentes digitales, organizar evidencias basicas y
construir una linea de tiempo simple para apoyar la respuesta, el reporte y la
recuperacion inicial.

Archivos principales
--------------------
- index.html
- imsmanifest.xml
- css/styles.css
- js/scorm-api.js
- js/app.js
- assets/

Como comprimir correctamente
----------------------------
1. Entrar dentro de la carpeta ova-u3-02-analisis-defensivo-evidencias.
2. Seleccionar index.html, imsmanifest.xml, css, js y assets.
3. Comprimir esos elementos en un archivo ZIP.
4. No comprimir la carpeta externa como raiz del ZIP.
5. Verificar que imsmanifest.xml quede directamente en la raiz del ZIP.

Como subir a Moodle
-------------------
1. Activar edicion en el curso.
2. Seleccionar "Anadir una actividad o un recurso".
3. Elegir "Paquete SCORM".
4. Subir el ZIP de esta OVA.
5. Configurar calificacion maxima: 100.
6. Definir intentos permitidos segun criterio docente.
7. Usar "Calificacion mas alta" o "Ultimo intento".
8. Activar seguimiento de finalizacion cuando el SCORM reporte estado aprobado o
   completado.

Validacion recomendada
----------------------
1. Entrar con un usuario estudiante de prueba.
2. Completar la OVA.
3. Verificar que score.raw se reporte entre 0 y 100.
4. Verificar lesson_status:
   - passed si el puntaje es 70 o superior.
   - completed si el puntaje es menor a 70 y se finalizo la OVA.
   - incomplete si faltan actividades.
5. Salir antes de finalizar y volver a entrar para confirmar que retoma la
   ultima pantalla y conserva respuestas.

Notas de privacidad
-------------------
La OVA no solicita ni almacena contrasenas reales, codigos SMS, tokens, PIN,
CVV, tarjetas completas, documentos de identidad, direcciones, telefonos reales,
correos personales obligatorios ni capturas reales.

Recursos
--------
El archivo MATERIAL_AYUDA_U3_OVA2.txt se incluye como material de apoyo dentro
del paquete. Los enlaces externos mostrados en la OVA son opcionales y no son
necesarios para completar el SCORM.
