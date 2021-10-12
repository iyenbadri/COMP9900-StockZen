import React from 'react';
import { usdFormatter } from 'utils/Utilities';
import styles from './PortfolioListSummary.module.css';

const PortfolioListSummary = () => {
  let portfolioSummary = {
    holding: 50210.4,
    todayChangePercent: 0.82,
    overallChangePercent: -10.76,
  };
  return (
    <>
      <div className={styles.summaryContainer}>
        <div className={styles.summaryWrapper}>
          <div className={styles.summaryTitle}>Today</div>
          <div className={`${styles.summaryValue} outerStroke`}>
            {portfolioSummary.todayChangePercent}%
          </div>
        </div>
        <div className={styles.summaryWrapper}>
          <div className={styles.summaryTitle}>My Holdings</div>
          <div className={`${styles.summaryValue} outerStroke`}>
            {usdFormatter.format(portfolioSummary.holding)}
          </div>
        </div>

        <div className={styles.summaryWrapper}>
          <div className={styles.summaryTitle}>Overall</div>
          <div className={`${styles.summaryValue} outerStroke`}>
            {portfolioSummary.overallChangePercent}%
          </div>
          <hr className={styles.separatorLine} />
        </div>
      </div>
    </>
  );
};

export default PortfolioListSummary;
