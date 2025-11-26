// =========================================================
//           CLIENTE WEBSOCKET (ACTUALIZADO)
// =========================================================

let ws = null;
let miId = -1;
let miNombre = '';
let miColor = '';
let registrado = false;
let partidaIniciada = false;
let esMiTurno = false;

// Instancias de gestores
let stateManager = null;
let boardRenderer = null;
let pieceManager = null;

// Lista de jugadores en el lobby
let jugadoresLobby = [];

// =========================================================
//              INICIALIZACIÓN
// =========================================================

window.onload = () => {
  console.log('🌐 Página cargada');
  
  // Inicializar gestores
  stateManager = new GameStateManager();
  
  // Conectar WebSocket
  conectar();
};

// =========================================================
//              CONEXIÓN WEBSOCKET
// =========================================================

function conectar() {
  ws = new WebSocket('ws://localhost:8080');

  ws.onopen = () => {
    console.log('✅ Conectado al servidor');
    logEvento('✅ Conectado al servidor');
  };

  ws.onmessage = (event) => {
    try {
      const evento = JSON.parse(event.data);
      procesarEvento(evento);
    } catch (e) {
      console.error('❌ Error parseando JSON:', e);
    }
  };

  ws.onerror = () => {
    console.error('❌ Error de conexión WebSocket');
    logEvento('❌ Error de conexión');
  };

  ws.onclose = () => {
    console.log('❌ Desconectado del servidor');
    logEvento('❌ Desconectado');
  };
}

// =========================================================
//              PROCESAMIENTO DE EVENTOS
// =========================================================

function procesarEvento(evento) {
  console.log('📩 Evento:', evento);

  switch (evento.tipoEvento) {
    case 'JUGADOR_CONECTADO':
      if (evento.mensaje && evento.mensaje.startsWith('Tu ID es:')) {
        miId = parseInt(evento.mensaje.split(':')[1]. trim());
        console.log(`🆔 Tu ID asignado: ${miId}`);
      }
      break;

    case 'REGISTRO_ACEPTADO':
      registrado = true;
      miNombre = evento.jugadorAfectado.nombre;
      miColor = evento.jugadorAfectado.color;
      stateManager.showLobby();
      logEvento(`✅ Registro aceptado: ${miNombre} (${miColor})`);
      break;

    case 'REGISTRO_RECHAZADO':
      alert('❌ Registro rechazado: ' + evento.mensaje);
      break;

    case 'JUGADOR_ACTUALIZADO':
      if (evento. jugadorAfectado) {
        actualizarJugadorLobby(evento.jugadorAfectado);
      }
      break;

    case 'COLORES_DISPONIBLES':
      // Actualizar colores disponibles en UI
      break;

    case 'PARTIDA_INICIADA':
      partidaIniciada = true;
      stateManager.showGame();
      inicializarTablero();
      logEvento('🎮 ¡LA PARTIDA HA COMENZADO!');
      break;

    case 'TURNO_CAMBIADO':
      if (evento.mensaje && evento.mensaje.includes('jugador ' + miId)) {
        esMiTurno = true;
        logEvento('🎯 ¡ES TU TURNO!');
      } else {
        esMiTurno = false;
        logEvento('⏳ Esperando turno...');
      }
      break;

    case 'FICHA_MOVIDA':
      if (evento. valorDado) {
        actualizarDado(evento.valorDado);
      }
      if (evento.jugadorAfectado && evento.fichaAfectada) {
        actualizarPosicionFicha(evento);
      }
      logEvento(`🎲 ${evento.mensaje}`);
      break;

    case 'MOVIMIENTO_IMPOSIBLE':
      logEvento(`❌ ${evento.mensaje}`);
      alert('⚠️ ' + evento.mensaje);
      break;

    case 'CAPTURA':
    case 'FICHA_SALE_BASE':
    case 'ENTRA_PASILLO_COLOR':
    case 'FICHA_EN_META':
      logEvento(`📢 ${evento.mensaje}`);
      if (evento.jugadorAfectado && evento.fichaAfectada) {
        actualizarPosicionFicha(evento);
      }
      break;

    case 'VICTORIA':
    case 'PARTIDA_TERMINADA':
      logEvento(`🏁 ${evento.mensaje}`);
      alert(evento.mensaje);
      break;

    default:
      logEvento(`ℹ️ ${evento.tipoEvento}: ${evento.mensaje || ''}`);
  }
}

