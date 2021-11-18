import React, { createContext, FC, useState } from 'react';

interface IRefreshContext {
  subscribe: (func: () => void) => void;
  unsubscribe: (func: () => void) => void;
  refresh: () => void;
}

const contextDefaultValues: IRefreshContext = {
  subscribe: () => {},
  unsubscribe: () => {},
  refresh: () => {},
};

export const RefreshContext =
  createContext<IRefreshContext>(contextDefaultValues);

// **************************************************************
// Refresh context provider
// **************************************************************

const RefreshProvider: FC = ({ children }) => {
  // Callbacks to call on refresh
  const [callbacks, setCallbacks] = useState<(() => void)[]>([]);

  // Subscribe the function
  const subscribe = (func: () => void): void => {
    setCallbacks((callbacks) => {
      return [...callbacks, func];
    });
  };

  // Unsubscribe the function
  const unsubscribe = (func: () => void): void => {
    setCallbacks((callbacks) => {
      return callbacks.filter((x) => x !== func);
    });
  };

  // Call all the callback in the list
  const refresh = () => {
    callbacks.forEach((x) => {
      x();
    });
  };

  return (
    <RefreshContext.Provider
      value={{
        subscribe,
        unsubscribe,
        refresh,
      }}
    >
      {children}
    </RefreshContext.Provider>
  );
};

export default RefreshProvider;
