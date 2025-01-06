const PRESSED_CLASS = 'pressed';
const MAX_OSCILLATORS = 3;
const MAIN_GAIN = 1;
const GAIN_OFF = 0;
const GAIN_ON = (1 / MAX_OSCILLATORS) ?? 1;
const DEFAULT_WAVE = 'sawtooth';
const MAX_VOICES = 6;
const WAVEFORMS = [
   'sawtooth',
   'sine',
   'square',
   'triangle',
];

const keys = document.querySelectorAll('.key');
const optionsEl = document.getElementById('options');
const oscillatorOptions = document.getElementById('oscillator-options');
const voices = [];

const freqToKeyMap = new Map([
   [261.6256, 'KeyA'],
   [277.1826, 'KeyW'],
   [293.6648, 'KeyS'],
   [311.127, 'KeyE'],
   [329.6276, 'KeyD'],
   [349.2282, 'KeyF'],
   [369.9944, 'KeyT'],
   [391.9954, 'KeyG'],
   [415.3047, 'KeyY'],
   [440, 'KeyH'],
   [466.1638, 'KeyU'],
   [493.8833, 'KeyJ'],
   [523.2511, 'KeyK']
]);

let currentVoiceCount = 4;
let audioCtx;
let masterGain;

class Voice {
   isActive = false;
   activeTime = -1;
   frequency = -1;
   oscillators = [];
   oscillatorGains = [];

   constructor(audioCtx, voiceIndicatorEl) {
      this.audioCtx = audioCtx;
      this.voiceIndicatorEl = voiceIndicatorEl;

      this.voiceGain = new GainNode(audioCtx, { gain: GAIN_OFF })
      this.voiceGain.connect(masterGain);

      for (let i = 0; i < MAX_OSCILLATORS; i++) {
         const oscillatorGain = new GainNode(audioCtx, { gain: GAIN_ON });
         this.oscillatorGains.push(oscillatorGain);

         const oscillator = new OscillatorNode(audioCtx, { frequency: 0, type: DEFAULT_WAVE });
         oscillator.connect(oscillatorGain);
         oscillator.start();
         this.oscillators.push(oscillator);
         oscillatorGain.connect(this.voiceGain);
      }
   }

   playFrequency(frequency) {
      if (this.activeTime > -1) {
         const keyElement = document.querySelector(`[data-freq="${this.frequency}"]`);
         keyElement?.classList.remove(PRESSED_CLASS);
      }

      const currentTime = this.audioCtx.currentTime;
      for (const oscillator of this.oscillators) {
         oscillator.frequency.setValueAtTime(frequency, currentTime);
      }

      this.voiceGain.gain.setValueAtTime(GAIN_ON, currentTime);
      this.isActive = true;
      this.activeTime = currentTime;
      this.frequency = frequency;

      this.voiceIndicatorEl.classList.add('on');
   }

   stop() {
      this.voiceGain.gain.setValueAtTime(GAIN_OFF, this.audioCtx.currentTime);
      this.isActive = false;
      this.frequency = -1;

      this.voiceIndicatorEl.classList.remove('on');
   }

   setOscillatorType(newWave, oscillator) {
      this.oscillators[oscillator].type = newWave;

   }

   setOscillatorGain(gainValue, oscillator) {
      this.oscillatorGains[oscillator].gain.setValueAtTime(gainValue, this.audioCtx.currentTime);
   }
}

function getVoiceIndicatorElements() {
   const voiceIndicators = document.querySelectorAll('[data-voice-indicator]');
   if (voiceIndicators.length !== MAX_VOICES) {
      console.error(`expected ${MAX_VOICES} indicator elements but got ${voiceIndicators.length}`);
   }

   return voiceIndicators;
}

function instantiateVoices() {
   if (!audioCtx) {
      console.warn('attempting to instantiate new voices but audioCtx is not set', `audioCtx: ${audioCtx}`);
      return;
   }

   const voiceIndicators = getVoiceIndicatorElements();
   for (let i = 0; i < MAX_VOICES; i++) {
      const voiceIndicatorEl = voiceIndicators[i];
      voices.push(new Voice(audioCtx, voiceIndicatorEl));
   }
}

function setVoiceIndicators(numIndicators) {
   const voiceIndicators = getVoiceIndicatorElements();
   for (let i = 0; i < voiceIndicators.length; i++) {
      if (i < numIndicators) {
         voiceIndicators[i].classList.remove('disabled');
      } else {
         voiceIndicators[i].classList.add('disabled');
      }
   }
}

