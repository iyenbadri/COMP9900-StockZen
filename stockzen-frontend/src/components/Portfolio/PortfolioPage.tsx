import { arrayMoveImmutable } from 'array-move';
import orderDown from 'assets/icon-outlines/outline-chevron-down-small.svg';
import orderUp from 'assets/icon-outlines/outline-chevron-up-small.svg';
import refresh from 'assets/icon-outlines/outline-refresh-small.svg';
import axios from 'axios';
import SearchWidget from 'components/Search/SearchWidget';
import { TopPerformerContext } from 'contexts/TopPerformerContext';
import { Ordering } from 'enums';
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  DropResult,
  ResponderProvided,
} from 'react-beautiful-dnd';
import Button from 'react-bootstrap/Button';
import { useParams } from 'react-router-dom';
import styles from './PortfolioPage.module.css';
import PortfolioPageRow from './PortfolioPageRow';
import PortfolioPageSummary from './PortfolioPageSummary';

interface RouteRarams {
  portfolioId?: string | undefined;
}

interface StockListResponse {
  id: number;
  code: string;
  order: number | undefined;
  stockName: string;
  price: number;
  change: number;
  percChange: number;
  avgPrice: number;
  unitsHeld: number;
  gain: number;
  percGain: number;
  value: number;
  prediction: number;
  confidence: number;
}

type PortfolioPageColumn =
  | 'symbol'
  | 'name'
  | 'price'
  | 'change'
  | 'averagePrice'
  | 'profit'
  | 'value'
  | 'prediction';

const OrderingIndicator: FC<OrderingIndicatorProp> = (props) => {
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
      {/* {target !== ordering.column && (
          <span
            style={{ display: 'inline-block', width: '24px', height: '24px' }}
          >
            &nbsp;
          </span>
        )} */}
    </>
  );
};

