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

  const authenticate = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
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
