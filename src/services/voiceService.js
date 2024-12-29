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
  // If permission was already granted, return true
  if (permissionGranted) {
    return true;
  }

  try {
    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: true,
      video: false
    });

    // Keep the stream active
    window.audioStream = stream;
    permissionGranted = true;
    return true;
  } catch (error) {
    console.error('Error getting microphone permission:', error);
    permissionGranted = false;
    return false;
  }
};

export const startListening = async (onResult, onError) => {
  console.log('Starting speech recognition...');
  
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

  // Don't restart if already active
  if (isRecognitionActive) {
    console.log('Recognition is already active');
    return;
  }

  // Request microphone permission first
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
    isRecognitionActive = false;
    
    // Only restart if we haven't manually stopped and have permission
    if (!recognition.manualStop && permissionGranted) {
      try {
        recognition.start();
        console.log('Recognition restarted');
      } catch (error) {
        console.error('Error restarting recognition:', error);
      }
    }
  };

  recognition.onresult = (event) => {
    // Get the last result
    const last = event.results.length - 1;
    const text = event.results[last][0].transcript;
    console.log('Recognized text:', text);
    onResult(text);
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (event.error === 'no-speech') {
      // Ignore no-speech errors as they're common
      return;
    }
    if (event.error === 'not-allowed') {
      permissionGranted = false;
    }
    isRecognitionActive = false;
    onError(event.error);
  };

  try {
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
  if (recognition && isRecognitionActive) {
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
      reject(error);
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
      reject(event.error);
    };

    try {
      synth.speak(utterance);
    } catch (error) {
      console.error('Error starting speech synthesis:', error);
      reject(error);
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
  return !!window.speechSynthesis;
};
