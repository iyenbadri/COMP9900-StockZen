import handleIcon from 'assets/icon-outlines/outline-drag-handle.svg';
import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Draggable } from 'react-beautiful-dnd';
import styles from './PortfolioPage.module.css';

interface PortfolioPageRowProp {
  readonly stock: IStock;
  readonly index: number;
}

const PortfolioPageRow: FC<PortfolioPageRowProp> = (props) => {
  const { stock } = props;
  const numberFormatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

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
          <div className={styles.tableRow}>
            <span className={styles.rowStockInfo}>
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
              <span
                className={`${styles.rowName} d-block d-sm-none d-xl-block`}
              >
                {stock.name}
              </span>
              <span className={styles.rowPrice}>
                {numberFormatter.format(stock.price)}
              </span>
              <span
                className={`${styles.rowChange} ${gainLossClass(stock.change)}`}
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
                className={`${styles.rowProfit} ${gainLossClass(stock.profit)}`}
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
            </span>

            {/* <span className={styles.rowDelete}>
          <button
            className={`p-0 ${styles.deleteButton}`}
            onClick={() => {
              if (prop.showDeleteModal != null) {
                prop.showDeleteModal(prop.portfolioId, prop.name);
              }
            }}
          >
            <img src={crossIcon} alt='cross' />
          </button>
        </span> */}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default PortfolioPageRow;
