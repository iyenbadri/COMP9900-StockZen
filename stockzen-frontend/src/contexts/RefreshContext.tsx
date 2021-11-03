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

const RefreshProvider: FC = ({ children }) => {
  const [callbacks, setCallbacks] = useState<(() => void)[]>([]);

  const subscribe = (func: () => void): void => {
    setCallbacks((callbacks) => {
      return [...callbacks, func];
    });
  };

  const unsubscribe = (func: () => void): void => {
    setCallbacks((callbacks) => {
      return callbacks.filter((x) => x !== func);
    });
  };

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
