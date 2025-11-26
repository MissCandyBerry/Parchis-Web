// =========================================================
//  RENDERIZADOR DEL TABLERO DE PARCHÍS
// =========================================================
/**
 * Clase que dibuja el tablero completo de Parchís en un canvas HTML5.
 * 
 * RESPONSABILIDADES:
 * - Dibujar las 68 casillas del anillo principal
 * - Dibujar las 4 bases (círculos grandes de cada color)
 * - Dibujar los 4 pasillos de color (7 casillas cada uno)
 * - Dibujar la meta central (cuadrado con 4 triángulos de colores)
 * - Proveer métodos para obtener coordenadas de casillas/bases/pasillos
 * 
 * ESTRUCTURA DEL TABLERO:
 * - Anillo principal: 68 casillas numeradas (0-67)
 * - Bases: 4 círculos grandes (uno por color) con 4 posiciones cada uno
 * - Pasillos: 7 casillas por color (índices 0-6, el 7 es meta)
 * - Meta: Cuadrado central dividido en 4 triángulos (uno por color)
 * 
 * CONFIGURACIÓN DE TAMAÑO:
 * - cellWidth/cellHeight: Tamaño de cada casilla (ajustable)
 * - Sugerencias:
 *   * Original:   cellWidth: 38,  cellHeight: 38  (pequeño)
 *   * Intermedio: cellWidth: 57,  cellHeight: 38  (RECOMENDADO)
 *   * Grande:     cellWidth: 76,  cellHeight: 38  (grande)
 * 
 * CASILLAS ESPECIALES:
 * - Casilla 0:  Salida ROJO
 * - Casilla 17: Salida AZUL
 * - Casilla 34: Salida AMARILLO
 * - Casilla 51: Salida VERDE
 * 
 * USO:
 * ```
 * const renderer = new BoardRenderer('tablero'); // ID del canvas
 * renderer.dibujarTablero(); // Dibuja todo el tablero
 * 
 * // Obtener coordenadas de casillas
 * const pos = renderer.getPosicionCasilla(10); // {x: 590, y: 440}
 * const posBase = renderer.getPosicionBase('ROJO', 0); // Primera ficha roja en base
 * ```
 */

class BoardRenderer {
  /**
   * Constructor que inicializa el canvas y calcula las posiciones. 
   * 
   * @param {string} canvasId - ID del elemento canvas en el HTML
   */
  constructor(canvasId) {
    this. canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error('❌ Canvas no encontrado:', canvasId);
      return;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;   // 1180px por defecto
    this.height = this.canvas.height; // 880px por defecto
    
    console.log('✅ BoardRenderer inicializado:', this.width, 'x', this.height);
    
    // ===== PALETA DE COLORES =====
    this. colores = {
      ROJO:     '#c0504d',  // Rojo oscuro
      AZUL:     '#4f81bd',  // Azul medio
      VERDE:    '#77a968',  // Verde oliva
      AMARILLO: '#f0ad4e',  // Amarillo dorado
      fondo:    '#d4a574',  // Madera clara
      borde:    '#8b6f47',  // Madera oscura
      casilla:  '#f5deb3',  // Beige claro (casillas normales)
      texto:    '#3a2a1a'   // Marrón muy oscuro (números)
    };
    
    // ===== TAMAÑO DE CASILLAS (AJUSTABLE) =====
    // Cambiar estos valores para redimensionar el tablero
    this.cellWidth = 57;   // ⬅️ Ancho de cada casilla
    this.cellHeight = 38;  // ⬅️ Alto de cada casilla
    
    // Centro del canvas (para cálculos de posiciones)
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    
    // ===== PRECALCULAR TODAS LAS POSICIONES =====
    // Esto se hace UNA VEZ al inicializar para optimizar el renderizado
    this.casillasAnillo = this.calcularPosicionesCasillas(); // 68 casillas
    this. basesPos = this.calcularPosicionesBases();          // 4 bases (ROJO, AZUL, VERDE, AMARILLO)
    this.pasillosPos = this.calcularPosicionesPasillos();    // 4 pasillos x 7 casillas
    
    console.log('✅ Posiciones calculadas:', this.casillasAnillo. length, 'casillas');
  }

