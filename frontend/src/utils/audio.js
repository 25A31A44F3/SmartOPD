/**
 * Audio Chime and Voice Announcement Utility using Web Audio API and SpeechSynthesis.
 * Safe for all modern browsers without external audio assets.
 */

export const playHospitalChime = (isEmergency = false) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (isEmergency) {
      // 3-tone urgent alert chime
      const tones = [880, 1174, 880];
      tones.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);

        gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 0.25);
      });
    } else {
      // Pleasant 2-tone airport/hospital announcement chime (F#5 -> C#6)
      const freqs = [740, 1108];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.2);

        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.2 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.2);
        osc.stop(ctx.currentTime + idx * 0.2 + 0.4);
      });
    }
  } catch (err) {
    console.warn("Audio playback not permitted or unavailable:", err);
  }
};

export const announceToken = (tokenNumber, room, lang = 'en') => {
  playHospitalChime(tokenNumber.startsWith("EMG"));
  
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const text = lang === 'te' 
        ? `టోకెన్ ${tokenNumber}. దయచేసి ${room} వద్దకు వెళ్ళండి.` 
        : `Token ${tokenNumber}. Please proceed to ${room}.`;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = lang === 'te' ? 'te-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis unavailable:", e);
    }
  }
};
