import { UserContext } from 'contexts/UserContext';
import React, { FC, useContext } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import Login from './Login';
import Logout from './Logout';
import Register from './Register';

const User: FC = () => {
  const { path } = useRouteMatch();
  const { isAuthenticated } = useContext(UserContext);

  return (
    <>
      {/* <HomeNavbar type={'participant'} />
      <CurrentActiveUser /> */}
      <div className='container mt-5'>
        <div className='columns'>
          <div className='column is-3'>
            {/* <SideNavBar type={'participant'} /> */}
            {isAuthenticated ? 'Logged in' : 'Guest'}
          </div>

          <div className='column is-9'>
            <Switch>
              <Route path={`${path}/login`} component={Login} />
              {/* <Route exact path={path} component={Dashboard} /> */}
              <Route path={`${path}/register`} component={Register} />
              <Route path={`${path}/logout`} component={Logout} />
            </Switch>
          </div>
        </div>
      </div>
    </>
  );
};

export default User;
