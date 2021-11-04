import logo_dark from 'assets/stockzen_dark_cropped.png';
import logo_light from 'assets/stockzen_light_cropped.png';
import SearchWidgetHeader from 'components/Search/SearchWidgetHeader';
import { UserContext } from 'contexts/UserContext';
import React, { useContext } from 'react';
import Button from 'react-bootstrap/Button';
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
          <Col md={3} lg={2} className='text-start'>
            <Link to={isAuthenticated ? '/portfolio' : '/'}>
              {isAuthenticated && <img src={logo_light} alt='StockZen' />}
              {!isAuthenticated && <img src={logo_dark} alt='StockZen' />}
            </Link>
          </Col>
          {isAuthenticated && (
            <Col md={7} lg={8} xl={7} className={styles.tabs}>
              <Link to="/portfolio">
                <Button
                  variant='trnasparent'
                  className={styles.tab}
                >
                  My Portfolios
                </Button>
              </Link>
              <Link to="/portfolio">
                <Button
                  variant='trnasparent'
                  className={styles.tab}
                >
                  Challenge
                </Button>
              </Link>
              <div className={styles.searchWidget}>
                <SearchWidgetHeader />
              </div>
            </Col>
          )}
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
    </header >
  );
};

export default Header;
