// =========================================================
//     GESTOR DE ESTADOS - NAVEGACIÓN ENTRE PANTALLAS
// =========================================================
/**
 * Clase que controla la navegación entre las 5 pantallas del juego
 * y gestiona los eventos de la interfaz de usuario (botones, inputs, selecciones). 
 * 
 * PANTALLAS GESTIONADAS:
 * 1. screenInicio         - Pantalla de bienvenida con botón "Jugar"
 * 2.  screenRegistro       - Ingreso de nombre del jugador
 * 3.  screenConfiguracion  - Selección de color (ROJO, AZUL, VERDE, AMARILLO)
 * 4. screenLobby          - Sala de espera con lista de jugadores conectados
 * 5. screenJuego          - Partida en curso con tablero, dado y log de eventos
 * 
 * RESPONSABILIDADES:
 * - Ocultar/mostrar pantallas según el flujo del juego
 * - Configurar event listeners para botones e inputs
 * - Actualizar la lista de jugadores en el lobby
 * - Sincronizar información de jugadores en la pantalla de juego
 * 
 * FLUJO DE NAVEGACIÓN:
 * Inicio → Registro → Configuración → Lobby → Juego
 *   [Jugar]  [Nombre]    [Color]      [Iniciar]
 * 
 * INTEGRACIÓN:
 * - Se instancia en client.js al cargar la página
 * - Interactúa con window.clientManager (definido en client.js)
 * - Recibe actualizaciones del broker vía eventos WebSocket
 * 
 * EJEMPLO DE USO:
 * ```
 * const stateManager = new GameStateManager();
 * stateManager.goTo('screenLobby');  // Ir al lobby
 * stateManager. updateLobbyPlayers([...]); // Actualizar lista de jugadores
 * ```
 */

class GameStateManager {
  /**
   * Constructor que inicializa las referencias a las pantallas
   * y configura todos los event listeners necesarios.
   */
  constructor() {
    // Pantalla actual (inicialmente la de inicio)
    this.currentScreen = 'screenInicio';
    
    // ===== REFERENCIAS A LOS 5 DIVS DE PANTALLAS =====
    // Cada pantalla es un <div> con clase "screen" en index.html
    this.screens = {
      screenInicio: document.getElementById('screenInicio'),
      screenRegistro: document.getElementById('screenRegistro'),
      screenConfiguracion: document.getElementById('screenConfiguracion'),
      screenLobby: document.getElementById('screenLobby'),
      screenJuego: document.getElementById('screenJuego')
    };
    
    // Configurar event listeners para botones, inputs, etc.
    this.setupEventListeners();
  }

