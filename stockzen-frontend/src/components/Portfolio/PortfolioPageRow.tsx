import crossIcon from 'assets/icon-outlines/outline-cross.svg';
import handleIcon from 'assets/icon-outlines/outline-drag-handle.svg';
import downArrowIcon from 'assets/ml-down-arrow.svg';
import upArrowIcon from 'assets/ml-up-arrow.svg';
import React, { FC, useEffect, useRef, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import { numberFormatter, usdFormatter } from 'utils/Utilities';
import PortfolioPageAlert from './PortfolioPage-Alert';
import PortfolioPageLots from './PortfolioPage-Lots';
import styles from './PortfolioPage.module.css';

interface PortfolioPageRowProp {
  readonly stock: IStock;
  readonly index: number;
  readonly showDeleteModal: (stockId: number, stock: string) => void;
}

// **************************************************************
// Component to display the row in the portfolio page
// **************************************************************
const PortfolioPageRow: FC<PortfolioPageRowProp> = (props) => {
  const { stock } = props;

  // Get the container ref
  const conatinerRef = useRef<HTMLDivElement>(null);

  // content height of the continaer
  const [contentHeight, setContentHeight] = useState<number>();

  // Setup to listen to the resize to get the contentHeight
  useEffect(() => {
    const listener = () => {
      setContentHeight(conatinerRef.current?.scrollHeight ?? 0);
    };

    window.addEventListener('resize', listener);
    listener();

    return () => {
      window.removeEventListener('resize', listener);
    };
  }, []);

  const [showPanel, setShowPanel] = useState(false);

  // Functon to get the className of the gain/loss
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

  // convert fractional accuracy to a colour variable name
  const accuracyColour = (accu: number): string => {
    switch (true) {
      case accu > 0.5:
        return '--ml-high-green';
      case accu > 0.25:
        return '--ml-med-yellow';
      default:
        return '--ml-low-red';
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
                    (height) => conatinerRef.current?.scrollHeight ?? height
                  );
                  setShowPanel(!showPanel);
                }}
              >
                {/* DnD handle */}
                <span className={styles.rowHandle}>
                  <img
                    src={handleIcon}
                    alt='handle'
                    {...provided.dragHandleProps}
                  />
                </span>

                {/* Code */}
                <span className={styles.rowCode}>
                  <Link
                    to={{
                      pathname: `/stock/${stock.stockPageId}`,
                      state: {
                        code: stock.code,
                        name: stock.name,
                      },
                    }}
                    className={styles.rowStockLink}
                  >
                    {stock.code}
                  </Link>
                </span>

                {/* Name */}
                <div className={`${styles.rowName} d-none d-xxl-block`}>
                  <div
                    style={{ textOverflow: 'ellipsis', overflowX: 'hidden' }}
                  >
                    {stock.name}
                  </div>
                </div>

                {/* Price */}
                <span className={styles.rowPrice}>
                  {usdFormatter.format(stock.price)}
                </span>

                {/* Change */}
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
                      <div>{usdFormatter.format(stock.change)}</div>
                    </>
                  )}
                </span>

                {/* Average price */}
                <span
                  className={`${styles.rowAveragePrice} d-block d-lg-none d-xl-block`}
                >
                  {stock.averagePrice == null
                    ? '-'
                    : usdFormatter.format(stock.averagePrice)}
                </span>

                {/* Gain/loss */}
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
                      <div>{usdFormatter.format(stock.profit)}</div>
                    </>
                  )}
                </span>

                {/* Value */}
                <span className={styles.rowValue}>
                  {stock.value == null ? '-' : usdFormatter.format(stock.value)}
                </span>

                {/* Prediction */}
                <span className={styles.rowPredict}>
                  {stock.prediction === 1 ? (
                    <img
                      src={upArrowIcon}
                      alt='prediction up arrow icon'
                      className={styles.predictArrow}
                    />
                  ) : stock.prediction === 0 ? (
                    <img
                      src={downArrowIcon}
                      alt='prediction down arrow icon'
                      className={styles.predictArrow}
                    />
                  ) : (
                    '-'
                  )}
                  {stock.prediction !== null && stock.confidence ? (
                    <div className={styles.indicatorContainer}>
                      <div className={styles.indicatorOutline}>
                        <div
                          className={styles.indicatorLevel}
                          style={{
                            height: `${stock.confidence * 100}%`,
                            backgroundColor: `var(${accuracyColour(
                              stock.confidence
                            )})`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    ''
                  )}
                </span>
              </div>

              {/* Content of the portfolio */}
              <div
                className={styles.panelContainer}
                ref={conatinerRef}
                style={{
                  maxHeight: showPanel
                    ? contentHeight ?? conatinerRef.current?.scrollHeight ?? 0
                    : 0,
                }}
              >
                <hr className={styles.panelSeparator} />
                <div className={styles.panelContent}>
                  {/* Price alert */}
                  <PortfolioPageAlert
                    stockId={stock.stockId}
                  ></PortfolioPageAlert>

                  <hr className={styles.panelSeparator} />

                  {/* Lots */}
                  <PortfolioPageLots
                    stockId={stock.stockId}
                    currentPrice={stock.price}
                    priceChange={stock.change}
                    onSizeChanged={() => {
                      setContentHeight(conatinerRef.current?.scrollHeight ?? 0);
                    }}
                  ></PortfolioPageLots>
                </div>
              </div>
            </div>

            {/* Delete button */}
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
