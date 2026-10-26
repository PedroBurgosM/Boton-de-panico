const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'historial.json');
const SALAS_FILE = path.join(__dirname, 'salas.json');

// Detectar la ubicación de la carpeta public (por si se subió dentro de una subcarpeta en GitHub)
let publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  const posibles = [
    path.join(__dirname, 'Boton de pánico', 'public'),
    path.join(__dirname, 'Boton de panico', 'public'),
    path.join(__dirname, 'src', 'public')
  ];
  for (const p of posibles) {
    if (fs.existsSync(p)) {
      publicDir = p;
      break;
    }
  }
}

app.use(express.json());
app.use(express.static(publicDir));

// Rutas directas y amigables (con y sin .html)
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/sala', (req, res) => {
  res.sendFile(path.join(publicDir, 'sala.html'));
});

app.get('/receptor', (req, res) => {
  res.sendFile(path.join(publicDir, 'receptor.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicDir, 'admin.html'));
});

app.get('/demo', (req, res) => {
  res.sendFile(path.join(publicDir, 'demo_sin_servidor.html'));
});

// Salas por defecto si no existe salas.json
const SALAS_DEFAULT = [
  { id: 'sala-101', nombre: 'Sala 101', pabellon: 'Pabellón 1 - Piso 1' },
  { id: 'sala-102', nombre: 'Sala 102', pabellon: 'Pabellón 1 - Piso 1' },
  { id: 'sala-103', nombre: 'Sala 103', pabellon: 'Pabellón 1 - Piso 1' },
  { id: 'sala-201', nombre: 'Sala 201', pabellon: 'Pabellón 1 - Piso 2' },
  { id: 'sala-202', nombre: 'Sala 202', pabellon: 'Pabellón 1 - Piso 2' },
  { id: 'sala-203', nombre: 'Sala 203', pabellon: 'Pabellón 1 - Piso 2' },
  { id: 'lab-computacion', nombre: 'Lab de Computación', pabellon: 'Pabellón Tecnológico' },
  { id: 'lab-ciencias', nombre: 'Laboratorio de Ciencias', pabellon: 'Pabellón 2' },
  { id: 'biblioteca', nombre: 'Biblioteca Escolar', pabellon: 'Pabellón Central' },
  { id: 'gimnasio', nombre: 'Gimnasio / Patio Cubierto', pabellon: 'Zona Deportiva' }
];

// Cargar o inicializar salas
function cargarSalas() {
  if (fs.existsSync(SALAS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(SALAS_FILE, 'utf-8'));
    } catch (e) {
      console.error('Error leyendo salas.json:', e);
    }
  }
  fs.writeFileSync(SALAS_FILE, JSON.stringify(SALAS_DEFAULT, null, 2));
  return SALAS_DEFAULT;
}

// Cargar o inicializar historial
function cargarHistorial() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (e) {
      console.error('Error leyendo historial.json:', e);
    }
  }
  return [];
}

function guardarHistorial(historial) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(historial, null, 2));
  } catch (e) {
    console.error('Error guardando historial.json:', e);
  }
}

let salas = cargarSalas();
let historialAlertas = cargarHistorial();
// Alertas activas en memoria: { id: { ...datosAlerta } }
const alertasActivas = {};

// Obtener la IP local de la máquina para mostrarla en consola
function obtenerIpLocal() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Endpoint de salud / keep-alive para Render o monitores externos
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Rutas de API REST
app.get('/api/info', (req, res) => {
  res.json({
    ip: obtenerIpLocal(),
    puerto: PORT,
    alertasActivas: Object.values(alertasActivas),
    totalSalas: salas.length
  });
});

app.get('/api/salas', (req, res) => {
  res.json(salas);
});

app.post('/api/salas', (req, res) => {
  if (Array.isArray(req.body)) {
    salas = req.body;
    fs.writeFileSync(SALAS_FILE, JSON.stringify(salas, null, 2));
    io.emit('salas_actualizadas', salas);
    return res.json({ ok: true, salas });
  }
  res.status(400).json({ error: 'Formato inválido. Se espera una lista de salas.' });
});

app.get('/api/historial', (req, res) => {
  res.json(historialAlertas.slice(-100)); // últimas 100
});

// Endpoint HTTP alternativo para emitir alertas (si no usan socket)
app.post('/api/alerta', (req, res) => {
  const alerta = procesarNuevaAlerta(req.body);
  res.json({ ok: true, alerta });
});

