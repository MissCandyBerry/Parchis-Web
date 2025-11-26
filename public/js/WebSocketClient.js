// =========================================================
//     CLIENTE WEBSOCKET ROBUSTO CON RECONEXIÓN AUTOMÁTICA
// =========================================================
/**
 * Clase que encapsula la lógica de conexión WebSocket. 
 * 
 * CARACTERÍSTICAS:
 * - Reconexión automática tras desconexión (máximo 5 intentos)
 * - Sistema de eventos (on/off/trigger)
 * - Serialización/deserialización JSON automática
 * - Estado de conexión (`isConnected()`)
 * 
 * EVENTOS DISPONIBLES:
 * - 'connect': Cuando se establece conexión exitosa
 * - 'disconnect': Cuando se cierra la conexión
 * - 'message': Cuando llega un mensaje (data = objeto JSON)
 * - 'error': Cuando ocurre un error
 * 
 * EJEMPLO DE USO:
 * ```
 * const ws = new WebSocketClient('ws://localhost:8080');
 * ws.on('connect', () => console.log('Conectado'));
 * ws.on('message', (data) => console.log('Recibí:', data));
 * ws. connect();
 * ws.send({ tipo: 'SOLICITAR_REGISTRO', ...   });
 * ```
 */
class WebSocketClient {
  constructor(url) {
    this.url = url;                        // URL del servidor WebSocket
    this.ws = null;                        // Instancia de WebSocket (null hasta conectar)
    this.reconnectAttempts = 0;            // Contador de intentos de reconexión
    this.maxReconnectAttempts = 5;         // Máximo de intentos antes de rendirse
    this.reconnectDelay = 2000;            // Espera 2 segundos entre reconexiones
    this.eventHandlers = {};               // Map de eventos → [callbacks]
    this.connected = false;                // Estado de conexión
  }

  // =========================================================
  //              CONEXIÓN Y RECONEXIÓN
  // =========================================================

  /**
   * Inicia la conexión WebSocket y configura los event listeners.
   * Si falla, intentará reconectar automáticamente.
   */
  connect() {
    console.log('🔌 Intentando conectar a:', this.url);
    
    // Crear instancia de WebSocket nativo del navegador
    this.ws = new WebSocket(this.url);

    // Evento: conexión exitosa
    this.ws.onopen = () => {
      this.connected = true;
      this.reconnectAttempts = 0; // Resetear contador al conectar
      console.log('✅ WebSocket conectado');
      this.trigger('connect'); // Notificar a los listeners
    };

    // Evento: mensaje recibido (JSON)
    this.ws. onmessage = (event) => {
      try {
        const data = JSON. parse(event.data); // Parsear JSON automáticamente
        console.log('📩 Mensaje recibido:', data);
        this.trigger('message', data); // Disparar evento 'message'
      } catch (error) {
        console.error('❌ Error parseando mensaje:', error);
      }
    };

    // Evento: error en la conexión
    this. ws.onerror = (error) => {
      console.error('❌ Error WebSocket:', error);
      this. trigger('error', error);
    };

    // Evento: conexión cerrada
    this.ws.onclose = () => {
      this.connected = false;
      console.log('❌ WebSocket desconectado');
      this. trigger('disconnect');
      this.attemptReconnect(); // Intentar reconectar
    };
  }

  /**
   * Intenta reconectar al servidor tras una desconexión.
   * Reintentos limitados con delay exponencial.
   */
  attemptReconnect() {
    // Verificar si se alcanzó el máximo de intentos
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo de reconexiones alcanzado');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Reconectando... (${this.reconnectAttempts}/${this. maxReconnectAttempts})`);

    // Esperar antes de reintentar
    setTimeout(() => {
      this. connect();
    }, this.reconnectDelay);
  }

  // =========================================================
  //              ENVÍO DE MENSAJES
  // =========================================================

  /**
   * Envía un objeto JavaScript al servidor (se serializa a JSON).
   * 
   * @param {Object} data - Objeto a enviar (ej: { tipoEvento: 'SOLICITAR_TURNO', ...  })
   * @returns {boolean} - true si se envió correctamente, false si no hay conexión
   * 
   * EJEMPLO:
   * ws.send({ tipoEvento: 'SOLICITAR_REGISTRO', jugadorAfectado: { id: 1, nombre: 'Candy' } });
   */
  send(data) {
    // Verificar que la conexión esté activa
    if (!this.connected || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket no está conectado');
      return false;
    }

    try {
      const json = JSON.stringify(data); // Convertir objeto a JSON
      this. ws.send(json);                // Enviar por WebSocket
      console.log('📤 Mensaje enviado:', data);
      return true;
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
      return false;
    }
  }

  // =========================================================
  //              MANEJO DE EVENTOS (Observer Pattern)
  // =========================================================

  /**
   * Registra un callback para un evento específico.
   * 
   * @param {string} event - Nombre del evento ('connect', 'message', 'disconnect', 'error')
   * @param {Function} callback - Función a ejecutar cuando ocurra el evento
   * 
   * EJEMPLO:
   * ws.on('message', (data) => {
   *   console.log('Recibí:', data);
   * });
   */
  on(event, callback) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = []; // Inicializar array si no existe
    }
    this.eventHandlers[event]. push(callback); // Agregar callback a la lista
  }

  /**
   * Elimina un callback de un evento. 
   * 
   * @param {string} event - Nombre del evento
   * @param {Function} callback - Callback a remover
   */
  off(event, callback) {
    if (! this.eventHandlers[event]) return;
    this.eventHandlers[event] = this.eventHandlers[event]. filter(
      cb => cb !== callback
    );
  }

  /**
   * Dispara un evento, ejecutando todos sus callbacks registrados.
   * 
   * @param {string} event - Nombre del evento
   * @param {*} data - Datos a pasar a los callbacks
   */
  trigger(event, data) {
    if (!this.eventHandlers[event]) return;
    this.eventHandlers[event].forEach(callback => {
      try {
        callback(data); // Ejecutar callback con los datos
      } catch (error) {
        console.error(`❌ Error en handler de '${event}':`, error);
      }
    });
  }

  // =========================================================
  //              DESCONEXIÓN MANUAL
  // =========================================================

  /**
   * Cierra la conexión WebSocket manualmente (sin reconexión).
   */
  disconnect() {
    if (this.ws) {
      this.reconnectAttempts = this.maxReconnectAttempts; // Evitar reconexión automática
      this.ws.close();
      this.ws = null;
    }
  }

  // =========================================================
  //              ESTADO
  // =========================================================

  /**
   * Verifica si el WebSocket está conectado y listo para enviar mensajes. 
   * 
   * @returns {boolean} - true si está conectado, false si no
   */
  isConnected() {
    return this.connected && this.ws && this.ws. readyState === WebSocket. OPEN;
  }
}