const PortfolioPage = () => {
  //const [showSearchWidget, setShowSearchWidget] = useState<boolean>(false);
  const { setShowPortfolioSummary } = useContext(TopPerformerContext);

  const { portfolioId } = useParams<RouteRarams>();
  const [stocks, _setStocks] = useState<IStock[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [tableOrdering, setTableOrdering] = useState<
    TableOrdering<PortfolioPageColumn>
  >({
    column: '',
    ordering: Ordering.Unknown,
  });

  const mapStockList = useCallback(
    (data: StockListResponse[]): IStock[] => {
      return data.map((stock) => ({
        stockId: stock.id,
        draggableId: `stock-${stock.id}`,
        ordering: stock.order ?? Math.random(), // TODO: map the backend data
        symbol: stock.code ?? Math.random().toString(),
        name: stock.stockName ?? Math.random().toString(),
        price: stock.price ?? Math.random() * 10000 - 5000,
        change: stock.change ?? Math.random() * 10000 - 5000,
        changePercent: stock.percChange ?? Math.random() * 10000 - 5000,
        averagePrice: stock.avgPrice ?? Math.random() * 10000 - 5000,
        profit: stock.gain ?? Math.random() * 10000 - 5000,
        profitPercent: stock.percGain ?? Math.random() * 10000 - 5000,
        value: stock.value ?? Math.random() * 10000 - 5000,
        prediction: stock.prediction ?? Math.random() * 200 - 100,
        confidence: stock.confidence ?? Math.random() * 200 - 100,
      }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const setStocks = useCallback(
    (stocks: IStock[], tableOrdering: TableOrdering<PortfolioPageColumn>) => {
      if (tableOrdering.column === '') {
        stocks = stocks.sort((a, b) => a.ordering - b.ordering);
      } else {
        stocks = stocks.sort((a, b) => {
          if (tableOrdering.column !== '') {
            const keyA = a[tableOrdering.column] ?? 0;
            const keyB = b[tableOrdering.column] ?? 0;

            if (keyA > keyB) {
              return tableOrdering.ordering;
            } else if (keyB > keyA) {
              return -tableOrdering.ordering;
            } else {
              return a.ordering - b.ordering;
            }
          } else {
            return a.ordering - b.ordering;
          }
        });
      }

      _setStocks(stocks);
    },
    [_setStocks]
  );

  const reloadStockList = useCallback(() => {
    axios.get(`/stock/list/${portfolioId}`).then((response) => {
      setStocks(mapStockList(response.data), tableOrdering);
    });
  }, [portfolioId, mapStockList, setStocks]);

  useEffect(
    () => {
      setShowPortfolioSummary(true);
      reloadStockList();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleAddStock = (symbol: string, stockPageId: number) => {
    axios
      .post(`/stock/${portfolioId}`, { stockPageId: stockPageId })
      .then(() => {
        reloadStockList();
      });
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (result: DropResult, provided: ResponderProvided) => {
    setIsDragging(false);

    if (result.destination != null) {
      _setStocks((stocks) => {
        const newList = arrayMoveImmutable(
          stocks,
          result.source.index,
          result.destination!.index
        );

        for (let i = 0; i < newList.length; i++) {
          newList[i].ordering = i;
        }

        // TODO: Call API to reorder the list in the backend.

        return newList;
      });
      setTableOrdering({ column: '', ordering: Ordering.Unknown });
    }
  };

  const handleTempSort = (columnName: PortfolioPageColumn) => {
    setTableOrdering(
      (
        ordering: TableOrdering<PortfolioPageColumn>
      ): TableOrdering<PortfolioPageColumn> => {
        if (ordering.column === columnName) {
          switch (ordering.ordering) {
            case Ordering.Ascending:
              ordering = { ...ordering, ordering: Ordering.Descending };
              break;
            case Ordering.Descending:
              ordering = { column: '', ordering: Ordering.Unknown };
              break;
            default:
              ordering = { ...ordering, ordering: Ordering.Ascending };
              break;
          }
        } else {
          ordering = { column: columnName, ordering: Ordering.Ascending };
        }

        setStocks(stocks, ordering);

        return ordering;
      }
    );
  };

  return (
    <>
      <div>
        <PortfolioPageSummary></PortfolioPageSummary>
      </div>
      <hr />

      <div className={styles.tableToolbar}>
        <SearchWidget addStock={handleAddStock}></SearchWidget>
        <Button
          variant='light'
          className='ms-1 text-muted d-flex align-items-center'
        >
          <img src={refresh} alt='refresh' style={{ opacity: 0.5 }} />
          Refresh
        </Button>
      </div>

      <div
        style={{
          maxWidth: '100vw',
          overflowX: 'auto',
        }}
      >
        <div style={{ minWidth: '615px', margin: '0 1px' }}>
          <div className={styles.tableHeader}>
            <span className={styles.rowStockInfo}>
              <span className={styles.rowHandle}></span>
              <span className={styles.rowCode}>
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort('symbol')}
                >
                  Code
                  <OrderingIndicator
                    target='symbol'
                    ordering={tableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span
                className={`${styles.rowName} d-block d-sm-none d-xl-block`}
              >
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort('name')}
                >
                  Name
                  <OrderingIndicator
                    target='name'
                    ordering={tableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span className={styles.rowPrice}>
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort('price')}
                >
                  Price
                  <OrderingIndicator
                    target='price'
                    ordering={tableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span className={styles.rowChange}>
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort('change')}
                >
                  Change
                  <OrderingIndicator
                    target='change'
                    ordering={tableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span
                className={`${styles.rowAveragePrice} d-block d-lg-none  d-xl-block`}
              >
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort('averagePrice')}
                >
                  Avg price
                  <OrderingIndicator
                    target='averagePrice'
                    ordering={tableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span className={styles.rowProfit}>
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort('profit')}
                >
                  Profit
                  <OrderingIndicator
                    target='profit'
                    ordering={tableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span className={styles.rowValue}>
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort('value')}
                >
                  Value
                  <OrderingIndicator
                    target='value'
                    ordering={tableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span className={styles.rowPredict}>
                <Button
                  variant='transparent'
                  size={'sm'}
                  onClick={() => handleTempSort('prediction')}
                >
                  Predict
                  <OrderingIndicator
                    target='prediction'
                    ordering={tableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
            </span>
            {/* <span className={styles.rowDelete}></span> */}
          </div>

          <div
            className={`${isDragging ? styles.dragging : styles.notDragging} ${
              tableOrdering.column !== '' ? styles.tempSort : ''
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

export default PortfolioPage;