  // =========================================================
  //    CÁLCULO DE LAS 68 CASILLAS DEL ANILLO
  // =========================================================
  /**
   * Calcula las coordenadas {x, y} de las 68 casillas del anillo principal.
   * 
   * DISTRIBUCIÓN:
   * - Casillas 0-16:  Brazo ROJO (arriba-derecha)
   * - Casillas 17-33: Brazo AZUL (derecha)
   * - Casillas 34-50: Brazo AMARILLO (abajo)
   * - Casillas 51-67: Brazo VERDE (izquierda)
   * 
   * NOTA: Las coordenadas son el CENTRO de cada casilla.
   * 
   * @returns {Array<{x: number, y: number}>} Array de 68 posiciones
   */
  calcularPosicionesCasillas() {
    const casillas = new Array(68);
    const cw = this.cellWidth;
    const ch = this.cellHeight;
    const cx = this.centerX;
    const cy = this.centerY;
    
    // Offset horizontal para centrar el tablero
    const offsetX = cw * 2;
    
    // ===== BRAZO ROJO (0-16): Vertical arriba, luego horizontal derecha =====
    casillas[0] = { x: cx - cw * 3 + offsetX, y: cy - ch * 3 - ch * 2 };  // Salida ROJO
    casillas[1] = { x: cx - cw * 3 + offsetX, y: cy - ch * 4 - ch * 2 };
    casillas[2] = { x: cx - cw * 3 + offsetX, y: cy - ch * 5 - ch * 2 };
    casillas[3] = { x: cx - cw * 3 + offsetX, y: cy - ch * 6 - ch * 2 };
    casillas[4] = { x: cx - cw * 2 + offsetX, y: cy - ch * 7 - ch };
    casillas[5] = { x: cx - cw + offsetX, y: cy - ch * 7 - ch };         // Segura
    casillas[6] = { x: cx - cw + offsetX, y: cy - ch * 7 };
    casillas[7] = { x: cx - cw + offsetX, y: cy - ch * 6 };
    casillas[8] = { x: cx - cw + offsetX, y: cy - ch * 5 };
    casillas[9] = { x: cx - cw + offsetX, y: cy - ch * 4 };
    casillas[10] = { x: cx - cw + offsetX, y: cy - ch * 3 };
    casillas[11] = { x: cx - cw + offsetX, y: cy - ch * 2 };
    casillas[12] = { x: cx - cw + offsetX, y: cy - ch };                 // Segura (entrada pasillo ROJO)
    casillas[13] = { x: cx + offsetX, y: cy };
    casillas[14] = { x: cx + cw + offsetX, y: cy };
    casillas[15] = { x: cx + cw * 2 + offsetX, y: cy };
    casillas[16] = { x: cx + cw * 3 + offsetX, y: cy };
    
    // ===== BRAZO AZUL (17-33): Horizontal derecha, luego vertical abajo =====
    casillas[17] = { x: cx + cw * 4 + offsetX, y: cy };                  // Salida AZUL
    casillas[18] = { x: cx + cw * 5 + offsetX, y: cy };
    casillas[19] = { x: cx + cw * 6 + offsetX, y: cy };
    casillas[20] = { x: cx + cw * 7 + offsetX, y: cy };
    casillas[21] = { x: cx + cw * 7 + offsetX, y: cy + ch };
    casillas[22] = { x: cx + cw * 7 + offsetX, y: cy + ch * 2 };         // Segura
    casillas[23] = { x: cx + cw * 6 + offsetX, y: cy + ch * 2 };
    casillas[24] = { x: cx + cw * 5 + offsetX, y: cy + ch * 2 };
    casillas[25] = { x: cx + cw * 4 + offsetX, y: cy + ch * 2 };
    casillas[26] = { x: cx + cw * 3 + offsetX, y: cy + ch * 2 };
    casillas[27] = { x: cx + cw * 2 + offsetX, y: cy + ch * 2 };
    casillas[28] = { x: cx + cw + offsetX, y: cy + ch * 2 };
    casillas[29] = { x: cx + offsetX, y: cy + ch * 2 };                  // Segura (entrada pasillo AZUL)
    casillas[30] = { x: cx - cw + offsetX, y: cy + ch * 2 + ch };
    
    // ===== BRAZO AMARILLO (31-50): Vertical abajo, luego horizontal izquierda =====
    casillas[31] = { x: cx - cw + offsetX, y: cy + ch * 3 + ch };
    casillas[32] = { x: cx - cw + offsetX, y: cy + ch * 4 + ch };
    casillas[33] = { x: cx - cw + offsetX, y: cy + ch * 5 + ch };
    casillas[34] = { x: cx - cw + offsetX, y: cy + ch * 6 + ch };        // Salida AMARILLO
    casillas[35] = { x: cx - cw + offsetX, y: cy + ch * 7 + ch };
    casillas[36] = { x: cx - cw + offsetX, y: cy + ch * 8 + ch };
    casillas[37] = { x: cx - cw + offsetX, y: cy + ch * 9 + ch };
    casillas[38] = { x: cx - cw * 2 + offsetX, y: cy + ch * 9 + ch };
    casillas[39] = { x: cx - cw * 3 + offsetX, y: cy + ch * 9 + ch };    // Segura
    casillas[40] = { x: cx - cw * 3 + offsetX, y: cy + ch * 8 + ch };
    casillas[41] = { x: cx - cw * 3 + offsetX, y: cy + ch * 7 + ch };
    casillas[42] = { x: cx - cw * 3 + offsetX, y: cy + ch * 6 + ch };
    casillas[43] = { x: cx - cw * 3 + offsetX, y: cy + ch * 5 + ch };
    casillas[44] = { x: cx - cw * 3 + offsetX, y: cy + ch * 4 + ch };
    casillas[45] = { x: cx - cw * 3 + offsetX, y: cy + ch * 3 + ch };
    casillas[46] = { x: cx - cw * 3 + offsetX, y: cy + ch * 2 + ch };    // Segura (entrada pasillo AMARILLO)
    casillas[47] = { x: cx - cw * 4 + offsetX, y: cy + ch * 2 };
    casillas[48] = { x: cx - cw * 5 + offsetX, y: cy + ch * 2 };
    casillas[49] = { x: cx - cw * 6 + offsetX, y: cy + ch * 2 };
    casillas[50] = { x: cx - cw * 7 + offsetX, y: cy + ch * 2 };
    
    // ===== BRAZO VERDE (51-67): Horizontal izquierda, luego vertical arriba =====
    casillas[51] = { x: cx - cw * 8 + offsetX, y: cy + ch * 2 };         // Salida VERDE
    casillas[52] = { x: cx - cw * 9 + offsetX, y: cy + ch * 2 };
    casillas[53] = { x: cx - cw * 10 + offsetX, y: cy + ch * 2 };
    casillas[54] = { x: cx - cw * 11 + offsetX, y: cy + ch * 2 };
    casillas[55] = { x: cx - cw * 11 + offsetX, y: cy + ch };
    casillas[56] = { x: cx - cw * 11 + offsetX, y: cy };                 // Segura
    casillas[57] = { x: cx - cw * 10 + offsetX, y: cy };
    casillas[58] = { x: cx - cw * 9 + offsetX, y: cy };
    casillas[59] = { x: cx - cw * 8 + offsetX, y: cy };
    casillas[60] = { x: cx - cw * 7 + offsetX, y: cy };
    casillas[61] = { x: cx - cw * 6 + offsetX, y: cy };
    casillas[62] = { x: cx - cw * 5 + offsetX, y: cy };
    casillas[63] = { x: cx - cw * 4 + offsetX, y: cy };                  // Segura (entrada pasillo VERDE)
    casillas[64] = { x: cx - cw * 3 + offsetX, y: cy - ch };
    casillas[65] = { x: cx - cw * 3 + offsetX, y: cy - ch * 2 };
    casillas[66] = { x: cx - cw * 3 + offsetX, y: cy - ch * 3 };
    casillas[67] = { x: cx - cw * 3 + offsetX, y: cy - ch * 4 };         // Entrada pasillo ROJO (cierra el anillo)
    
    return casillas;
  }
  
