import React from 'react';
import { ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useLayout, LAYOUT_TYPES } from '../contexts/LayoutContext';

export default function LayoutSwitcher() {
  const { layoutType, setLayoutType } = useLayout();

  const handleLayoutChange = (event, newLayout) => {
    if (newLayout !== null) {
      setLayoutType(newLayout);
    }
  };

  return (
    <ToggleButtonGroup
      value={layoutType}
      exclusive
      onChange={handleLayoutChange}
      aria-label="layout view"
      size="small"
      sx={{
        mb: 2,
        '& .MuiToggleButton-root': {
          px: 2,
          py: 1,
        },
      }}
    >
      <Tooltip title="Grid View">
        <ToggleButton value={LAYOUT_TYPES.GRID} aria-label="grid view">
          <GridViewIcon />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="List View">
        <ToggleButton value={LAYOUT_TYPES.LIST} aria-label="list view">
          <ViewListIcon />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Adaptive View">
        <ToggleButton value={LAYOUT_TYPES.ADAPTIVE} aria-label="adaptive view">
          <AutoAwesomeIcon />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
}
