import React, { FC } from 'react';
import { Link, useHistory } from 'react-router-dom';

import TestOnly from '../../components/TESTONLY';

const Landing: FC = () => {
  return (
    <>
      <header className='App-header'>
        <TestOnly></TestOnly>
        <Link to='/user/register' >Register</Link>
      </header>
    </>
  );
};

export default Landing;
