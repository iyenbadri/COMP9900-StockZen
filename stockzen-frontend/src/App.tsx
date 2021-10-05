import 'bootstrap-custom.scss';
import Footer from 'components/Layout/Footer';
import Header from 'components/Layout/Header';
import UserProvider from 'contexts/UserContext';
import TopPerformerProvider from 'contexts/TopPerformerContext';
import Landing from 'pages/Landing';
import Portfolio from 'pages/Portfolio';
import User from 'pages/User';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import styles from './App.module.css';

function App() {
  return (
    <div>
      <Router>
        <Header></Header>
        <div className={styles.appContainer}>
          <Switch>
            <Route exact path={'/'} component={Landing} />
            <Route path={'/user'} component={User} />
            <Route path={'/portfolio'} component={Portfolio} />
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
    <TopPerformerProvider>
      <App />
    </TopPerformerProvider>
  </UserProvider>
);

export default WrappedApp;
