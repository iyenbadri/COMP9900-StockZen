import 'bootstrap-custom.scss';
import Footer from 'components/Layout/Footer';
import Header from 'components/Layout/Header';
import UserProvider, { UserContext } from 'contexts/UserContext';
import Landing from 'pages/Landing';
import User from 'pages/User';
import React, { useContext } from 'react';
import { Container } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import styles from './App.module.css';

function App() {
  const { isAuthenticated } = useContext(UserContext);

  return (
    <Router>
      <div className={styles.app}>
        <Header></Header>
        <Container
          fluid
          className={`${styles.appContent} ${!isAuthenticated && styles.hero}`}
        >
          <Switch>
            <Route exact path={'/'} component={Landing} />
            <Route path={'/user'} component={User} />
            <Route path={'/portfolio'} component={Portfolio} />
          </Switch>
        </Container>
        <Footer></Footer>
      </div>
    </Router>
  );
}

const WrappedApp = () => (
  <UserProvider>
    <App />
  </UserProvider>
);

export default WrappedApp;
