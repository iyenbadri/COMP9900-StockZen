import React, { FC, useContext, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Link, useHistory } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

const Login: FC = () => {
  const { isAuthenticated, authenticate } = useContext(UserContext);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const history = useHistory();

  useEffect(() => {
    if (isAuthenticated) {
      history.replace('/portfolio');
    }
  }, [history, isAuthenticated]);

  const doAuthen = () => {
    authenticate();
    history.push('/portfolio');
  };

  return (
    <>
      <Row>
        <Col>
          Email <span style={{ color: 'red' }}>*</span>
        </Col>
      </Row>

      <Row>
        <Col>
          <input
            onChange={(ev) => {
              setEmail(ev.target.value);
            }}
          ></input>
        </Col>
      </Row>

      <Row>
        <Col>
          Password <span style={{ color: 'red' }}>*</span>
        </Col>
      </Row>

      <Row>
        <Col>
          <input
            type='password'
            onChange={(ev) => {
              setPassword(ev.target.value);
            }}
          ></input>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button
            onClick={(ev) => {
              ev.preventDefault();
              doAuthen();
            }}
          >
            Login
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <Link to='/'>Home</Link>
        </Col>
      </Row>
    </>
  );
};

export default Login;
