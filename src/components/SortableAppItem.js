import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Paper, IconButton, Typography, Box } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';

export default function SortableAppItem({ app, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: app.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      sx={{
        p: 2,
        mb: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <IconButton size="small" {...attributes} {...listeners}>
        <DragIndicatorIcon />
      </IconButton>
      
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1">{app.name}</Typography>
        <Typography variant="caption" color="textSecondary">
          {app.url}
        </Typography>
      </Box>

      <IconButton size="small" onClick={onRemove} color="error">
        <DeleteIcon />
      </IconButton>
    </Paper>
  );
}
