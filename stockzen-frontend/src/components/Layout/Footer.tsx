import { UserContext } from 'contexts/UserContext';
import React, { useContext } from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  const { isAuthenticated } = useContext(UserContext);

  return (
    <footer className={isAuthenticated ? styles.userAuthenticated : ''}>
      &copy; StockZen 2021. All rights reserved
    </footer>
  );
};

export default Footer;
