import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import Footer from './components/Layout/Footer';
import Header from './components/Layout/Header';
import UserProvider, { UserContext } from './contexts/UserContext';
import Landing from './pages/Landing';
import User from './pages/User';

function App() {
  const { isAuthenticated } = useContext(UserContext);

  return (
    <div className={`App ${isAuthenticated ? 'user--authenticated' : ''}`}>
      <Header></Header>
      <Router>
        <Switch>
          <Route exact path={'/'} component={Landing} />
          <Route path={'/user'} component={User} />
          {/* <Route path={'/regulator'} component={Regulator} />
          <Route path={'/participant'} component={Participant} /> */}
          {/* <Route path={'/track'} component={Track} /> */}
        </Switch>
      </Router>
      <Footer></Footer>
    </div>
  );
}

export default () => (
  <UserProvider>
    <App />
  </UserProvider>
);
