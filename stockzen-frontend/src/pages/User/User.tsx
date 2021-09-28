import React, { FC } from 'react'
import { Switch, Route, useRouteMatch } from 'react-router-dom'
import Register from './Register'

const User: FC = () => {
  const { path } = useRouteMatch()

  return (
    <>
      {/* <HomeNavbar type={'participant'} />
      <CurrentActiveUser /> */}
      <div className="container mt-5">
        <div className="columns">
          <div className="column is-3">
            {/* <SideNavBar type={'participant'} /> */}
          </div>

          <div className="column is-9">
            <Switch>
              {/* <Route exact path={path} component={Dashboard} /> */}
              <Route
                exact
                path={`${path}/register`}
                component={Register}
              />
            </Switch>
          </div>
        </div>
      </div>
    </>
  )
}

export default User
