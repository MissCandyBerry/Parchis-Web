// =========================================================
//     GESTOR DE FICHAS - RENDERIZADO Y SELECCIÓN
// =========================================================
/**
 * Clase que gestiona el estado y renderizado de todas las fichas del juego.
 * 
 * RESPONSABILIDADES:
 * - Mantener el estado de las 16 fichas (4 por color)
 * - Dibujar fichas según su posición (base/anillo/pasillo/meta)
 * - Detectar clicks del mouse sobre fichas
 * - Animar movimientos de fichas
 * - Actualizar estado de fichas según eventos del broker
 * 
 * ESTRUCTURA DE DATOS:
 * this.fichas = {
 *   ROJO: {
 *     0: { color, id, posicion, enBase, enPasillo, enMeta, indicePasillo },
 *     1: { ...  },
 *     2: { ... },
 *     3: { ... }
 *   },
 *   AZUL: { ... },
 *   VERDE: { ... },
 *   AMARILLO: { ... }
 * }
 * 
 * ESTADOS DE UNA FICHA:
 * - enBase: true      → posicion = -1, en círculo grande del color
 * - enAnillo: true    → 0 <= posicion < 68 (casillas del tablero)
 * - enPasillo: true   → indicePasillo 0-6 (7 casillas finales)
 * - enMeta: true      → Llegó al centro (ganó)
 * 
 * USO:
 * ```
 * const manager = new PieceManager(boardRenderer);
 * manager.dibujarTodasLasFichas();
 * 
 * // Actualizar ficha después de moverla
 * manager.actualizarFicha('ROJO', 0, {
 *   posicion: 10,
 *   enBase: false,
 *   enPasillo: false,
 *   enMeta: false
 * });
 * 
 * // Detectar click
 * const idFicha = manager.seleccionarFichaEnPosicion(x, y, 'ROJO');
 * if (idFicha !== null) {
 *   console.log('Ficha seleccionada:', idFicha);
 * }
 * ```
 */

class PieceManager {
  /**
   * Constructor que inicializa el estado de las 16 fichas.
   * 
   * @param {BoardRenderer} boardRenderer - Instancia del renderizador del tablero
   */
  constructor(boardRenderer) {
    this.board = boardRenderer;
    this. ctx = boardRenderer.ctx;
    
    console.log('✅ PieceManager inicializado');
    
    // ===== ESTADO DE LAS FICHAS =====
    // Cada color tiene 4 fichas (índices 0-3)
    this.fichas = {
      ROJO: this.crearFichasIniciales('ROJO'),
      AZUL: this.crearFichasIniciales('AZUL'),
      VERDE: this. crearFichasIniciales('VERDE'),
      AMARILLO: this.crearFichasIniciales('AMARILLO')
    };
    
    // Ficha actualmente seleccionada (para highlight)
    this.fichaSeleccionada = null;
  }
  
  // =========================================================
  //              CREAR FICHAS INICIALES
  // =========================================================
  
  /**
   * Crea el estado inicial de las 4 fichas de un color.
   * Todas comienzan en BASE (posicion = -1).
   * 
   * @param {string} color - Color de las fichas ('ROJO', 'AZUL', 'VERDE', 'AMARILLO')
   * @returns {Object} Diccionario con {0: ficha, 1: ficha, 2: ficha, 3: ficha}
   */
  crearFichasIniciales(color) {
    return {
      0: { 
        color,           // Color de la ficha
        id: 0,           // Identificador (0-3)
        posicion: -1,    // -1 = BASE (no está en el anillo)
        enBase: true,    // Está en el círculo grande de inicio
        enPasillo: false,// No está en el pasillo final
        enMeta: false,   // No llegó a la meta
        indicePasillo: -1 // Índice dentro del pasillo (0-6 cuando entra)
      },
      1: { color, id: 1, posicion: -1, enBase: true, enPasillo: false, enMeta: false, indicePasillo: -1 },
      2: { color, id: 2, posicion: -1, enBase: true, enPasillo: false, enMeta: false, indicePasillo: -1 },
      3: { color, id: 3, posicion: -1, enBase: true, enPasillo: false, enMeta: false, indicePasillo: -1 }
    };
  }
  