// =========================================================
//              FUNCIONES DEL TABLERO
// =========================================================

function inicializarTablero() {
  console.log('🎨 Inicializando tablero...');
  
  if (! boardRenderer) {
    boardRenderer = new BoardRenderer('tablero');
    
    if (! boardRenderer || !boardRenderer.canvas) {
      console.error('❌ Error: No se pudo crear BoardRenderer');
      return;
    }
    
    pieceManager = new PieceManager(boardRenderer);
  }
  
  // ===== DIBUJAR TABLERO INMEDIATAMENTE =====
  boardRenderer.dibujarTablero();
  pieceManager.dibujarTodasLasFichas();
  
  console.log('✅ Tablero inicializado y dibujado');
  
  // Event listener para clicks
  const canvas = document.getElementById('tablero');
  canvas.onclick = (e) => {
    if (! esMiTurno) {
      alert('⚠️ No es tu turno');
      return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const idFicha = pieceManager.seleccionarFichaEnPosicion(x, y, miColor);
    
    if (idFicha !== null) {
      console.log(`✅ Ficha seleccionada: ${idFicha}`);
      boardRenderer.dibujarTablero();
      pieceManager. dibujarTodasLasFichas();
      
      // Enviar SOLICITAR_TURNO
      enviarSolicitudTurno(idFicha);
    }
  };
}

function actualizarPosicionFicha(evento) {
  const jugador = evento.jugadorAfectado;
  const ficha = evento.fichaAfectada;
  
  if (! jugador || !ficha) return;
  
  const datos = {
    posicion: evento.posicionNueva || ficha.posicion || 0,
    enBase: ficha.posicion < 0 && !ficha.enPasillo && !ficha.enMeta,
    enPasillo: ficha.enPasillo || false,
    enMeta: ficha.enMeta || false,
    indicePasillo: ficha.indicePasillo || -1
  };
  
  pieceManager.actualizarFicha(jugador.color, ficha.id, datos);
  
  // Redibujar
  boardRenderer.dibujarTablero();
  pieceManager. dibujarTodasLasFichas();
}

function actualizarDado(valor) {
  const dado = document.getElementById('dado');
  const valorDado = document.getElementById('valorDado');
  
  const caras = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  dado.querySelector('. cara').textContent = caras[valor - 1];
  valorDado.textContent = `Dado: ${valor}`;
}

// =========================================================
//              FUNCIONES DEL LOBBY
// =========================================================

function actualizarJugadorLobby(jugador) {
  const existe = jugadoresLobby. find(j => j.id === jugador.id);
  if (! existe) {
    jugadoresLobby.push(jugador);
  } else {
    Object.assign(existe, jugador);
  }
  
  stateManager.updateLobbyPlayers(jugadoresLobby);
}

// =========================================================
//              ENVÍO DE EVENTOS AL BROKER
// =========================================================

window.clientManager = {
  registrar: (nombre, color) => {
    const jugador = {
      id: miId,
      nombre: nombre,
      color: color
    };
    
    enviarEvento('SOLICITAR_REGISTRO', jugador, null, `Registro: ${nombre} (${color})`);
  },
  
  iniciarPartida: () => {
    enviarEvento('SOLICITAR_INICIO', null, null, 'Solicita iniciar partida');
  }
};

function enviarSolicitudTurno(idFicha) {
  const jugador = {
    id: miId,
    nombre: miNombre,
    color: miColor
  };
  
  const ficha = {
    id: idFicha,
    posicion: 0
  };
  
  enviarEvento('SOLICITAR_TURNO', jugador, ficha, 
               `Jugador ${miId} solicita turno para ficha ${idFicha}`);
}

function enviarEvento(tipo, jugador, ficha, mensaje) {
  const evento = {
    tipoEvento: tipo,
    jugadorAfectado: jugador,
    fichaAfectada: ficha,
    mensaje: mensaje,
    timestamp: Date.now()
  };
  
  console.log('📤 Enviando:', evento);
  ws.send(JSON.stringify(evento));
}

// =========================================================
//                    LOG DE EVENTOS
// =========================================================

function logEvento(mensaje) {
  const logContainer = document.getElementById('logEventos');
  if (! logContainer) return;
  
  const p = document.createElement('p');
  p.textContent = `[${new Date().toLocaleTimeString()}] ${mensaje}`;
  logContainer.appendChild(p);
  logContainer.scrollTop = logContainer.scrollHeight;
}