function createVoiceSelector() {
   const voiceSelector = document.querySelector('[data-voices]');
   voiceSelector.type = 'number';
   voiceSelector.value = currentVoiceCount;
   voiceSelector.max = MAX_VOICES;
   voiceSelector.min = 1;

   const voiceTemplate = document.getElementById('voice-indicator');
   const voiceContainer = document.getElementById('voices');

   for (let i = 0; i < MAX_VOICES; i++) {
      const voiceEl = voiceTemplate.content.cloneNode(true);
      voiceContainer.appendChild(voiceEl);
   }

   setVoiceIndicators(currentVoiceCount);

   voiceSelector.addEventListener('change', event => {
      currentVoiceCount = event.target.value;
      setVoiceIndicators(currentVoiceCount);
   });
}


function createOscillatorOption(oscillatorNum) {
   const template = document.getElementById('oscillator');
   const oscillatorContainer = template.content.cloneNode(true);

   const titleEl = oscillatorContainer.querySelector('[data-oscillator-title');
   titleEl.textContent = `Oscillator ${oscillatorNum + 1}`

   const labelEl = oscillatorContainer.querySelector('[data-wave-label]');
   labelEl.textContent = `Waveform`;
   const selectEl = oscillatorContainer.querySelector('[data-wave-select]');
   selectEl.value = DEFAULT_WAVE;

   for (const wave of WAVEFORMS) {
      const option = document.createElement('option');
      option.label = wave;
      option.value = wave;
      selectEl.add(option);
   }

   selectEl.addEventListener('change', event => {
      if (!WAVEFORMS.includes(event.target.value)) {
         console.warn(`failed to set waveform to ${event.target.value}`);
         return;
      }

      for (const voice of voices) {
         voice.setOscillatorType(event.target.value, oscillatorNum);
      }
   });

   const gainEl = oscillatorContainer.querySelector('[data-gain]');
   const gainInputScale = 100;
   gainEl.max = gainInputScale;
   gainEl.value = gainInputScale;
   gainEl.addEventListener('change', event => {
      const normalizedVolume = event.target.value / (MAX_OSCILLATORS * gainInputScale);
      for (const voice of voices) {
         voice.setOscillatorGain(normalizedVolume, oscillatorNum);
      }
   });

   oscillatorOptions.appendChild(oscillatorContainer);
}

function drawAnalayzer(audioContext, source) {
   const analyser = audioContext.createAnalyser();
   analyser.fftSize = 2048;

   const bufferLength = analyser.frequencyBinCount;
   const dataArray = new Uint8Array(bufferLength);
   analyser.getByteTimeDomainData(dataArray);

   // Connect the source to be analyzed
   source.connect(analyser);

   // Get a canvas defined with ID "oscilloscope"
   const canvas = document.getElementById("oscilloscope");
   const canvasCtx = canvas.getContext("2d");

   function draw() {
      requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = '#a7ffbe';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = "rgb(0 0 0)";

      canvasCtx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
         const v = dataArray[i] / 128.0;
         const y = (v * canvas.height) / 2;

         if (i === 0) {
            canvasCtx.moveTo(x, y);
         } else {
            canvasCtx.lineTo(x, y);
         }

         x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
   }

   draw();
}

addEventListener('mousedown', () => {
   audioCtx = new AudioContext();
   masterGain = new GainNode(audioCtx, { gain: MAIN_GAIN });
   masterGain.connect(audioCtx.destination);
   drawAnalayzer(audioCtx, masterGain);

   instantiateVoices();

   for (const key of keys) {
      const frequency = Number(key.getAttribute('data-freq')) ?? 0;
      const keyCode = freqToKeyMap.get(frequency) ?? '';

      function playNote() {
         const currentVoiceSet = voices.slice(0, currentVoiceCount);
         const inactiveVoces = currentVoiceSet.filter(voice => !voice.isActive);
         // Use an inactive voice before we reuse active ones
         const voicePool = inactiveVoces.length > 0 ? inactiveVoces : currentVoiceSet;
         const nextVoice = voicePool.toSorted((a, b) => a.activeTime - b.activeTime)[0];
         nextVoice.playFrequency(frequency);
         key.classList.add(PRESSED_CLASS);
      }

      function stopNote() {
         const activeVoice = voices.find(voice => voice.frequency === frequency);
         if (!activeVoice) return;

         activeVoice.stop();
         key.classList.remove(PRESSED_CLASS);
      }

      addEventListener('keydown', event => {
         if (event.code !== keyCode || event.repeat) return;
         playNote();
      });

      key.addEventListener('pointerdown', event => {
         event.preventDefault();
         playNote();
      });

      addEventListener('keyup', event => {
         if (event.code !== keyCode) return;
         stopNote();
      });

      key.addEventListener('pointerup', event => {
         event.preventDefault();
         stopNote();
      });

      key.addEventListener('pointerleave', event => {
         event.preventDefault();
         stopNote();
      });
   }
}, { once: true });

createVoiceSelector();

for (let i = 0; i < MAX_OSCILLATORS; i++) {
   createOscillatorOption(i);
}