  // =========================================================
  //              ACTUALIZAR ESTADO DE FICHAS
  // =========================================================
  
  /**
   * Actualiza el estado de una ficha según datos recibidos del broker.
   * Usa Object.assign para actualizar solo los campos presentes en 'datos'.
   * 
   * @param {string} color - Color de la ficha ('ROJO', 'AZUL', etc.)
   * @param {number} idFicha - ID de la ficha (0-3)
   * @param {Object} datos - Datos a actualizar:
   *   - posicion: número de casilla (0-67) o -1 si no está en anillo
   *   - enBase: true/false
   *   - enPasillo: true/false
   *   - enMeta: true/false
   *   - indicePasillo: 0-6 (si está en pasillo)
   * 
   * EJEMPLO:
   * manager.actualizarFicha('ROJO', 0, {
   *   posicion: 15,
   *   enBase: false,
   *   enPasillo: false
   * });
   */
  actualizarFicha(color, idFicha, datos) {
    // Validar que la ficha existe
    if (!this.fichas[color] || ! this.fichas[color][idFicha]) {
      console.warn(`⚠️ Ficha no encontrada: ${color} #${idFicha}`);
      return;
    }
    
    // Actualizar solo los campos presentes en 'datos'
    Object.assign(this. fichas[color][idFicha], datos);
    console.log(`✅ Ficha actualizada: ${color} #${idFicha}`, datos);
  }
  
  // =========================================================
  //                  RENDERIZAR FICHAS
  // =========================================================
  
  /**
   * Dibuja TODAS las fichas de TODOS los colores.
   * Este método se llama cada vez que hay que redibujar el estado completo.
   */
  dibujarTodasLasFichas() {
    // Iterar por cada color (ROJO, AZUL, VERDE, AMARILLO)
    Object.keys(this.fichas).forEach(color => {
      // Dibujar las 4 fichas del color
      for (let i = 0; i < 4; i++) {
        this.dibujarFicha(color, i);
      }
    });
  }
  
  /**
   * Dibuja UNA ficha según su estado actual (base/anillo/pasillo/meta). 
   * 
   * LÓGICA DE POSICIONAMIENTO:
   * 1. Si enMeta: centro del tablero
   * 2. Si enPasillo: casilla del pasillo según indicePasillo
   * 3. Si enBase O posicion < 0: círculo de base
   * 4. Si ninguno de los anteriores: anillo principal (casilla 0-67)
   * 
   * VISUALIZACIÓN:
   * - Círculo del color de la ficha
   * - Sombra para efecto 3D
   * - Borde negro (o blanco si está seleccionada)
   * - Número de la ficha (0-3) en el centro
   * 
   * @param {string} color - Color de la ficha
   * @param {number} idFicha - ID de la ficha (0-3)
   */
  dibujarFicha(color, idFicha) {
    const ficha = this.fichas[color][idFicha];
    if (!ficha) return;
    
    let pos = null; // Coordenadas {x, y} donde dibujar
    
    // ===== DETERMINAR POSICIÓN SEGÚN ESTADO =====
    if (ficha.enMeta) {
      // En meta: centro del tablero
      pos = { x: this.board.centerX, y: this.board. centerY };
    } else if (ficha.enPasillo) {
      // En pasillo: obtener coordenadas del pasillo
      pos = this.board.getPosicionPasillo(color, ficha.indicePasillo);
    } else if (ficha. enBase || ficha.posicion < 0) {
      // En base: círculo grande del color
      pos = this.board.getPosicionBase(color, idFicha);
    } else {
      // En anillo: casilla 0-67
      pos = this.board.getPosicionCasilla(ficha.posicion);
    }
    
    // Si no hay posición válida, no dibujar
    if (! pos) return;
    
    // ===== RADIO DE LA FICHA =====
    // Se calcula como fracción del tamaño de celda
    const radius = Math.min(this.board.cellWidth, this.board.cellHeight) / 2.5;
    
    // ===== SOMBRA (EFECTO 3D) =====
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; // Negro semitransparente
    this. ctx.shadowBlur = 8;                      // Difuminado
    this.ctx.shadowOffsetX = 3;                   // Desplazamiento horizontal
    this.ctx.shadowOffsetY = 3;                   // Desplazamiento vertical
    
    // ===== CÍRCULO PRINCIPAL (COLOR DE LA FICHA) =====
    this.ctx.fillStyle = this.board.colores[color];
    this. ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Resetear sombra (para que no afecte otros dibujos)
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    // ===== BORDE DEL CÍRCULO =====
    // Si está seleccionada: borde blanco grueso
    // Si no: borde negro fino
    const esSeleccionada = this.fichaSeleccionada && 
                           this.fichaSeleccionada.color === color && 
                           this.fichaSeleccionada.id === idFicha;
    
    this.ctx.strokeStyle = esSeleccionada ?  '#ffffff' : '#333333';
    this.ctx. lineWidth = esSeleccionada ? 5 : 3;
    this.ctx.stroke();
    
    // ===== BRILLO ADICIONAL SI ESTÁ SELECCIONADA =====
    if (esSeleccionada) {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; // Blanco semitransparente
      this.ctx.lineWidth = 7;
      this.ctx.stroke();
    }
    
    // ===== NÚMERO DE LA FICHA (0-3) EN EL CENTRO =====
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(idFicha. toString(), pos.x, pos. y);
  }
  
