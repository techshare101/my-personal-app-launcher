import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  IconButton,
  Paper,
} from '@mui/material';
import { VolumeUp, Speed, GraphicEq } from '@mui/icons-material';
import { getAvailableVoices, setVoice, updateVoiceSettings } from '../services/voiceService';

const VoiceSettings = () => {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [settings, setSettings] = useState({
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  });

  useEffect(() => {
    // Initialize available voices
    const loadVoices = () => {
      const availableVoices = getAvailableVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    loadVoices();

    // Handle dynamically loaded voices
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleVoiceChange = (event) => {
    const voiceName = event.target.value;
    setSelectedVoice(voiceName);
    setVoice(voiceName);
  };

  const handleSettingChange = (setting) => (event, newValue) => {
    const newSettings = {
      ...settings,
      [setting]: newValue,
    };
    setSettings(newSettings);
    updateVoiceSettings(newSettings);
  };

  return (
    <Paper 
      elevation={3}
      sx={{
        p: 2,
        bgcolor: 'rgba(18, 18, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: '#90caf9' }}>
        Voice Settings
      </Typography>

      <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
        <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Voice</InputLabel>
        <Select
          value={selectedVoice}
          onChange={handleVoiceChange}
          label="Voice"
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(144, 202, 249, 0.3)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#90caf9',
            },
          }}
        >
          {voices.map((voice) => (
            <MenuItem key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <IconButton size="small" sx={{ color: '#90caf9', mr: 1 }}>
            <Speed />
          </IconButton>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Rate: {settings.rate.toFixed(1)}
          </Typography>
        </Box>
        <Slider
          value={settings.rate}
          onChange={handleSettingChange('rate')}
          min={0.5}
          max={2}
          step={0.1}
          sx={{
            color: '#90caf9',
            '& .MuiSlider-rail': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <IconButton size="small" sx={{ color: '#90caf9', mr: 1 }}>
            <GraphicEq />
          </IconButton>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Pitch: {settings.pitch.toFixed(1)}
          </Typography>
        </Box>
        <Slider
          value={settings.pitch}
          onChange={handleSettingChange('pitch')}
          min={0.5}
          max={2}
          step={0.1}
          sx={{
            color: '#90caf9',
            '& .MuiSlider-rail': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        />
      </Box>

      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <IconButton size="small" sx={{ color: '#90caf9', mr: 1 }}>
            <VolumeUp />
          </IconButton>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Volume: {settings.volume.toFixed(1)}
          </Typography>
        </Box>
        <Slider
          value={settings.volume}
          onChange={handleSettingChange('volume')}
          min={0}
          max={1}
          step={0.1}
          sx={{
            color: '#90caf9',
            '& .MuiSlider-rail': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default VoiceSettings;
