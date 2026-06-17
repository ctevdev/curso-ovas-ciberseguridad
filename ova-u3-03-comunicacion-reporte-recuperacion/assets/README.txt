OVA U3-03 - Comunicacion, reporte y recuperacion despues de un incidente digital
================================================================================

Objetivo
--------
Esta OVA ensena a comunicar y reportar incidentes digitales de forma clara y
segura, aplicar acciones basicas de recuperacion y registrar aprendizajes para
reducir la posibilidad de reincidencia.

Contenido del paquete
---------------------
- index.html
- imsmanifest.xml
- css/styles.css
- js/scorm-api.js
- js/app.js
- assets/logo-unicartagena-ctev.png
- assets/fondo-hexagonal-azul.jpeg
- assets/celular-alerta-real.png
- assets/candado-digital.png
- assets/escudo-candado.png
- assets/escudo-llave.png
- assets/phishing-correo.png
- assets/MATERIAL_AYUDA_U3_OVA3.txt

Como comprimir correctamente
---------------------------
1. Entre dentro de la carpeta ova-u3-03-comunicacion-reporte-recuperacion.
2. Seleccione index.html, imsmanifest.xml, css, js y assets.
3. Comprima esos elementos en un archivo ZIP.
4. No comprima la carpeta externa como raiz del ZIP.
5. Verifique que imsmanifest.xml quede directamente en la raiz del ZIP.

Como subir a Moodle
-------------------
1. Active la edicion del curso.
2. Seleccione "Anadir una actividad o un recurso".
3. Elija "Paquete SCORM".
4. Suba el ZIP de esta OVA.
5. Configure calificacion maxima en 100.
6. Configure los intentos permitidos segun criterio docente.
7. Use "Calificacion mas alta" o "Ultimo intento" como metodo de calificacion.
8. Active seguimiento de finalizacion cuando el SCORM reporte aprobado o completado.

Configuracion recomendada
-------------------------
- Estandar: SCORM 1.2.
- Puntaje maximo: 100.
- Aprobacion sugerida: 70 puntos.
- Estado esperado:
  - passed: score.raw >= 70 con actividades completadas.
  - completed: score.raw < 70 con actividades completadas.
  - incomplete: actividades obligatorias incompletas.

Validacion en Moodle
--------------------
1. Ingrese con una cuenta de estudiante de prueba.
2. Complete las 18 pantallas y pulse "Finalizar OVA".
3. Abra reportes SCORM.
4. Confirme que cmi.core.score.raw este entre 0 y 100.
5. Confirme que cmi.core.lesson_status sea passed o completed al finalizar.
6. Salga antes de terminar, vuelva a ingresar y verifique que retoma progreso.

Privacidad y datos sensibles
----------------------------
La OVA no solicita ni guarda contrasenas reales, codigos SMS, tokens, PIN, CVV,
numeros completos de tarjeta, documentos, direcciones, telefonos reales,
correos personales obligatorios, capturas reales ni informacion privada.

Uso sin internet
----------------
La OVA funciona localmente y dentro de Moodle sin conexion. Los recursos externos
del material de ayuda son opcionales y solo sirven para ampliar conocimiento.
