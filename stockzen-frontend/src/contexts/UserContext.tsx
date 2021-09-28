import React, { FC, createContext, useState, useEffect } from 'react';
// import api from '../../api';

interface IUserContext {
  isAuthenticated: boolean;
  authenticate: () => void;
  logout: () => void;
}

const contextDefaultValues: IUserContext = {
  isAuthenticated: false,
  authenticate: () => {},
  logout: () => {},
};

export const UserContext = createContext<IUserContext>(contextDefaultValues);

const UserProvider: FC = ({ children }): any => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const init = () => {
    if (localStorage.getItem('isAuthenticated') === '1') {
      setIsAuthenticated(true);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const authenticate = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', '1');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('isAuthenticated', '0');
  };

  return (
    <UserContext.Provider
      value={{
        isAuthenticated,
        authenticate,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
