import { arrayMoveImmutable } from 'array-move';
import orderDown from 'assets/icon-outlines/outline-chevron-down-small.svg';
import orderUp from 'assets/icon-outlines/outline-chevron-up-small.svg';
import refreshIcon from 'assets/icon-outlines/outline-refresh-small.svg';
import axios from 'axios';
import { RefreshContext } from 'contexts/RefreshContext';
import { TopPerformerContext } from 'contexts/TopPerformerContext';
import { Ordering } from 'enums';
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable, DropResult,
  ResponderProvided
} from 'react-beautiful-dnd';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useParams } from 'react-router-dom';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import AddStock from './AddStock';
import PortfolioFundamentalRow from './PortfolioFundamentalRow';
import styles from './PortfolioPage.module.css';
import PortfolioPageRow from './PortfolioPageRow';
import PortfolioPageSummary from './PortfolioPageSummary';

interface RouteRarams {
  portfolioId: string;
}

// List of sortable columns in tab(1) MyHoldings
type HoldingsColumn =
  | 'symbol'
  | 'name'
  | 'price'
  | 'change'
  | 'averagePrice'
  | 'profit'
  | 'value'
  | 'prediction';

// List of sortable columns in tab(2) Fundamentals
type FundamentalColumn =
  | 'symbol'
  | 'name'
  | 'dayLow'
  | 'dayHigh'
  | 'fiftyTwoWeekLow'
  | 'fiftyTwoWeekHigh'
  | 'avgVolume'
  | 'marketCap'
  | 'beta';

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