  /**
   * Calcula las posiciones centrales de las 4 BASES (círculos grandes).
   * Cada base tiene espacio para 4 fichas (en los 4 cuadrantes del círculo).
   * 
   * @returns {Object} Diccionario con {ROJO: {x,y}, AZUL: {x,y}, ... }
   */
  calcularPosicionesBases() {
    const offsetX = this.cellWidth * 7.5;   // Distancia horizontal del centro
    const offsetY = this.cellHeight * 7;    // Distancia vertical del centro
    
    return {
      ROJO:     { x: this.centerX - offsetX, y: this. centerY - offsetY }, // Arriba-izquierda
      AZUL:     { x: this.centerX + offsetX, y: this.centerY - offsetY }, // Arriba-derecha
      VERDE:    { x: this.centerX - offsetX, y: this.centerY + offsetY }, // Abajo-izquierda
      AMARILLO: { x: this.centerX + offsetX, y: this.centerY + offsetY }  // Abajo-derecha
    };
  }
  
  /**
   * Calcula las posiciones de las 7 casillas de cada PASILLO de color.
   * Los pasillos son las 7 casillas finales antes de la meta (índices 0-6).
   * 
   * @returns {Object} Diccionario con {ROJO: [{x,y}, ...], AZUL: [... ], ...}
   */
  calcularPosicionesPasillos() {
    const pasillos = {};
    const cx = this.centerX;
    const cy = this.centerY;
    const cw = this.cellWidth;
    const ch = this.cellHeight;
    const offsetX = cw * 2;
    
    // ===== PASILLO ROJO: Vertical hacia abajo (desde arriba) =====
    pasillos. ROJO = [];
    pasillos.ROJO. push({ x: cx - cw * 2 + offsetX, y: cy - ch * 7 });      // Índice 0 (entrada)
    for (let i = 1; i < 7; i++) {
      pasillos.ROJO.push({ x: cx - cw * 2 + offsetX, y: cy - ch * 6 + (i - 1) * ch });
    }
    
    // ===== PASILLO AZUL: Horizontal hacia izquierda (desde derecha) =====
    pasillos.AZUL = [];
    for (let i = 0; i < 7; i++) {
      pasillos.AZUL.push({ x: cx + cw * 6 - i * cw + offsetX, y: cy + ch });
    }
    
    // ===== PASILLO AMARILLO: Vertical hacia arriba (desde abajo) =====
    pasillos.AMARILLO = [];
    for (let i = 0; i < 7; i++) {
      pasillos.AMARILLO.push({ x: cx - cw * 2 + offsetX, y: cy + ch * 8 + ch - i * ch });
    }
    
    // ===== PASILLO VERDE: Horizontal hacia derecha (desde izquierda) =====
    pasillos. VERDE = [];
    pasillos.VERDE.push({ x: cx - cw * 11 + offsetX + cw, y: cy + ch }); // Índice 0
    for (let i = 1; i < 7; i++) {
      pasillos. VERDE.push({ x: cx - cw * 10 + (i - 1) * cw + offsetX + cw, y: cy + ch });
    }
    
    return pasillos;
  }

