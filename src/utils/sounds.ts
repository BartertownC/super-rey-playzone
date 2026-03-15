// Sound effects using Web Audio API (no external files needed!)
class SoundManager {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  // Play a tone with specific frequency and duration
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ) {
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  // Play a sequence of notes
  private playMelody(notes: { freq: number; duration: number; delay: number }[], type: OscillatorType = 'sine', volume: number = 0.3) {
    const ctx = this.getContext();
    notes.forEach(note => {
      setTimeout(() => {
        this.playTone(note.freq, note.duration, type, volume);
      }, note.delay * 1000);
    });
  }

  // ✅ Correct answer - happy ascending chime
  playCorrect() {
    this.playMelody([
      { freq: 523.25, duration: 0.15, delay: 0 },    // C5
      { freq: 659.25, duration: 0.15, delay: 0.1 },   // E5
      { freq: 783.99, duration: 0.3, delay: 0.2 },    // G5
    ], 'sine', 0.25);
  }

  // ❌ Wrong answer - gentle descending tone
  playWrong() {
    this.playMelody([
      { freq: 400, duration: 0.15, delay: 0 },
      { freq: 300, duration: 0.3, delay: 0.12 },
    ], 'triangle', 0.2);
  }

  // 🎉 Quiz complete - celebration fanfare!
  playComplete() {
    this.playMelody([
      { freq: 523.25, duration: 0.15, delay: 0 },     // C5
      { freq: 523.25, duration: 0.15, delay: 0.15 },   // C5
      { freq: 523.25, duration: 0.15, delay: 0.3 },    // C5
      { freq: 523.25, duration: 0.3, delay: 0.5 },     // C5
      { freq: 415.30, duration: 0.15, delay: 0.5 },    // Ab4
      { freq: 466.16, duration: 0.15, delay: 0.65 },   // Bb4
      { freq: 523.25, duration: 0.15, delay: 0.8 },    // C5
      { freq: 466.16, duration: 0.1, delay: 0.95 },    // Bb4
      { freq: 523.25, duration: 0.4, delay: 1.05 },    // C5
    ], 'sine', 0.25);
  }

  // ⭐ Earn a star
  playStar() {
    this.playMelody([
      { freq: 880, duration: 0.1, delay: 0 },
      { freq: 1108.73, duration: 0.2, delay: 0.08 },
    ], 'sine', 0.2);
  }

  // 🆙 Level up!
  playLevelUp() {
    this.playMelody([
      { freq: 261.63, duration: 0.12, delay: 0 },     // C4
      { freq: 329.63, duration: 0.12, delay: 0.1 },    // E4
      { freq: 392.00, duration: 0.12, delay: 0.2 },    // G4
      { freq: 523.25, duration: 0.12, delay: 0.3 },    // C5
      { freq: 659.25, duration: 0.12, delay: 0.4 },    // E5
      { freq: 783.99, duration: 0.3, delay: 0.5 },     // G5
      { freq: 1046.50, duration: 0.5, delay: 0.65 },   // C6
    ], 'sine', 0.2);
  }

  // 🖱️ Button click
  playClick() {
    this.playTone(600, 0.08, 'sine', 0.15);
  }

  // 🦖 Dinosaur roar (fun!)
  playDinoRoar() {
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  }

  // 🚀 Rocket launch sound
  playRocketLaunch() {
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(100, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.8);
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.8);
  }
}

export const soundManager = new SoundManager();