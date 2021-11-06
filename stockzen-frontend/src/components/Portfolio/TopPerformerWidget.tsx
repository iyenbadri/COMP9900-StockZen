import lossArrow from 'assets/icon-outlines/outline-arrow-down-circle-red.svg';
import gainArrow from 'assets/icon-outlines/outline-arrow-up-circle-green.svg';
import { RefreshContext } from 'contexts/RefreshContext';
import { TopPerformerContext } from 'contexts/TopPerformerContext';
import moment from 'moment';
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './TopPerformerWidget.module.css';
import { usdFormatter } from 'utils/Utilities';

// interface IProps {
//   firstName: string;
//   lastName: string;
// }

// does not show any img if no change
const gainLossArrow = (change: number) => {
  if (change > 0)
    return <img src={gainArrow} alt='up green arrow' width={30} height={30} />;
  else if (change < 0)
    return <img src={lossArrow} alt='down red arrow' width={30} height={30} />;
  else return <></>;
};

// Number formatter
const changeFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  signDisplay: 'always',
});

const TopPerformerWidget: FC = (props) => {
  const { subscribe, unsubscribe } = useContext(RefreshContext);
  const { showPortfolioSummary, topPerformers, isLoading } =
    useContext(TopPerformerContext);

  const [lastUpdateDate, setLastUpdateDate] = useState<Date>();

  const [portfolioSummary, setPortfolioSummary] =
    useState<IPortfolioPerformance>();

  const reloadData = useCallback(async () => {
    setLastUpdateDate(new Date());

    setPortfolioSummary({
      holding: Math.random() * 2000,
      todayChangePercent: Math.random() * 10 - 5,
      overallChangePercent: Math.random() * 10 - 5,
    });
  }, [setLastUpdateDate, setPortfolioSummary]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  useEffect(
    () => {
      const refresh = () => {
        reloadData();
      };

      subscribe(refresh);

      return () => {
        unsubscribe(refresh);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className={styles.widget}>
      <div className={styles.date}>
        {moment(lastUpdateDate).format('dddd Do MMMM h:mma')}
      </div>
      {showPortfolioSummary && (
        <>
          <div className={styles.summaryTitle}>My Holdings</div>
          <div className={`${styles.summaryValue} outerStroke`}>
            {usdFormatter.format(portfolioSummary?.holding ?? 0)}
          </div>
          <div className={styles.summaryTitle}>Today</div>
          <div className={`${styles.summaryValue} outerStroke`}>
            {gainLossArrow(portfolioSummary?.todayChangePercent ?? 0)}
            {usdFormatter.format(portfolioSummary?.todayChangePercent ?? 0)}%
          </div>
          <div className={styles.summaryTitle}>Overall</div>
          <div className={`${styles.summaryValue} outerStroke`}>
            {gainLossArrow(portfolioSummary?.overallChangePercent ?? 0)}
            {usdFormatter.format(portfolioSummary?.overallChangePercent ?? 0)}%
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
            <th className={styles.gain}>Change</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={99} className='text-center'>
                Loading
              </td>
            </tr>
          )}
          {!isLoading &&
            topPerformers.map((stock, index) => {
              return (
                <tr key={stock.symbol} className={styles.symbolRow}>
                  <td className={styles.symbol}>
                    <Link to={'/stock/' + stock.stockPageId.toString()}>
                      {stock.symbol}
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

interface IPortfolioPerformance {
  holding: number;
  todayChangePercent: number;
  overallChangePercent: number;
}

export default TopPerformerWidget;
