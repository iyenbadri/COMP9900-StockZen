import MainLogo from 'assets/stockzen_logo_only.svg';
import React, { FC } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import styles from './Landing.module.css';

// **************************************************************
// Page to display the home page
// **************************************************************
const Landing: FC = () => {
  return (
    <>
      <Container>
        <Col>
          <Row className={`${styles.text}`}>
            <div>
              Join <span className={styles.highlight}>StockZen</span> today
              <br />
              and begin
              <br />
              <span className={styles.highlight}>investing without stress</span>
            </div>
          </Row>
          <Row>
            <img src={MainLogo} className={styles.heroLogo} alt='app logo' />
          </Row>
          <Row className={`${styles.text} ${styles.subtitle}`}>
            Here at StockZen, we worry about the little details for you
            <br />
            so that you are free to make your best decisions
          </Row>
        </Col>
      </Container>
    </>
  );
};

export default Landing;
