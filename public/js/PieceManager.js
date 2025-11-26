// =========================================================
//     GESTOR DE FICHAS (VERSIÓN MEJORADA VISUAL)
// =========================================================

class PieceManager {
  constructor(boardRenderer) {
    this.board = boardRenderer;
    this. ctx = boardRenderer.ctx;
    
    console.log('✅ PieceManager inicializado');
    
    // Estado de las fichas de todos los jugadores
    // Estructura: { ROJO: { 0: {ficha}, 1: {ficha}, 2, 3 }, AZUL: {... }, ... }
    this.fichas = {
      ROJO: this.crearFichasIniciales('ROJO'),
      AZUL: this.crearFichasIniciales('AZUL'),
      VERDE: this.crearFichasIniciales('VERDE'),
      AMARILLO: this.crearFichasIniciales('AMARILLO')
    };
    
    this.fichaSeleccionada = null;
  }
  
  // =========================================================
  //              CREAR FICHAS INICIALES
  // =========================================================
  
  crearFichasIniciales(color) {
    return {
      0: { 
        color, 
        id: 0, 
        posicion: -1, 
        enBase: true, 
        enPasillo: false, 
        enMeta: false, 
        indicePasillo: -1 
      },
      1: { 
        color, 
        id: 1, 
        posicion: -1, 
        enBase: true, 
        enPasillo: false, 
        enMeta: false, 
        indicePasillo: -1 
      },
      2: { 
        color, 
        id: 2, 
        posicion: -1, 
        enBase: true, 
        enPasillo: false, 
        enMeta: false, 
        indicePasillo: -1 
      },
      3: { 
        color, 
        id: 3, 
        posicion: -1, 
        enBase: true, 
        enPasillo: false, 
        enMeta: false, 
        indicePasillo: -1 
      }
    };
  }
  
  // =========================================================
  //              ACTUALIZAR ESTADO DE FICHAS
  // =========================================================
  
  actualizarFicha(color, idFicha, datos) {
    if (!this.fichas[color] || !this.fichas[color][idFicha]) {
      console.warn(`⚠️ Ficha no encontrada: ${color} #${idFicha}`);
      return;
    }
    
    Object.assign(this.fichas[color][idFicha], datos);
    console.log(`✅ Ficha actualizada: ${color} #${idFicha}`, datos);
  }
  
  // =========================================================
  //                  RENDERIZAR FICHAS
  // =========================================================
  
  dibujarTodasLasFichas() {
    // Dibujar todas las fichas de todos los colores
    Object.keys(this.fichas).forEach(color => {
      for (let i = 0; i < 4; i++) {
        this.dibujarFicha(color, i);
      }
    });
  }
  
  dibujarFicha(color, idFicha) {
    const ficha = this.fichas[color][idFicha];
    if (!ficha) return;
    
    let pos = null;
    
    // Determinar posición según estado
    if (ficha.enMeta) {
      // En meta (centro del tablero)
      pos = { x: this.board.centerX, y: this.board. centerY };
    } else if (ficha.enPasillo) {
      // En pasillo
      pos = this.board.getPosicionPasillo(color, ficha.indicePasillo);
    } else if (ficha.enBase || ficha.posicion < 0) {
      // En base
      pos = this.board.getPosicionBase(color, idFicha);
    } else {
      // En anillo (0-67)
      pos = this.board.getPosicionCasilla(ficha.posicion);
    }
    
    if (! pos) return;
    
    // ===== TAMAÑO DE LA FICHA (MÁS GRANDE) =====
    const radius = this.board.cellSize / 2.5;  // ⬅️ Era /3, ahora /2.5
    
    // ===== SOMBRA MÁS PRONUNCIADA =====
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0. 5)';  // ⬅️ Era 0.4, ahora 0.5
    this.ctx.shadowBlur = 8;  // ⬅️ Era 6, ahora 8
    this.ctx.shadowOffsetX = 3;  // ⬅️ Era 2, ahora 3
    this.ctx.shadowOffsetY = 3;  // ⬅️ Era 2, ahora 3
    
    // ===== CÍRCULO PRINCIPAL =====
    this.ctx. fillStyle = this.board.colores[color];
    this. ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Resetear sombra
    this. ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this. ctx.shadowOffsetY = 0;
    
    // ===== BORDE (MÁS GRUESO SI ESTÁ SELECCIONADA) =====
    const esSeleccionada = this.fichaSeleccionada && 
                           this.fichaSeleccionada.color === color && 
                           this.fichaSeleccionada. id === idFicha;
    
