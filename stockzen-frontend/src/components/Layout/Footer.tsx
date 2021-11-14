import { UserContext } from 'contexts/UserContext';
import React, { useContext } from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  const { isAuthenticated } = useContext(UserContext);

  return (
    <footer className={isAuthenticated ? styles.userAuthenticated : ''}>
      <div>&copy; StockZen 2021. All Rights Reserved.</div>
      <div className={styles.currency}>*All prices shown are in dollar USD</div>
    </footer>
  );
};

export default Footer;
