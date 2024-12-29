import React, { useState, useRef, useEffect } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { processUserInput } from '../services/chatbotService';
import { startListening, stopListening, speak, isSpeechRecognitionSupported } from '../services/voiceService';
import { FaMicrophone } from 'react-icons/fa';
import {
  Box,
  IconButton,
  Paper,
  TextField,
  Typography,
  Collapse,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [microphoneStatus, setMicrophoneStatus] = useState('unchecked'); // 'unchecked', 'available', 'unavailable'
  const messagesEndRef = useRef(null);
  const { apps, workflows } = useFirestore();

  // Check if voice recognition is supported
  const [voiceSupported, setVoiceSupported] = useState(true);

  useEffect(() => {
    // Check if voice features are supported
    const checkVoiceSupport = async () => {
      try {
        const supported = isSpeechRecognitionSupported();
        console.log('Voice recognition supported:', supported);
        setVoiceSupported(supported);

        // Check for microphone devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasAudioInput = devices.some(device => device.kind === 'audioinput');
        setMicrophoneStatus(hasAudioInput ? 'available' : 'unavailable');
        
        if (!hasAudioInput) {
          setError('No microphone found. Please connect a microphone to use voice commands.');
        }
      } catch (err) {
        console.error('Error checking voice support:', err);
        setVoiceSupported(false);
        setMicrophoneStatus('unavailable');
        setError('Unable to access microphone. Please check your device permissions.');
      }
    };

    checkVoiceSupport();

    // Add welcome message
    setMessages([{
      text: 'Hello! I can help you manage your apps and workflows. Type "help" to see what I can do, or click the microphone to use voice commands.',
      sender: 'bot',
      timestamp: new Date().toISOString(),
      isError: false
    }]);
  }, []);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    scrollToBottom();
  }, [messages]);

  const addMessage = (text, sender, isError = false) => {
    setMessages(prev => [...prev, {
      text,
      sender,
      timestamp: new Date().toISOString(),
      isError
    }]);
  };

  const toggleVoice = async () => {
    console.log('Toggle voice called. Voice supported:', voiceSupported, 'Microphone status:', microphoneStatus);
    
    // Clear any previous errors
    setError(null);

    if (!voiceSupported) {
      setError('Voice recognition is not supported in your browser');
      addMessage('Voice recognition is not supported in your browser. Please type your commands instead.', 'bot', true);
      return;
    }

    if (microphoneStatus === 'unavailable') {
      const errorMsg = 'No microphone found. Please connect a microphone and refresh the page to use voice commands.';
      setError(errorMsg);
      addMessage(errorMsg, 'bot', true);
      return;
    }

    try {
      if (isListening) {
        console.log('Stopping voice recognition...');
        stopListening();
        setIsListening(false);
      } else {
        console.log('Starting voice recognition...');
        setIsListening(true);
        await startListening(
          async (text) => {
            console.log('Voice command received:', text);
            // Add user's voice input to chat
            addMessage(text, 'user');
            
            try {
              // Process the voice command
              const response = await processUserInput(text, { apps, workflows });
              console.log('Voice command response:', response);
              
              // Add bot response to chat
              addMessage(response, 'bot');
              
              // Only speak if we're still listening
              if (isListening) {
                await speak(response);
              }
            } catch (error) {
              console.error('Error processing voice command:', error);
              const errorMessage = 'Sorry, I encountered an error processing your voice command. Please try again.';
              addMessage(errorMessage, 'bot', true);
              if (isListening) {
                await speak(errorMessage);
              }
            }
          },
          (error) => {
            console.error('Voice recognition error:', error);
            setIsListening(false);
            
            // Handle specific error cases
            let errorMessage = 'An error occurred with voice recognition. ';
            if (error.message?.includes('device not found')) {
              errorMessage = 'No microphone found. Please connect a microphone and try again.';
              setMicrophoneStatus('unavailable');
            } else if (error.message?.includes('permission')) {
              errorMessage = 'Microphone access was denied. Please allow microphone access in your browser settings.';
            }
            
            setError(errorMessage);
            addMessage(errorMessage, 'bot', true);
          }
        );
      }
    } catch (error) {
      console.error('Error toggling voice:', error);
      setIsListening(false);
      const errorMessage = 'Failed to start voice recognition. Please check your microphone connection and try again.';
      setError(errorMessage);
      addMessage(errorMessage, 'bot', true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userInput = input.trim();
    setInput('');
    
    // Add user message to chat
    addMessage(userInput, 'user');

    try {
      // Process user input
      const response = await processUserInput(userInput, { apps, workflows });
      
      // Add bot response to chat
      addMessage(response, 'bot');
      
      // Speak the response if voice is active
      if (isListening) {
        await speak(response);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      addMessage('Sorry, I encountered an error. Please try again.', 'bot', true);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        width: '320px',
        zIndex: 1000,
      }}
    >
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        }}
      >
        <SmartToyIcon />
      </IconButton>

      <Collapse in={isOpen}>
        <Paper
          elevation={3}
          sx={{
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
              backgroundColor: 'primary.main',
              color: 'white',
            }}
          >
            <Typography variant="h6" sx={{ fontSize: '1rem' }}>AI Assistant</Typography>
            {error && (
              <Typography color="error" variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                {error}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 1.5,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'background.default',
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  mb: 1,
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 1,
                    backgroundColor: message.sender === 'user' 
                      ? 'primary.main'
                      : message.isError 
                        ? 'error.dark'
                        : 'background.paper',
                    color: message.sender === 'user' || message.isError
                      ? 'white'
                      : 'text.primary',
                    border: theme => message.sender === 'bot' ? `1px solid ${theme.palette.divider}` : 'none',
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{message.text}</Typography>
                </Paper>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: 1.5,
              borderTop: 1,
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              display: 'flex',
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default',
                  '& fieldset': {
                    borderColor: 'divider',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: 'text.primary',
                  fontSize: '0.875rem',
                },
              }}
            />
            <IconButton 
              color="primary" 
              type="submit"
              size="small"
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                width: 32,
                height: 32,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              <SendIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton 
              onClick={toggleVoice}
              disabled={!voiceSupported || microphoneStatus === 'unavailable'}
              size="small"
              sx={{
                backgroundColor: isListening ? 'error.main' : 'primary.main',
                color: 'white',
                width: 32,
                height: 32,
                '&:hover': {
                  backgroundColor: isListening ? 'error.dark' : 'primary.dark',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'grey.800',
                  color: 'grey.500',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <FaMicrophone style={{ 
                fontSize: '14px',
                transform: isListening ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.3s ease'
              }} />
            </IconButton>
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default ChatBot;
