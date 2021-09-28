import React, { FC, useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

interface IProps {
  component: React.Component;
}

const ProtectedRoute: FC<IProps> = ({
  component: Component,
  ...restOfProps
}) => {
  const { isAuthenticated } = useContext(UserContext);

  return (
    <Route
      {...restOfProps}
      render={(props) =>
        isAuthenticated ? (
          <React.Component {...props} />
        ) : (
          <Redirect to='/user/login' />
        )
      }
    />
  );
};

export default ProtectedRoute;
