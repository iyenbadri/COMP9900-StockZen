import crossIcon from 'assets/icon-outlines/outline-cross.svg';
import handleIcon from 'assets/icon-outlines/outline-drag-handle.svg';
import React, { FC, useEffect, useRef, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import PortfolioPageAlert from './PortfolioPage-Alert';
import PortfolioPageLots from './PortfolioPage-Lots';
import styles from './PortfolioPage.module.css';

interface PortfolioPageRowProp {
  readonly stock: IStock;
  readonly index: number;
  readonly showDeleteModal: (stockId: number, stock: string) => void;
}

const PortfolioPageRow: FC<PortfolioPageRowProp> = (props) => {
  const { stock } = props;
  const numberFormatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

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
    <Draggable draggableId={stock.draggableId} index={props.index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          <div
            className={`${styles.stockWrapper} ${
              showPanel ? styles.panelVisible : styles.panelHidden
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
                <span className={styles.rowHandle}>
                  <img
                    src={handleIcon}
                    alt='handle'
                    {...provided.dragHandleProps}
                  />
                </span>
                <span className={styles.rowCode}>
                  <Link
                    to={`/stock/${stock.symbol}`}
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
                  {numberFormatter.format(stock.price)}
                </span>
                <span
                  className={`${styles.rowChange} ${gainLossClass(
                    stock.change
                  )}`}
                >
                  {stock.change == null ? (
                    '-'
                  ) : (
                    <>
                      <div className={styles.percent}>
                        {numberFormatter.format(stock.changePercent)}%
                      </div>
                      <div>{numberFormatter.format(stock.change)}</div>
                    </>
                  )}
                </span>
                <span
                  className={`${styles.rowAveragePrice} d-block d-lg-none d-xl-block`}
                >
                  {numberFormatter.format(stock.averagePrice)}
                </span>
                <span
                  className={`${styles.rowProfit} ${gainLossClass(
                    stock.profit
                  )}`}
                >
                  {stock.profit == null ? (
                    '-'
                  ) : (
                    <>
                      <div className={styles.percent}>
                        {numberFormatter.format(stock.profitPercent)}%
                      </div>
                      <div>{numberFormatter.format(stock.profit)}</div>
                    </>
                  )}
                </span>
                <span className={styles.rowValue}>
                  {numberFormatter.format(stock.value)}
                </span>
                <span className={styles.rowPredict}>+</span>
              </div>

              <div
                className={styles.panelContainer}
                ref={ref}
                style={{
                  maxHeight: showPanel
                    ? contentHeight ?? ref.current?.scrollHeight ?? 0
                    : 0,
                }}
              >
                <hr className={styles.panelSeparator} />
                <div className={styles.panelContent}>
                  <PortfolioPageAlert></PortfolioPageAlert>
                  <hr className={styles.panelSeparator} />
                  <PortfolioPageLots
                    stockId={stock.stockId}
                    currentPrice={stock.price}
                    priceChange={stock.change}
                    onSizeChanged={() => {
                      setContentHeight(ref.current?.scrollHeight ?? 0);
                    }}
                  ></PortfolioPageLots>
                </div>
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
        </div>
      )}
    </Draggable>
  );
};

export default PortfolioPageRow;
