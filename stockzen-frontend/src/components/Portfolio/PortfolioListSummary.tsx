import lossArrow from 'assets/icon-outlines/outline-arrow-down-circle-red.svg';
import gainArrow from 'assets/icon-outlines/outline-arrow-up-circle-green.svg';
import { TopPerformerContext } from 'contexts/TopPerformerContext';
import React, { useContext } from 'react';
import { usdFormatter } from 'utils/Utilities';
import styles from './PortfolioListSummary.module.css';

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

// does not show any img if no change
const gainLossArrow = (change: number | undefined) => {
  if (change == null) return <></>;
  if (change > 0) return <img src={gainArrow} alt='up green arrow' />;
  if (change < 0) return <img src={lossArrow} alt='down red arrow' />;
  else return <></>;
};

const PortfolioListSummary = () => {
  const { portfolioSummary } = useContext(TopPerformerContext);

  return (
    <>
      <div className={styles.summaryContainer}>
        <div className={styles.summaryWrapper}>
          <div className={styles.summaryTitle}>Today</div>
          <div className={`${styles.summaryValue} outerStroke`}>
            {gainLossArrow(portfolioSummary?.todayChangePercent)}
            <span>
              {portfolioSummary == null
                ? '-'
                : percentFormatter.format(portfolioSummary?.todayChangePercent)}
            </span>
          </div>
        </div>
        <div className={styles.summaryWrapper}>
          <div className={styles.summaryTitle}>My Holdings</div>
          <div className={`${styles.summaryValue} outerStroke`}>
            <span>
              {portfolioSummary == null
                ? '-'
                : usdFormatter.format(portfolioSummary?.holding)}
            </span>
          </div>
        </div>

        <div className={styles.summaryWrapper}>
          <div className={styles.summaryTitle}>Overall</div>
          <div className={`${styles.summaryValue} outerStroke`}>
            {gainLossArrow(portfolioSummary?.overallChangePercent)}
            <span>
              {portfolioSummary == null
                ? '-'
                : percentFormatter.format(
                    portfolioSummary?.overallChangePercent
                  )}
            </span>
          </div>
        </div>
      </div>
      <hr className={styles.separatorLine} />
    </>
  );
};

export default PortfolioListSummary;
