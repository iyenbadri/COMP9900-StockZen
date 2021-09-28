import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import TestOnly from '../../components/TESTONLY';

const Landing: FC = () => {
  return (
    <>
      <header className='App-header'>
        <TestOnly></TestOnly>
        <Link to='/user/login'>Login</Link>
        <Link to='/user/register'>Register</Link>
      </header>
    </>
  );
};

export default Landing;
