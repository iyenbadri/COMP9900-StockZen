import React, { FC, useContext } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link, useHistory } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

import TestOnly from '../../components/TESTONLY';

const Landing: FC = () => {
  const { authenticate, logout } = useContext(UserContext);

  const history = useHistory();

  const doAuthen = () => {
    authenticate();
    // history.push('/');
  };

  const doLogout = () => {
    logout();
    //  history.push('/');
  };

  return (
    <>
      <Row>
        <Col>FirstName</Col>
        <Col>LastName</Col>
      </Row>
      <Row>
        <TestOnly></TestOnly>
      </Row>
      <Row>
        <Link to='/'>Home</Link>
      </Row>
      <Row>
        <Col>
          <a href='#' onClick={() => doAuthen()}>
            Test Loging
          </a>{' '}
          <a href='#' onClick={() => doLogout()}>
            Test Logout
          </a>
        </Col>
      </Row>
    </>
  );
};

export default Landing;
