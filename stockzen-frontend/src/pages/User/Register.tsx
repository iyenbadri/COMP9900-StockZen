import axios from 'axios';
import { UserContext } from 'contexts/UserContext';
import React, { FC, useContext, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import styles from './Register.module.css';

const Register: FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const { authenticate, logout } = useContext(UserContext);
  // const [firstName, setFirstName] = useState<string>('');
  // const [lastName, setLastName] = useState<string>('');
  // const [email, setEmail] = useState<string>('');
  // const [password, setPassword] = useState<string>('');
  // const [confirmPassword, setConfirmPassword] = useState<string>('');

  //const history = useHistory();

  const password = useRef({});
  password.current = watch('password', '');

  const onRegister = async (data: any) => {
    let payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
      email: data.email
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
      <form onSubmit={handleSubmit(onRegister)}>
        <Row>
          {/* -- First Name -- */}
          <Col xs={12}>
            First Name <span style={{ color: 'red' }}>*</span>
          </Col>
          <Col xs={12}>
            <input
              {...register('firstName', { required: true, maxLength: 40 })}
              placeholder='First Name'
            ></input>
          </Col>
          <Col xs={12} className={styles.errorMessage}>
            {errors.firstName?.type === 'required' && 'First name is required'}
          </Col>

          {/* -- Last Name -- */}
          <Col xs={12}>
            Last Name <span style={{ color: 'red' }}>*</span>
          </Col>
          <Col xs={12}>
            <input
              {...register('lastName', { required: true, maxLength: 40 })}
              placeholder="Last Name"
            ></input>
          </Col>
          <Col xs={12}  className={styles.errorMessage}>
            {errors.lastName?.type === 'required' && 'Last name is required'}
          </Col>

          {/* -- Email -- */}
          <Col xs={12}>
            Email Address <span style={{ color: 'red' }}>*</span>
          </Col>
          <Col xs={12}>
            <input
              type='email'
              {...register('email', { required: true })}
              placeholder="Email Address"
            ></input>
          </Col>
          <Col xs={12} className={styles.errorMessage}>
            {errors.email?.type === 'required' && 'Email is required'}
          </Col>

          {/* -- Password -- */}
          <Col xs={12}>
            Password <span style={{ color: 'red' }}>*</span>
          </Col>
          <Col xs={12}>
            <input
              type='password'
              {...register('password', {
                required: true,
                minLength: 8,
                validate: {
                  lower: (val) => /[a-z]/.test(val),
                  upper: (val) => /[A-Z]/.test(val),
                  number: (val) => /[0-9]/.test(val),
                  symbol: (val) => /[^a-zA-Z0-9]/.test(val),
                },
              })}
              placeholder="Password"
            ></input>
          </Col>
          <Col xs={12} className={styles.errorMessage}>
            {errors.password?.type === 'required' && 'Password is required'}
            {errors.password?.type === 'minLength' && 'Password is too short'}
            {errors.password?.type === 'lower' &&
              'Password must contains at least one lower case letter'}
            {errors.password?.type === 'upper' &&
              'Password must contains at least one upper case letter'}
            {errors.password?.type === 'number' &&
              'Password must contains at least one digit'}
            {errors.password?.type === 'symbol' &&
              'Password must contains at least one symbol'}
          </Col>

          {/* -- Confirm Password -- */}
          <Col xs={12}>
            Confirm Password <span style={{ color: 'red' }}>*</span>
          </Col>
          <Col xs={12}>
            <input
              type='password'
              {...register('confirmPassword', {
                required: true,
                validate: {
                  match: (val) =>  val === password.current
                },
              })}
              placeholder="Password"
            ></input>
          </Col>
          <Col xs={12} className={styles.errorMessage}>
            {errors.confirmPassword?.type === 'match' &&
              'Password is not matched'}
          </Col>

          {/* -- Submit Button -- */}
          <Col xs={12}>
            <Button type='submit'>Create Account</Button>
          </Col>
        </Row>
      </form>
      <Row>
        <Link to='/'>Home</Link>
      </Row>
      <Row>
        <Col>
          <button
            onClick={(ev) => {
              ev.preventDefault();
              doAuthen();
            }}
          >
            Test Loging
          </button>{' '}
          <button
            onClick={(ev) => {
              ev.preventDefault();
              doLogout();
            }}
          >
            Test Logout
          </button>
        </Col>
      </Row>
    </>
  );
};

export default Register;
