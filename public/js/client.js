// =========================================================
//     ORQUESTADOR PRINCIPAL DEL CLIENTE WEB
// =========================================================
/**
 * Archivo principal que coordina TODA la lógica del cliente web.
 * 
 * ARQUITECTURA:
 * 
 *   WebSocket ←→ client.js ←→ GameStateManager (pantallas)
 *                    ↓
 *              BoardRenderer (dibuja tablero)
 *                    ↓
 *              PieceManager (gestiona fichas)
 * 
 * RESPONSABILIDADES:
 * 1. Conectar al servidor WebSocket (ws://localhost:8080)
 * 2. Recibir y procesar TODOS los eventos del broker
 * 3. Enviar eventos al broker (registro, inicio partida, turnos)
 * 4. Sincronizar estado del juego (fichas, dado, turnos)
 * 5.  Inicializar y actualizar el tablero visual
 * 6. Gestionar el log de eventos en tiempo real
 * 
 * VARIABLES GLOBALES DE ESTADO:
 * - miId: ID asignado por el broker al conectar
 * - miNombre: Nombre del jugador (registrado)
 * - miColor: Color del jugador (ROJO, AZUL, VERDE, AMARILLO)
 * - registrado: true si el registro fue aceptado
 * - partidaIniciada: true si la partida comenzó
 * - esMiTurno: true si es el turno del jugador local
 * 
 * GESTORES INSTANCIADOS:
 * - ws: Conexión WebSocket nativa
 * - stateManager: Gestor de pantallas (GameStateManager)
 * - boardRenderer: Dibujante del tablero (BoardRenderer)
 * - pieceManager: Gestor de fichas (PieceManager)
 * 
 * FLUJO DE EJECUCIÓN:
 * 1. window.onload → Inicializa gestores y conecta WebSocket
 * 2. ws.onmessage → procesarEvento() según tipo de evento
 * 3. Usuario interactúa → envía eventos al broker
 * 4.  Broker responde → actualiza estado local y redibuja
 */

// =========================================================
//              VARIABLES GLOBALES DE ESTADO
// =========================================================

/** Conexión WebSocket con el servidor (ws://localhost:8080) */
let ws = null;

/** ID único del jugador asignado por el broker (ej: 1, 2, 3, 4) */
let miId = -1;

/** Nombre del jugador (ej: "Candy") */
let miNombre = '';

/** Color del jugador ('ROJO', 'AZUL', 'VERDE', 'AMARILLO') */
let miColor = '';

/** ¿El jugador completó el registro exitosamente? */
let registrado = false;

/** ¿La partida ya comenzó? */
let partidaIniciada = false;

/** ¿Es el turno del jugador local? */
let esMiTurno = false;

// =========================================================
//              INSTANCIAS DE GESTORES
// =========================================================

/** Gestor de navegación entre pantallas */
let stateManager = null;

/** Renderizador del tablero (canvas) */
let boardRenderer = null;

/** Gestor de fichas (posiciones, animaciones) */
let pieceManager = null;

// =========================================================
//              ESTADO DEL LOBBY
// =========================================================

/** Lista de jugadores conectados en el lobby (antes de iniciar) */
let jugadoresLobby = [];

// =========================================================
//              INICIALIZACIÓN AL CARGAR LA PÁGINA
// =========================================================
/**
 * Punto de entrada principal. 
 * Se ejecuta cuando el DOM está completamente cargado. 
 * 
 * TAREAS:
 * 1. Crear instancia de GameStateManager
 * 2.  Conectar WebSocket al servidor
 * 3.  Exponer window.clientManager para que los botones puedan enviar eventos
 */
window.onload = () => {
  console.log('🌐 Página cargada');
  
  // ===== INICIALIZAR GESTOR DE PANTALLAS =====
  stateManager = new GameStateManager();
  
  // ===== CONECTAR WEBSOCKET =====
  conectar();
};

// =========================================================
//              CONEXIÓN WEBSOCKET
// =========================================================
/**
 * Establece la conexión WebSocket con el servidor y configura
 * los event handlers (onopen, onmessage, onerror, onclose).
 * 
 * PROTOCOLO:
 * - URL: ws://localhost:8080 (servidor Node.js con Express + ws)
 * - Formato: JSON (todos los mensajes son objetos EventoPartida serializados)
 * 
 * EVENT HANDLERS:
 * - onopen: Conexión exitosa
 * - onmessage: Recibe eventos del broker (parsea JSON y procesa)
 * - onerror: Error en la conexión
 * - onclose: Desconexión del servidor
 */
