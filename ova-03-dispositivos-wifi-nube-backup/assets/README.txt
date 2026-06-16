OVA 3 — Seguridad en Dispositivos, Redes WiFi, Nube y Copias de Seguridad

Objetivo
Evaluar y mejorar la seguridad de dispositivos personales, redes WiFi, servicios en la nube, copias de seguridad y hábitos básicos de privacidad digital.

Estructura del paquete
- index.html
- imsmanifest.xml
- css/styles.css
- js/scorm-api.js
- js/app.js
- assets/README.txt
- assets/MATERIAL_AYUDA_OVA3.txt
- assets gráficos locales del curso

Cómo comprimir correctamente
1. Entrar dentro de la carpeta ova-03-dispositivos-wifi-nube-backup.
2. Seleccionar index.html, imsmanifest.xml, css, js y assets.
3. Comprimir esos elementos en ZIP.
4. No comprimir la carpeta externa como raíz del ZIP. imsmanifest.xml debe quedar directamente en la raíz del archivo comprimido.

Cómo subir a Moodle
1. Activar edición en el curso.
2. Añadir actividad o recurso.
3. Seleccionar Paquete SCORM.
4. Subir el ZIP de la OVA.
5. Configurar calificación máxima: 100.
6. Definir intentos permitidos según criterio docente.
7. Método de calificación sugerido: calificación más alta o último intento.
8. Activar seguimiento de finalización cuando el SCORM reporte aprobado o completado.

Validación recomendada
1. Entrar con usuario estudiante.
2. Completar la OVA y presionar Finalizar OVA.
3. Revisar reportes SCORM.
4. Confirmar cmi.core.score.raw entre 0 y 100.
5. Confirmar cmi.core.lesson_status:
   - passed si el puntaje es 70 o más.
   - completed si el puntaje es menor a 70 pero se completaron las actividades.
   - incomplete si faltan actividades.
6. Salir antes de finalizar, volver a entrar y confirmar que se retoma el progreso.

Notas
- La OVA funciona localmente con localStorage si no encuentra API SCORM.
- No guarda contraseñas reales, documentos, teléfonos, datos bancarios ni información privada.
- Los recursos externos aparecen como ampliación opcional y requieren internet, pero no son necesarios para completar el SCORM.
