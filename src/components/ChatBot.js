import React, { useState, useRef, useEffect } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { processUserInput } from '../services/chatbotService';
import { startListening, stopListening, speak, isSpeechRecognitionSupported } from '../services/voiceService';
import { generateResponse } from '../services/geminiService';
import { FaMicrophone } from 'react-icons/fa';
import {
  Box,
  IconButton,
  Paper,
  TextField,
  Typography,
  Collapse,
  CircularProgress,
  Drawer,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SettingsIcon from '@mui/icons-material/Settings';
import VoiceSettings from './VoiceSettings';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [microphoneStatus, setMicrophoneStatus] = useState('unchecked');
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStreamingResponse = (chunk) => {
    setMessages(prevMessages => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      if (lastMessage && lastMessage.type === 'assistant') {
        // Update the last message with the new chunk
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + chunk
        };
        return updatedMessages;
      } else {
        // Add a new assistant message
        return [...prevMessages, { type: 'assistant', content: chunk }];
      }
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      // Add initial empty assistant message for streaming
      setMessages(prev => [...prev, { type: 'assistant', content: '' }]);

      // Process the message with Gemini
      const context = { apps, workflows };
      const response = await generateResponse(userMessage, context, handleStreamingResponse);

      // Process any actions from the response
      await processUserInput(response, context);

      // Speak the response
      await speak(response);
    } catch (err) {
      console.error('Error processing message:', err);
      setError(err.message);
      setMessages(prev => [...prev, { type: 'error', content: err.message }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
      return;
    }

    setError(null);
    setIsListening(true);

    try {
      await startListening(
        async (text) => {
          setInput(text);
          setIsListening(false);
          // Automatically send the voice input
          await handleSend();
        },
        (error) => {
          console.error('Voice input error:', error);
          setError(error);
          setIsListening(false);
        }
      );
    } catch (err) {
      console.error('Error starting voice input:', err);
      setError(err.message);
      setIsListening(false);
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <Collapse in={isOpen} collapsedSize={0}>
        <Paper
          elevation={3}
          sx={{
            width: 350,
            height: 500,
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: 'rgba(18, 18, 18, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box sx={{ 
            p: 2, 
            bgcolor: 'rgba(18, 18, 18, 0.95)',
            color: '#90caf9',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <Typography variant="h6" sx={{ 
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              fontWeight: 500,
            }}>
              AI Assistant
            </Typography>
            <IconButton
              onClick={() => setShowSettings(!showSettings)}
              sx={{
                color: '#90caf9',
                '&:hover': {
                  bgcolor: 'rgba(144, 202, 249, 0.1)',
                },
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              backgroundColor: 'transparent',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0, 0, 0, 0.1)',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.2)',
                },
              },
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 1,
                    bgcolor: message.type === 'user' 
                      ? 'rgba(144, 202, 249, 0.15)' 
                      : 'rgba(255, 255, 255, 0.05)', 
                    color: message.type === 'user' ? '#90caf9' : '#fff',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid',
                    borderColor: message.type === 'user'
                      ? 'rgba(144, 202, 249, 0.3)'
                      : 'rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: message.type === 'user' ? 500 : 400,
                      textShadow: '0 1px 1px rgba(0,0,0,0.3)',
                      letterSpacing: 0.2,
                    }}
                  >
                    {message.content}
                  </Typography>
                </Paper>
              </Box>
            ))}
            {isTyping && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                p: 1,
                borderRadius: 1,
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <CircularProgress size={16} sx={{ color: '#90caf9' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  AI is typing...
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            gap: 1, 
            bgcolor: 'rgba(18, 18, 18, 0.95)',
            backdropFilter: 'blur(8px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <TextField
              fullWidth
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              error={!!error}
              helperText={error}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                  },
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(144, 202, 249, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#90caf9',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: '#fff',
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />
            {voiceSupported && microphoneStatus === 'available' && (
              <IconButton
                color={isListening ? 'secondary' : 'primary'}
                onClick={handleVoiceInput}
                disabled={isTyping}
                sx={{
                  bgcolor: isListening ? 'rgba(244, 143, 177, 0.15)' : 'rgba(144, 202, 249, 0.15)',
                  color: isListening ? '#f48fb1' : '#90caf9',
                  '&:hover': {
                    bgcolor: isListening ? 'rgba(244, 143, 177, 0.25)' : 'rgba(144, 202, 249, 0.25)',
                  },
                  border: '1px solid',
                  borderColor: isListening ? 'rgba(244, 143, 177, 0.3)' : 'rgba(144, 202, 249, 0.3)',
                }}
              >
                <FaMicrophone />
              </IconButton>
            )}
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              sx={{
                bgcolor: 'rgba(144, 202, 249, 0.15)',
                color: '#90caf9',
                '&:hover': {
                  bgcolor: 'rgba(144, 202, 249, 0.25)',
                },
                '&.Mui-disabled': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.3)',
                },
                border: '1px solid rgba(144, 202, 249, 0.3)',
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Collapse>

      <IconButton
        color="primary"
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          width: 56,
          height: 56,
          bgcolor: 'rgba(18, 18, 18, 0.95)',
          backdropFilter: 'blur(8px)',
          '&:hover': { 
            bgcolor: 'rgba(18, 18, 18, 0.98)',
          },
          color: '#90caf9',
          border: '1px solid rgba(144, 202, 249, 0.3)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        <SmartToyIcon />
      </IconButton>

      <Drawer
        anchor="right"
        open={showSettings}
        onClose={() => setShowSettings(false)}
        PaperProps={{
          sx: {
            width: 350,
            bgcolor: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <VoiceSettings />
        </Box>
      </Drawer>
    </Box>
  );
};

export default ChatBot;
