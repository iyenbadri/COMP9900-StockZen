import lossArrow from 'assets/icon-outlines/outline-arrow-down-circle-red.svg';
import gainArrow from 'assets/icon-outlines/outline-arrow-up-circle-green.svg';
import { RefreshContext } from 'contexts/RefreshContext';
import { TopPerformerContext } from 'contexts/TopPerformerContext';
import moment from 'moment';
import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
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
  else if (change < 0)
    return <img src={lossArrow} alt='down red arrow' width={30} height={30} />;
  else return <></>;
};

const TopPerformerWidget: FC = (props) => {
  const { subscribe, unsubscribe } = useContext(RefreshContext);
  const { showPortfolioSummary } = useContext(TopPerformerContext);

  const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  // Number formatter
  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'decimal',
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }),
    []
  );

  const [lastUpdateDate, setLastUpdateDate] = useState<Date>();
  const [topPerformers, setTopPerformers] = useState<ITopPerformer[]>([]);
  const [portfolioSummary, setPortfolioSummary] =
    useState<IPortfolioPerformance>();

  const reloadData = useCallback(() => {
    setLastUpdateDate(new Date());
    setTopPerformers([
      {
        symbol: 'GOOG',
        price: Math.random() * 1000,
        gain: Math.random(),
      },
      {
        symbol: 'TSLA',
        price: Math.random() * 1000,
        gain: Math.random(),
      },
      {
        symbol: 'APPL',
        price: Math.random() * 1000,
        gain: Math.random(),
      },
      {
        symbol: 'ARTAW',
        price: Math.random() * 1000,
        gain: Math.random(),
      },
      {
        symbol: 'DIS',
        price: Math.random() * 1000,
        gain: Math.random(),
      },
    ]);
    setPortfolioSummary({
      holding: Math.random() * 2000,
      todayChangePercent: Math.random() * 10 - 5,
      overallChangePercent: Math.random() * 10 - 5,
    });
  }, [setLastUpdateDate, setTopPerformers, setPortfolioSummary]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  useEffect(() => {
    const refresh = () => {
      reloadData();
    };

    subscribe(refresh);

    return () => {
      unsubscribe(refresh);
    };
  }, []);

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
            {numberFormatter.format(portfolioSummary?.todayChangePercent ?? 0)}%
          </div>
          <div className={styles.summaryTitle}>Overall</div>
          <div className={`${styles.summaryValue} outerStroke`}>
            {gainLossArrow(portfolioSummary?.overallChangePercent ?? 0)}
            {numberFormatter.format(
              portfolioSummary?.overallChangePercent ?? 0
            )}
            %
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
                <td className={styles.gain}>
                  +{numberFormatter.format(stock.gain)}%
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

interface ITopPerformer {
  symbol: string;
  price: number;
  gain: number;
}

interface IPortfolioPerformance {
  holding: number;
  todayChangePercent: number;
  overallChangePercent: number;
}

export default TopPerformerWidget;
