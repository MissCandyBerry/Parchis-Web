// =========================================================
//  RENDERIZADOR DEL TABLERO (VERSIÓN FINAL - TAMAÑO AJUSTABLE)
// =========================================================

class BoardRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error('❌ Canvas no encontrado:', canvasId);
      return;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    console.log('✅ BoardRenderer inicializado:', this.width, 'x', this.height);
    
    // Colores
    this.colores = {
      ROJO: '#c0504d',
      AZUL: '#4f81bd',
      VERDE: '#77a968',
      AMARILLO: '#f0ad4e',
      fondo: '#d4a574',
      borde: '#8b6f47',
      casilla: '#f5deb3',
      texto: '#3a2a1a'
    };
    
    // ⬇️ TAMAÑO AJUSTABLE - Cambia estos valores según necesites
    // Opciones sugeridas:
    // - Original:   cellWidth: 38,  cellHeight: 38  (muy pequeño)
    // - Intermedio: cellWidth: 57,  cellHeight: 38  (1. 5x ancho)
    // - Grande:     cellWidth: 76,  cellHeight: 38  (2x ancho)
    // - Muy grande: cellWidth: 95,  cellHeight: 48  (2.5x ancho, 1.25x alto)
    
    this.cellWidth = 57;   // ⬅️ TAMAÑO INTERMEDIO (1.5x el original)
    this.cellHeight = 38;  // ⬅️ Altura original
    
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    
    // Calcular posiciones
    this.casillasAnillo = this.calcularPosicionesCasillas();
    this.basesPos = this.calcularPosicionesBases();
    this. pasillosPos = this.calcularPosicionesPasillos();
    
    console.log('✅ Posiciones calculadas:', this.casillasAnillo. length, 'casillas');
  }

  // =========================================================
  //    CÁLCULO DE LAS 68 CASILLAS (TODAS LAS MODIFICACIONES APLICADAS)
  // =========================================================
  
  calcularPosicionesCasillas() {
    const casillas = new Array(68);
    const cw = this.cellWidth;
    const ch = this.cellHeight;
    const cx = this.centerX;
    const cy = this.centerY;
    
    const offsetX = cw * 2;
    
    // ===== BRAZO ROJO (0-16) =====
    casillas[0] = { x: cx - cw * 3 + offsetX, y: cy - ch * 3 - ch * 2 };
    casillas[1] = { x: cx - cw * 3 + offsetX, y: cy - ch * 4 - ch * 2 };
    casillas[2] = { x: cx - cw * 3 + offsetX, y: cy - ch * 5 - ch * 2 };
    casillas[3] = { x: cx - cw * 3 + offsetX, y: cy - ch * 6 - ch * 2 };
    casillas[4] = { x: cx - cw * 2 + offsetX, y: cy - ch * 7 - ch };
    casillas[5] = { x: cx - cw + offsetX, y: cy - ch * 7 - ch };
    casillas[6] = { x: cx - cw + offsetX, y: cy - ch * 7 };
    casillas[7] = { x: cx - cw + offsetX, y: cy - ch * 6 };
    casillas[8] = { x: cx - cw + offsetX, y: cy - ch * 5 };
    casillas[9] = { x: cx - cw + offsetX, y: cy - ch * 4 };
    casillas[10] = { x: cx - cw + offsetX, y: cy - ch * 3 };
    casillas[11] = { x: cx - cw + offsetX, y: cy - ch * 2 };
    casillas[12] = { x: cx - cw + offsetX, y: cy - ch };
    casillas[13] = { x: cx + offsetX, y: cy };
    casillas[14] = { x: cx + cw + offsetX, y: cy };
    casillas[15] = { x: cx + cw * 2 + offsetX, y: cy };
    casillas[16] = { x: cx + cw * 3 + offsetX, y: cy };
    
    // ===== BRAZO AZUL (17-33) =====
    casillas[17] = { x: cx + cw * 4 + offsetX, y: cy };
    casillas[18] = { x: cx + cw * 5 + offsetX, y: cy };
    casillas[19] = { x: cx + cw * 6 + offsetX, y: cy };
    casillas[20] = { x: cx + cw * 7 + offsetX, y: cy };
    casillas[21] = { x: cx + cw * 7 + offsetX, y: cy + ch };
    casillas[22] = { x: cx + cw * 7 + offsetX, y: cy + ch * 2 };
    casillas[23] = { x: cx + cw * 6 + offsetX, y: cy + ch * 2 };
    casillas[24] = { x: cx + cw * 5 + offsetX, y: cy + ch * 2 };
    casillas[25] = { x: cx + cw * 4 + offsetX, y: cy + ch * 2 };
    casillas[26] = { x: cx + cw * 3 + offsetX, y: cy + ch * 2 };
    casillas[27] = { x: cx + cw * 2 + offsetX, y: cy + ch * 2 };
    casillas[28] = { x: cx + cw + offsetX, y: cy + ch * 2 };
    casillas[29] = { x: cx + offsetX, y: cy + ch * 2 };
    casillas[30] = { x: cx - cw + offsetX, y: cy + ch * 2 + ch };
    
    // ===== BRAZO AMARILLO (34-50) =====
    casillas[31] = { x: cx - cw + offsetX, y: cy + ch * 3 + ch };
    casillas[32] = { x: cx - cw + offsetX, y: cy + ch * 4 + ch };
    casillas[33] = { x: cx - cw + offsetX, y: cy + ch * 5 + ch };
    casillas[34] = { x: cx - cw + offsetX, y: cy + ch * 6 + ch };
    casillas[35] = { x: cx - cw + offsetX, y: cy + ch * 7 + ch };
    casillas[36] = { x: cx - cw + offsetX, y: cy + ch * 8 + ch };
    casillas[37] = { x: cx - cw + offsetX, y: cy + ch * 9 + ch };
    casillas[38] = { x: cx - cw * 2 + offsetX, y: cy + ch * 9 + ch };
    casillas[39] = { x: cx - cw * 3 + offsetX, y: cy + ch * 9 + ch };
    casillas[40] = { x: cx - cw * 3 + offsetX, y: cy + ch * 8 + ch };
    casillas[41] = { x: cx - cw * 3 + offsetX, y: cy + ch * 7 + ch };
    casillas[42] = { x: cx - cw * 3 + offsetX, y: cy + ch * 6 + ch };
    casillas[43] = { x: cx - cw * 3 + offsetX, y: cy + ch * 5 + ch };
    casillas[44] = { x: cx - cw * 3 + offsetX, y: cy + ch * 4 + ch };
    casillas[45] = { x: cx - cw * 3 + offsetX, y: cy + ch * 3 + ch };
    casillas[46] = { x: cx - cw * 3 + offsetX, y: cy + ch * 2 + ch };
    casillas[47] = { x: cx - cw * 4 + offsetX, y: cy + ch * 2 };
    casillas[48] = { x: cx - cw * 5 + offsetX, y: cy + ch * 2 };
    casillas[49] = { x: cx - cw * 6 + offsetX, y: cy + ch * 2 };
    casillas[50] = { x: cx - cw * 7 + offsetX, y: cy + ch * 2 };
    
    // ===== BRAZO VERDE (51-67) =====
    casillas[51] = { x: cx - cw * 8 + offsetX, y: cy + ch * 2 };
    casillas[52] = { x: cx - cw * 9 + offsetX, y: cy + ch * 2 };
    casillas[53] = { x: cx - cw * 10 + offsetX, y: cy + ch * 2 };
    casillas[54] = { x: cx - cw * 11 + offsetX, y: cy + ch * 2 };
    casillas[55] = { x: cx - cw * 11 + offsetX, y: cy + ch };
    casillas[56] = { x: cx - cw * 11 + offsetX, y: cy };
    casillas[57] = { x: cx - cw * 10 + offsetX, y: cy };
    casillas[58] = { x: cx - cw * 9 + offsetX, y: cy };
    casillas[59] = { x: cx - cw * 8 + offsetX, y: cy };
    casillas[60] = { x: cx - cw * 7 + offsetX, y: cy };
    casillas[61] = { x: cx - cw * 6 + offsetX, y: cy };
    casillas[62] = { x: cx - cw * 5 + offsetX, y: cy };
    casillas[63] = { x: cx - cw * 4 + offsetX, y: cy };
    casillas[64] = { x: cx - cw * 3 + offsetX, y: cy - ch };
    casillas[65] = { x: cx - cw * 3 + offsetX, y: cy - ch * 2 };
    casillas[66] = { x: cx - cw * 3 + offsetX, y: cy - ch * 3 };
    casillas[67] = { x: cx - cw * 3 + offsetX, y: cy - ch * 4 };
    
    return casillas;
  }
  
  calcularPosicionesBases() {
    const offsetX = this.cellWidth * 7.5;
    const offsetY = this.cellHeight * 7;
    
    return {
      ROJO: { x: this. centerX - offsetX, y: this.centerY - offsetY },
      AZUL: { x: this.centerX + offsetX, y: this.centerY - offsetY },
      VERDE: { x: this.centerX - offsetX, y: this.centerY + offsetY },
      AMARILLO: { x: this.centerX + offsetX, y: this.centerY + offsetY }
    };
  }
  
  calcularPosicionesPasillos() {
    const pasillos = {};
    const cx = this.centerX;
    const cy = this.centerY;
    const cw = this.cellWidth;
    const ch = this.cellHeight;
    const offsetX = cw * 2;
    
    pasillos.ROJO = [];
    pasillos.ROJO.push({ x: cx - cw * 2 + offsetX, y: cy - ch * 7 });
    for (let i = 1; i < 7; i++) {
      pasillos. ROJO.push({ x: cx - cw * 2 + offsetX, y: cy - ch * 6 + (i - 1) * ch });
    }
    
    pasillos.AZUL = [];
    for (let i = 0; i < 7; i++) {
      pasillos. AZUL.push({ x: cx + cw * 6 - i * cw + offsetX, y: cy + ch });
    }
    
    pasillos.AMARILLO = [];
    for (let i = 0; i < 7; i++) {
      pasillos.AMARILLO.push({ x: cx - cw * 2 + offsetX, y: cy + ch * 8 + ch - i * ch });
    }
    
    pasillos. VERDE = [];
    pasillos.VERDE.push({ x: cx - cw * 11 + offsetX + cw, y: cy + ch });
    for (let i = 1; i < 7; i++) {
      pasillos. VERDE.push({ x: cx - cw * 10 + (i - 1) * cw + offsetX + cw, y: cy + ch });
    }
    
    return pasillos;
  }

  dibujarTablero() {
    this.ctx.fillStyle = this.colores.fondo;
    this.ctx. fillRect(0, 0, this.width, this.height);
    this.dibujarCasillasAnillo();
    this. dibujarPasillos();
    this.dibujarBases();
    this.dibujarCentro();
  }
  
  dibujarCasillasAnillo() {
    this.casillasAnillo.forEach((pos, index) => {
      if (! pos) return;
      
      this.ctx.fillStyle = this. colores.casilla;
      if (index === 0) this.ctx.fillStyle = this.colores. ROJO;
      if (index === 17) this.ctx.fillStyle = this.colores.AZUL;
      if (index === 34) this.ctx.fillStyle = this.colores.AMARILLO;
      if (index === 51) this.ctx.fillStyle = this.colores. VERDE;
      
      const x = pos.x - this.cellWidth / 2;
      const y = pos.y - this. cellHeight / 2;
      
      this.ctx.fillRect(x, y, this.cellWidth, this.cellHeight);
      this.ctx.strokeStyle = this. colores.borde;
      this.ctx.lineWidth = 2;
      this.ctx. strokeRect(x, y, this. cellWidth, this.cellHeight);
      
      this.ctx.fillStyle = this. colores.texto;
      this.ctx.font = 'bold 11px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this. ctx.fillText(index.toString(), pos.x, pos.y);
    });
  }
  
  dibujarBases() {
    Object.entries(this.basesPos).forEach(([color, pos]) => {
      const radioBase = (this.cellWidth + this.cellHeight) / 2;
      
      this.ctx.fillStyle = this.colores[color];
      this.ctx. globalAlpha = 0.5;
      this.ctx.beginPath();
      this.ctx. arc(pos.x, pos. y, radioBase * 3.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
      this.ctx.strokeStyle = this. colores[color];
      this.ctx. lineWidth = 5;
      this.ctx.stroke();
      
      const offset = radioBase * 1.3;
      const posiciones = [
        { x: pos.x - offset, y: pos.y - offset },
        { x: pos.x + offset, y: pos.y - offset },
        { x: pos.x - offset, y: pos.y + offset },
        { x: pos.x + offset, y: pos.y + offset }
      ];
      
      posiciones.forEach(p => {
        this.ctx. fillStyle = this.colores[color];
        this.ctx. globalAlpha = 0.5;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, radioBase / 2.2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1.0;
        this.ctx. strokeStyle = this.colores[color];
        this.ctx. lineWidth = 3;
        this.ctx.stroke();
      });
    });
  }
  
  dibujarPasillos() {
    Object.entries(this.pasillosPos).forEach(([color, casillas]) => {
      casillas.forEach((pos, index) => {
        this.ctx.fillStyle = this. colores[color];
        this.ctx.globalAlpha = 0.7;
        
        const x = pos.x - this. cellWidth / 2;
        const y = pos.y - this.cellHeight / 2;
        
        this.ctx.fillRect(x, y, this. cellWidth, this.cellHeight);
        this.ctx.globalAlpha = 1.0;
        this.ctx.strokeStyle = this. colores. borde;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, this. cellWidth, this.cellHeight);
        
        this.ctx. fillStyle = 'white';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(index.toString(), pos.x, pos.y);
      });
    });
  }
  
