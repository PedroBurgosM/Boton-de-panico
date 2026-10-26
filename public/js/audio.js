/**
 * Generador de Sirenas y Tonos de Alerta usando Web Audio API.
 * 100% sintetizado, no requiere archivos de audio externos.
 */

class SistemaAudioAlerta {
  constructor() {
    this.audioCtx = null;
    this.oscilador = null;
    this.ganancia = null;
    this.intervaloSirena = null;
    this.sonando = false;
    this.silenciado = false;
    this.volumen = 0.8;
  }

  // Inicializar o reanudar el AudioContext tras la primera interacción del usuario
  iniciar() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Activar o desactivar sonido general
  toggleSilencio() {
    this.silenciado = !this.silenciado;
    if (this.silenciado) {
      this.detenerSirena();
    }
    return this.silenciado;
  }

  // Detener cualquier sirena en curso
  detenerSirena() {
    if (this.intervaloSirena) {
      clearInterval(this.intervaloSirena);
      this.intervaloSirena = null;
    }
    if (this.oscilador) {
      try {
        this.oscilador.stop();
        this.oscilador.disconnect();
      } catch (e) {}
      this.oscilador = null;
    }
    this.sonando = false;
  }

  // Sirena de Emergencia / Inspectoría (tono oscilante bitonal penetrante)
  reproducirSirenaInspectoria() {
    if (this.silenciado) return;
    this.detenerSirena();
    this.iniciar();

    try {
      this.sonando = true;
      this.oscilador = this.audioCtx.createOscillator();
      this.ganancia = this.audioCtx.createGain();

      this.oscilador.type = 'sawtooth';
      this.ganancia.gain.setValueAtTime(this.volumen * 0.3, this.audioCtx.currentTime);

      this.oscilador.connect(this.ganancia);
      this.ganancia.connect(this.audioCtx.destination);
      this.oscilador.start();

      let frecuenciaAlta = true;
      this.intervaloSirena = setInterval(() => {
        if (!this.sonando || !this.oscilador) return;
        const ahora = this.audioCtx.currentTime;
        const freqDestino = frecuenciaAlta ? 920 : 680;
        this.oscilador.frequency.exponentialRampToValueAtTime(freqDestino, ahora + 0.25);
        frecuenciaAlta = !frecuenciaAlta;
      }, 350);
    } catch (e) {
      console.warn('Error al reproducir audio:', e);
    }
  }

  // Sirena de Enfermería (pulso de aviso médico urgente)
  reproducirSirenaEnfermeria() {
    if (this.silenciado) return;
    this.detenerSirena();
    this.iniciar();

    try {
      this.sonando = true;
      this.oscilador = this.audioCtx.createOscillator();
      this.ganancia = this.audioCtx.createGain();

      this.oscilador.type = 'sine';
      this.ganancia.gain.setValueAtTime(this.volumen * 0.4, this.audioCtx.currentTime);

      this.oscilador.connect(this.ganancia);
      this.ganancia.connect(this.audioCtx.destination);
      this.oscilador.start();

      let estado = 0;
      this.intervaloSirena = setInterval(() => {
        if (!this.sonando || !this.oscilador) return;
        const ahora = this.audioCtx.currentTime;
        // Patrón tipo monitor médico urgente: beep-beep
        if (estado === 0) {
          this.oscilador.frequency.setValueAtTime(880, ahora);
          this.ganancia.gain.setValueAtTime(this.volumen * 0.4, ahora);
        } else if (estado === 1) {
          this.oscilador.frequency.setValueAtTime(1174, ahora);
        } else {
          this.ganancia.gain.setValueAtTime(0.01, ahora);
        }
        estado = (estado + 1) % 4;
      }, 200);
    } catch (e) {
      console.warn('Error al reproducir audio:', e);
    }
  }

  // Sirena de Convivencia Escolar (campana / chime de llamado urgente pero no estridente)
  reproducirSirenaConvivencia() {
    if (this.silenciado) return;
    this.detenerSirena();
    this.iniciar();

    try {
      this.sonando = true;
      const tocarCampana = () => {
        if (!this.sonando) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        const ahora = this.audioCtx.currentTime;

        osc.frequency.setValueAtTime(659.25, ahora); // Mi5
        osc.frequency.exponentialRampToValueAtTime(880, ahora + 0.15); // La5

        gain.gain.setValueAtTime(this.volumen * 0.5, ahora);
        gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.8);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(ahora);
        osc.stop(ahora + 0.85);
      };

      tocarCampana();
      this.intervaloSirena = setInterval(tocarCampana, 1200);
    } catch (e) {
      console.warn('Error al reproducir audio:', e);
    }
  }

  // Reproducir según el tipo de alerta
  reproducirSegunTipo(tipo) {
    if (tipo === 'enfermeria') {
      this.reproducirSirenaEnfermeria();
    } else if (tipo === 'convivencia') {
      this.reproducirSirenaConvivencia();
    } else {
      this.reproducirSirenaInspectoria();
    }
  }

  // Tono de confirmación breve al atender una alerta
  reproducirTonoAtendido() {
    this.iniciar();
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const ahora = this.audioCtx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ahora); // Do5
      osc.frequency.setValueAtTime(659.25, ahora + 0.1); // Mi5
      osc.frequency.setValueAtTime(783.99, ahora + 0.2); // Sol5

      gain.gain.setValueAtTime(this.volumen * 0.3, ahora);
      gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.45);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(ahora);
      osc.stop(ahora + 0.5);
    } catch (e) {}
  }

  // Tono breve de prueba de bocinas
  probarSonido() {
    this.iniciar();
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const ahora = this.audioCtx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ahora);
      gain.gain.setValueAtTime(0.3, ahora);
      gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.3);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(ahora);
      osc.stop(ahora + 0.35);
    } catch (e) {}
  }
}

// Instancia global
window.sistemaAudio = new SistemaAudioAlerta();
