import React, { createContext, FC, useState } from 'react';

interface ITopPerformerContext {
  showPortfolioSummary: boolean;
  setShowPortfolioSummary: (show: boolean) => void;
}

const contextDefaultValues: ITopPerformerContext = {
  showPortfolioSummary: false,
  setShowPortfolioSummary: (show: boolean) => {},
};

export const TopPerformerContext =
  createContext<ITopPerformerContext>(contextDefaultValues);

const TopPerformerProvider: FC = ({ children }): any => {
  const [showPortfolioSummary, setShowPortfolioSummary] =
    useState<boolean>(false);

  return (
    <TopPerformerContext.Provider
      value={{
        showPortfolioSummary,
        setShowPortfolioSummary,
      }}
    >
      {children}
    </TopPerformerContext.Provider>
  );
};

export default TopPerformerProvider;
