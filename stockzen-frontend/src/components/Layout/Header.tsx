import logo_dark from 'assets/stockzen_dark_cropped.png';
import logo_light from 'assets/stockzen_light_cropped.png';
import { UserContext } from 'contexts/UserContext';
import React, { useContext } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
  const { isAuthenticated } = useContext(UserContext);

  return (
    <header className={isAuthenticated ? styles.userAuthenticated : ''}>
      <Container>
        <Row>
          <Col sm={6} className='text-start'>
            <Link to='/'>
              {!isAuthenticated && <img src={logo_light} alt='StockZen' />}
              {isAuthenticated && <img src={logo_dark} alt='StockZen' />}
            </Link>
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
            {isAuthenticated && (
              <Link to='/user/logout' className='btn btn-info'>
                Logout
              </Link>
            )}
          </Col>
        </Row>
      </Container>
    </header>
  );
};

export default Header;
