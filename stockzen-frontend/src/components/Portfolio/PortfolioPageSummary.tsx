import axios from 'axios';
import { RefreshContext } from 'contexts/RefreshContext';
import React, { FC, useContext, useEffect, useState } from 'react';
import { usdFormatter } from 'utils/Utilities';
import styles from './PortfolioPageSummary.module.css';

const numberFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

interface IPortfolioPageSummaryProp {
  portfolioId: string;
}

interface PortfolioSummary {
  name: string | null;
  stocks: number | null;
  holdings: number | null;
  change: number | null;
  changePercent: number | null;
  totalGain: number | null;
  totalGainPercent: number | null;
}

const PortfolioPageSummary: FC<IPortfolioPageSummaryProp> = (props) => {
  const { portfolioId } = props;
  const { subscribe, unsubscribe } = useContext(RefreshContext);

  const [summaryData, setSummaryData] = useState<PortfolioSummary>({
    name: '-',
    stocks: null,
    holdings: null,
    change: null,
    changePercent: null,
    totalGain: null,
    totalGainPercent: null,
  });

  useEffect(
    () => {
      let refresh = async () => {
        const response = await axios.get<SummaryResponse>(
          '/portfolio/' + portfolioId
        );

        setSummaryData({
          name: response.data.portfolioName,
          stocks: response.data.stockCount,
          holdings: response.data.value,
          change: response.data.change,
          changePercent: response.data.percChange,
          totalGain: response.data.gain,
          totalGainPercent: response.data.percGain,
        });
      };

      refresh();

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
        <h2>{summaryData.name}</h2>
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
            {summaryData.holdings == null
              ? '-'
              : usdFormatter.format(summaryData.holdings)}
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
                  {summaryData.changePercent == null
                    ? '-'
                    : numberFormatter.format(summaryData.changePercent)}
                  %
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
                  {summaryData.totalGainPercent == null
                    ? '-'
                    : numberFormatter.format(summaryData.totalGainPercent)}
                  %
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

interface SummaryResponse {
  id: number;
  portfolioName: string;
  stockCount: number;
  value: number;
  change: number;
  percChange: number;
  gain: number;
  percGain: number;
  order: number;
}

export default PortfolioPageSummary;
