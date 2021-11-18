import crossIcon from 'assets/icon-outlines/outline-cross.svg';
import { SubmissionContext } from 'contexts/SubmissionContext';
import React, { FC, useContext } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styles from './SubmissionModal.module.css';

interface ISelectedStockRow {
  port: ISelectedStock;
}

// **************************************************************
// Component to display selected stock as a row
// **************************************************************
const SubmissionStockList: FC<ISelectedStockRow> = (prop) => {
  // Get information of selected stock passed from search in SubmissionModal
  const { port: stock } = prop;

  // Get function from context to delete specified stock in the list 
  const { deleteSelectedStock } = useContext(SubmissionContext);

  // Render
  return (
    <li className={styles.selectedStockRow}>
      <div className={styles.selectedStockInfo}>
        {/* Stock code with link to corresponding stock page */}
        <span className={styles.selectedStockCode}>
          <Link to={{
            pathname: '/stock/' + stock.stockPageId.toString(),
            state: {
              code: stock.code,
              name: stock.stockName,
            }
          }}>
            {stock.code}
          </Link>
        </span>
        {/* Stock name */}
        <span className={`${styles.selectedStockName} d-none d-lg-block`}>
          <div>{stock.stockName}</div>
        </span>
      </div>
      {/* Delete button */}
      <span className={styles.stockRowDelete}>
        <Button
          variant='transparent'
          size='sm'
          className={styles.deleteButton}
          onClick={() => {
            deleteSelectedStock(stock.stockPageId);
          }}>
          <img src={crossIcon} alt='delete selected stock'></img>
        </Button>
      </span>
    </li>
  );
}

export default SubmissionStockList;