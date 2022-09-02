const AudioContext = window.AudioContext;

let context: AudioContext
let masterVolume: GainNode

let oscillator: OscillatorNode

export const init = () => {
  context = new AudioContext();
  masterVolume = context.createGain();
  masterVolume.connect(context.destination);

  masterVolume.gain.value = 0;

  oscillator = context.createOscillator();

  oscillator.connect(masterVolume);
  oscillator.type = "sine";
  oscillator.start(0);
}

export const play = (freq: number, volume: number) => {
  masterVolume.gain.value = volume;
  oscillator.frequency.setValueAtTime(freq, context.currentTime);
};
