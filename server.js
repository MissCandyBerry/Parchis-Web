// server.js
const express = require('express');
const WebSocket = require('ws');
const net = require('net');

const app = express();

// ====== CONFIG ======
const HTTP_PORT = 8080;
const BROKER_HOST = '127.0.0.1'; // <- Cambia por la IP del broker si está en otra máquina
const BROKER_PORT = 5000;

// Servir archivos estáticos
app.use(express.static('public'));

const server = app.listen(HTTP_PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   SERVIDOR PUENTE PARCHÍS INICIADO    ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`🌐 Servidor web:  http://localhost:${HTTP_PORT}`);
  console.log(`🔌 WebSocket:     ws://localhost:${HTTP_PORT}`);
  console.log(`📡 Broker Java:   ${BROKER_HOST}:${BROKER_PORT}`);
  console.log('');
  console.log('💡 Abre tu navegador en: http://localhost:' + HTTP_PORT);
  console.log('─────────────────────────────────────────\n');
});

// WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('✅ [WebSocket] Cliente web conectado');

  // Conectar al Broker Java vía TCP
  const brokerSocket = net.createConnection(BROKER_PORT, BROKER_HOST, () => {
    console.log('✅ [TCP] Conectado al Broker Java');
  });

  let buffer = '';

  // WebSocket -> Broker (TCP)
  ws.on('message', (message) => {
    const msg = message.toString();
    const preview = msg.length > 120 ? msg.substring(0, 120) + '...' : msg;
    console.log('📤 [Web → Broker]', preview);
    // Broker espera JSON por línea
    brokerSocket.write(msg + '\n');
  });

  // Broker (TCP) -> WebSocket
  brokerSocket.on('data', (data) => {
    buffer += data.toString();
    while (buffer.includes('\n')) {
      const idx = buffer.indexOf('\n');
      const line = buffer.substring(0, idx).trim();
      buffer = buffer.substring(idx + 1);
      if (line) {
        const preview = line.length > 120 ? line.substring(0, 120) + '...' : line;
        console.log('📥 [Broker → Web]', preview);
        ws.send(line);
      }
    }
  });

  ws.on('close', () => {
    console.log('❌ [WebSocket] Cliente web desconectado');
    brokerSocket.end();
  });

  ws.on('error', (err) => {
    console.error('❌ [WebSocket] Error:', err.message);
  });

  brokerSocket.on('end', () => {
    console.log('❌ [TCP] Broker cerró la conexión');
    try { ws.close(); } catch (e) {}
  });

  brokerSocket.on('error', (err) => {
    console.error('❌ [TCP] Error:', err.message);
    try { ws.close(); } catch (e) {}
  });
});