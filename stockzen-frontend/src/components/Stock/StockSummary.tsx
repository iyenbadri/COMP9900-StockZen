import questionIcon from 'assets/icon-outlines/outline-question-circle.svg';
import React, { FC } from 'react';
import { intFormatter, numberFomatter } from 'utils/Utilities';
import styles from './StockSummary.module.css';

const StockSummary: FC<IStockPageResponse> = (prop) => {
  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.stockTable}>
          <div className={styles.infoRow}>
            <div className={styles.infoTitle}>
              Previous Close
            </div>
            <div className={styles.infoValue}>
              {numberFomatter.format(prop.prevClose)}
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoTitle}>
              Open
            </div>
            <div className={styles.infoValue}>
              {numberFomatter.format(prop.open)}
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoTitle}>
              Bid
            </div>
            <div className={styles.infoValue}>{numberFomatter.format(prop.bid)} x {intFormatter.format(prop.bidSize)}
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoTitle}>
              Ask
            </div>
            <div className={styles.infoValue}>
              {numberFomatter.format(prop.ask)} x {intFormatter.format(prop.askSize)}
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoTitle}>
              Day's Range
            </div>
            <div className={styles.infoValue}>
              {numberFomatter.format(prop.dayLow)} - {numberFomatter.format(prop.dayHigh)}
            </div>
          </div>
        </div>
        <div className={styles.stockTable}>
          <div className={styles.infoRow}>
            <div className={styles.infoTitle}>
              52 Week Range
            </div>
            <div className={styles.infoValue}>
              {numberFomatter.format(prop.fiftyTwoWeekLow)} - {numberFomatter.format(prop.fiftyTwoWeekHigh)}
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoTitle}>
              Volume
            </div>
            <div className={styles.infoValue}>
              {intFormatter.format(prop.volume)}
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoTitle}>
              Avg. Volume
            </div>
            <div className={styles.infoValue}>
              {intFormatter.format(prop.avgVolume)}
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoTitle}>
              Market Cap
            </div>
            <div className={styles.infoValue}>
              {intFormatter.format(prop.marketCap)}
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoTitle}>
              Beta (5Y Monthly)
            </div>
            <div className={styles.indexInfo}>
              <img
                className={styles.questionMark}
                src={questionIcon}
                alt='explanation about info'
              >
              </img>
              <div className={styles.indexInfoVal}>
                Stock's volatility in relation to the overall market
              </div>
            </div>
            <div>{typeof prop.beta === 'number' ? numberFomatter.format(prop.beta) : '-'}</div>
          </div>
        </div>
      </div>
    </>
  )
};

export default StockSummary;