import questionIcon from 'assets/icon-outlines/outline-question-circle.svg';
import React, { FC } from 'react';
import styles from './StockSummary.module.css';

const StockSummary: FC<IStockPageResponse> = (prop) => {
  const numberFomatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })

  return (
    <>
      <div className={styles.wrapper}>
        <table className={styles.stockTable}>
          <tr>
            <th>Previous Close</th>
            <td>{numberFomatter.format(prop.prevClose)}</td>
          </tr>
          <tr>
            <th>Open</th>
            <td>{numberFomatter.format(prop.open)}</td>
          </tr>
          <tr>
            <th>Bid</th>
            <td>{numberFomatter.format(prop.bid)} x {numberFomatter.format(prop.bidSize)}</td>
          </tr>
          <tr>
            <th>Ask</th>
            <td>{numberFomatter.format(prop.ask)} x {numberFomatter.format(prop.askSize)}</td>
          </tr>
          <tr>
            <th>Day's Range</th>
            <td>{numberFomatter.format(prop.dayLow)} - {numberFomatter.format(prop.dayHigh)}</td>
          </tr>
        </table>
        <table className={styles.stockTable}>
          <tr>
            <th>52 Week Range</th>
            <td>{numberFomatter.format(prop.fiftyTwoWeekLow)} - {numberFomatter.format(prop.fiftyTwoWeekHigh)}</td>
          </tr>
          <tr>
            <th>Volume</th>
            <td>{numberFomatter.format(prop.volume)}</td>
          </tr>
          <tr>
            <th>Avg. Volume</th>
            <td>{numberFomatter.format(prop.avgVolume)}</td>
          </tr>
          <tr>
            <th>Market Cap</th>
            <td>{numberFomatter.format(prop.marketCap)}</td>
          </tr>
          <tr>
            <th>Beta (5Y Monthly)</th>
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
            <td>{typeof prop.beta === 'number' ? numberFomatter.format(prop.beta) : ''}</td>
          </tr>
        </table>
      </div>
    </>
  )
};

export default StockSummary;