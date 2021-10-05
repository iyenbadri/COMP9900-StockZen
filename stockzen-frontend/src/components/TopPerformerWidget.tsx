import React, { FC, useContext } from 'react';
import moment from 'moment';
import styles from './TopPerformerWidget.module.css';
import { Link } from 'react-router-dom';
import { TopPerformanceContext } from 'contexts/TopPerformerContext';

// interface IProps {
//   firstName: string;
//   lastName: string;
// }

const TopPerformerWidget: FC = (props) => {
  const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  let topPerformarsLastUpdate = new Date();
  let topPerformars = [
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

  const { showPortfolioSummary } = useContext(TopPerformanceContext);

  return (
    <div className={styles.widget}>
      <div className={styles.date}>
        {moment(topPerformarsLastUpdate).format('dddd Do MMMM h:mma')}
      </div>
      {showPortfolioSummary && (
        <>
          <div className={styles.summaryTitle}>My holdings</div>
          <div className={styles.summaryValue}>
            {usdFormatter.format(portfolioSummary.holding)}
          </div>
          <div className={styles.summaryTitle}>Today</div>
          <div className={styles.summaryValue}>
            {portfolioSummary.todayChangePercent}%
          </div>
          <div className={styles.summaryTitle}>Overall</div>
          <div className={styles.summaryValue}>
            {portfolioSummary.overallChangePercent}%
          </div>
          <hr className={styles.separatorLine} />
        </>
      )}
      <div className={styles.title}>Today's top performars</div>
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th className={styles.symbol}>Symbol</th>
            <th className={styles.price}>Price</th>
            <th className={styles.gain}>Gain</th>
          </tr>
        </thead>
        <tbody>
          {topPerformars.map((stock, index) => {
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
