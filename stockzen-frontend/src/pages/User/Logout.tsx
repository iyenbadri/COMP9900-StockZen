import { UserContext } from 'contexts/UserContext';
import React, { FC, useContext, useEffect } from 'react';
import { Redirect } from 'react-router-dom';

const Logout: FC = () => {
  const { isAuthenticated, logout } = useContext(UserContext);

  useEffect(() => {
    if (isAuthenticated) {
      logout();
    }
  }, [isAuthenticated]);

  return <Redirect to='/'></Redirect>;
};

export default Logout;
