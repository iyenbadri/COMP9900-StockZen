import React, { FC } from 'react';
import { Link } from 'react-router-dom';

const Landing: FC = () => {
  return (
    <>
      <header>
        <Link to='/user/login'>Login</Link>
        <Link to='/user/register'>Register</Link>
      </header>
    </>
  );
};

export default Landing;
