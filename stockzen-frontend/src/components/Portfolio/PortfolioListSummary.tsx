import lossArrow from 'assets/icon-outlines/outline-arrow-down-circle-red.svg';
import gainArrow from 'assets/icon-outlines/outline-arrow-up-circle-green.svg';
import { RefreshContext } from 'contexts/RefreshContext';
import React, { useContext, useEffect, useState } from 'react';
import { usdFormatter } from 'utils/Utilities';
import styles from './PortfolioListSummary.module.css';

const numberFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const PortfolioListSummary = () => {
  const { subscribe, unsubscribe } = useContext(RefreshContext);

  const [summaryData, setSummaryData] = useState({
    holdings: 7248.1,
    todayChangePercent: 10.15,
    overallChangePercent: -0.79,
  });

  useEffect(
    () => {
      let refresh = () => {
        setSummaryData({
          holdings: Math.random() * 10000,
          todayChangePercent: Math.random() * 10 - 5,
          overallChangePercent: Math.random() * 10 - 5,
        });
      };

      subscribe(refresh);

      return () => {
        unsubscribe(refresh);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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
            <span>
              {numberFormatter.format(summaryData.todayChangePercent)}%
            </span>
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
            <span>
              {numberFormatter.format(summaryData.overallChangePercent)}%
            </span>
          </div>
        </div>
      </div>
      <hr className={styles.separatorLine} />
    </>
  );
};

export default PortfolioListSummary;
