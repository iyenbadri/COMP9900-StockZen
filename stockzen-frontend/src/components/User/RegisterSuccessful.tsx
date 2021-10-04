import TickIcon from 'assets/icon-outlines/outline-check-circle-green.svg';
import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import styles from './RegisterSuccessful.module.css';

interface IProps {
  firstName: string;
  lastName: string;
}

const RegisterSuccessful: FC<IProps> = (props) => {
  return (
    <>
      <div className={styles.message}>
        <p className={styles.names}>
          Welcome,
          <br />
          {props.firstName} {props.lastName} !
        </p>
        <div>
          <img className={styles.tick} src={TickIcon} alt='green tick icon' />
        </div>
        <p>
          Your account has been successfully created.
          <br />
          You may login to your new account now.
        </p>
        <div>
          <Link to='/user/login' className='my-3 btn btn-primary'>
            Log in
          </Link>
        </div>
      </div>
    </>
  );
};

export default RegisterSuccessful;
