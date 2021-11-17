import 'bootstrap-custom.scss';
import Footer from 'components/Layout/Footer';
import Header from 'components/Layout/Header';
import RefreshProvider from 'contexts/RefreshContext';
import SearchProvider from 'contexts/SearchContext';
import SubmissionProvider from 'contexts/SubmissionContext';
import TopPerformerProvider from 'contexts/TopPerformerContext';
import UserProvider, { UserContext } from 'contexts/UserContext';
import Challenge from 'pages/Challenge';
import Landing from 'pages/Landing';
import Portfolio from 'pages/Portfolio';
import Stock from 'pages/Stock';
import User from 'pages/User';
import React, { useContext } from 'react';
import { Container } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import GuestRoute from 'utils/GuestRoute';
import styles from './App.module.css';

// **************************************************************
// Component to display the app
// **************************************************************
function App() {
  const { isAuthenticated } = useContext(UserContext);

  // Render
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
            <Route path={'/challenge'} component={Challenge} />
            <Route path={'/stock'} component={Stock} />
          </Switch>
        </Container>
        <Footer></Footer>
      </div>
    </Router>
  );
}

// Wrap the app with context providers
const WrappedApp = () => (
  <RefreshProvider>
    <UserProvider>
      <SearchProvider>
        <TopPerformerProvider>
          <SubmissionProvider>
            <App />
          </SubmissionProvider>
        </TopPerformerProvider>
      </SearchProvider>
    </UserProvider>
  </RefreshProvider>
);

export default WrappedApp;
