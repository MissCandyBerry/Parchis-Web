// =========================================================
//           GESTOR DE ESTADOS (PANTALLAS)
// =========================================================

class GameStateManager {
  constructor() {
    this.currentScreen = 'screenInicio';
    this.screens = {
      screenInicio: document.getElementById('screenInicio'),
      screenRegistro: document.getElementById('screenRegistro'),
      screenConfiguracion: document.getElementById('screenConfiguracion'),
      screenLobby: document.getElementById('screenLobby'),
      screenJuego: document.getElementById('screenJuego')
    };
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Botón "Jugar" (Inicio → Registro)
    document.getElementById('btnJugar').onclick = () => {
      this. goTo('screenRegistro');
    };

    // Botón "Aceptar Nombre" (Registro → Configuración)
    document.getElementById('btnAceptarNombre').onclick = () => {
      const nombre = document.getElementById('inputNombre').value. trim();
      if (! nombre) {
        alert('⚠️ Escribe tu nombre');
        return;
      }
      this.goTo('screenConfiguracion');
    };

    // Selección de color (Configuración → espera registro)
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
      option.onclick = () => {
        colorOptions.forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        document.getElementById('btnAceptarColor').disabled = false;
      };
    });

    // Botón "Aceptar Color" (envía registro al broker)
    document.getElementById('btnAceptarColor').onclick = () => {
      const selectedColor = document.querySelector('.color-option.selected');
      if (! selectedColor) {
        alert('⚠️ Selecciona un color');
        return;
      }
      const color = selectedColor.dataset.color;
      const nombre = document.getElementById('inputNombre').value.trim();
      
      // Enviar registro (lo maneja client. js)
      if (window.clientManager) {
        window.clientManager.registrar(nombre, color);
      }
    };

    // Botón "Iniciar Partida" (Lobby → envía solicitud)
    document.getElementById('btnIniciar').onclick = () => {
      if (window.clientManager) {
        window.clientManager.iniciarPartida();
      }
    };
  }

  goTo(screenName) {
    // Ocultar todas
    Object.values(this.screens).forEach(screen => {
      screen.classList.add('hidden');
    });

    // Mostrar la seleccionada
    if (this.screens[screenName]) {
      this.screens[screenName].classList.remove('hidden');
      this.currentScreen = screenName;
    }
  }

  showLobby() {
    this. goTo('screenLobby');
  }

  showGame() {
    this.goTo('screenJuego');
  }

  updateLobbyPlayers(jugadores) {
    const lista = document.getElementById('listaJugadores');
    lista.innerHTML = '';
    
    jugadores.forEach(j => {
      const item = document.createElement('div');
      item.className = 'jugador-item';
      item.innerHTML = `
        <div class="color-circle ${j. color. toLowerCase()}"></div>
        <span>${j.nombre}</span>
      `;
      lista. appendChild(item);
    });

    document.getElementById('contadorJugadores').textContent = `${jugadores.length}/4`;
  }

  updatePlayerInfo(jugador) {
    const colorMap = {
      'ROJO': 'Rojo',
      'AZUL': 'Azul',
      'VERDE': 'Verde',
      'AMARILLO': 'Amarillo'
    };

    const elemName = document.getElementById(`nombre${colorMap[jugador.color]}`);
    const elemFichas = document.getElementById(`fichas${colorMap[jugador.color]}`);

    if (elemName) elemName.textContent = jugador. nombre;
    if (elemFichas) elemFichas. textContent = `0/4`; // Actualizar dinámicamente después
  }
}

  