  // =========================================================
  //              RENDERIZADO COMPLETO DEL TABLERO
  // =========================================================
  /**
   * Dibuja TODO el tablero (casillas, pasillos, bases y meta).
   * Este método se llama cada vez que necesitas redibujar el tablero completo.
   * 
   * ORDEN DE DIBUJADO:
   * 1. Fondo (color madera)
   * 2.  Casillas del anillo (68 casillas)
   * 3. Pasillos de colores (4 x 7 casillas)
   * 4. Bases (4 círculos grandes)
   * 5. Meta central (cuadrado de 4 triángulos)
   */
  dibujarTablero() {
    // 1) Fondo completo
    this.ctx.fillStyle = this.colores.fondo;
    this.ctx. fillRect(0, 0, this.width, this.height);
    
    // 2) Dibujar en orden (de atrás hacia adelante)
    this.dibujarCasillasAnillo();
    this.dibujarPasillos();
    this.dibujarBases();
    this.dibujarCentro();
  }
  
  /**
   * Dibuja las 68 casillas del anillo principal con sus números.
   * Las casillas de SALIDA (0, 17, 34, 51) se pintan del color correspondiente.
   */
  dibujarCasillasAnillo() {
    this.casillasAnillo.forEach((pos, index) => {
      if (! pos) return; // Saltar si no existe
      
      // Determinar color de fondo (salidas tienen color especial)
      this.ctx.fillStyle = this. colores.casilla; // Color por defecto (beige)
      if (index === 0)  this.ctx.fillStyle = this. colores. ROJO;
      if (index === 17) this.ctx. fillStyle = this.colores. AZUL;
      if (index === 34) this.ctx.fillStyle = this.colores.AMARILLO;
      if (index === 51) this. ctx.fillStyle = this.colores.VERDE;
      
      // Calcular esquina superior-izquierda del rectángulo
      const x = pos.x - this.cellWidth / 2;
      const y = pos.y - this.cellHeight / 2;
      
      // Dibujar rectángulo de la casilla
      this.ctx. fillRect(x, y, this.cellWidth, this.cellHeight);
      
      // Dibujar borde
      this.ctx.strokeStyle = this.colores.borde;
      this.ctx. lineWidth = 2;
      this.ctx.strokeRect(x, y, this.cellWidth, this.cellHeight);
      
      // Dibujar número de la casilla (centrado)
      this.ctx. fillStyle = this.colores. texto;
      this.ctx.font = 'bold 11px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(index. toString(), pos.x, pos.y);
    });
  }
  
