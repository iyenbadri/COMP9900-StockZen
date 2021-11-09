import crossIcon from 'assets/icon-outlines/outline-cross.svg';
import React, { FC, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { numberFormatter } from 'utils/Utilities';
import styles from './PortfolioPage.module.css';

interface PortfolioPageRowProp {
  readonly stock: IStockFundamental;
  readonly index: number;
  readonly showDeleteModal: (stockId: number, stock: string) => void;
}

const PortfolioFundamentalRow: FC<PortfolioPageRowProp> = (props) => {
  const { stock } = props;

  const ref = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>();

  useEffect(() => {
    const listener = () => {
      setContentHeight(ref.current?.scrollHeight ?? 0);
    };

    window.addEventListener('resize', listener);
    listener();

    return () => {
      window.removeEventListener('resize', listener);
    };
  }, []);

  const [showPanel, setShowPanel] = useState(false);

  return (
    // <Draggable draggableId={stock.draggableId} index={props.index}>
    //   {(provided, snapshot) => (
    //     <div ref={provided.innerRef} {...provided.draggableProps}>
    <div
      className={`${styles.stockWrapper} ${showPanel ? styles.panelVisible : styles.panelHidden
        }`}
    >
      <div className={styles.tableRow}>
        <div
          className={styles.rowStockInfo}
          onClick={() => {
            setContentHeight(
              (height) => ref.current?.scrollHeight ?? height
            );
            setShowPanel(!showPanel);
          }}
        >
          <span className={styles.rowCode}>
            <Link
              to={`/stock/${stock.stockPageId}`}
              className={styles.rowStockLink}
            >
              {stock.symbol}
            </Link>
          </span>
          <div className={`${styles.rowName} d-none d-xxl-block`}>
            <div
              style={{ textOverflow: 'ellipsis', overflowX: 'hidden' }}
            >
              {stock.name}
            </div>
          </div>
          <span className={styles.rowPrice}>
            {stock.dayLow == null
              ? '-'
              : numberFormatter.format(stock.dayLow)}
          </span>
          <span className={styles.rowPrice}>
            {stock.dayHigh == null
              ? '-'
              : numberFormatter.format(stock.dayHigh)}
          </span>
          <span className={styles.rowPrice}>
            {stock.fiftyTwoWeekLow == null
              ? '-'
              : numberFormatter.format(stock.fiftyTwoWeekLow)}
          </span>
          <span className={styles.rowPrice}>
            {stock.fiftyTwoWeekHigh == null
              ? '-'
              : numberFormatter.format(stock.fiftyTwoWeekHigh)}
          </span>
          <span className={styles.rowPrice}>
            {stock.avgVolume == null
              ? '-'
              : numberFormatter.format(stock.avgVolume)}
          </span>
          <span className={styles.rowPrice}>
            {stock.marketCap == null
              ? '-'
              : numberFormatter.format(stock.marketCap)}
          </span>
          <span className={styles.rowPrice}>
            {stock.beta == null
              ? '-'
              : numberFormatter.format(stock.beta)}
          </span>
        </div>
      </div>
      <span className={styles.rowDelete}>
        <button
          className={`p-0 ${styles.deleteButton}`}
          onClick={() => {
            if (props.showDeleteModal != null) {
              props.showDeleteModal(stock.stockId, stock.name);
            }
          }}
        >
          <img src={crossIcon} alt='cross' />
        </button>
      </span>
    </div>
  );
};

export default PortfolioFundamentalRow;
