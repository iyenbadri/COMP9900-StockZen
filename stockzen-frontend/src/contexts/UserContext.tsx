import React, { createContext, FC, useEffect, useState } from 'react';
// import api from '../../api';

interface IUserContext {
  isAuthenticated: boolean;
  authenticate: () => void;
  logout: () => void;
  checkEmailUnique: (email: string) => boolean;
}

const contextDefaultValues: IUserContext = {
  isAuthenticated: false,
  authenticate: () => {},
  logout: () => {},
  checkEmailUnique: (email: string) => true,
};

export const UserContext = createContext<IUserContext>(contextDefaultValues);

const UserProvider: FC = ({ children }): any => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem('isAuthenticated') === '1'
  );

  // const init = () => {
  //   if (localStorage.getItem('isAuthenticated') === '1') {
  //     setIsAuthenticated(true);
  //   }
  // };

  // useEffect(() => {
  //   init();
  // }, []);

  const authenticate = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', '1');
    //document.body.style.backgroundColor = '#5bc0be';
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('isAuthenticated', '0');
    //document.body.style.backgroundColor = '#1c2541';
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
        checkEmailUnique,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
