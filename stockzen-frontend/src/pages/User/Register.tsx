import axios from 'axios';
import React, { FC, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useForm } from 'react-hook-form';
import styles from './Register.module.css';

const Register: FC = () => {
  // Form validation helpers
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Error message from backend
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Password for confirm
  const password = useRef({});
  password.current = watch('password', '');

  // Do register with backend when submit
  const onRegister = async (data: any) => {
    // Clear error message
    setErrorMessage('');

    let payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
      email: data.email,
    };

    try {
      // POST to backend
      let response = await axios.post('/user/register', payload);

      // Read the response
      if (response.data.message === 'user successfully registered') {
        // TODO: Implement register successfully page.
        alert(response.data.message);
      }
    } catch (e: any) {
      // Display error message.
      setErrorMessage(e.response?.data?.message);
    }
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
              placeholder='Last Name'
            ></input>
          </Col>
          <Col xs={12} className={styles.errorMessage}>
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
              placeholder='Email Address'
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
              placeholder='Password'
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
                  match: (val) => val === password.current,
                },
              })}
              placeholder='Password'
            ></input>
          </Col>
          <Col xs={12} className={styles.errorMessage}>
            {errors.confirmPassword?.type === 'match' &&
              'Password is not matched'}
          </Col>

          <Col xs={12} className={styles.errorMessage}>
            {errorMessage}
          </Col>
          {/* -- Submit Button -- */}
          <Col xs={12}>
            <Button type='submit'>Create Account</Button>
          </Col>
        </Row>
      </form>
    </>
  );
};

export default Register;
