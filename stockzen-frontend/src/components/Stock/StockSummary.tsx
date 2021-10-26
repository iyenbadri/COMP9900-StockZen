import questionIcon from 'assets/icon-outlines/outline-question-circle.svg';
import React, { FC } from 'react';
import styles from './StockSummary.module.css';

// TO DO: API WIRE UP

const StockSummary: FC<IStockSummary> = (prop) => {
  return (
    <>
      <div className={styles.wrapper}>
        <table className={styles.stockTable}>
          <tr>
            <th>Previous Close</th>
            <td>{prop.prevClose}</td>
          </tr>
          <tr>
            <th>Open</th>
            <td>{prop.open}</td>
          </tr>
          <tr>
            <th>Bid</th>
            <td>{prop.bid} x {prop.bidSize}</td>
          </tr>
          <tr>
            <th>Ask</th>
            <td>{prop.ask} x {prop.askSize}</td>
          </tr>
          <tr>
            <th>Day's Range</th>
            <td>{prop.dayLow} - {prop.dayHigh}</td>
          </tr>
        </table>
        <table className={styles.stockTable}>
          <tr>
            <th>52 Week Range</th>
            <td>{prop.fiftyTwoWeekLow} - {prop.fiftyTwoWeekHigh}</td>
          </tr>
          <tr>
            <th>Volume</th>
            <td>{prop.volume}</td>
          </tr>
          <tr>
            <th>Avg. Volume</th>
            <td>{prop.avgVolume}</td>
          </tr>
          <tr>
            <th>Market Cap</th>
            <td>{prop.marketCap}</td>
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
            <td>{prop.beta}</td>
          </tr>
        </table>
      </div>
    </>
  )
};

export default StockSummary;