import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import Landing from './pages/Landing';
import User from './pages/User';
import UserProvider from './contexts/UserContext';

function App() {
  return (
    <UserProvider>
      <div className='App'>
        <Router>
          <Switch>
            <Route exact path={'/'} component={Landing} />
            <Route path={'/user'} component={User} />
            {/* <Route path={'/regulator'} component={Regulator} />
          <Route path={'/participant'} component={Participant} /> */}
            {/* <Route path={'/track'} component={Track} /> */}
          </Switch>
        </Router>
      </div>
    </UserProvider>
  );
}

export default App;