dibujarCentro() {
    const cx = this.centerX;
    const cy = this.centerY;
    
    // ⬇️ Meta del tamaño de una casilla (cellWidth × cellHeight)
    const metaWidth = this.cellWidth;
    const metaHeight = this.cellHeight;
    
    // Coordenadas de las 4 esquinas del cuadrado central
    const halfW = metaWidth / 2;
    const halfH = metaHeight / 2;
    
    // ROJO: triángulo superior
    this.ctx.fillStyle = this.colores. ROJO;
    this.ctx.beginPath();
    this. ctx.moveTo(cx, cy);                    // centro
    this.ctx.lineTo(cx - halfW, cy - halfH);   // esquina superior izquierda
    this.ctx.lineTo(cx + halfW, cy - halfH);   // esquina superior derecha
    this.ctx.closePath();
    this.ctx. fill();
    
    // AZUL: triángulo derecho
    this.ctx.fillStyle = this.colores. AZUL;
    this.ctx.beginPath();
    this. ctx.moveTo(cx, cy);                    // centro
    this.ctx.lineTo(cx + halfW, cy - halfH);   // esquina superior derecha
    this.ctx. lineTo(cx + halfW, cy + halfH);   // esquina inferior derecha
    this. ctx.closePath();
    this.ctx.fill();
    
    // AMARILLO: triángulo inferior
    this.ctx.fillStyle = this.colores.AMARILLO;
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy);                    // centro
    this.ctx. lineTo(cx - halfW, cy + halfH);   // esquina inferior izquierda
    this.ctx.lineTo(cx + halfW, cy + halfH);   // esquina inferior derecha
    this.ctx.closePath();
    this.ctx.fill();
    
    // VERDE: triángulo izquierdo
    this.ctx.fillStyle = this.colores.VERDE;
    this.ctx.beginPath();
    this.ctx. moveTo(cx, cy);                    // centro
    this.ctx.lineTo(cx - halfW, cy - halfH);   // esquina superior izquierda
    this. ctx.lineTo(cx - halfW, cy + halfH);   // esquina inferior izquierda
    this. ctx.closePath();
    this.ctx.fill();
    
    // ⬇️ OPCIONAL: Borde del cuadrado completo
    this.ctx.strokeStyle = this.colores.borde;
    this.ctx. lineWidth = 3;
    this.ctx.strokeRect(cx - halfW, cy - halfH, metaWidth, metaHeight);
}
  
  getPosicionCasilla(numeroCasilla) {
    if (numeroCasilla >= 0 && numeroCasilla < 68) {
      return this.casillasAnillo[numeroCasilla];
    }
    return null;
  }
  
  getPosicionBase(color, indiceFicha) {
    const base = this.basesPos[color];
    if (! base) return null;
    
    const offset = ((this.cellWidth + this.cellHeight) / 2) * 1.3;
    const posiciones = [
      { x: base.x - offset, y: base.y - offset },
      { x: base.x + offset, y: base.y - offset },
      { x: base. x - offset, y: base. y + offset },
      { x: base.x + offset, y: base.y + offset }
    ];
    
    return posiciones[indiceFicha] || null;
  }
  
  getPosicionPasillo(color, indicePasillo) {
    const pasillo = this.pasillosPos[color];
    if (!pasillo || indicePasillo < 0 || indicePasillo >= pasillo.length) {
      return null;
    }
    return pasillo[indicePasillo];
  }
}