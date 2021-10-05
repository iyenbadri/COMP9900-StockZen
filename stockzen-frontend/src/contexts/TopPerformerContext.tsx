import React, { createContext, FC, useEffect, useState } from 'react';
// import api from '../../api';

interface ITopPerformerContext {
  showPortfolioSummary: boolean;
  setShowPortfolioSummary: (show: boolean) => void;
}

const contextDefaultValues: ITopPerformerContext = {
  showPortfolioSummary: false,
  setShowPortfolioSummary: (show: boolean) => {},
};

export const TopPerformanceContext =
  createContext<ITopPerformerContext>(contextDefaultValues);

const TopPerformerProvider: FC = ({ children }): any => {
  const [showPortfolioSummary, setShowPortfolioSummary] =
    useState<boolean>(false);

  return (
    <TopPerformanceContext.Provider
      value={{
        showPortfolioSummary,
        setShowPortfolioSummary,
      }}
    >
      {children}
    </TopPerformanceContext.Provider>
  );
};

export default TopPerformerProvider;