function conectar() {
  // Crear conexión WebSocket
  ws = new WebSocket('ws://localhost:8080');

  // ===== EVENTO: CONEXIÓN EXITOSA =====
  ws.onopen = () => {
    console.log('✅ Conectado al servidor');
    logEvento('✅ Conectado al servidor');
  };

  // ===== EVENTO: MENSAJE RECIBIDO =====
  ws.onmessage = (event) => {
    try {
      // Parsear JSON recibido como EventoPartida
      const evento = JSON.parse(event.data);
      
      // Procesar el evento según su tipo
      procesarEvento(evento);
    } catch (e) {
      console.error('❌ Error parseando JSON:', e);
    }
  };

  // ===== EVENTO: ERROR DE CONEXIÓN =====
  ws.onerror = () => {
    console.error('❌ Error de conexión WebSocket');
    logEvento('❌ Error de conexión');
  };

  // ===== EVENTO: DESCONEXIÓN =====
  ws.onclose = () => {
    console.log('❌ Desconectado del servidor');
    logEvento('❌ Desconectado');
  };
}

// =========================================================
//              PROCESAMIENTO DE EVENTOS DEL BROKER
// =========================================================
/**
 * Dispatcher central que recibe eventos del broker y delega
 * a funciones específicas según el tipo de evento.
 * 
 * TIPOS DE EVENTOS SOPORTADOS:
 * - JUGADOR_CONECTADO: Asignación de ID
 * - REGISTRO_ACEPTADO/RECHAZADO: Resultado del registro
 * - JUGADOR_ACTUALIZADO: Otro jugador se registró
 * - COLORES_DISPONIBLES: Lista de colores libres
 * - PARTIDA_INICIADA: Comienza la partida
 * - TURNO_CAMBIADO: Cambio de turno
 * - FICHA_MOVIDA: Una ficha se movió
 * - MOVIMIENTO_IMPOSIBLE: Movimiento inválido
 * - CAPTURA/FICHA_SALE_BASE/ENTRA_PASILLO_COLOR/FICHA_EN_META: Eventos especiales
 * - VICTORIA/PARTIDA_TERMINADA: Fin de la partida
 * 
 * @param {Object} evento - EventoPartida recibido del broker
 *   Estructura:
 *   {
 *     tipoEvento: string,         // Tipo del evento (enum TipoEvento)
 *     jugadorAfectado: Object,    // Jugador involucrado (puede ser null)
 *     fichaAfectada: Object,      // Ficha involucrada (puede ser null)
 *     valorDado: number,          // Valor del dado (si aplica)
 *     posicionAnterior: number,   // Posición origen (desde)
 *     posicionNueva: number,      // Posición destino (hasta)
 *     mensaje: string,            // Descripción del evento
 *     timestamp: number           // Timestamp del evento
 *   }
 */
