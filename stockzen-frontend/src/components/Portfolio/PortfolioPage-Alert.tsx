import { TopPerformerContext } from 'contexts/TopPerformerContext';
import moment from 'moment';
import React, { FC, useContext } from 'react';
import { Link } from 'react-router-dom';
import styles from './PortfolioPage-Panel.module.css';
import Form from 'react-bootstrap/Form';

// interface IProps {
//   firstName: string;
//   lastName: string;
// }

const PortfolioPageAlert: FC = (props) => {
  return (
    <div style={{ margin: '10px 20px' }}>
      <div className={styles.header}>
        <div className={styles.headerText}>ALERTS</div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-around',
          margin: 'auto',
          width: '400px',
        }}
      >
        <Form.Label>High limit:</Form.Label>
        <Form.Control style={{ width: '100px' }} />
        <Form.Label>Low limit:</Form.Label>
        <Form.Control style={{ width: '100px' }} />
      </div>
    </div>
  );
};

export default PortfolioPageAlert;
