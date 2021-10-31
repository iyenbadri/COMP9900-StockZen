import lossArrow from 'assets/icon-outlines/outline-arrow-down-circle-red.svg';
import gainArrow from 'assets/icon-outlines/outline-arrow-up-circle-green.svg';
import React from 'react';
import { usdFormatter } from 'utils/Utilities';
import styles from './PortfolioListSummary.module.css';

const PortfolioListSummary = () => {
  const summaryData = {
    holdings: 7248.1,
    todayChangePercent: 10.15,
    overallChangePercent: -0.79,
  };

  // does not show any img if no change
  const gainLossArrow = (change: number) => {
    if (change > 0) return <img src={gainArrow} alt='up green arrow' />;
    if (change < 0) return <img src={lossArrow} alt='down red arrow' />;
  };

  return (
    <>
      <div className={styles.summaryContainer}>
        <div className={styles.summaryWrapper}>
          <div className={styles.summaryTitle}>Today</div>
          <div className={`${styles.summaryValue} outerStroke`}>
            {gainLossArrow(summaryData.todayChangePercent)}
            <span>{summaryData.todayChangePercent}%</span>
          </div>
        </div>
        <div className={styles.summaryWrapper}>
          <div className={styles.summaryTitle}>My Holdings</div>
          <div className={`${styles.summaryValue} outerStroke`}>
            <span> {usdFormatter.format(summaryData.holdings)}</span>
          </div>
        </div>

        <div className={styles.summaryWrapper}>
          <div className={styles.summaryTitle}>Overall</div>
          <div className={`${styles.summaryValue} outerStroke`}>
            {gainLossArrow(summaryData.overallChangePercent)}
            <span>{summaryData.overallChangePercent}%</span>
          </div>
        </div>
      </div>
      <hr className={styles.separatorLine} />
    </>
  );
};

export default PortfolioListSummary;
