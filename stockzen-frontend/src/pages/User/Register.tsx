import axios from 'axios';
import { UserContext } from 'contexts/UserContext';
import React, { FC, useContext, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Link, useHistory } from 'react-router-dom';

const Register: FC = () => {
  const { authenticate, logout } = useContext(UserContext);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const history = useHistory();

  const doRegister = async () => {
    let payload = {
      firstName,
      lastName,
      email,
      password,
    };

    try {
      let response = await axios.post('/user/register', payload);
    } catch (e) {}
  };

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
        <Col>
          First Name <span style={{ color: 'red' }}>*</span>
        </Col>
      </Row>
      <Row>
        <Col>
          <input
            onChange={(ev) => {
              setFirstName(ev.target.value);
            }}
          ></input>
        </Col>
      </Row>
      <Row>
        <Col>
          Last Name <span style={{ color: 'red' }}>*</span>
        </Col>
      </Row>

      <Row>
        <Col>
          <input
            onChange={(ev) => {
              setLastName(ev.target.value);
            }}
          ></input>
        </Col>
      </Row>

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
          Confirm Password <span style={{ color: 'red' }}>*</span>
        </Col>
      </Row>

      <Row>
        <Col>
          <input
            type='password'
            onChange={(ev) => {
              setConfirmPassword(ev.target.value);
            }}
          ></input>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button onClick={() => doRegister()}>Create Account</Button>
        </Col>
      </Row>

      <Row>
        <Link to='/'>Home</Link>
      </Row>
      <Row>
        <Col>
          <a
            href='#'
            onClick={(ev) => {
              ev.preventDefault();
              doAuthen();
            }}
          >
            Test Loging
          </a>{' '}
          <a
            href='#'
            onClick={(ev) => {
              ev.preventDefault();
              doLogout();
            }}
          >
            Test Logout
          </a>
        </Col>
      </Row>
    </>
  );
};

export default Register;