  // =========================================================
  //              SELECCIÓN CON MOUSE (CLICK)
  // =========================================================
  
  /**
   * Detecta si un click del mouse cayó sobre alguna ficha del jugador.
   * Calcula la distancia entre el punto clickeado y el centro de cada ficha.
   * Si la distancia es <= radio, la ficha está seleccionada.
   * 
   * ALGORITMO:
   * 1.  Iterar por las 4 fichas del color del jugador
   * 2.  Obtener posición de cada ficha según su estado
   * 3.  Calcular distancia euclidiana: sqrt((x2-x1)² + (y2-y1)²)
   * 4. Si distancia <= radio → ficha clickeada
   * 
   * @param {number} x - Coordenada X del click (relativa al canvas)
   * @param {number} y - Coordenada Y del click (relativa al canvas)
   * @param {string} colorJugador - Color del jugador que hace click
   * @returns {number|null} - ID de la ficha (0-3) o null si no clickeó ninguna
   * 
   * EJEMPLO:
   * canvas.onclick = (e) => {
   *   const rect = canvas.getBoundingClientRect();
   *   const x = e. clientX - rect.left;
   *   const y = e. clientY - rect.top;
   *   const idFicha = manager.seleccionarFichaEnPosicion(x, y, 'ROJO');
   *   if (idFicha !== null) {
   *     console.log('Clickeaste la ficha', idFicha);
   *   }
   * };
   */
  seleccionarFichaEnPosicion(x, y, colorJugador) {
    // Calcular radio de detección (mismo que el de dibujo)
    const radius = Math.min(this.board.cellWidth, this.board. cellHeight) / 2.5;
    
    // Resetear selección previa
    this.fichaSeleccionada = null;
    
    // Buscar ficha del jugador en esa posición
    for (let i = 0; i < 4; i++) {
      const ficha = this.fichas[colorJugador][i];
      if (! ficha) continue;
      
      // Obtener posición de la ficha según su estado
      let pos = null;
      
      if (ficha.enMeta) {
        pos = { x: this.board.centerX, y: this.board.centerY };
      } else if (ficha.enPasillo) {
        pos = this.board.getPosicionPasillo(colorJugador, ficha. indicePasillo);
      } else if (ficha.enBase || ficha.posicion < 0) {
        pos = this.board.getPosicionBase(colorJugador, i);
      } else {
        pos = this.board.getPosicionCasilla(ficha. posicion);
      }
      
      if (!pos) continue; // Posición inválida, saltar
      
      // ===== CÁLCULO DE DISTANCIA EUCLIDIANA =====
      // dist = √((x₂-x₁)² + (y₂-y₁)²)
      const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      
      // Debug: imprimir distancias para diagnóstico
      console.log(`[DEBUG] Ficha ${i}: pos=(${pos.x. toFixed(0)}, ${pos.y.toFixed(0)}), click=(${x.toFixed(0)}, ${y.toFixed(0)}), dist=${dist.toFixed(0)}, radius=${radius. toFixed(0)}`);
      
      // ===== DETECCIÓN DE CLICK =====
      // Si la distancia es menor o igual al radio → click dentro del círculo
      if (dist <= radius) {
        this.fichaSeleccionada = ficha;
        console.log(`✅ Ficha seleccionada: ${colorJugador} #${i}`);
        return i; // Retorna el ID de la ficha seleccionada
      }
    }
    
    // No se clickeó ninguna ficha
    console.log('⚠️ No se seleccionó ninguna ficha');
    return null;
  }
  