function procesarEvento(evento) {
  console.log('📩 Evento:', evento);

  // ===== DELEGACIÓN POR TIPO DE EVENTO =====
  switch (evento.tipoEvento) {
    // ===== ASIGNACIÓN DE ID AL CONECTAR =====
    case 'JUGADOR_CONECTADO':
      // El broker envía "Tu ID es: X" al conectar
      if (evento.mensaje && evento.mensaje.startsWith('Tu ID es:')) {
        miId = parseInt(evento.mensaje.split(':')[1]. trim());
        console.log(`🆔 Tu ID asignado: ${miId}`);
        logEvento(`✅ Tu ID es: ${miId}`);
      }
      break;

    // ===== REGISTRO ACEPTADO =====
    case 'REGISTRO_ACEPTADO':
      registrado = true;
      miNombre = evento.jugadorAfectado.nombre;
      miColor = evento.jugadorAfectado.color;
      
      // Ir al lobby
      stateManager.showLobby();
      logEvento(`✅ Registro aceptado: ${miNombre} (${miColor})`);
      break;

    // ===== REGISTRO RECHAZADO =====
    case 'REGISTRO_RECHAZADO':
      alert('❌ Registro rechazado: ' + evento.mensaje);
      logEvento('❌ ' + evento.mensaje);
      break;

    // ===== OTRO JUGADOR SE REGISTRÓ =====
    case 'JUGADOR_ACTUALIZADO':
      if (evento.jugadorAfectado) {
        actualizarJugadorLobby(evento.jugadorAfectado);
        logEvento(`👤 ${evento.jugadorAfectado. nombre} se unió (${evento.jugadorAfectado.color})`);
      }
      break;

    // ===== LISTA DE COLORES DISPONIBLES =====
    case 'COLORES_DISPONIBLES':
      // Aquí podrías actualizar dinámicamente los colores en la UI
      console.log('🎨 Colores disponibles:', evento.mensaje);
      break;

    // ===== LA PARTIDA COMENZÓ =====
    case 'PARTIDA_INICIADA':
      partidaIniciada = true;
      
      // Ir a la pantalla de juego
      stateManager.showGame();
      
      // Inicializar el tablero (canvas)
      inicializarTablero();
      
      logEvento('🎮 ¡LA PARTIDA HA COMENZADO!');
      break;

    // ===== CAMBIO DE TURNO =====
    case 'TURNO_CAMBIADO':
      // Verificar si el mensaje menciona nuestro ID
      if (evento.mensaje && evento.mensaje.includes('jugador ' + miId)) {
        esMiTurno = true;
        logEvento('🎯 ¡ES TU TURNO!');
      } else {
        esMiTurno = false;
        logEvento('⏳ Esperando turno...');
      }
      break;

    // ===== FICHA MOVIDA =====
    case 'FICHA_MOVIDA':
      // Actualizar el dado si el evento incluye valorDado
      if (evento. valorDado) {
        actualizarDado(evento.valorDado);
      }
      
      // Actualizar la posición de la ficha en el tablero
      if (evento.jugadorAfectado && evento.fichaAfectada) {
        actualizarPosicionFicha(evento);
      }
      
      logEvento(`🎲 ${evento.mensaje}`);
      break;

    // ===== MOVIMIENTO INVÁLIDO =====
    case 'MOVIMIENTO_IMPOSIBLE':
      logEvento(`❌ ${evento.mensaje}`);
      alert('⚠️ ' + evento.mensaje);
      break;

    // ===== EVENTOS ESPECIALES DE FICHAS =====
    case 'CAPTURA':
    case 'FICHA_SALE_BASE':
    case 'ENTRA_PASILLO_COLOR':
    case 'FICHA_EN_META':
      logEvento(`📢 ${evento.mensaje}`);
      
      // Actualizar posición si hay datos de ficha
      if (evento.jugadorAfectado && evento.fichaAfectada) {
        actualizarPosicionFicha(evento);
      }
      break;

    // ===== FIN DE LA PARTIDA =====
    case 'VICTORIA':
    case 'PARTIDA_TERMINADA':
      logEvento(`🏁 ${evento.mensaje}`);
      alert(evento.mensaje);
      break;

    // ===== OTROS EVENTOS =====
    default:
      logEvento(`ℹ️ ${evento.tipoEvento}: ${evento.mensaje || ''}`);
  }
}

// =========================================================
//              INICIALIZACIÓN DEL TABLERO
// =========================================================
/**
 * Inicializa el tablero de juego (canvas) y configura el click listener
 * para seleccionar fichas.
 * 
 * TAREAS:
 * 1. Crear instancias de BoardRenderer y PieceManager (si no existen)
 * 2. Dibujar el tablero y las fichas iniciales
 * 3. Configurar event listener para clicks en el canvas
 * 
 * NOTA: Solo se ejecuta UNA VEZ cuando la partida inicia.
 */
