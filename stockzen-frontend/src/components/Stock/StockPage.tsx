import refreshIcon from 'assets/icon-outlines/outline-refresh-small.svg';
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import styles from './StockPage.module.css';

// interface Stockdata {
//   stockId: number;
//   symbol: string;
//   name: string;
//   price: number;
//   change: number;
//   changePercent: number;
//   averagePrice: number;
//   profit: number;
//   profitPercent: number;
//   value: number;
// }

const StockPage = () => {
  const reloadStockInfo = () => {
    // TO DO: API wireup 
    window.location.reload();
  }

  const gainLossClass = (change: number): string => {
    if (change >= 0) {
      return styles.moneyGain;
    } else {
      return styles.moneyLoss;
    }
  }

  const [activeTab, setActiveTab] = useState(0);

  const clickHandler = (idx: number) => {
    return setActiveTab(idx);
  }

  const tabArr = [
    { name: 'Summary', content: 'Summary content' },
    { name: 'Historical Data', content: 'Historical data content' },
    { name: 'Company Data', content: 'Company data content' },
  ];

  return (
    <>
      {/* <PortfolioListSummary></PortfolioListSummary> */}
      <div className={styles.stockHeader}>
        <h5 className={styles.stockName}>Alphabet Inc.</h5>
        <div className={styles.stockCode}>(GOOG)</div>
      </div>
      <div className={styles.stockSummmary}>
        <div className={`${styles.stockPrice} outerStroke`}> 2,823.66</div>
        <div
          className={`${styles.stockChange} ${gainLossClass(-0.09)}`}
        >
          -0.09
        </div>
        <div
          className={`${styles.stockPercChange} ${gainLossClass(-0.09)}`}
        >
          (0.08%)
        </div>
        <div className={styles.update}>
          <Button
            className={styles.updateButton}
            variant={'light'}
            onClick={reloadStockInfo}
          >
            <img
              src={refreshIcon}
              alt='refresh'
              style={{ opacity: 0.5 }}
            />
            Refresh
          </Button>
        </div>
      </div>
      <div className={styles.chartPlaceholder}>
        <h3>Chart Placeholder</h3>
      </div>
      <div className={styles.tableBar}>
        {/* TO DO: rewrite this section using react-tabs */}
        <div
          className={`${activeTab === 0 ? styles.activeTab : styles.tabs}`}
          onClick={() => {
            clickHandler(0);
          }}
        >
          Summary
        </div>
        <div
          className={`${activeTab === 1 ? styles.activeTab : styles.tabs}`}
          onClick={() => clickHandler(1)}
        >
          Historical Data
        </div>
        <div
          className={`${activeTab === 2 ? styles.activeTab : styles.tabs}`}
          onClick={() => clickHandler(2)}
        >
          Company Data
        </div>
      </div>
      <div className={styles.chartPlaceholder}>
        {/* TO DO: replace with each tab content */}
        <h3>{tabArr[activeTab].content}</h3>
      </div>
    </>
  )
};

export default StockPage;