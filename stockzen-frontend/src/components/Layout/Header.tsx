import React, { useContext } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { Link } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import './Header.module.css';

const Header = () => {
  const { isAuthenticated } = useContext(UserContext);

  return (
    <header>
      <Container>
        <Row>
          <Col sm={6} className='text-start'>
            Logo StockZen
          </Col>
          <Col sm={6} className='text-end'>
            {!isAuthenticated && (
              <>
                <Link to='/user/login' className='btn btn-info me-3'>
                  Login
                </Link>
                <Link to='/user/register' className='btn btn-info'>
                  Register
                </Link>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </header>
  );
};

export default Header;