function inicializarTablero() {
  console.log('🎨 Inicializando tablero.. .');
  
  // ===== CREAR RENDERER SI NO EXISTE =====
  if (! boardRenderer) {
    // Crear instancia del renderizador (pasando ID del canvas)
    boardRenderer = new BoardRenderer('tablero');
    
    // Verificar que se creó correctamente
    if (! boardRenderer || !boardRenderer.canvas) {
      console.error('❌ Error: No se pudo crear BoardRenderer');
      return;
    }
    
    // Crear gestor de fichas (requiere boardRenderer)
    pieceManager = new PieceManager(boardRenderer);
  }
  
  // ===== DIBUJAR TABLERO INICIAL =====
  boardRenderer. dibujarTablero();
  pieceManager.dibujarTodasLasFichas();
  
  console.log('✅ Tablero inicializado y dibujado');
  
  // ===== CONFIGURAR CLICK LISTENER =====
  const canvas = document.getElementById('tablero');
  
  canvas.onclick = (e) => {
    // Verificar que es nuestro turno
    if (! esMiTurno) {
      alert('⚠️ No es tu turno');
      return;
    }
    
    // Obtener coordenadas del click relativas al canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Detectar si se clickeó una ficha del color del jugador
    const idFicha = pieceManager. seleccionarFichaEnPosicion(x, y, miColor);
    
    if (idFicha !== null) {
      console.log(`✅ Ficha seleccionada: ${idFicha}`);
      
      // Redibujar para mostrar la ficha seleccionada (con highlight)
      boardRenderer.dibujarTablero();
      pieceManager.dibujarTodasLasFichas();
      
      // Enviar solicitud de turno al broker
      enviarSolicitudTurno(idFicha);
    }
  };
}

// =========================================================
//              ACTUALIZACIÓN DE FICHAS
// =========================================================
/**
 * Actualiza la posición de una ficha en el tablero según el evento recibido.
 * 
 * LÓGICA:
 * 1. Extraer datos del jugador y la ficha del evento
 * 2.  Construir objeto de datos con la nueva posición y estado
 * 3. Actualizar el estado interno de PieceManager
 * 4. Redibujar el tablero completo
 * 
 * @param {Object} evento - EventoPartida con datos de movimiento
 */
function actualizarPosicionFicha(evento) {
  const jugador = evento.jugadorAfectado;
  const ficha = evento.fichaAfectada;
  
  // Validar que hay datos
  if (!jugador || !ficha) return;
  
  // ===== CONSTRUIR OBJETO DE DATOS =====
  const datos = {
    posicion: evento.posicionNueva || ficha.posicion || 0,
    enBase: ficha.posicion < 0 && ! ficha.enPasillo && !ficha.enMeta,
    enPasillo: ficha.enPasillo || false,
    enMeta: ficha.enMeta || false,
    indicePasillo: ficha.indicePasillo || -1
  };
  
  // ===== ACTUALIZAR ESTADO INTERNO =====
  pieceManager.actualizarFicha(jugador.color, ficha.id, datos);
  
  // ===== REDIBUJAR TABLERO =====
  boardRenderer.dibujarTablero();
  pieceManager.dibujarTodasLasFichas();
}

// =========================================================
//              ACTUALIZACIÓN DEL DADO
// =========================================================
/**
 * Actualiza la visualización del dado en la UI.
 * 
 * ELEMENTOS ACTUALIZADOS:
 * - #dado . cara: Símbolo Unicode del dado (⚀ ⚁ ⚂ ⚃ ⚄ ⚅)
 * - #valorDado: Texto "Dado: X"
 * 
 * @param {number} valor - Valor del dado (1-6)
 */
function actualizarDado(valor) {
  const dado = document.getElementById('dado');
  const valorDado = document. getElementById('valorDado');
  
  // Símbolos Unicode de dados (1-6)
  const caras = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  
  // Actualizar símbolo del dado (índice = valor - 1)
  dado.querySelector('.cara').textContent = caras[valor - 1];
  
  // Actualizar texto del valor
  valorDado. textContent = `Dado: ${valor}`;
}

// =========================================================
//              GESTIÓN DEL LOBBY
// =========================================================
/**
 * Actualiza o agrega un jugador a la lista del lobby.
 * 
 * LÓGICA:
 * - Si el jugador ya existe (mismo ID) → actualiza sus datos
 * - Si es nuevo → lo agrega a la lista
 * - Redibuja la lista completa en el HTML
 * 
 * @param {Object} jugador - Objeto con { id, nombre, color }
 */