  // =========================================================
  //              ANIMACIÓN DE MOVIMIENTO
  // =========================================================
  
  /**
   * Anima el movimiento de una ficha desde un punto A a un punto B.
   * Usa requestAnimationFrame para lograr 60 FPS.
   * Aplica easing (suavizado) para movimiento natural.
   * Incluye efecto de "salto" (sube y baja durante el trayecto).
   * 
   * PARÁMETROS:
   * @param {string} color - Color de la ficha
   * @param {number} idFicha - ID de la ficha (0-3)
   * @param {Object} posInicial - {x, y} punto de partida
   * @param {Object} posFinal - {x, y} punto de llegada
   * @param {number} duracion - Duración en milisegundos (ej: 500 = medio segundo)
   * @param {Function} callback - Función a ejecutar al terminar la animación
   * 
   * EJEMPLO:
   * const posA = { x: 100, y: 200 };
   * const posB = { x: 300, y: 400 };
   * manager.animarMovimiento('ROJO', 0, posA, posB, 500, () => {
   *   console. log('Animación terminada');
   * });
   */
  animarMovimiento(color, idFicha, posInicial, posFinal, duracion, callback) {
    const ficha = this.fichas[color][idFicha];
    if (!ficha) return;
    
    const startTime = Date.now();
    
    /**
     * Función recursiva que se ejecuta en cada frame (60 FPS).
     */
    const animate = () => {
      // Calcular tiempo transcurrido
      const elapsed = Date.now() - startTime;
      
      // Progreso (0. 0 a 1.0)
      const progress = Math.min(elapsed / duracion, 1);
      
      // Aplicar easing (suavizado cúbico)
      const easeProgress = this.easeInOutCubic(progress);
      
      // ===== INTERPOLACIÓN LINEAL =====
      // x(t) = x₀ + (x₁ - x₀) * t
      // y(t) = y₀ + (y₁ - y₀) * t
      const x = posInicial.x + (posFinal.x - posInicial.x) * easeProgress;
      const y = posInicial.y + (posFinal.y - posInicial. y) * easeProgress;
      
      // ===== REDIBUJAR TODO EL TABLERO =====
      this.board.dibujarTablero();
      this.dibujarTodasLasFichas();
      
      // ===== EFECTO DE SALTO (SENO) =====
      // La ficha sube en el medio del trayecto y baja al final
      const radius = Math.min(this.board.cellWidth, this.board. cellHeight) / 2.5;
      const jumpHeight = Math.sin(progress * Math.PI) * 15; // 15px de altura máxima
      
      // ===== DIBUJAR FICHA EN MOVIMIENTO =====
      // Sombra
      this.ctx. shadowColor = 'rgba(0, 0, 0, 0.4)';
      this.ctx. shadowBlur = 10;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
      
      // Círculo
      this.ctx.fillStyle = this.board.colores[color];
      this.ctx.beginPath();
      this. ctx.arc(x, y - jumpHeight, radius, 0, Math.PI * 2); // Restar jumpHeight para "subir"
      this.ctx. fill();
      
      // Resetear sombra
      this. ctx.shadowColor = 'transparent';
      this.ctx.shadowBlur = 0;
      
      // Borde
      this.ctx. strokeStyle = '#fff';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
      
      // Número
      this.ctx.fillStyle = 'white';
      this.ctx.font = 'bold 18px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(idFicha.toString(), x, y - jumpHeight);
      
      // ===== CONTINUAR ANIMACIÓN O TERMINAR =====
      if (progress < 1) {
        // Solicitar siguiente frame
        requestAnimationFrame(animate);
      } else {
        // Animación completada: redibujar estado final y ejecutar callback
        this.board. dibujarTablero();
        this.dibujarTodasLasFichas();
        if (callback) callback();
      }
    };
    
    // Iniciar animación
    animate();
  }
  
