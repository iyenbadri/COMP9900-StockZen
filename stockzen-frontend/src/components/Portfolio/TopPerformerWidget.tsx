import lossArrow from 'assets/icon-outlines/outline-arrow-down-circle-red.svg';
import gainArrow from 'assets/icon-outlines/outline-arrow-up-circle-green.svg';
import loadSpinner from 'assets/load_spinner.svg';
import { TopPerformerContext } from 'contexts/TopPerformerContext';
import moment from 'moment';
import React, { FC, useContext } from 'react';
import { Link } from 'react-router-dom';
import { percentFormatter, usdFormatter } from 'utils/Utilities';
import styles from './TopPerformerWidget.module.css';

// Function to get the arrow for gain/loss
const gainLossArrow = (change: number) => {
  if (change > 0)
    return <img src={gainArrow} alt='up green arrow' width={30} height={30} />;
  else if (change < 0)
    return <img src={lossArrow} alt='down red arrow' width={30} height={30} />;
  else return <></>; // does not show any img if no change
};

// Number formatters
const changeFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  signDisplay: 'always',
});

// **************************************************************
// Component to display the top performer widget
// **************************************************************
const TopPerformerWidget: FC = (props) => {
  const {
    showPortfolioSummary,
    portfolioSummary,
    lastUpdateDate,
    topPerformers,
    isLoading,
  } = useContext(TopPerformerContext);

  // Render
  return (
    <div className={styles.widget}>
      {/* Date */}
      <div className={styles.date}>
        {lastUpdateDate == null
          ? '-'
          : moment(lastUpdateDate).format('dddd Do MMMM h:mma')}
      </div>

      {/* The portfolio summary */}
      {showPortfolioSummary && (
        <>
          <div className={styles.summaryTitle}>My Holdings</div>
          <div className={`${styles.summaryValue} outerStroke`}>
            {portfolioSummary == null
              ? '-'
              : usdFormatter.format(portfolioSummary?.holding ?? 0)}
          </div>
          <div className={styles.summaryTitle}>Today</div>
          <div className={`${styles.summaryValue} outerStroke`}>
            {gainLossArrow(portfolioSummary?.todayChangePercent ?? 0)}
            {portfolioSummary == null
              ? '-'
              : percentFormatter.format(
                portfolioSummary?.todayChangePercent ?? 0
              )}
          </div>
          <div className={styles.summaryTitle}>Overall</div>
          <div className={`${styles.summaryValue} outerStroke`}>
            {gainLossArrow(portfolioSummary?.overallChangePercent ?? 0)}
            {portfolioSummary == null
              ? '-'
              : percentFormatter.format(
                portfolioSummary?.overallChangePercent ?? 0
              )}
          </div>
          <hr className={styles.separatorLine} />
        </>
      )}

      {/* Top performers */}
      <div className={styles.title}>Today's top performers</div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.code}>Code</th>
            <th className={styles.price}>Price</th>
            <th className={styles.gain}>Change</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={99} className='text-center'>
                <img
                  src={loadSpinner}
                  alt='loading spinner'
                  className={styles.spinner}
                />
                <span className={styles.spinnerText}>Loading...</span>
              </td>
            </tr>
          )}
          {!isLoading &&
            topPerformers.map((stock, index) => {
              return (
                <tr key={stock.code} className={styles.codeRow}>
                  <td className={styles.code}>
                    <Link
                      to={{
                        pathname: '/stock/' + stock.stockPageId.toString(),
                        state: {
                          code: stock.code,
                          name: stock.stockName,
                        },
                      }}
                    >
                      {stock.code}
                    </Link>
                  </td>
                  <td className={styles.price}>
                    {usdFormatter.format(stock.price)}
                  </td>
                  <td className={styles.gain}>
                    {changeFormatter.format(stock.changePercent)}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      <hr className={styles.separatorLine} />
      <div className={styles.challenge}>
        <Link to='/challenge'>Enter the Portfolio Challenge</Link>
      </div>
    </div>
  );
};

export default TopPerformerWidget;
