import axios from 'axios';
import React, { FC, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import styles from './LoginForm.module.css';

interface IProps {
  onLoginSuccess: (email: string, password: string) => void;
}

const LoginForm: FC<IProps> = (props) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const [errorMessage, setErrorMessage] = useState<string>('');

  const onLogin = async (data: any) => {
    setErrorMessage('');

    let payload = {
      email: data.email,
      password: data.password
    };

    try {
      let response = await axios.post('/user/login', payload);
      if (response.status === 200) {
        props.onLoginSuccess(data.email, data.password);
        // If user is authenticated, save user info in local storage
        localStorage.setItem('firstName', response.data.firstName);
        localStorage.setItem('lastName', response.data.lastName);
        localStorage.setItem('email', data.email);
      }
    } catch (e: any) {
      if (e.response.status === 401) {
        alert('Incorrect password.');
      } else if (e.response.status === 403) {
        alert('This email is not registered.');
      } else {
        alert('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <>
      <h3 className={styles.formTitle}>Log in</h3><br />
      <Form onSubmit={handleSubmit(onLogin)}>
        <Form.Group controlId='email' className={styles.controlGroup}>
          <Form.Label className={styles.formLabel}>Email Address</Form.Label>
          <Form.Control
            {...register('email', {
              required: true
            })}
            placeholder=''
          ></Form.Control>
          <Form.Text className={styles.errorMessage}>
            {errors.email?.type === 'required' && 'Email address is required'}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId='password' className={styles.controlGroup}>
          <Form.Label className={styles.formLabel}>Password</Form.Label>
          <Form.Control
            type='password'
            {...register('password', {
              required: true
            })}
            placeholder=''
          ></Form.Control>
          <Form.Text className={styles.errorMessage}>
            {errors.password?.type === 'required' && 'Password is required'}
          </Form.Text>

        </Form.Group>
        <Row className='text-center'>
          <Col xs={12}>
            <Button
              type='submit'
            >
              Submit
            </Button>
          </Col>
        </Row>
        <Row className='text-center'>
          <Col>
            <Link to='/' className={styles.formLink}>Forgot Password?</Link>
          </Col>
        </Row>
        <Row className='text-center'>
          <Col>
            Don't have an account?
            <Link to='/user/register' className={styles.formLink}>Sign up</Link>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default LoginForm;