  // =========================================================
  //              CONFIGURACIÓN DE EVENT LISTENERS
  // =========================================================
  /**
   * Registra todos los manejadores de eventos (onclick) para los elementos
   * interactivos del HTML (botones, opciones de color, etc.).
   * 
   * Este método se ejecuta UNA VEZ al instanciar la clase.
   */
  setupEventListeners() {
    // ===== PANTALLA 1: INICIO → REGISTRO =====
    // Botón "Jugar" lleva a la pantalla de registro
    document. getElementById('btnJugar').onclick = () => {
      this. goTo('screenRegistro');
    };

    // ===== PANTALLA 2: REGISTRO → CONFIGURACIÓN =====
    // Botón "Aceptar Nombre" valida y avanza a configuración
    document.getElementById('btnAceptarNombre').onclick = () => {
      const nombre = document.getElementById('inputNombre').value. trim();
      
      // Validación: el nombre no puede estar vacío
      if (! nombre) {
        alert('⚠️ Escribe tu nombre');
        return;
      }
      
      // Avanzar a la siguiente pantalla
      this.goTo('screenConfiguracion');
    };

    // ===== PANTALLA 3: CONFIGURACIÓN (SELECCIÓN DE COLOR) =====
    // Obtener todas las opciones de color (. color-option)
    const colorOptions = document.querySelectorAll('.color-option');
    
    // Configurar onclick para cada opción
    colorOptions.forEach(option => {
      option.onclick = () => {
        // Quitar clase "selected" de todas las opciones
        colorOptions.forEach(o => o.classList.remove('selected'));
        
        // Agregar clase "selected" a la opción clickeada
        option.classList.add('selected');
        
        // Habilitar el botón "Aceptar Color"
        document.getElementById('btnAceptarColor').disabled = false;
      };
    });

    // Botón "Aceptar Color" envía registro al broker
    document.getElementById('btnAceptarColor').onclick = () => {
      // Obtener la opción seleccionada
      const selectedColor = document.querySelector('.color-option.selected');
      
      // Validación: debe haber un color seleccionado
      if (!selectedColor) {
        alert('⚠️ Selecciona un color');
        return;
      }
      
      // Extraer el color del atributo data-color (ROJO, AZUL, VERDE, AMARILLO)
      const color = selectedColor.dataset.color;
      
      // Obtener el nombre ingresado en la pantalla anterior
      const nombre = document.getElementById('inputNombre').value.trim();
      
      // ===== ENVIAR REGISTRO AL BROKER =====
      // window.clientManager es un objeto definido en client.js
      // que expone métodos para comunicarse con el broker
      if (window.clientManager) {
        window.clientManager.registrar(nombre, color);
      }
      
      // NOTA: La transición al lobby ocurre cuando el broker
      // responde con REGISTRO_ACEPTADO (manejado en client.js)
    };

    // ===== PANTALLA 4: LOBBY → JUEGO =====
    // Botón "Iniciar Partida" envía solicitud al broker
    document.getElementById('btnIniciar').onclick = () => {
      if (window.clientManager) {
        window.clientManager.iniciarPartida();
      }
      
      // NOTA: La transición al juego ocurre cuando el broker
      // responde con PARTIDA_INICIADA (manejado en client.js)
    };
  }

  // =========================================================
  //              NAVEGACIÓN ENTRE PANTALLAS
  // =========================================================
  /**
   * Cambia la pantalla visible ocultando todas las demás. 
   * 
   * MECÁNICA:
   * - Agrega la clase "hidden" a todas las pantallas (display: none)
   * - Remueve la clase "hidden" de la pantalla objetivo
   * 
   * @param {string} screenName - Nombre de la pantalla a mostrar
   *   Valores válidos: 'screenInicio', 'screenRegistro', 'screenConfiguracion',
   *                    'screenLobby', 'screenJuego'
   * 
   * EJEMPLO:
   * stateManager.goTo('screenLobby'); // Muestra el lobby
   */
  goTo(screenName) {
    // Ocultar todas las pantallas
    Object. values(this.screens).forEach(screen => {
      screen.classList.add('hidden');
    });

    // Mostrar la pantalla seleccionada
    if (this.screens[screenName]) {
      this.screens[screenName].classList.remove('hidden');
      this.currentScreen = screenName;
    }
  }

  /**
   * Atajo para mostrar la pantalla de lobby.
   * Llamado desde client.js cuando el broker acepta el registro.
   */
  showLobby() {
    this.goTo('screenLobby');
  }

  /**
   * Atajo para mostrar la pantalla de juego (tablero).
   * Llamado desde client.js cuando el broker inicia la partida.
   */
  showGame() {
    this.goTo('screenJuego');
  }

