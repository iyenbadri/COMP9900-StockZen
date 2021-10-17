import lossArrow from 'assets/icon-outlines/outline-arrow-down-circle-red.svg';
import gainArrow from 'assets/icon-outlines/outline-arrow-up-circle-green.svg';
import { TopPerformerContext } from 'contexts/TopPerformerContext';
import moment from 'moment';
import React, { FC, useContext } from 'react';
import { Link } from 'react-router-dom';
import styles from './TopPerformerWidget.module.css';

// interface IProps {
//   firstName: string;
//   lastName: string;
// }

// does not show any img if no change
const gainLossArrow = (change: number) => {
  if (change > 0)
    return <img src={gainArrow} alt='up green arrow' width={30} height={30} />;
  if (change < 0)
    return <img src={lossArrow} alt='down red arrow' width={30} height={30} />;
};

const TopPerformerWidget: FC = (props) => {
  const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  let topPerformersLastUpdate = new Date();
  let topPerformers = [
    {
      symbol: 'GOOG',
      price: 2853.35,
      gain: 17.63,
    },
    {
      symbol: 'TSLA',
      price: 753.64,
      gain: 0.23,
    },
    {
      symbol: 'APPL',
      price: 145.83,
      gain: 0.98,
    },
    {
      symbol: 'ARTAW',
      price: 0.53,
      gain: 1.28,
    },
    {
      symbol: 'DIS',
      price: 176,
      gain: 0.06,
    },
  ];

  let portfolioSummary = {
    holding: 50210.4,
    todayChangePercent: 0.82,
    overallChangePercent: -10.76,
  };

  const { showPortfolioSummary } = useContext(TopPerformerContext);

  return (
    <div className={styles.widget}>
      <div className={styles.date}>
        {moment(topPerformersLastUpdate).format('dddd Do MMMM h:mma')}
      </div>
      {showPortfolioSummary && (
        <>
          <div className={styles.summaryTitle}>My Holdings</div>
          <div className={`${styles.summaryValue} outerStroke`}>
            {usdFormatter.format(portfolioSummary.holding)}
          </div>
          <div className={styles.summaryTitle}>Today</div>
          <div className={`${styles.summaryValue} outerStroke`}>
            {gainLossArrow(portfolioSummary.todayChangePercent)}
            {portfolioSummary.todayChangePercent}%
          </div>
          <div className={styles.summaryTitle}>Overall</div>
          <div className={`${styles.summaryValue} outerStroke`}>
            {gainLossArrow(portfolioSummary.overallChangePercent)}
            {portfolioSummary.overallChangePercent}%
          </div>
          <hr className={styles.separatorLine} />
        </>
      )}
      <div className={styles.title}>Today's top performers</div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.symbol}>Symbol</th>
            <th className={styles.price}>Price</th>
            <th className={styles.gain}>Gain</th>
          </tr>
        </thead>
        <tbody>
          {topPerformers.map((stock, index) => {
            return (
              <tr key={stock.symbol} className={styles.symbolRow}>
                <td className={styles.symbol}>{stock.symbol}</td>
                <td className={styles.price}>
                  {usdFormatter.format(stock.price)}
                </td>
                <td className={styles.gain}>+{stock.gain}%</td>
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
