// Speech recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

console.log('SpeechRecognition available:', !!SpeechRecognition);
console.log('SpeechGrammarList available:', !!SpeechGrammarList);
console.log('SpeechRecognitionEvent available:', !!SpeechRecognitionEvent);

let recognition = null;
let isRecognitionActive = false;
let permissionGranted = false;

// Speech synthesis setup
const synth = window.speechSynthesis;
console.log('Speech synthesis available:', !!synth);

// Voice settings
let selectedVoice = null;
let voiceSettings = {
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0
};

// Initialize voices and select a default one
const initializeVoices = () => {
  const voices = synth.getVoices();
  console.log('Available voices:', voices);
  
  // Try to find a good quality English voice
  selectedVoice = voices.find(voice => 
    voice.lang.includes('en') && 
    (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Natural'))
  ) || voices[0];
  
  console.log('Selected voice:', selectedVoice?.name);
  return voices;
};

// Handle voices changed event
if (synth.onvoiceschanged !== undefined) {
  synth.onvoiceschanged = initializeVoices;
}

const initializeRecognition = () => {
  if (!recognition && SpeechRecognition) {
    try {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      console.log('Speech recognition initialized successfully');
      return recognition;
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      return null;
    }
  }
  return recognition;
};

const requestMicrophonePermission = async () => {
  try {
    // Check if we're in Electron
    if (window.electron) {
      // First check existing permission
      const status = await window.electron.invoke('check-microphone-permission');
      console.log('Current microphone status:', status);
      
      if (status === 'granted') {
        // Verify we can actually access the microphone
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasAudioInput = devices.some(device => device.kind === 'audioinput');
          if (!hasAudioInput) {
            console.error('No audio input devices found');
            throw new Error('No microphone devices found on your system');
          }
          permissionGranted = true;
          return true;
        } catch (deviceError) {
          console.error('Error accessing audio devices:', deviceError);
          throw new Error('Could not access microphone device. Please ensure a microphone is connected and enabled.');
        }
      }
      
      // Request permission through Electron
      console.log('Requesting permission through Electron...');
      const granted = await window.electron.invoke('request-microphone-permission');
      console.log('Permission request result:', granted);
      
      if (granted) {
        // Double check device access after permission granted
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasAudioInput = devices.some(device => device.kind === 'audioinput');
        if (!hasAudioInput) {
          throw new Error('No microphone devices found on your system');
        }
        permissionGranted = true;
        return true;
      }
      
      throw new Error('Microphone permission denied by system');
    }
    
    // Regular browser permission request
    console.log('Requesting permission through browser...');
    // First check for available devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasAudioInput = devices.some(device => device.kind === 'audioinput');
    if (!hasAudioInput) {
      throw new Error('No microphone devices found on your system');
    }
    
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: true,
      video: false 
    });
    
    window.audioStream = stream;
    permissionGranted = true;
    return true;
  } catch (error) {
    console.error('Error getting microphone permission:', error);
    permissionGranted = false;
    throw error;
  }
};

