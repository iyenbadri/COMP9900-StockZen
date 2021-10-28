import questionIcon from 'assets/icon-outlines/outline-question-circle.svg';
import React, { FC } from 'react';
import styles from './StockSummary.module.css';

const StockSummary: FC<IStockPageResponse> = (props) => {
  return (
    <>
      <div className={styles.wrapper}>
        <table className={styles.stockTable}>
          <tr>
            <th>Previous Close</th>
            <td>{props.prevClose}</td>
          </tr>
          <tr>
            <th>Open</th>
            <td>{props.open}</td>
          </tr>
          <tr>
            <th>Bid</th>
            <td>{props.bid} x {props.bidSize}</td>
          </tr>
          <tr>
            <th>Ask</th>
            <td>{props.ask} x {props.askSize}</td>
          </tr>
          <tr>
            <th>Day's Range</th>
            <td>{props.dayLow} - {props.dayHigh}</td>
          </tr>
        </table>
        <table className={styles.stockTable}>
          <tr>
            <th>52 Week Range</th>
            <td>{props.fiftyTwoWeekLow} - {props.fiftyTwoWeekHigh}</td>
          </tr>
          <tr>
            <th>Volume</th>
            <td>{props.volume}</td>
          </tr>
          <tr>
            <th>Avg. Volume</th>
            <td>{props.avgVolume}</td>
          </tr>
          <tr>
            <th>Market Cap</th>
            <td>{props.marketCap}</td>
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
            <td>{props.beta}</td>
          </tr>
        </table>
      </div>
    </>
  )
};

export default StockSummary;