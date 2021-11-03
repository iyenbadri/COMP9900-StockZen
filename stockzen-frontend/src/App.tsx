import 'bootstrap-custom.scss';
import Footer from 'components/Layout/Footer';
import Header from 'components/Layout/Header';
import TopPerformerProvider from 'contexts/TopPerformerContext';
import UserProvider, { UserContext } from 'contexts/UserContext';
import RefreshProvider from 'contexts/RefreshContext';
import Landing from 'pages/Landing';
import Portfolio from 'pages/Portfolio';
import Stock from 'pages/Stock';
import User from 'pages/User';
import React, { useContext } from 'react';
import { Container } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import GuestRoute from 'utils/GuestRoute';
import styles from './App.module.css';

function App() {
  const { isAuthenticated } = useContext(UserContext);

  return (
    <Router>
      <div className={styles.app}>
        <Header></Header>
        <Container
          fluid
          className={`${styles.appContent} ${
            !isAuthenticated ? styles.hero : ''
          }`}
        >
          <Switch>
            <GuestRoute exact path={'/'} component={Landing} />
            <Route path={'/user'} component={User} />
            <Route path={'/portfolio'} component={Portfolio} />
            <Route path={'/stock/:stockPageId'} component={Stock} />
          </Switch>
        </Container>
        <Footer></Footer>
      </div>
    </Router>
  );
}

const WrappedApp = () => (
  <RefreshProvider>
    <UserProvider>
      <TopPerformerProvider>
        <App />
      </TopPerformerProvider>
    </UserProvider>
  </RefreshProvider>
);

export default WrappedApp;