// Función central para registrar y emitir una alerta
function procesarNuevaAlerta(datos) {
  const id = 'alt_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  const nuevaAlerta = {
    id,
    sala: datos.sala || 'Sala Desconocida',
    pabellon: datos.pabellon || '',
    tipo: datos.tipo || 'inspectoria', // inspectoria | enfermeria | convivencia | general
    mensaje: datos.mensaje || '',
    fechaHora: new Date().toISOString(),
    horaLegible: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    estado: 'pendiente', // pendiente | atendiendo | resuelta | cancelada
    atendidoPor: null,
    horaAtencion: null,
    resueltaPor: null,
    horaResolucion: null
  };

  alertasActivas[id] = nuevaAlerta;
  historialAlertas.push(nuevaAlerta);
  guardarHistorial(historialAlertas);

  // Emitir por WebSocket a todas las pantallas de receptores y salas
  io.emit('alerta_emitida', nuevaAlerta);
  console.log(`[🚨 ALERTA] Sala: ${nuevaAlerta.sala} | Tipo: ${nuevaAlerta.tipo} | Hora: ${nuevaAlerta.horaLegible}`);

  return nuevaAlerta;
}

// Eventos de WebSocket en tiempo real
io.on('connection', (socket) => {
  // Al conectarse, enviar el estado actual de alertas activas
  socket.emit('estado_inicial', {
    alertasActivas: Object.values(alertasActivas),
    salas
  });

  // Sala emite una alerta
  socket.on('emitir_alerta', (datos) => {
    procesarNuevaAlerta(datos);
  });

  // Receptor pulsa "Voy en camino / Atender"
  socket.on('atender_alerta', ({ idAlerta, nombreResponsable, rol }) => {
    if (alertasActivas[idAlerta]) {
      const alerta = alertasActivas[idAlerta];
      alerta.estado = 'atendiendo';
      alerta.atendidoPor = nombreResponsable || 'Inspector de turno';
      alerta.rolResponsable = rol || 'Inspectoría';
      alerta.horaAtencion = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Actualizar en historial
      const enHistorial = historialAlertas.find(a => a.id === idAlerta);
      if (enHistorial) {
        enHistorial.estado = alerta.estado;
        enHistorial.atendidoPor = alerta.atendidoPor;
        enHistorial.horaAtencion = alerta.horaAtencion;
        guardarHistorial(historialAlertas);
      }

      io.emit('alerta_actualizada', alerta);
      console.log(`[✅ ATENDIENDO] ${alerta.sala} atendida por ${alerta.atendidoPor}`);
    }
  });

  // Receptor marca alerta como resuelta
  socket.on('resolver_alerta', ({ idAlerta, resueltaPor }) => {
    if (alertasActivas[idAlerta]) {
      const alerta = alertasActivas[idAlerta];
      alerta.estado = 'resuelta';
      alerta.resueltaPor = resueltaPor || 'Personal a cargo';
      alerta.horaResolucion = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Actualizar en historial
      const enHistorial = historialAlertas.find(a => a.id === idAlerta);
      if (enHistorial) {
        enHistorial.estado = 'resuelta';
        enHistorial.resueltaPor = alerta.resueltaPor;
        enHistorial.horaResolucion = alerta.horaResolucion;
        guardarHistorial(historialAlertas);
      }

      // Quitar de las alertas activas en pantalla
      delete alertasActivas[idAlerta];

      io.emit('alerta_resuelta', alerta);
      console.log(`[🏁 RESUELTA] Alerta en ${alerta.sala} cerrada`);
    }
  });

  // Cancelar alerta por la sala (falsa alarma rápida)
  socket.on('cancelar_alerta', ({ idAlerta, motivo }) => {
    if (alertasActivas[idAlerta]) {
      const alerta = alertasActivas[idAlerta];
      alerta.estado = 'cancelada';
      alerta.motivoCancelacion = motivo || 'Falsa alarma reportada por la sala';

      const enHistorial = historialAlertas.find(a => a.id === idAlerta);
      if (enHistorial) {
        enHistorial.estado = 'cancelada';
        enHistorial.motivoCancelacion = alerta.motivoCancelacion;
        guardarHistorial(historialAlertas);
      }

      delete alertasActivas[idAlerta];
      io.emit('alerta_cancelada', alerta);
      console.log(`[⚠️ CANCELADA] Alerta en ${alerta.sala} cancelada (Falsa alarma)`);
    }
  });

  // Modo Simulacro / Prueba de sirena
  socket.on('probar_sirena', (datos) => {
    io.emit('prueba_sirena', datos);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ip = obtenerIpLocal();
  console.log('===========================================================');
  console.log('🚨 SISTEMA DE BOTÓN DE PÁNICO ESCOLAR INICIADO');
  console.log('===========================================================');
  console.log(`📡 Servidor disponible en:`);
  console.log(`   - En este computador:      http://localhost:${PORT}`);
  console.log(`   - Desde los PC de salas:   http://${ip}:${PORT}`);
  console.log('-----------------------------------------------------------');
  console.log(`💻 Panel de Salas (Botonera): http://${ip}:${PORT}/sala.html`);
  console.log(`🏢 Panel Receptores:          http://${ip}:${PORT}/receptor.html`);
  console.log(`⚙️ Administración y Salas:    http://${ip}:${PORT}/admin.html`);
  console.log('===========================================================');
});