  /**
   * Dibuja las 4 BASES (círculos grandes) con sus 4 posiciones para fichas.
   * Cada base es un círculo semitransparente con 4 círculos pequeños dentro.
   */
  dibujarBases() {
    Object.entries(this.basesPos).forEach(([color, pos]) => {
      const radioBase = (this.cellWidth + this.cellHeight) / 2;
      
      // Círculo grande de la base (semitransparente)
      this.ctx.fillStyle = this. colores[color];
      this.ctx. globalAlpha = 0.5;
      this.ctx.beginPath();
      this.ctx. arc(pos.x, pos. y, radioBase * 3.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
      
      // Borde del círculo grande
      this.ctx.strokeStyle = this.colores[color];
      this.ctx. lineWidth = 5;
      this.ctx.stroke();
      
      // 4 círculos pequeños para las fichas (distribuidos en los 4 cuadrantes)
      const offset = radioBase * 1.3;
      const posiciones = [
        { x: pos.x - offset, y: pos.y - offset }, // Superior-izquierda
        { x: pos.x + offset, y: pos.y - offset }, // Superior-derecha
        { x: pos.x - offset, y: pos.y + offset }, // Inferior-izquierda
        { x: pos.x + offset, y: pos.y + offset }  // Inferior-derecha
      ];
      
      posiciones.forEach(p => {
        this.ctx. fillStyle = this.colores[color];
        this.ctx. globalAlpha = 0.5;
        this.ctx.beginPath();
        this.ctx. arc(p.x, p. y, radioBase / 2.2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1.0;
        
        // Borde del círculo pequeño
        this.ctx.strokeStyle = this.colores[color];
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
      });
    });
  }
  
  /**
   * Dibuja los 4 PASILLOS de colores (7 casillas cada uno).
   * Los pasillos son semitransparentes y tienen números (0-6).
   */
  dibujarPasillos() {
    Object.entries(this.pasillosPos).forEach(([color, casillas]) => {
      casillas.forEach((pos, index) => {
        this.ctx.fillStyle = this. colores[color];
        this.ctx.globalAlpha = 0.7;
        
        // Calcular esquina superior-izquierda
        const x = pos.x - this.cellWidth / 2;
        const y = pos.y - this.cellHeight / 2;
        
        // Dibujar rectángulo del pasillo
        this.ctx.fillRect(x, y, this.cellWidth, this.cellHeight);
        this.ctx.globalAlpha = 1.0;
        
        // Borde
        this.ctx.strokeStyle = this.colores. borde;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, this. cellWidth, this.cellHeight);
        
        // Número del índice del pasillo
        this.ctx. fillStyle = 'white';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(index.toString(), pos.x, pos.y);
      });
    });
  }
  
  /**
   * Dibuja la META CENTRAL: un cuadrado dividido en 4 triángulos de colores.
   * Cada triángulo representa el destino final de un color. 
   * 
   * DISTRIBUCIÓN:
   * - Triángulo superior: ROJO
   * - Triángulo derecho: AZUL
   * - Triángulo inferior: AMARILLO
   * - Triángulo izquierdo: VERDE
   */
  dibujarCentro() {
    const cx = this.centerX;
    const cy = this.centerY;
    
    // Tamaño del cuadrado central (del tamaño de una casilla)
    const metaWidth = this.cellWidth;
    const metaHeight = this.cellHeight;
    
    const halfW = metaWidth / 2;
    const halfH = metaHeight / 2;
    
    // ===== TRIÁNGULO SUPERIOR (ROJO) =====
    this.ctx.fillStyle = this.colores.ROJO;
    this.ctx.beginPath();
    this.ctx. moveTo(cx, cy);                    // Centro
    this.ctx.lineTo(cx - halfW, cy - halfH);   // Esquina superior-izquierda
    this.ctx.lineTo(cx + halfW, cy - halfH);   // Esquina superior-derecha
    this.ctx. closePath();
    this.ctx. fill();
    
    // ===== TRIÁNGULO DERECHO (AZUL) =====
    this.ctx.fillStyle = this.colores.AZUL;
    this.ctx. beginPath();
    this.ctx.moveTo(cx, cy);                    // Centro
    this. ctx.lineTo(cx + halfW, cy - halfH);   // Esquina superior-derecha
    this.ctx.lineTo(cx + halfW, cy + halfH);   // Esquina inferior-derecha
    this.ctx.closePath();
    this.ctx. fill();
    
    // ===== TRIÁNGULO INFERIOR (AMARILLO) =====
    this.ctx.fillStyle = this.colores.AMARILLO;
    this.ctx.beginPath();
    this.ctx. moveTo(cx, cy);                    // Centro
    this.ctx.lineTo(cx - halfW, cy + halfH);   // Esquina inferior-izquierda
    this.ctx.lineTo(cx + halfW, cy + halfH);   // Esquina inferior-derecha
    this.ctx.closePath();
    this.ctx.fill();
    
    // ===== TRIÁNGULO IZQUIERDO (VERDE) =====
    this.ctx.fillStyle = this. colores.VERDE;
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy);                    // Centro
    this.ctx.lineTo(cx - halfW, cy - halfH);   // Esquina superior-izquierda
    this.ctx.lineTo(cx - halfW, cy + halfH);   // Esquina inferior-izquierda
    this.ctx.closePath();
    this. ctx.fill();
    
    // ===== BORDE DEL CUADRADO COMPLETO =====
    this.ctx.strokeStyle = this.colores.borde;
    this. ctx.lineWidth = 3;
    this.ctx.strokeRect(cx - halfW, cy - halfH, metaWidth, metaHeight);
  }
  
