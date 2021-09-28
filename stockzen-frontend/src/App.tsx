import 'bootstrap/dist/css/bootstrap-utilities.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from 'components/Layout/Footer';
import Header from 'components/Layout/Header';
import UserProvider from 'contexts/UserContext';
import Landing from 'pages/Landing';
import User from 'pages/User';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div>
      <Router>
        <Header></Header>
        <div className='App'>
          <Switch>
            <Route exact path={'/'} component={Landing} />
            <Route path={'/user'} component={User} />
            {/* <Route path={'/regulator'} component={Regulator} />
          <Route path={'/participant'} component={Participant} /> */}
            {/* <Route path={'/track'} component={Track} /> */}
          </Switch>
        </div>
        <Footer></Footer>
      </Router>
    </div>
  );
}

const WrappedApp = () => (
  <UserProvider>
    <App />
  </UserProvider>
);

export default WrappedApp;
