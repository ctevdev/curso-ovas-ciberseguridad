OVA 1 - INTRODUCCIÓN A LA CIBERSEGURIDAD Y AMENAZAS COMUNES

Esta carpeta forma parte de un paquete SCORM 1.2 independiente.

CÓMO COMPRIMIR

Entre en la carpeta ova-01-introduccion-ciberseguridad y comprima directamente:

- index.html
- imsmanifest.xml
- css
- js
- assets

imsmanifest.xml debe quedar en la raíz del ZIP.

CÓMO SUBIR A MOODLE

1. Añada una actividad "Paquete SCORM".
2. Suba el archivo ZIP.
3. Configure la calificación máxima en 100.
4. Seleccione "Calificación más alta" o "Último intento".
5. Active finalización por estado aprobado o completado.

CONFIGURACIÓN Y PRUEBA RECOMENDADA

- Abra la OVA como estudiante de prueba.
- Complete las actividades y pulse "Finalizar OVA".
- Revise en el reporte SCORM:
  - cmi.core.score.raw: puntaje entre 0 y 100.
  - cmi.core.lesson_status: passed o completed.
- Salga antes de finalizar y vuelva a entrar para comprobar que la OVA recupera
  la última pantalla y las respuestas mediante cmi.suspend_data.

La OVA también funciona localmente. Cuando no encuentra la API SCORM, guarda el
progreso en localStorage del navegador.

IDENTIDAD Y RECURSOS VISUALES

La OVA utiliza una identidad azul marino y cian con motivos hexagonales,
escudos, candados, dispositivos y recursos visuales del material de referencia
"Diplomado.pptx" suministrado para el proyecto.

Archivos visuales principales:

- logo-unicartagena-ctev.png: marca institucional visible en la cabecera y cierre.
- fondo-hexagonal-azul.jpeg: fondo tecnológico basado en la presentación.
- candado-digital.png: imagen de protección digital.
- escudo-candado.png: imagen de protección de cuentas e identidad.
- celular-alerta-real.png: imagen de alerta en celular.
- phishing-correo.png: imagen asociada a phishing.
- sello-virus.png: imagen asociada a malware.
- globo-digital.png: imagen asociada a vida digital conectada.
- escudo-llave.png: imagen asociada a identidad y acceso.

También se incluyen SVG de respaldo y apoyo visual. No se cargan imágenes desde
internet.

RECURSOS EXTERNOS OPCIONALES

La sección "Ayuda / Aprende más" incluye enlaces de profundización que requieren
internet. Estos recursos no son obligatorios para completar la OVA ni afectan el
puntaje SCORM:

- Google Cybersecurity Certificate.
- Foundations of Cybersecurity - Google/Coursera.
- NIST Cybersecurity Framework 2.0.
- Google Phishing Quiz.

El archivo MATERIAL_AYUDA_OVA1.txt contiene la versión ampliada del material de
apoyo pedagógico usado dentro de la OVA.