  // =========================================================
  //              ACTUALIZACIÓN DEL LOBBY
  // =========================================================
  /**
   * Actualiza la lista visual de jugadores en el lobby. 
   * Genera dinámicamente los elementos HTML para cada jugador.
   * 
   * ESTRUCTURA GENERADA POR JUGADOR:
   * <div class="jugador-item">
   *   <div class="color-circle rojo"></div>
   *   <span>Nombre del Jugador</span>
   * </div>
   * 
   * @param {Array<Object>} jugadores - Array de objetos con estructura:
   *   {
   *     id: number,        // ID del jugador
   *     nombre: string,    // Nombre del jugador
   *     color: string      // Color: 'ROJO', 'AZUL', 'VERDE', 'AMARILLO'
   *   }
   * 
   * EJEMPLO:
   * stateManager.updateLobbyPlayers([
   *   { id: 1, nombre: 'Candy', color: 'ROJO' },
   *   { id: 2, nombre: 'Berry', color: 'AZUL' }
   * ]);
   */
  updateLobbyPlayers(jugadores) {
    // Obtener el contenedor de la lista
    const lista = document.getElementById('listaJugadores');
    
    // Limpiar la lista existente
    lista.innerHTML = '';
    
    // Generar un elemento por cada jugador
    jugadores.forEach(j => {
      const item = document.createElement('div');
      item.className = 'jugador-item';
      
      // HTML interno: círculo de color + nombre
      // El color se mapea a minúsculas para la clase CSS (. rojo, .azul, etc.)
      item.innerHTML = `
        <div class="color-circle ${j. color. toLowerCase()}"></div>
        <span>${j.nombre}</span>
      `;
      
      // Agregar al contenedor
      lista.appendChild(item);
    });

    // Actualizar el contador de jugadores (ej: "2/4")
    document.getElementById('contadorJugadores').textContent = `${jugadores.length}/4`;
  }

  // =========================================================
  //        ACTUALIZACIÓN DE JUGADORES EN PANTALLA DE JUEGO
  // =========================================================
  /**
   * Actualiza la información de un jugador en la pantalla de juego.
   * Muestra su nombre y cantidad de fichas en meta (0/4, 1/4, etc.).
   * 
   * ELEMENTOS HTML ACTUALIZADOS (según el color):
   * - nombreRojo, nombreAzul, nombreVerde, nombreAmarillo
   * - fichasRojo, fichasAzul, fichasVerde, fichasAmarillo
   * 
   * @param {Object} jugador - Objeto con estructura:
   *   {
   *     nombre: string,       // Nombre del jugador
   *     color: string,        // Color: 'ROJO', 'AZUL', 'VERDE', 'AMARILLO'
   *     fichas: Array<Object> // (opcional) Array de fichas con propiedad enMeta
   *   }
   * 
   * NOTA: Este método puede ser llamado cada vez que una ficha entra a meta
   * para actualizar el contador en tiempo real.
   * 
   * EJEMPLO:
   * stateManager.updatePlayerInfo({
   *   nombre: 'Candy',
   *   color: 'ROJO',
   *   fichas: [
   *     { id: 0, enMeta: true },
   *     { id: 1, enMeta: false },
   *     { id: 2, enMeta: false },
   *     { id: 3, enMeta: false }
   *   ]
   * });
   * // Resultado: "Candy" y "1/4" se muestran en la esquina roja
   */
  updatePlayerInfo(jugador) {
    // Mapeo de colores (backend) a nombres de elementos HTML
    const colorMap = {
      'ROJO': 'Rojo',
      'AZUL': 'Azul',
      'VERDE': 'Verde',
      'AMARILLO': 'Amarillo'
    };

    // Obtener referencias a los elementos HTML
    const elemName = document.getElementById(`nombre${colorMap[jugador.color]}`);
    const elemFichas = document.getElementById(`fichas${colorMap[jugador.color]}`);

    // Actualizar nombre del jugador
    if (elemName) {
      elemName.textContent = jugador. nombre;
    }
    
    // Actualizar contador de fichas en meta
    if (elemFichas && jugador.fichas) {
      // Contar cuántas fichas tienen enMeta: true
      const enMeta = jugador.fichas.filter(f => f.enMeta).length;
      elemFichas.textContent = `${enMeta}/4`;
    } else if (elemFichas) {
      // Si no hay datos de fichas, mostrar 0/4
      elemFichas.textContent = '0/4';
    }
  }
}
  