export const startListening = async (onResult, onError) => {
  console.log('Starting speech recognition...');
  
  try {
    // Make sure previous instance is stopped
    stopListening();
    await new Promise(resolve => setTimeout(resolve, 100)); // Brief pause for cleanup
    
    // Initialize new recognition instance
    recognition = initializeRecognition();
    
    if (!recognition) {
      const error = 'Speech recognition is not supported in this browser';
      console.error(error);
      onError(error);
      return;
    }

    // Request permission first
    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        const error = 'Microphone permission denied';
        console.error(error);
        onError(error);
        return;
      }
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      onError(error.message || 'Failed to access microphone');
      return;
    }

    // Set up event handlers
    recognition.onstart = () => {
      console.log('Speech recognition started');
      isRecognitionActive = true;
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      isRecognitionActive = false;
      
      // Only restart if we haven't manually stopped and have permission
      if (!recognition?.manualStop && permissionGranted) {
        try {
          recognition?.start();
          console.log('Recognition restarted');
          isRecognitionActive = true;
        } catch (error) {
          console.error('Error restarting recognition:', error);
          isRecognitionActive = false;
          onError('Error restarting recognition: ' + error.message);
        }
      } else {
        isRecognitionActive = false;
      }
    };

    recognition.onresult = (event) => {
      try {
        if (!event.results || event.results.length === 0) {
          console.error('No results in recognition event');
          onError('No speech detected');
          return;
        }

        // Get the last result
        const last = event.results.length - 1;
        const result = event.results[last];
        
        if (!result || result.length === 0) {
          console.error('Invalid recognition result');
          onError('Failed to process speech');
          return;
        }

        const text = result[0].transcript;
        if (!text || typeof text !== 'string') {
          console.error('Invalid recognition text:', text);
          onError('Failed to convert speech to text');
          return;
        }

        console.log('Recognized text:', text);
        onResult(text);
      } catch (error) {
        console.error('Error in onresult:', error);
        onError('Error processing voice input: ' + error.message);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'Speech recognition error';
      
      switch (event.error) {
        case 'no-speech':
          // Ignore no-speech errors as they're common
          return;
        case 'not-allowed':
        case 'permission-denied':
          permissionGranted = false;
          isRecognitionActive = false;
          errorMessage = 'Microphone permission denied. Please allow microphone access and try again.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was aborted';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone was found. Please ensure your microphone is properly connected.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service is not allowed';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      isRecognitionActive = false;
      recognition = null;
      onError(errorMessage);
    };

    // Start recognition
    recognition.manualStop = false;
    await recognition.start();
    console.log('Recognition started successfully');
  } catch (error) {
    console.error('Error starting speech recognition:', error);
    isRecognitionActive = false;
    recognition = null;
    onError('Failed to start speech recognition: ' + error.message);
  }
};

export const stopListening = () => {
  console.log('Stopping speech recognition...');
  if (recognition) {
    try {
      recognition.manualStop = true;
      recognition.stop();
      isRecognitionActive = false;
      
      // Cleanup the audio stream
      if (window.audioStream) {
        window.audioStream.getTracks().forEach(track => track.stop());
        window.audioStream = null;
      }
      
      // Reset recognition instance
      recognition.onstart = null;
      recognition.onend = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition = null;
      
      console.log('Speech recognition stopped and cleaned up');
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      isRecognitionActive = false;
      // Reset recognition instance even on error
      recognition = null;
    }
  }
};

export const getAvailableVoices = () => {
  return synth.getVoices();
};

export const setVoice = (voiceName) => {
  const voices = synth.getVoices();
  const voice = voices.find(v => v.name === voiceName);
  if (voice) {
    selectedVoice = voice;
    console.log('Voice set to:', voice.name);
    return true;
  }
  return false;
};

export const updateVoiceSettings = (settings) => {
  voiceSettings = {
    ...voiceSettings,
    ...settings
  };
  console.log('Voice settings updated:', voiceSettings);
};

export const speak = (text) => {
  return new Promise((resolve, reject) => {
    console.log('Starting speech synthesis...');
    if (!synth) {
      const error = 'Speech synthesis not supported';
      console.error(error);
      resolve();
      return;
    }

    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply voice settings
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.lang = selectedVoice?.lang || 'en-US';
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;

    utterance.onstart = () => {
      console.log('Speech synthesis started');
    };

    utterance.onend = () => {
      console.log('Speech synthesis ended');
      resolve();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      resolve();
    };

    try {
      synth.speak(utterance);
    } catch (error) {
      console.error('Error starting speech synthesis:', error);
      resolve();
    }
  });
};

export const testSpeech = async () => {
  console.log('Testing speech synthesis...');
  await speak('Testing speech synthesis. If you can hear this, audio is working correctly.');
};

export const isSpeechRecognitionSupported = () => {
  try {
    // Check if the browser supports the Web Speech API
    if (!SpeechRecognition) {
      console.log('SpeechRecognition API not available');
      return false;
    }

    // Check if we can create a recognition instance
    const testRecognition = new SpeechRecognition();
    if (!testRecognition) {
      console.log('Cannot create SpeechRecognition instance');
      return false;
    }

    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log('getUserMedia not available');
      return false;
    }

    console.log('Speech recognition is fully supported');
    return true;
  } catch (error) {
    console.error('Error checking speech recognition support:', error);
    return false;
  }
};

export const isSpeechSynthesisSupported = () => {
  return !!synth;
};