function actualizarJugadorLobby(jugador) {
  // Buscar si ya existe en la lista
  const existe = jugadoresLobby.find(j => j.id === jugador.id);
  
  if (! existe) {
    // Agregar nuevo jugador
    jugadoresLobby.push(jugador);
  } else {
    // Actualizar datos del jugador existente
    Object.assign(existe, jugador);
  }
  
  // Redibujar la lista en el HTML
  stateManager.updateLobbyPlayers(jugadoresLobby);
}

// =========================================================
//              ENVÍO DE EVENTOS AL BROKER
// =========================================================
/**
 * API expuesta globalmente para que los botones del HTML puedan
 * invocar métodos de envío de eventos.
 * 
 * MÉTODOS:
 * - registrar(nombre, color): Envía SOLICITAR_REGISTRO
 * - iniciarPartida(): Envía SOLICITAR_INICIO
 * 
 * USO:
 * ```
 * window.clientManager.registrar('Candy', 'ROJO');
 * window.clientManager.iniciarPartida();
 * ```
 */
window.clientManager = {
  /**
   * Envía solicitud de registro al broker. 
   * 
   * @param {string} nombre - Nombre del jugador
   * @param {string} color - Color elegido ('ROJO', 'AZUL', 'VERDE', 'AMARILLO')
   */
  registrar: (nombre, color) => {
    const jugador = {
      id: miId,
      nombre: nombre,
      color: color
    };
    
    enviarEvento('SOLICITAR_REGISTRO', jugador, null, `Registro: ${nombre} (${color})`);
  },
  
  /**
   * Envía solicitud para iniciar la partida.
   */
  iniciarPartida: () => {
    enviarEvento('SOLICITAR_INICIO', null, null, 'Solicita iniciar partida');
  }
};

/**
 * Envía solicitud de turno al broker (cuando el jugador hace click en una ficha).
 * 
 * @param {number} idFicha - ID de la ficha seleccionada (0-3)
 */
function enviarSolicitudTurno(idFicha) {
  const jugador = {
    id: miId,
    nombre: miNombre,
    color: miColor
  };
  
  const ficha = {
    id: idFicha,
    posicion: 0 // El broker calculará la nueva posición
  };
  
  enviarEvento('SOLICITAR_TURNO', jugador, ficha, 
               `Jugador ${miId} solicita turno para ficha ${idFicha}`);
}

/**
 * Función genérica para enviar un evento al broker vía WebSocket.
 * 
 * FORMATO:
 * Los eventos se serializan a JSON con la estructura de EventoPartida.
 * 
 * @param {string} tipo - Tipo de evento (TipoEvento enum)
 * @param {Object|null} jugador - Jugador afectado (puede ser null)
 * @param {Object|null} ficha - Ficha afectada (puede ser null)
 * @param {string} mensaje - Descripción del evento
 */
function enviarEvento(tipo, jugador, ficha, mensaje) {
  // Construir objeto EventoPartida
  const evento = {
    tipoEvento: tipo,
    jugadorAfectado: jugador,
    fichaAfectada: ficha,
    mensaje: mensaje,
    timestamp: Date.now()
  };
  
  console.log('📤 Enviando:', evento);
  
  // Serializar a JSON y enviar por WebSocket
  ws.send(JSON.stringify(evento));
}

// =========================================================
//                    LOG DE EVENTOS
// =========================================================
/**
 * Agrega un mensaje al log de eventos (terminal estilo consola en la UI).
 * 
 * FORMATO:
 * [HH:MM:SS] Mensaje
 * 
 * UBICACIÓN:
 * Panel derecho de la pantalla de juego (#logEventos)
 * 
 * CARACTERÍSTICAS:
 * - Auto-scroll hacia abajo (siempre muestra el mensaje más reciente)
 * - Color verde terminal (#0f0)
 * - Fuente monoespaciada (Courier New)
 * 
 * @param {string} mensaje - Texto a agregar al log
 */
function logEvento(mensaje) {
  const logContainer = document.getElementById('logEventos');
  if (! logContainer) return;
  
  // Crear elemento <p> con el mensaje
  const p = document. createElement('p');
  p. textContent = `[${new Date().toLocaleTimeString()}] ${mensaje}`;
  
  // Agregar al contenedor
  logContainer.appendChild(p);
  
  // Hacer scroll automático hacia abajo
  logContainer.scrollTop = logContainer. scrollHeight;
}