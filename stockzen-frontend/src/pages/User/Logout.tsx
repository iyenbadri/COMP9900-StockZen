import smileIcon from 'assets/icon-outlines/outline-emotxd-smile.svg';
import { UserContext } from 'contexts/UserContext';
import React, { FC, useContext, useEffect } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';


const Logout: FC = () => {
  const { isAuthenticated, logout } = useContext(UserContext);

  useEffect(() => {
    if (isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, logout]);

  const history = useHistory();

  return (
    <>
      <h3 className='mt-4 text-center'>
        Logout Successful!
      </h3>
      <Row className='mb-4 text-center'>
        <Col>
          See you next time <img src={smileIcon} alt='smile face' />
        </Col>
      </Row>
      <Row className='text-center'>
        <Col xs={12}>
          <Button
            onClick={() => {
              history.push('/')
            }}>OK
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default Logout;
