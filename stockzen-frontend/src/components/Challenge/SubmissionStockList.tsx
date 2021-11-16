import crossIcon from 'assets/icon-outlines/outline-cross.svg';
import { SubmissionContext } from 'contexts/SubmissionContext';
import React, { FC, useContext } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styles from './SubmissionModal.module.css';

interface ISelectedStockRow {
  port: ISelectedStock;
}

const SubmissionStockList: FC<ISelectedStockRow> = (prop) => {
  const { port } = prop;

  const { deleteSelectedStock } = useContext(SubmissionContext)
  return (
    <li className={styles.selectedStockRow}>
      <div className={styles.selectedStockInfo}>
        <span className={styles.selectedStockCode}>
          <Link to={{
            pathname: '/stock/' + port.stockPageId.toString(),
            state: {
              code: port.code,
              name: port.stockName,
            }
          }}>
            {port.code}
          </Link>
        </span>
        <span className={`${styles.selectedStockName} d-none d-lg-block`}>
          <div>{port.stockName}</div>
        </span>
      </div>
      <span className={styles.stockRowDelete}>
        <Button
          variant='transparent'
          size='sm'
          className={styles.deleteButton}
          onClick={() => {
            deleteSelectedStock(port.stockPageId);
          }}>
          <img src={crossIcon} alt='delete selected stock'></img>
        </Button>
      </span>
    </li>
  );
}

export default SubmissionStockList;