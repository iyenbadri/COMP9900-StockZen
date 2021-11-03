import { RefreshContext } from 'contexts/RefreshContext';
import React, { useContext, useEffect, useState } from 'react';
import { usdFormatter } from 'utils/Utilities';
import styles from './PortfolioPageSummary.module.css';

const numberFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const PortfolioPageSummary = () => {
  const { subscribe, unsubscribe } = useContext(RefreshContext);

  const [summaryData, setSummaryData] = useState({
    stocks: 3,
    holdings: 7248.1,
    change: 403.1,
    changePercent: 0.59,
    totalGain: 1403.1,
    totalGainPercent: 11.7,
  });

  useEffect(
    () => {
      let refresh = () => {
        setSummaryData({
          stocks: Math.round(Math.random() * 10),
          holdings: Math.random() * 10000,
          change: Math.random() * 1000,
          changePercent: Math.random(),
          totalGain: Math.random() * 1000,
          totalGainPercent: Math.random() * 10,
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

  const gainLossClass = (val: number | null): string => {
    if (val == null) {
      return '';
    } else if (val < 0) {
      return styles.moneyLoss;
    } else if (val > 0) {
      return styles.moneyGain;
    } else {
      return '';
    }
  };

  return (
    <>
      <div className={styles.portfolioName}>
        <h2>My portfolio 1</h2>
      </div>

      <div>
        <div className={`${styles.summaryRow} ${styles.summaryHeaderRow}`}>
          <div className={styles.rowStocks}>Stocks</div>
          <div className={styles.rowMarketValue}>Merket value</div>
          <div className={styles.rowChange}>Change</div>
          <div className={styles.rowTotalGain}>Total gain</div>
        </div>

        <div className={styles.summaryRow}>
          <div className={styles.rowStocks}>{summaryData.stocks}</div>
          <div className={styles.rowMarketValue}>
            {usdFormatter.format(summaryData.holdings)}
          </div>
          <div
            className={`${styles.rowChange} ${gainLossClass(
              summaryData.change
            )}`}
          >
            {summaryData.change == null ? (
              '-'
            ) : (
              <>
                <div className={styles.percent}>
                  {numberFormatter.format(summaryData.changePercent)}%
                </div>
                <div>{numberFormatter.format(summaryData.change)}</div>
              </>
            )}
          </div>
          <div
            className={`${styles.rowTotalGain} ${gainLossClass(
              summaryData.totalGain
            )}`}
          >
            {summaryData.totalGain == null ? (
              '-'
            ) : (
              <>
                <div className={styles.percent}>
                  {numberFormatter.format(summaryData.totalGainPercent)}%
                </div>
                <div>{numberFormatter.format(summaryData.totalGain)}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PortfolioPageSummary;
