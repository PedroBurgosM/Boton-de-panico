# 🚨 Sistema de Botón de Pánico Escolar para Computadores

Sistema web en tiempo real diseñado específicamente para colegios donde **no está permitido el uso de teléfonos celulares**. Conecta las salas de clases con los computadores fijos de **Inspectoría General, Enfermería y Convivencia Escolar**.

---

## 🚀 Cómo probarlo ahora mismo (En 10 segundos)

Tienes dos formas inmediatas de probarlo:

### Forma 1: Demo Instantánea (Sin instalar nada)
1. Entra a la carpeta `public` y haz doble clic en [demo_sin_servidor.html](file:///c:/Users/Admin%20Woodland/Desktop/PAncho/Boton%20de%20pánico/public/demo_sin_servidor.html).
2. Se abrirá en tu navegador un simulador de pantalla dividida:
   - **Izquierda:** La botonera de la sala de clases (Sala 204).
   - **Derecha:** La central de monitoreo de Inspectoría / Enfermería.
3. Pulsa cualquier botón de pánico: escucharás la sirena sintetizada y verás cómo se actualiza en tiempo real.

### Forma 2: Con Servidor Completo en Red
1. Ejecuta con doble clic el archivo [iniciar_servidor.bat](file:///c:/Users/Admin%20Woodland/Desktop/PAncho/Boton%20de%20pánico/iniciar_servidor.bat).
2. Se abrirá automáticamente la central en `http://localhost:3000`.
3. Podrás abrir varias pestañas o conectar otros computadores de tu misma red Wi-Fi o cable.

---

## 📁 Estructura del Proyecto

```
Boton de pánico/
├── server.js                   # Servidor central en Node.js + WebSockets (Socket.io)
├── package.json                # Configuración y dependencias
├── iniciar_servidor.bat        # Lanzador automático de 1 clic para Windows
├── crear_acceso_escritorio.bat # Asistente para crear accesos directos en el escritorio
├── README.md                   # Esta guía
│
└── public/
    ├── index.html              # Portal de bienvenida y datos de red
    ├── sala.html               # Interfaz del botón de pánico en la sala de clases
    ├── receptor.html           # Panel de control con sirena para Inspectoría/Enfermería
    ├── admin.html              # Administrador de salas y generador de enlaces
    ├── demo_sin_servidor.html  # Simulador visual rápido
    ├── css/
    │   └── styles.css          # Estilos visuales, animaciones de alerta y contrastes
    └── js/
        └── audio.js            # Generador de sirenas con Web Audio API (100% sintetizado)
```

---

## 🛠️ Cómo funciona cada módulo

### 1. En la Sala de Clases (`sala.html`)
- **Acceso:** Se deja como icono en el escritorio: *"🚨 ALERTA - SALA 101"*.
- **Identificación automática:** La sala ya viene preconfigurada por su URL (`?sala=Sala-101`) o se guarda en la memoria del navegador. El profesor no pierde tiempo escribiendo nada.
- **Categorías claras:**
  - 🚨 **Inspectoría General:** Pelea, riña, desorden grave, intrusos, escape.
  - 🩺 **Enfermería:** Desmayo, convulsión, golpe, corte, vómitos, crisis de salud.
  - 🤝 **Convivencia Escolar:** Desregulación emocional severa, contención, mediación urgente.
  - 🆘 **Pánico General:** Botón de un solo clic ante cualquier emergencia crítica.
- **Confirmación en pantalla:** Una vez presionado, la pantalla cambia a rojo y muestra: *«ALERTA ENVIADA»*. Cuando un inspector pulsa *"Voy en camino"*, la pantalla de la sala se actualiza de inmediato avisando: *«🏃 Inspector Juan Pérez va en camino a tu sala»*.
- **Anti-error:** Botón de *"Cancelar alerta (Falsa alarma)"* para evitar movilizaciones innecesarias si alguien presionó por equivocación.

### 2. En los Computadores Receptores (`receptor.html`)
- Se deja una pestaña abierta en los computadores fijos de:
  - Inspector General y Subdirección.
  - Enfermería.
  - Convivencia Escolar / Orientación.
  - Inspectores de patio.
- **Alarma audible continua:** Suena una sirena fuerte a través de los parlantes del computador receptor hasta que alguien tome el llamado.
- **Notificaciones nativas de Windows:** Aunque la ventana esté minimizada o el personal esté trabajando en el Libro de Clases Digital, Windows arroja la notificación en la esquina inferior de la pantalla.
- **Botón "🏃 Voy en Camino":** Quien se dirija a la sala presiona el botón. Al instante silencia la alarma y les avisa a los demás inspectores quién está atendiendo el caso.
- **Botón "✅ Marcar Resuelta":** Cierra el incidente y lo archiva en el historial con hora exacta y tiempo de respuesta.

---

## 🌐 Dónde Montarlo (2 Alternativas)

### Alternativa 1: En la Red Local del Colegio (Intranet)
1. Elige un computador del colegio que permanezca siempre encendido durante la jornada (por ejemplo, el PC de Inspectoría General o un servidor local).
2. Ejecuta `iniciar_servidor.bat`.
3. La consola te mostrará la IP local (ejemplo: `http://192.168.1.50:3000`).
4. Cualquier computador conectado a la misma red puede abrir esa dirección en Chrome o Edge.

### Alternativa 2: En la Nube Gratuita (Render / Railway / Glitch)
Si prefieres no depender de dejar un computador encendido o si las salas están en redes Wi-Fi separadas:
1. Puedes subir esta carpeta a un servicio de hosting en la nube como **[Render.com](https://render.com)** o **[Railway.app](https://railway.app)** (ambos tienen planes gratuitos).
2. Te darán un enlace público seguro (ejemplo: `https://alerta-colegio.onrender.com`).
3. **Ventajas:** Funciona de inmediato sin configurar routers, firewalls ni IPs locales.

---

## 🖥️ Cómo crear el acceso directo en cada sala (Modo App)

Para que el botón se abra como si fuera un programa nativo de Windows (sin barra de direcciones ni pestañas de navegación):

1. **Opción Rápida:** Ejecuta con doble clic el archivo [crear_acceso_escritorio.bat](file:///c:/Users/Admin%20Woodland/Desktop/PAncho/Boton%20de%20pánico/crear_acceso_escritorio.bat) y sigue las instrucciones en pantalla.
2. **Opción Manual:**
   - Clic derecho en el escritorio de Windows > **Nuevo** > **Acceso directo**.
   - En la ubicación del elemento escribe:
     ```cmd
     "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="http://IP_SERVIDOR:3000/sala.html?sala=Sala-101"
     ```
   - Nómbralo: **🚨 ALERTA - SALA 101**.

---

## 🔒 Buenas Prácticas para el Colegio

1. **Volumen de parlantes:** Asegúrate de que los computadores de Inspectoría y Enfermería tengan parlantes conectados con el volumen al 70%-80%.
2. **Permisos de navegador:** Al abrir por primera vez `receptor.html`, haz clic en *"🔔 Notificaciones de Windows"* y selecciona *"Permitir"*.
3. **Simulacro inicial:** Realiza una prueba controlada de 5 minutos avisando a los profesores para que conozcan cómo luce y cómo suena el sistema antes de iniciar su uso oficial.
