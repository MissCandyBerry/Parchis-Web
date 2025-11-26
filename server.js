// server.js
const express = require('express');
const WebSocket = require('ws');
const net = require('net');

const app = express();

// ====== CONFIG ======
const HTTP_PORT = 8080;
const BROKER_HOST = '127.0.0.1';
const BROKER_PORT = 5000;

// Servir archivos estáticos
app.use(express.static('public'));

const server = app.listen(HTTP_PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   SERVIDOR PUENTE PARCHÍS INICIADO    ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`🌐 Servidor web:  http://localhost:${HTTP_PORT}`);
  console.log(`🔌 WebSocket:     ws://localhost:${HTTP_PORT}`);
  console.log(`📡 Broker Java:   ${BROKER_HOST}:${BROKER_PORT}`);
  console.log('💡 Abre tu navegador en: http://localhost:' + HTTP_PORT);
});

// WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('✅ [WebSocket] Cliente web conectado');

  const brokerSocket = net.createConnection(BROKER_PORT, BROKER_HOST, () => {
    console.log('✅ [TCP] Conectado al Broker Java');
  });

  let buffer = '';

  ws.on('message', (message) => {
    const msg = message.toString();
    console.log('📤 [Web → Broker]', msg. substring(0, 120));
    brokerSocket.write(msg + '\n');
  });

  brokerSocket.on('data', (data) => {
    buffer += data.toString();
    while (buffer.includes('\n')) {
      const idx = buffer.indexOf('\n');
      const line = buffer.substring(0, idx). trim();
      buffer = buffer. substring(idx + 1);
      if (line) {
        console. log('📥 [Broker → Web]', line. substring(0, 120));
        ws.send(line);
      }
    }
  });

  ws.on('close', () => {
    console.log('❌ [WebSocket] Cliente web desconectado');
    brokerSocket.end();
  });

  ws.on('error', (err) => console.error('❌ [WebSocket] Error:', err. message));
  brokerSocket.on('end', () => { 
    console.log('❌ [TCP] Broker cerró la conexión'); 
    try { ws.close(); } catch (e) {}
  });
  brokerSocket.on('error', (err) => {
    console.error('❌ [TCP] Error:', err. message);
    try { ws.close(); } catch (e) {}
  });
});