  // =========================================================
  //              FUNCIONES DE EASING (SUAVIZADO)
  // =========================================================
  
  /**
   * Función de easing cúbico (in-out). 
   * Hace que la animación:
   * - Inicie lento (aceleración)
   * - Vaya rápido en el medio
   * - Termine lento (desaceleración)
   * 
   * FÓRMULA:
   * - Si t < 0.5: 4t³
   * - Si t >= 0.5: 1 - (-2t + 2)³ / 2
   * 
   * @param {number} t - Progreso (0.0 a 1.0)
   * @returns {number} - Progreso suavizado (0.0 a 1. 0)
   * 
   * GRÁFICA:
   *    ^
   *  1 |           ___---
   *    |      __---
   *  0 |___---
   *    +--------------->
   *    0      0.5      1
   */
  easeInOutCubic(t) {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  // =========================================================
  //              OBTENER INFORMACIÓN DE FICHAS
  // =========================================================
  
  /**
   * Devuelve un resumen del estado de las fichas de un color.
   * Útil para mostrar estadísticas en la UI (ej: "2/4 en meta"). 
   * 
   * @param {string} color - Color de las fichas
   * @returns {Object|null} Objeto con contadores:
   *   - enBase: número de fichas en base
   *   - enAnillo: número de fichas en el anillo principal
   *   - enPasillo: número de fichas en el pasillo final
   *   - enMeta: número de fichas que llegaron a meta
   * 
   * EJEMPLO:
   * const estado = manager.obtenerEstadoFichas('ROJO');
   * console.log(`Fichas en meta: ${estado.enMeta}/4`);
   */
  obtenerEstadoFichas(color) {
    const fichasColor = this.fichas[color];
    if (! fichasColor) return null;
    
    return {
      enBase: Object.values(fichasColor).filter(f => f.enBase). length,
      enAnillo: Object.values(fichasColor). filter(f => ! f.enBase && ! f.enPasillo && ! f.enMeta).length,
      enPasillo: Object.values(fichasColor).filter(f => f.enPasillo).length,
      enMeta: Object. values(fichasColor).filter(f => f.enMeta).length
    };
  }
  
  // =========================================================
  //              RESET DE FICHAS (NUEVA PARTIDA)
  // =========================================================
  
  /**
   * Reinicia TODAS las fichas a su estado inicial (en base).
   * Útil para empezar una nueva partida sin recargar la página.
   */
  resetearTodasLasFichas() {
    this.fichas = {
      ROJO: this.crearFichasIniciales('ROJO'),
      AZUL: this.crearFichasIniciales('AZUL'),
      VERDE: this.crearFichasIniciales('VERDE'),
      AMARILLO: this.crearFichasIniciales('AMARILLO')
    };
    this.fichaSeleccionada = null;
    console.log('♻️ Todas las fichas reseteadas');
  }
}