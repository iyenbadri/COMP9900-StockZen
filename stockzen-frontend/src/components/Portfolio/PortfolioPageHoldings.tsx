import orderDown from 'assets/icon-outlines/outline-chevron-down-small.svg';
import orderUp from 'assets/icon-outlines/outline-chevron-up-small.svg';
import { PortfolioContext } from 'contexts/PortfolioContext';
import { Ordering } from 'enums';
import React, { FC, useContext } from 'react';
import {
  DragDropContext,
  Droppable
} from 'react-beautiful-dnd';
import Button from 'react-bootstrap/Button';
import styles from './PortfolioPage.module.css';
import PortfolioPageRow from './PortfolioPageRow';

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

const MyHoldings = () => {
  const {
    showDeleteStockModal,
    deleteStockId,
    deleteStockName,
    stocks,
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleTempSort,
    holdingsTableOrdering,
  } = useContext(PortfolioContext);

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
                  onClick={() => handleTempSort(0, 'symbol')}
                >
                  Code
                  <OrderingIndicator
                    target='symbol'
                    ordering={holdingsTableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span className={`${styles.rowName} d-none d-xxl-block`}>
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort(0, 'name')}
                >
                  Name
                  <OrderingIndicator
                    target='name'
                    ordering={holdingsTableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span className={styles.rowPrice}>
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort(0, 'price')}
                >
                  Price
                  <OrderingIndicator
                    target='price'
                    ordering={holdingsTableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span className={styles.rowChange}>
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort(0, 'change')}
                >
                  Change
                  <OrderingIndicator
                    target='change'
                    ordering={holdingsTableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span
                className={`${styles.rowAveragePrice} d-block d-lg-none  d-xl-block`}
              >
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort(0, 'averagePrice')}
                >
                  Avg price
                  <OrderingIndicator
                    target='averagePrice'
                    ordering={holdingsTableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span className={styles.rowProfit}>
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort(0, 'profit')}
                >
                  Profit
                  <OrderingIndicator
                    target='profit'
                    ordering={holdingsTableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span className={styles.rowValue}>
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort(0, 'value')}
                >
                  Value
                  <OrderingIndicator
                    target='value'
                    ordering={holdingsTableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span className={styles.rowPredict}>
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort(0, 'prediction')}
                >
                  Predict
                  <OrderingIndicator
                    target='prediction'
                    ordering={holdingsTableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
            </span>
            <span className={styles.rowDelete}></span>
          </div>

          {/* Wrapper to enable/disable hightlight when dragging */}
          <div
            className={`${isDragging ? styles.dragging : styles.notDragging} ${holdingsTableOrdering.column !== '' ? styles.tempSort : ''
              }`}
          >
            <DragDropContext
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
            >
              <Droppable droppableId='stock-list' type='stock'>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {stocks.map((stock, index) => {
                      return (
                        <PortfolioPageRow
                          key={stock.stockId}
                          index={index}
                          stock={stock}
                          showDeleteModal={(stockId: number, name: string) => {
                            deleteStockId(stockId);
                            deleteStockName(name);
                            showDeleteStockModal();
                          }}
                        ></PortfolioPageRow>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyHoldings;
