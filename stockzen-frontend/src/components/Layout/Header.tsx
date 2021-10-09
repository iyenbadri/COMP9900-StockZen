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
      <Container className={styles.headerContainer}>
        <Row>
          <Col className='text-start'>
            <Link to='/'>
              {isAuthenticated && <img src={logo_light} alt='StockZen' />}
              {!isAuthenticated && <img src={logo_dark} alt='StockZen' />}
            </Link>
          </Col>
          <Col className='text-end'>
            {!isAuthenticated && (
              <>
                <Link to='/user/login' className='btn btn-zen-5 me-3'>
                  Log in
                </Link>
                <Link to='/user/register' className='btn btn-primary'>
                  Register
                </Link>
              </>
            )}
            {isAuthenticated && (
              <Link to='/user/logout' className='btn btn-outline-zen-2'>
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