const PortfolioPage = () => {
  const { portfolioId } = useParams<RouteRarams>();

  // Get the setShowPortfolioSummary from TopPerformerContext
  const { setShowPortfolioSummary } = useContext(TopPerformerContext);

  // Get functions for refresh
  const { subscribe, unsubscribe, refresh } = useContext(RefreshContext);

  // Tab indicator in portfolioi page (0: MyHoldings, 1: Fundamentals)
  const [activeTab, setActiveTab] = useState(0);

  // States for delete a stock
  const [showDeleteStockModal, setShowDeleteStockModal] = useState(false);
  const [deletingStockId, setDeletingStockId] = useState(0);
  const [deletingStockName, setDeletingStockName] = useState('');

  /* Retrieving data from backend 
    (1) List of holding stocks with summary data -- stocks
    (2) List of holding stocks with fundamental information -- stockInfo
  */
  // List of stock
  const [stocks, _setStocks] = useState<IStock[]>([]);

  // List of stock fundamental info
  const [stockInfo, _setStockInfo] = useState<IStockFundamental[]>([]);

  // The function to map response from backend to frontend object
  const mapStockList = useCallback(
    (data: IStockResponse[]): IStock[] => {
      return data.map((stock) => {
        return {
          stockId: stock.id,
          stockPageId: stock.stockPageId,
          draggableId: `stock-${stock.id}`,
          ordering: stock.order,
          symbol: stock.code,
          name: stock.stockName,
          price: stock.price,
          change: stock.change,
          changePercent: stock.percChange,
          averagePrice: stock.avgPrice,
          profit: stock.gain,
          profitPercent: stock.percGain,
          value: stock.value,
          prediction: stock.prediction,
          confidence: stock.confidence,
        };
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const mapStockInfoList = useCallback(
    (data: IStockResponse[]): any => {
      return data.map(async (stock) => {
        try {
          axios
            .get(`/stock-page/${stock.stockPageId}`)
            .then((res) => {
              const infoRes = res.data;
              const fundamentalInfo: IStockFundamental = {
                stockId: stock.id,
                stockPageId: stock.stockPageId,
                draggableId: `stock-${stock.id}`,
                ordering: stock.order,
                symbol: stock.code,
                name: stock.stockName,
                dayLow: infoRes.dayLow,
                dayHigh: infoRes.dayHigh,
                fiftyTwoWeekLow: infoRes.fiftyTwoWeekLow,
                fiftyTwoWeekHigh: infoRes.fiftyTwoWeekHigh,
                volume: infoRes.volume,
                avgVolume: infoRes.avgVolume,
                marketCap: infoRes.marketCap,
                beta: infoRes.beta,
              };
              return fundamentalInfo;
            })
        } catch (e: any) {
          const blankFundamentalInfo: IStockFundamental = {
            stockId: stock.id,
            stockPageId: stock.stockPageId,
            draggableId: `stock-${stock.id}`,
            ordering: stock.order,
            symbol: stock.code,
            name: stock.stockName,
            dayLow: null,
            dayHigh: null,
            fiftyTwoWeekLow: null,
            fiftyTwoWeekHigh: null,
            volume: null,
            avgVolume: null,
            marketCap: null,
            beta: null,
          }
          return blankFundamentalInfo;
        }
      })
      // const res = await axios.get(`/stock-page/${stock.stockPageId}`);
      // if (res.status === 200) {
      //   const infoRes = res.data;
      //   const fundamentalInfo: IStockFundamental = {
      //     stockId: stock.id,
      //     stockPageId: stock.stockPageId,
      //     draggableId: `stock-${stock.id}`,
      //     ordering: stock.order,
      //     symbol: stock.code,
      //     name: stock.stockName,
      //     dayLow: infoRes.dayLow,
      //     dayHigh: infoRes.dayHigh,
      //     fiftyTwoWeekLow: infoRes.fiftyTwoWeekLow,
      //     fiftyTwoWeekHigh: infoRes.fiftyTwoWeekHigh,
      //     volume: infoRes.volume,
      //     avgVolume: infoRes.avgVolume,
      //     marketCap: infoRes.marketCap,
      //     beta: infoRes.beta,
      //   };
      //   return fundamentalInfo;
      // } else {
      //   const blankFundamentalInfo: IStockFundamental = {
      //     stockId: stock.id,
      //     stockPageId: stock.stockPageId,
      //     draggableId: `stock-${stock.id}`,
      //     ordering: stock.order,
      //     symbol: stock.code,
      //     name: stock.stockName,
      //     dayLow: null,
      //     dayHigh: null,
      //     fiftyTwoWeekLow: null,
      //     fiftyTwoWeekHigh: null,
      //     volume: null,
      //     avgVolume: null,
      //     marketCap: null,
      //     beta: null,
      //   };
      //   return blankFundamentalInfo;
      // }
      // })
    }, []
  );

  // A function to do the sorting in MyHoldings table
  // (Used the same logic as in PortfolioList)
  const setStocks = useCallback(
    (stocks: IStock[], holdingsTableOrdering: TableOrdering<HoldingsColumn>) => {
      if (holdingsTableOrdering.column === '') {
        stocks = stocks.sort((a, b) => a.ordering - b.ordering);
      } else {
        stocks = stocks.sort((a, b) => {
          if (holdingsTableOrdering.column !== '') {
            const keyA = a[holdingsTableOrdering.column] ?? 0;
            const keyB = b[holdingsTableOrdering.column] ?? 0;

            if (keyA > keyB) {
              return holdingsTableOrdering.ordering;
            } else if (keyB > keyA) {
              return -holdingsTableOrdering.ordering;
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

  // A function to do the sorting in Fundamental table
  const setStockInfo = useCallback(
    (stockInfo: IStockFundamental[], infoTableOrdering: TableOrdering<FundamentalColumn>) => {
      if (infoTableOrdering.column === '') {
        stockInfo = stockInfo.sort((a, b) => a.ordering - b.ordering);
      } else {
        stockInfo = stockInfo.sort((a, b) => {
          if (infoTableOrdering.column !== '') {
            const keyA = a[infoTableOrdering.column] ?? 0;
            const keyB = b[infoTableOrdering.column] ?? 0;

            if (keyA > keyB) {
              return infoTableOrdering.ordering;
            } else if (keyB > keyA) {
              return -infoTableOrdering.ordering;
            } else {
              return a.ordering - b.ordering;
            }
          } else {
            return a.ordering - b.ordering;
          }
        });
      }

      _setStockInfo(stockInfo);
    },
    [_setStockInfo]
  );

  // The temp sort order in MyHoldings tab
  const [holdingsTableOrdering, setHoldingsTableOrdering] = useState<
    TableOrdering<HoldingsColumn>
  >({
    column: '',
    ordering: Ordering.Unknown,
  });

  // The temp sort order in Fundamentals tab
  const [infoTableOrdering, setInfoTableOrdering] = useState<
    TableOrdering<FundamentalColumn>
  >({
    column: '',
    ordering: Ordering.Unknown,
  });

  // A function to load the stocks list
  const reloadStockList = useCallback(
    (forceRefresh: boolean) => {
      // Call the API
      axios
        .get(`/stock/list/${portfolioId}?refresh=${forceRefresh ? '1' : '0'}`)
        .then((response) => {
          // Map the response and then set it.
          setStocks(mapStockList(response.data), holdingsTableOrdering);
          setStockInfo(mapStockInfoList(response.data), infoTableOrdering);
        });
    },
    [portfolioId, setStocks, mapStockList, setStockInfo, mapStockInfoList,
      holdingsTableOrdering, infoTableOrdering]
  );

  /* Ordering */
  // State of dragging
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Set isDragging when user start dragging the stock
  // It is to disable the highlight
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Handler when the drag end
  const handleDragEnd = (result: DropResult, provided: ResponderProvided) => {
    // Set isDragging to faslse
    setIsDragging(false);

    // If user drop it in the list
    if (result.destination != null) {
      // Update the stock list
      _setStocks((stocks) => {
        // Move the stock in  the array
        const newList = arrayMoveImmutable(
          stocks,
          result.source.index,
          result.destination!.index
        );

        // Update the `order`
        for (let i = 0; i < newList.length; i++) {
          newList[i].ordering = i;
        }

        // Call API to reorder the list in the backend.
        axios.put(
          `/stock/list/${portfolioId}`,
          newList.map((x) => ({ id: x.stockId, order: x.ordering }))
        );

        return newList;
      });

      // Reset the sorting parameter
      setHoldingsTableOrdering({ column: '', ordering: Ordering.Unknown });
    }
  };

  // Handler of temp sort in MyHoldings
  const handleHoldingsTempSort = (columnName: HoldingsColumn) => {
    setHoldingsTableOrdering(
      (
        ordering: TableOrdering<HoldingsColumn>
      ): TableOrdering<HoldingsColumn> => {
        // Update the sorting parameter
        // It rotate Asc -> Desc -> None
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

        // Call setStocks to update the list (do the sorting);
        setStocks(stocks, ordering);

        return ordering;
      }
    );
  };

  // Handler of temp sort in Fundamentals
  const handleFundamentalTempSort = (columnName: FundamentalColumn) => {
    setInfoTableOrdering(
      (
        ordering: TableOrdering<FundamentalColumn>
      ): TableOrdering<FundamentalColumn> => {
        // Update the sorting parameter
        // It rotate Asc -> Desc -> None
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

        // Update the list with sorting
        setStockInfo(stockInfo, ordering);

        return ordering;
      }
    );
  };

  // Init
  useEffect(
    () => {
      // Hide the summary in the top performer widget.
      setShowPortfolioSummary(true);

      // Load the stock list from backend.
      reloadStockList(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    const refresh = () => {
      reloadStockList(true);
    };

    subscribe(refresh);

    return () => {
      unsubscribe(refresh);
    };
  }, []);

  // Handler of add stock
  const handleAddStock = (symbol: string, stockPageId: number) => {
    // Call the API
    axios
      .post(`/stock/${portfolioId}`, { stockPageId: stockPageId })
      .then(() => {
        // Then reload the stock list
        reloadStockList(false);
      });
  };

  // Handle the stock delete
  const handleStockDelete = () => {
    setShowDeleteStockModal(false);

    axios.delete(`/stock/${deletingStockId}`).then(() => {
      reloadStockList(false);
    });
  };

  return (
    <>
      <Modal
        show={showDeleteStockModal}
        onHide={() => setShowDeleteStockModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Do you want to delete stock {deletingStockName}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant={'danger'} onClick={handleStockDelete}>
            Yes
          </Button>
          <Button
            variant={'secondary'}
            onClick={(ev) => setShowDeleteStockModal(false)}
          >
            No
          </Button>
        </Modal.Footer>
      </Modal>

      <div>
        <PortfolioPageSummary portfolioId={portfolioId}></PortfolioPageSummary>
      </div>
      <hr />

      <Tabs
        selectedIndex={activeTab}
        onSelect={idx => setActiveTab(idx)}
      >
        <TabList className={styles.tableBar}>
          <Tab
            className={`${activeTab === 0 ? styles.activeTab : styles.tabs}`}
          >
            My Holdings
          </Tab>
          <Tab
            className={`${activeTab === 1 ? styles.activeTab : styles.tabs}`}
          >
            Fundamentals
          </Tab>
        </TabList>
        <div className={styles.tableToolbar}>
          <AddStock
            portfolioId={portfolioId}
            addStock={handleAddStock}
          ></AddStock>
          <Button
            variant='light'
            className='ms-1 text-muted d-flex align-items-center'
          >
            <img src={refreshIcon} alt='refresh' style={{ opacity: 0.5 }} />
            Refresh
          </Button>
        </div>
        <TabPanel>
          {/* --- Tab(1) My Holdings --- */}
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
                      onClick={() => handleHoldingsTempSort('symbol')}
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
                      onClick={() => handleHoldingsTempSort('name')}
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
                      onClick={() => handleHoldingsTempSort('price')}
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
                      onClick={() => handleHoldingsTempSort('change')}
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
                      onClick={() => handleHoldingsTempSort('averagePrice')}
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
                      onClick={() => handleHoldingsTempSort('profit')}
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
                      onClick={() => handleHoldingsTempSort('value')}
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
                      onClick={() => handleHoldingsTempSort('prediction')}
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
            </div>
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
                      console.log(stocks);
                      return (
                        <PortfolioPageRow
                          key={stock.stockId}
                          index={index}
                          stock={stock}
                          showDeleteModal={(stockId: number, name: string) => {
                            setDeletingStockId(stockId);
                            setDeletingStockName(name);
                            setShowDeleteStockModal(true);
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
        </TabPanel>
        {/* --- Tab(2) Fundamentals --- */}
        <TabPanel>
          <div className={styles.sideScrollWrapper}>
            <div className={styles.sdieScrollContainer}>
              <div className={styles.tableHeader}>
                <span className={styles.rowStockInfo}>
                  <span className={styles.rowHandle}></span>
                  <span className={styles.rowCode}>
                    <Button
                      variant='transparent'
                      size={'sm'}
                      onClick={() => handleFundamentalTempSort('symbol')}
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
                      onClick={() => handleFundamentalTempSort('name')}
                    >
                      Name
                      <OrderingIndicator
                        target='name'
                        ordering={infoTableOrdering}
                      ></OrderingIndicator>
                    </Button>
                  </span>
                  <span className={styles.rowInfo}>
                    <Button
                      variant='transparent'
                      size={'sm'}
                      onClick={() => handleFundamentalTempSort('dayLow')}
                    >
                      DayLow
                      <OrderingIndicator
                        target='dayLow'
                        ordering={infoTableOrdering}
                      ></OrderingIndicator>
                    </Button>
                  </span>
                  <span className={styles.rowInfo}>
                    <Button
                      variant='transparent'
                      size={'sm'}
                      onClick={() => handleFundamentalTempSort('dayHigh')}
                    >
                      DayHigh
                      <OrderingIndicator
                        target='dayHigh'
                        ordering={infoTableOrdering}
                      ></OrderingIndicator>
                    </Button>
                  </span>
                  <span
                    className={`${styles.rowLongInfo} d-block d-lg-none  d-xl-block`}
                  >
                    <Button
                      variant='transparent'
                      size={'sm'}
                      onClick={() => handleFundamentalTempSort('fiftyTwoWeekLow')}
                    >
                      52Wk Low
                      <OrderingIndicator
                        target='fiftyTwoWeekLow'
                        ordering={infoTableOrdering}
                      ></OrderingIndicator>
                    </Button>
                  </span>
                  <span className={`${styles.rowLongInfo} d-block d-lg-none  d-xl-block`}>
                    <Button
                      variant='transparent'
                      size={'sm'}
                      onClick={() => handleFundamentalTempSort('fiftyTwoWeekHigh')}
                    >
                      52Wk High
                      <OrderingIndicator
                        target='fiftyTwoWeekHigh'
                        ordering={infoTableOrdering}
                      ></OrderingIndicator>
                    </Button>
                  </span>
                  <span className={styles.rowLongInfo}>
                    <Button
                      variant='transparent'
                      size={'sm'}
                      onClick={() => handleFundamentalTempSort('avgVolume')}
                    >
                      Avg Volume
                      <OrderingIndicator
                        target='avgVolume'
                        ordering={infoTableOrdering}
                      ></OrderingIndicator>
                    </Button>
                  </span>
                  <span className={styles.rowLongInfo}>
                    <Button
                      variant='transparent'
                      size={'sm'}
                      onClick={() => handleFundamentalTempSort('marketCap')}
                    >
                      Market Cap
                      <OrderingIndicator
                        target='marketCap'
                        ordering={infoTableOrdering}
                      ></OrderingIndicator>
                    </Button>
                  </span>
                  <span className={styles.rowShortInfo}>
                    <Button
                      variant='transparent'
                      size={'sm'}
                      onClick={() => handleFundamentalTempSort('beta')}
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
              </div>
            </div>
          </div>
          <div>
            {stockInfo.map((stock, index) => {
              console.log(stockInfo);
              return (
                <PortfolioFundamentalRow
                  key={stock.stockId}
                  index={index}
                  stock={stock}
                  showDeleteModal={(stockId: number, name: string) => {
                    setDeletingStockId(stockId);
                    setDeletingStockName(name);
                    setShowDeleteStockModal(true);
                  }}
                ></PortfolioFundamentalRow>
              );
            })}
          </div>

        </TabPanel>
      </Tabs>
    </>
  );
};

export default PortfolioPage;
