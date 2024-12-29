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
    // Initialize recognition if not already done
    if (!recognition) {
      recognition = initializeRecognition();
    }
    
    if (!recognition) {
      const error = 'Speech recognition is not supported in this browser';
      console.error(error);
      onError(error);
      return;
    }

    // Request permission first
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      const error = 'Microphone permission denied';
      console.error(error);
      onError(error);
      return;
    }

    // Set up event handlers
    recognition.onstart = () => {
      console.log('Speech recognition started');
      isRecognitionActive = true;
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      
      // Only restart if we haven't manually stopped and have permission
      if (!recognition.manualStop && permissionGranted) {
        try {
          recognition.start();
          console.log('Recognition restarted');
          isRecognitionActive = true;
        } catch (error) {
          console.error('Error restarting recognition:', error);
          isRecognitionActive = false;
          onError('Error restarting recognition');
        }
      } else {
        isRecognitionActive = false;
      }
    };

    recognition.onresult = (event) => {
      try {
        // Get the last result
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        console.log('Recognized text:', text);
        
        // Check for stop command
        const lowerText = text.toLowerCase();
        if (lowerText === 'stop' || lowerText === 'stop listening') {
          console.log('Stop command received');
          stopListening();
          onResult('Stopping voice recognition.');
          return;
        }
        
        onResult(text);
      } catch (error) {
        console.error('Error in onresult:', error);
        onError('Error processing voice input');
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Ignore no-speech errors as they're common
        return;
      }
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        permissionGranted = false;
        isRecognitionActive = false;
        onError('Microphone permission denied. Please allow microphone access and try again.');
        return;
      }
      if (event.error === 'network') {
        // Try to restart on network errors
        try {
          recognition.stop();
          setTimeout(() => {
            if (permissionGranted && !recognition.manualStop) {
              recognition.start();
            }
          }, 1000);
        } catch (error) {
          console.error('Error handling network error:', error);
        }
        return;
      }
      isRecognitionActive = false;
      onError(event.error);
    };

    // Start recognition
    recognition.manualStop = false;
    await recognition.start();
    console.log('Recognition started successfully');
  } catch (error) {
    console.error('Error starting speech recognition:', error);
    isRecognitionActive = false;
    onError(error.message);
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
      
      console.log('Speech recognition stopped');
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      isRecognitionActive = false;
    }
  }
};

export const speak = (text) => {
  return new Promise((resolve, reject) => {
    console.log('Starting speech synthesis...');
    if (!synth) {
      const error = 'Speech synthesis not supported';
      console.error(error);
      resolve(); // Resolve instead of reject to continue execution
      return;
    }

    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      console.log('Speech synthesis started');
    };

    utterance.onend = () => {
      console.log('Speech synthesis ended');
      resolve();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      resolve(); // Resolve instead of reject to continue execution
    };

    try {
      synth.speak(utterance);
    } catch (error) {
      console.error('Error starting speech synthesis:', error);
      resolve(); // Resolve instead of reject to continue execution
    }
  });
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
