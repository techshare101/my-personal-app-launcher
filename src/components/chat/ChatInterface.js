import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Fade,
  Chip,
  Avatar,
  useTheme,
  CircularProgress,
  Tooltip,
  Collapse,
  Button,
  Grow,
  Zoom,
} from '@mui/material';
import {
  Send as SendIcon,
  Mic as MicIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Lightbulb as LightbulbIcon,
  Apps as AppsIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { chatService } from '../../services/chatService';

const StyledPaper = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  width: 320,
  maxHeight: '60vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)'
    : 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
  zIndex: 1000,
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${theme.palette.divider}`,
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(90deg, #2196f3 0%, #1976d2 100%)'
    : 'linear-gradient(90deg, #2196f3 0%, #1976d2 100%)',
  color: '#fff',
}));

const ChatMessage = styled(Box)(({ theme, isUser }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(0.5),
  padding: theme.spacing(0.5, 1),
  flexDirection: isUser ? 'row-reverse' : 'row',
}));

const MessageBubble = styled(Paper)(({ theme, isUser }) => ({
  padding: theme.spacing(1),
  maxWidth: '75%',
  borderRadius: theme.spacing(1.5),
  background: isUser 
    ? 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
    : theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, #424242 0%, #303030 100%)'
      : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
  color: isUser ? '#fff' : theme.palette.text.primary,
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
}));

const QuickReplyChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
  color: '#fff',
  '&:hover': {
    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
  },
}));

const suggestions = [
  { label: 'Recommend an app', icon: <AppsIcon /> },
  { label: 'Create workflow', icon: <AutoAwesomeIcon /> },
  { label: 'Productivity tips', icon: <LightbulbIcon /> },
];

export default function ChatInterface() {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setIsTyping(true);
    setShowSuggestions(false);

    try {
      const response = await chatService.sendMessage(message);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: response,
        isUser: false,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion.label);
    inputRef.current?.focus();
  };

  return (
    <StyledPaper elevation={3}>
      <ChatHeader>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.dark', mr: 1, width: 28, height: 28 }}>
            <AutoAwesomeIcon sx={{ fontSize: 16 }} />
          </Avatar>
          <Typography variant="body2" fontWeight="bold">
            SmartLaunch Assistant
          </Typography>
        </Box>
        <Box>
          <IconButton size="small" color="inherit">
            <SettingsIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton 
            size="small" 
            color="inherit" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ExpandMoreIcon sx={{ fontSize: 18 }} /> : <ExpandLessIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Box>
      </ChatHeader>

      <Collapse in={isExpanded} sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            height: 300,
            overflowY: 'auto',
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {messages.map((msg) => (
            <Zoom in key={msg.id} style={{ transitionDelay: '50ms' }}>
              <ChatMessage isUser={msg.isUser}>
                <Avatar
                  sx={{ 
                    width: 24,
                    height: 24,
                    mx: 0.5,
                    bgcolor: msg.isUser ? 'primary.main' : 'secondary.main',
                    fontSize: '0.75rem',
                  }}
                >
                  {msg.isUser ? 'U' : 'A'}
                </Avatar>
                <MessageBubble isUser={msg.isUser} variant="outlined">
                  <Typography variant="body2">{msg.text}</Typography>
                </MessageBubble>
              </ChatMessage>
            </Zoom>
          ))}
          {isTyping && (
            <Fade in>
              <ChatMessage>
                <Avatar sx={{ width: 24, height: 24, mx: 0.5, bgcolor: 'secondary.main', fontSize: '0.75rem' }}>
                  A
                </Avatar>
                <MessageBubble variant="outlined">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2">Thinking...</Typography>
                  </Box>
                </MessageBubble>
              </ChatMessage>
            </Fade>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {showSuggestions && (
          <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {suggestions.map((suggestion) => (
              <Grow in key={suggestion.label}>
                <QuickReplyChip
                  label={suggestion.label}
                  icon={React.cloneElement(suggestion.icon, { sx: { fontSize: 16 } })}
                  onClick={() => handleSuggestionClick(suggestion)}
                  clickable
                  size="small"
                />
              </Grow>
            ))}
          </Box>
        )}

        <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Ask me anything..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            inputRef={inputRef}
            InputProps={{
              endAdornment: (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small">
                    <MicIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton 
                    size="small"
                    color="primary"
                    onClick={handleSend}
                    disabled={!message.trim()}
                  >
                    <SendIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              ),
            }}
          />
        </Box>
      </Collapse>
    </StyledPaper>
  );
}
