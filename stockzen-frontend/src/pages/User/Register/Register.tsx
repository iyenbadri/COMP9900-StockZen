import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import TestOnly from '../../../components/TESTONLY';

const Landing: FC = () => {
  return (
    <>
      <header className='App-header'>
        <TestOnly></TestOnly>
        <Link to='/'>Home</Link>
        This is a second page.
      </header>
    </>
  );
};

export default Landing;
