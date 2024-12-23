import React, { createContext, useContext, useState, useEffect } from 'react';

const LayoutContext = createContext();

export const LAYOUT_TYPES = {
  GRID: 'grid',
  LIST: 'list',
  ADAPTIVE: 'adaptive'
};

export function LayoutProvider({ children }) {
  const [layoutType, setLayoutType] = useState(() => {
    const savedLayout = localStorage.getItem('preferredLayout');
    return savedLayout || LAYOUT_TYPES.ADAPTIVE;
  });

  const [columnCount, setColumnCount] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (layoutType === LAYOUT_TYPES.ADAPTIVE) {
        const width = window.innerWidth;
        if (width < 600) setColumnCount(1);
        else if (width < 960) setColumnCount(2);
        else if (width < 1280) setColumnCount(3);
        else setColumnCount(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layoutType]);

  useEffect(() => {
    localStorage.setItem('preferredLayout', layoutType);
  }, [layoutType]);

  const value = {
    layoutType,
    setLayoutType,
    columnCount,
    isGridView: layoutType === LAYOUT_TYPES.GRID,
    isListView: layoutType === LAYOUT_TYPES.LIST,
    isAdaptiveView: layoutType === LAYOUT_TYPES.ADAPTIVE
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
