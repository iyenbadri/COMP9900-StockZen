import orderDown from 'assets/icon-outlines/outline-chevron-down-small.svg';
import orderUp from 'assets/icon-outlines/outline-chevron-up-small.svg';
import { PortfolioContext } from 'contexts/PortfolioContext';
import { Ordering } from 'enums';
import React, { FC, useContext } from 'react';
import Button from 'react-bootstrap/Button';
import PortfolioFundamentalRow from './PortfolioFundamentalRow';
import styles from './PortfolioPage.module.css';


// This is a copy from PortfolioList. Might create a separate file later.
const OrderingIndicator: FC<OrderingIndicatorProp> = (props) => {
  // Extract the properties
  const { target, ordering } = props;

  return (
    <>
      {target === ordering.column && (
        <img
          width={24}
          height={24}
          src={ordering.ordering === Ordering.Ascending ? orderUp : orderDown}
          alt='order-indicator'
        />
      )}
    </>
  );
};

const StockFundamental = () => {
  const {
    showDeleteStockModal,
    deleteStockId,
    deleteStockName,
    stockInfo,
    handleTempSort,
    infoTableOrdering,
  } = useContext(PortfolioContext);

  console.log('fundamental file is running');

  return (
    <>
      {/* Wrapper in case the screen is too small. It enable scrolling in case a really small screen. */}
      <div className={styles.sideScrollWrapper}>
        <div className={styles.sdieScrollContainer}>
          <div className={styles.tableHeader}>
            <span className={styles.rowStockInfo}>
              <span className={styles.rowHandle}></span>
              <span className={styles.rowCode}>
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort(1, 'symbol')}
                >
                  Code
                  <OrderingIndicator
                    target='symbol'
                    ordering={infoTableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span className={`${styles.rowName} d-none d-xxl-block`}>
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort(1, 'name')}
                >
                  Name
                  <OrderingIndicator
                    target='name'
                    ordering={infoTableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span className={styles.rowPrice}>
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort(1, 'dayLow')}
                >
                  DayLow
                  <OrderingIndicator
                    target='dayLow'
                    ordering={infoTableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span className={styles.rowChange}>
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort(1, 'dayHigh')}
                >
                  DayHigh
                  <OrderingIndicator
                    target='dayHigh'
                    ordering={infoTableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span
                className={`${styles.rowAveragePrice} d-block d-lg-none  d-xl-block`}
              >
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort(1, 'fiftyTwoWeekLow')}
                >
                  52Wk Low
                  <OrderingIndicator
                    target='fiftyTwoWeekLow'
                    ordering={infoTableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span className={styles.rowProfit}>
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort(1, 'fiftyTwoWeekHigh')}
                >
                  52Wk High
                  <OrderingIndicator
                    target='fiftyTwoWeekHigh'
                    ordering={infoTableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span className={styles.rowValue}>
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort(1, 'avgVolume')}
                >
                  Avg Volume
                  <OrderingIndicator
                    target='avgVolume'
                    ordering={infoTableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span className={styles.rowPredict}>
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort(1, 'marketCap')}
                >
                  Market Capacity
                  <OrderingIndicator
                    target='marketCap'
                    ordering={infoTableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span className={styles.rowPredict}>
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort(1, 'beta')}
                >
                  Beta
                  <OrderingIndicator
                    target='beta'
                    ordering={infoTableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
            </span>
            <span className={styles.rowDelete}></span>
            <div>
              {stockInfo.map((stock, index) => {
                return (
                  <PortfolioFundamentalRow
                    key={stock.stockId}
                    index={index}
                    stock={stock}
                    showDeleteModal={(stockId: number, name: string) => {
                      deleteStockId(stockId);
                      deleteStockName(name);
                      showDeleteStockModal();
                    }}
                  ></PortfolioFundamentalRow>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StockFundamental;
