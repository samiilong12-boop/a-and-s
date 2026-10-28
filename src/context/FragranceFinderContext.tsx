'use client';

import React, { createContext, useContext, useState } from 'react';
import { FragranceFinderModal } from '@/components/FragranceFinderModal';

interface FragranceFinderContextType {
  isOpen: boolean;
  openFinder: () => void;
  closeFinder: () => void;
}

const FragranceFinderContext = createContext<FragranceFinderContextType | undefined>(undefined);

export function FragranceFinderProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openFinder = () => setIsOpen(true);
  const closeFinder = () => setIsOpen(false);

  return (
    <FragranceFinderContext.Provider value={{ isOpen, openFinder, closeFinder }}>
      {children}
      <FragranceFinderModal isOpen={isOpen} onClose={closeFinder} />
    </FragranceFinderContext.Provider>
  );
}

export function useFragranceFinder() {
  const context = useContext(FragranceFinderContext);
  if (!context) {
    throw new Error('useFragranceFinder must be used within a FragranceFinderProvider');
  }
  return context;
}