  // =========================================================
  //     MÉTODOS DE ACCESO A POSICIONES (PARA FICHAS)
  // =========================================================
  
  /**
   * Obtiene las coordenadas {x, y} de una casilla del anillo.
   * 
   * @param {number} numeroCasilla - Número de casilla (0-67)
   * @returns {{x: number, y: number}|null} Coordenadas o null si inválido
   * 
   * EJEMPLO:
   * const pos = renderer.getPosicionCasilla(10); // {x: 590, y: 380}
   */
  getPosicionCasilla(numeroCasilla) {
    if (numeroCasilla >= 0 && numeroCasilla < 68) {
      return this.casillasAnillo[numeroCasilla];
    }
    return null;
  }
  
  /**
   * Obtiene las coordenadas de una ficha en BASE. 
   * Cada base tiene 4 posiciones (índices 0-3) distribuidas en los 4 cuadrantes.
   * 
   * @param {string} color - Color de la base ('ROJO', 'AZUL', 'VERDE', 'AMARILLO')
   * @param {number} indiceFicha - Índice de la ficha (0-3)
   * @returns {{x: number, y: number}|null} Coordenadas o null si inválido
   * 
   * EJEMPLO:
   * const pos = renderer.getPosicionBase('ROJO', 0); // Primera ficha roja en base
   */
  getPosicionBase(color, indiceFicha) {
    const base = this.basesPos[color];
    if (!base) return null;
    
    const offset = ((this.cellWidth + this.cellHeight) / 2) * 1.3;
    const posiciones = [
      { x: base.x - offset, y: base.y - offset }, // Posición 0 (superior-izquierda)
      { x: base.x + offset, y: base.y - offset }, // Posición 1 (superior-derecha)
      { x: base.x - offset, y: base.y + offset }, // Posición 2 (inferior-izquierda)
      { x: base.x + offset, y: base.y + offset }  // Posición 3 (inferior-derecha)
    ];
    
    return posiciones[indiceFicha] || null;
  }
  
  /**
   * Obtiene las coordenadas de una casilla dentro de un PASILLO de color.
   * Cada pasillo tiene 7 casillas (índices 0-6).
   * 
   * @param {string} color - Color del pasillo ('ROJO', 'AZUL', 'VERDE', 'AMARILLO')
   * @param {number} indicePasillo - Índice dentro del pasillo (0-6)
   * @returns {{x: number, y: number}|null} Coordenadas o null si inválido
   * 
   * EJEMPLO:
   * const pos = renderer.getPosicionPasillo('AZUL', 3); // Cuarta casilla del pasillo azul
   */
  getPosicionPasillo(color, indicePasillo) {
    const pasillo = this.pasillosPos[color];
    if (!pasillo || indicePasillo < 0 || indicePasillo >= pasillo.length) {
      return null;
    }
    return pasillo[indicePasillo];
  }
}