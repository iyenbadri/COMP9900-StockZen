import axios from 'axios';
import { UserContext } from 'contexts/UserContext';
import React, { FC, useContext, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { useForm } from 'react-hook-form';
import styles from './RegisterForm.module.css';

interface IProps {
  onRegisterSuccess: (firstName: string, lastName: string) => void;
}

const RegisterForm: FC<IProps> = (props) => {
  // Form validation helpers
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const { recheckAuthenticationStatus } = useContext(UserContext);

  // Error message from backend
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [emailErrorMessage, setEmailErrorMessage] = useState<string>('');

  // Password for confirm
  const password = useRef({});
  password.current = watch('password', '');

  const isEmailUnique = async (email: string): Promise<boolean> => {
    try {
      // Query the existance
      let response = await axios.head('/user/' + encodeURIComponent(email));
      if (response.status === 200) {
        // If no error then it means email is alread exists in backend.
        setEmailErrorMessage('Email is already in use');
        return false;
      } else {
        // Else then it is unknown
        setEmailErrorMessage('Unexpected response from server');
        return false;
      }
    } catch (ex: any) {
      if (ex.response?.status === 404) {
        // 404 indicates that the email is not found
        setEmailErrorMessage('');
        return true;
      } else {
        setEmailErrorMessage('An error occurred. Please try again later.');
        return false;
      }
    }
  };

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
      if (response.data.message === 'User successfully registered') {
        props.onRegisterSuccess(data.firstName, data.lastName);
      }
    } catch (e: any) {
      let message = e.response?.data?.message;
      switch (message) {
        case 'user already logged in':
          recheckAuthenticationStatus();
          break;
        default:
          // Display error message.
          setErrorMessage(message);
          break;
      }
    }
  };

  return (
    <>
      <h3 className={`my-2 ${styles.formTitle} outerStroke`}>Sign up</h3>
      <Form autoComplete='off' onSubmit={handleSubmit(onRegister)}>
        <Form.Group controlId='firstName' className={styles.controlGroup}>
          {/* -- First Name -- */}
          <Form.Label className={styles.formLabel}>First Name</Form.Label>
          <span className={styles.formRequired}> *</span>

          <Form.Control
            {...register('firstName', { required: true, maxLength: 40 })}
          ></Form.Control>
          <Form.Text className={styles.errorMessage}>
            {errors.firstName?.type === 'required' && 'First name is required'}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId='lastName' className={styles.controlGroup}>
          {/* -- Last Name -- */}
          <Form.Label className={styles.formLabel}>Last Name</Form.Label>
          <span className={styles.formRequired}> *</span>

          <Form.Control
            {...register('lastName', { required: true, maxLength: 40 })}
          ></Form.Control>
          <Form.Text className={styles.errorMessage}>
            {errors.lastName?.type === 'required' && 'Last name is required'}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId='email' className={styles.controlGroup}>
          {/* -- Email -- */}
          <Form.Label className={styles.formLabel}>Email Address</Form.Label>
          <span className={styles.formRequired}> *</span>

          <Form.Control
            type='email'
            {...register('email', {
              required: true,
              validate: {
                unique: async (val) => isEmailUnique(val),
              },
            })}
          ></Form.Control>
          <Form.Text className={styles.errorMessage}>
            {errors.email?.type === 'required' && 'Email is required'}
            {errors.email?.type === 'unique' && emailErrorMessage}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId='password' className={styles.controlGroup}>
          {/* -- Password -- */}
          <Form.Label className={styles.formLabel}>Password</Form.Label>
          <span className={styles.formRequired}> *</span>

          <Form.Control
            type='password'
            {...register('password', {
              required: true,
              minLength: 8,
              validate:
                !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
                  ? {}
                  : {
                      lower: (val) => /[a-z]/.test(val),
                      upper: (val) => /[A-Z]/.test(val),
                      number: (val) => /[0-9]/.test(val),
                      symbol: (val) => /[^a-zA-Z0-9]/.test(val),
                    },
            })}
          ></Form.Control>
          <Form.Text className={styles.errorMessage}>
            {errors.password?.type === 'required' && 'Password is required'}
            {errors.password?.type === 'minLength' && 'Password is too short'}
            {errors.password?.type === 'lower' &&
              'Password must contain at least one lower case letter'}
            {errors.password?.type === 'upper' &&
              'Password must contain at least one upper case letter'}
            {errors.password?.type === 'number' &&
              'Password must contain at least one digit'}
            {errors.password?.type === 'symbol' &&
              'Password must contain at least one symbol'}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId='confirmPassword' className={styles.controlGroup}>
          {/* -- Confirm Password -- */}
          <Form.Label className={styles.formLabel}>Confirm Password</Form.Label>
          <span className={styles.formRequired}> *</span>

          <Form.Control
            type='password'
            {...register('confirmPassword', {
              required: true,
              validate: {
                match: (val) => val === password.current,
              },
            })}
          ></Form.Control>
          <Form.Text className={styles.errorMessage}>
            {errors.confirmPassword?.type === 'match' &&
              'Passwords do not match'}
          </Form.Text>
        </Form.Group>

        <Row className='my-3 text-center'>
          {/* -- Submit Button -- */}
          <Col xs={12}>
            <Button type='submit'>Create account</Button>
          </Col>
          <Col xs={12} className={`mt-1 ${styles.backErrorMessage}`}>
            {errorMessage}
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default RegisterForm;