    this.ctx.strokeStyle = esSeleccionada ? '#ffffff' : '#333333';
    this.ctx. lineWidth = esSeleccionada ? 5 : 3;  // ⬅️ Era 4:2, ahora 5:3
    this.ctx.stroke();
    
    // ===== BRILLO SI ESTÁ SELECCIONADA =====
    if (esSeleccionada) {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      this.ctx. lineWidth = 7;
      this.ctx.stroke();
    }
    
    // ===== NÚMERO DE LA FICHA (MÁS GRANDE) =====
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 18px Arial';  // ⬅️ Era 14px, ahora 18px
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(idFicha. toString(), pos.x, pos.y);
  }
  
  // =========================================================
  //              SELECCIÓN CON MOUSE (CLICK)
  // =========================================================
  
  seleccionarFichaEnPosicion(x, y, colorJugador) {
    const radius = this.board.cellSize / 2.5;  // ⬅️ Actualizado para coincidir
    this.fichaSeleccionada = null;
    
    // Buscar ficha del jugador en esa posición
    for (let i = 0; i < 4; i++) {
      const ficha = this.fichas[colorJugador][i];
      if (! ficha) continue;
      
      let pos = null;
      
      if (ficha.enMeta) {
        pos = { x: this.board. centerX, y: this.board.centerY };
      } else if (ficha.enPasillo) {
        pos = this.board.getPosicionPasillo(colorJugador, ficha.indicePasillo);
      } else if (ficha. enBase || ficha.posicion < 0) {
        pos = this.board.getPosicionBase(colorJugador, i);
      } else {
        pos = this.board.getPosicionCasilla(ficha. posicion);
      }
      
      if (!pos) continue;
      
      // Verificar distancia (click dentro del círculo)
      const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      if (dist <= radius) {
        this.fichaSeleccionada = ficha;
        console.log(`✅ Ficha seleccionada: ${colorJugador} #${i}`);
        return i; // Retorna el ID de la ficha seleccionada
      }
    }
    
    console.log('⚠️ No se seleccionó ninguna ficha');
    return null;
  }
  
  // =========================================================
  //              ANIMACIÓN DE MOVIMIENTO
  // =========================================================
  
  animarMovimiento(color, idFicha, posInicial, posFinal, duracion, callback) {
    const ficha = this.fichas[color][idFicha];
    if (! ficha) return;
    
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duracion, 1);
      
      // Interpolación con easing (suavizado)
      const easeProgress = this.easeInOutCubic(progress);
      
      // Calcular posición interpolada
      const x = posInicial. x + (posFinal.x - posInicial.x) * easeProgress;
      const y = posInicial.y + (posFinal.y - posInicial.y) * easeProgress;
      
      // Redibujar tablero y fichas
      this.board.dibujarTablero();
      this.dibujarTodasLasFichas();
      
      // Dibujar ficha en movimiento (con efecto de "salto")
      const radius = this.board.cellSize / 2.5;
      const jumpHeight = Math.sin(progress * Math.PI) * 15; // Efecto de salto
      
      // Sombra durante el movimiento
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      this.ctx. shadowBlur = 10;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
      
      // Dibujar ficha
      this.ctx.fillStyle = this.board.colores[color];
      this.ctx.beginPath();
      this.ctx.arc(x, y - jumpHeight, radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Resetear sombra
      this.ctx.shadowColor = 'transparent';
      this.ctx.shadowBlur = 0;
      
      // Borde
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
      
      // Número
      this.ctx.fillStyle = 'white';
      this. ctx.font = 'bold 18px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(idFicha.toString(), x, y - jumpHeight);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animación completada
        this.board.dibujarTablero();
        this.dibujarTodasLasFichas();
        if (callback) callback();
      }
    };
    
    animate();
  }
  
  // =========================================================
  //              FUNCIONES DE EASING (SUAVIZADO)
  // =========================================================
  
  easeInOutCubic(t) {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  // =========================================================
  //              OBTENER INFORMACIÓN DE FICHAS
  // =========================================================
  
  obtenerEstadoFichas(color) {
    const fichasColor = this.fichas[color];
    if (!fichasColor) return null;
    
    return {
      enBase: Object.values(fichasColor).filter(f => f.enBase). length,
      enAnillo: Object.values(fichasColor).filter(f => ! f.enBase && ! f.enPasillo && !f.enMeta).length,
      enPasillo: Object.values(fichasColor). filter(f => f.enPasillo).length,
      enMeta: Object. values(fichasColor).filter(f => f.enMeta). length
    };
  }
  
  // =========================================================
  //              RESET DE FICHAS (NUEVA PARTIDA)
  // =========================================================
  
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