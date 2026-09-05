// Web Audio API Sound Synthesizer for Siren and Fake Call Ringtone

let audioCtx: AudioContext | null = null;
let sirenOscillator1: OscillatorNode | null = null;
let sirenOscillator2: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;
let sirenInterval: any = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Emergency High-Decibel Siren Alarm
export function startEmergencySiren() {
  try {
    const ctx = getAudioContext();
    stopEmergencySiren();

    sirenGain = ctx.createGain();
    sirenGain.gain.setValueAtTime(0.8, ctx.currentTime);
    sirenGain.connect(ctx.destination);

    sirenOscillator1 = ctx.createOscillator();
    sirenOscillator1.type = "sawtooth";
    sirenOscillator1.connect(sirenGain);
    sirenOscillator1.start();

    let freq = 600;
    let goingUp = true;

    sirenInterval = setInterval(() => {
      if (!sirenOscillator1 || !ctx) return;
      if (goingUp) {
        freq += 40;
        if (freq >= 1200) goingUp = false;
      } else {
        freq -= 40;
        if (freq <= 600) goingUp = true;
      }
      sirenOscillator1.frequency.setValueAtTime(freq, ctx.currentTime);
    }, 25);
  } catch (err) {
    console.warn("Audio Context error:", err);
  }
}

export function stopEmergencySiren() {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  if (sirenOscillator1) {
    try {
      sirenOscillator1.stop();
      sirenOscillator1.disconnect();
    } catch (e) {}
    sirenOscillator1 = null;
  }
  if (sirenGain) {
    try {
      sirenGain.disconnect();
    } catch (e) {}
    sirenGain = null;
  }
}

// Realistic Phone Ringtone Synthesizer
let ringtoneInterval: any = null;

export function playPhoneRingtone() {
  try {
    stopPhoneRingtone();
    const ctx = getAudioContext();

    const ringOnce = () => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc2.frequency.setValueAtTime(480, ctx.currentTime); // Standard US/Global ring tone frequencies

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.8);
      osc2.stop(ctx.currentTime + 1.8);
    };

    ringOnce();
    ringtoneInterval = setInterval(ringOnce, 3000);
  } catch (e) {
    console.warn("Ringtone error:", e);
  }
}

export function stopPhoneRingtone() {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
}

// Short Touch Beep
export function playBeep(freq = 800, duration = 0.15) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}
