import React, { FC } from 'react';
import { numberFomatter } from 'utils/Utilities';
import styles from './StockHistory.module.css';

interface history {
  date?: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

const StockHistory: FC<history> = (prop) => {
  return (
    <>
      <div className={styles.historyRow}>
        <div className={styles.history}>
          {prop.date}
        </div>
        <div className={styles.history}>
          {typeof prop.open === 'number' ? numberFomatter.format(prop.open) : ''}
        </div>
        <div className={styles.history}>
          {typeof prop.high === 'number' ? numberFomatter.format(prop.high) : ''}
        </div>
        <div className={styles.history}>
          {typeof prop.low === 'number' ? numberFomatter.format(prop.low) : ''}
        </div>
        <div className={styles.history}>
          {typeof prop.close === 'number' ? numberFomatter.format(prop.close) : ''}
        </div>
        <div className={styles.history}>
          {typeof prop.volume === 'number' ? numberFomatter.format(prop.volume) : ''}
        </div>
      </div>
    </>
  )
}

export default StockHistory;