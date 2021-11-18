import axios from 'axios';
import React, { createContext, FC, useState } from 'react';

interface IUserContext {
  isAuthenticated: boolean;
  authenticate: () => void;
  logout: () => void;
  recheckAuthenticationStatus: () => void;
}

const contextDefaultValues: IUserContext = {
  isAuthenticated: false,
  authenticate: () => {},
  logout: () => {},
  recheckAuthenticationStatus: () => {},
};

export const UserContext = createContext<IUserContext>(contextDefaultValues);

// **************************************************************
// User Context Provider
// **************************************************************
const UserProvider: FC = ({ children }): any => {
  // Is user authenticated state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem('isAuthenticated') === '1'
  );

  // Mark user as logged in
  const markAsLoggedIn = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', '1');
  };

  // Mark user as logged out
  const markAsLoggedOut = () => {
    setIsAuthenticated(false);
    localStorage.setItem('isAuthenticated', '0');
    // Remove user info from local storage
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('email');
  };

  const authenticate = () => {
    markAsLoggedIn();
  };

  const logout = () => {
    // Call API to do the logout
    axios
      .post('/user/logout')
      .then((res) => {
        if (res.status === 200) {
          markAsLoggedOut();
        }
      })
      // If user is already unauthorised from backend server, implement logout
      .catch(function (err) {
        if (err.response.status === 401) {
          markAsLoggedOut();
        }
      });
  };

  // Check wheather user is authenticated
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

  return (
    <UserContext.Provider
      value={{
        isAuthenticated,
        authenticate,
        logout,
        recheckAuthenticationStatus,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
