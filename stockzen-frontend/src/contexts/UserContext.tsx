import axios from 'axios';
import React, { createContext, FC, useEffect, useState } from 'react';
// import api from '../../api';

interface IUserContext {
  isAuthenticated: boolean;
  authenticate: () => void;
  logout: () => void;
  recheckAuthenticationStatus: () => void;
  checkEmailUnique: (email: string) => boolean;
}

const contextDefaultValues: IUserContext = {
  isAuthenticated: false,
  authenticate: () => {},
  logout: () => {},
  recheckAuthenticationStatus: () => {},
  checkEmailUnique: (email: string) => true,
};

export const UserContext = createContext<IUserContext>(contextDefaultValues);

const UserProvider: FC = ({ children }): any => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem('isAuthenticated') === '1'
  );

  const markAsLoggedIn = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', '1');
    //document.body.style.backgroundColor = '#5bc0be';
  };

  const markAsLoggedOut = () => {
    setIsAuthenticated(false);
    localStorage.setItem('isAuthenticated', '0');
    // Remove user info from local storage
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('email');
    //document.body.style.backgroundColor = '#1c2541';
  };

  const authenticate = () => {
    // TODO call API to do the login
    markAsLoggedIn();
  };

  const logout = () => {
    // TODO call API to do the logout
    markAsLoggedOut();
  };

  const recheckAuthenticationStatus = () => {
    axios
      .get('/user/details')
      .then(() => {
        markAsLoggedIn();
      })
      .catch(() => {
        logout();
      });
  };

  const checkEmailUnique = (email: string) => {
    return false;
  };

  return (
    <UserContext.Provider
      value={{
        isAuthenticated,
        authenticate,
        logout,
        recheckAuthenticationStatus,
        checkEmailUnique,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
