import { UserContext } from 'contexts/UserContext';
import React, { useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';

const GuestRoute = ({
  component: Component,
  ...restOfProps
}: {
  component: any;
  path?: string | readonly string[] | undefined;
  exact?: boolean | undefined;
}) => {
  const { isAuthenticated } = useContext(UserContext);

  return (
    <Route
      {...restOfProps}
      render={(props) =>
        !isAuthenticated ? (
          <Component {...restOfProps} />
        ) : (
          <Redirect to='/portfolio' />
        )
      }
    />
  );
};

export default GuestRoute;
