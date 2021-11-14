import React, { FC } from 'react';
import { intFormatter, numberFormatter } from 'utils/Utilities';
import styles from './StockHistory.module.css';

interface History {
  date?: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

const StockHistory: FC<History> = (prop) => {
  return (
    <>
      <div className={styles.historyRow}>
        <div className={styles.history}>
          {prop.date}
        </div>
        <div className={styles.history}>
          {typeof prop.open === 'number' ? numberFormatter.format(prop.open) : ''}
        </div>
        <div className={styles.history}>
          {typeof prop.high === 'number' ? numberFormatter.format(prop.high) : ''}
        </div>
        <div className={styles.history}>
          {typeof prop.low === 'number' ? numberFormatter.format(prop.low) : ''}
        </div>
        <div className={styles.history}>
          {typeof prop.close === 'number' ? numberFormatter.format(prop.close) : ''}
        </div>
        <div className={styles.history}>
          {typeof prop.volume === 'number' ? intFormatter.format(prop.volume) : ''}
        </div>
      </div>
    </>
  )
}

export default StockHistory;