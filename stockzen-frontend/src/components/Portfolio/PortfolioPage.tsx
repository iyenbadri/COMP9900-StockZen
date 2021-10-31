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
import Modal from 'react-bootstrap/Modal';
import { useParams } from 'react-router-dom';
import stocksListing from '../Search/listing.json';
import styles from './PortfolioPage.module.css';
import PortfolioPageRow from './PortfolioPageRow';
import PortfolioPageSummary from './PortfolioPageSummary';

interface RouteRarams {
  portfolioId: string;
}

// Define the list of sortable columns
type PortfolioPageColumn =
  | 'symbol'
  | 'name'
  | 'price'
  | 'change'
  | 'averagePrice'
  | 'profit'
  | 'value'
  | 'prediction';

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
  // Get the setShowPortfolioSummary from TopPerformerContext
  const { setShowPortfolioSummary } = useContext(TopPerformerContext);

  // Extract the portfolioId from route
  const { portfolioId } = useParams<RouteRarams>();

  // List of stock
  const [stocks, _setStocks] = useState<IStock[]>([]);

  // State of dragging
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // The temp sort order
  const [tableOrdering, setTableOrdering] = useState<
    TableOrdering<PortfolioPageColumn>
  >({
    column: '',
    ordering: Ordering.Unknown,
  });

  // States for delete a stock
  const [showDeleteStockModal, setShowDeleteStockModal] = useState(false);
  const [deletingStockId, setDeletingStockId] = useState(0);
  const [deletingStockName, setDeletingStockName] = useState('');

  // The function to map response from backend to frontend object
  const mapStockList = useCallback(
    (data: IStockResponse[]): IStock[] => {
      return data.map((stock) => {
        const randomIndex = Math.round(Math.random() * 10000);
        const symbol = stocksListing[randomIndex];
        return {
          stockId: stock.id,
          stockPageId: stock.stockPageId ?? Math.random(),
          draggableId: `stock-${stock.id}`,
          ordering: stock.order ?? Math.random(), // TODO: map the backend data
          symbol: stock.code ?? symbol.symbol,
          name: stock.stockName ?? symbol.description,
          price: stock.price ?? Math.random() * 2000,
          change: stock.change ?? Math.random() * 500 - 200,
          changePercent: stock.percChange ?? Math.random() * 300 - 150,
          averagePrice: stock.avgPrice ?? Math.random() * 100,
          profit: stock.gain ?? Math.random() * 10000 - 5000,
          profitPercent: stock.percGain ?? Math.random() * 10000 - 5000,
          value: stock.value ?? Math.random() * 10000,
          prediction: stock.prediction ?? Math.random() * 200 - 100,
          confidence: stock.confidence ?? Math.random() * 200 - 100,
        };
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // A function to do the sorting. It is the same logic as in PortfolioList
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

  // A function to load the stocks list
  const reloadStockList = useCallback(() => {
    // Call the API
    axios.get(`/stock/list/${portfolioId}`).then((response) => {
      // Map the response and then set it.
      setStocks(mapStockList(response.data), tableOrdering);
    });
  }, [portfolioId, mapStockList, setStocks, tableOrdering]);

  // Init
  useEffect(
    () => {
      // Hide the summary in the top performer widget.
      setShowPortfolioSummary(true);

      // Load the stock list from backend.
      reloadStockList();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Handler of add stock
  const handleAddStock = (symbol: string, stockPageId: number) => {
    // Call the API
    axios
      .post(`/stock/${portfolioId}`, { stockPageId: stockPageId })
      .then(() => {
        // Then reload the stock list
        reloadStockList();
      });
  };

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
      setTableOrdering({ column: '', ordering: Ordering.Unknown });
    }
  };

  // Handler of them sort
  const handleTempSort = (columnName: PortfolioPageColumn) => {
    setTableOrdering(
      (
        ordering: TableOrdering<PortfolioPageColumn>
      ): TableOrdering<PortfolioPageColumn> => {
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

  // Handle the stock delete
  const handleStockDelete = () => {
    setShowDeleteStockModal(false);

    axios.delete(`/stock/${deletingStockId}`).then(() => {
      reloadStockList();
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
        <PortfolioPageSummary></PortfolioPageSummary>
      </div>
      <hr />

      <div className={styles.tableToolbar}>
        <SearchWidget
          portfolioId={portfolioId}
          addStock={handleAddStock}
        ></SearchWidget>
        <Button
          variant='light'
          className='ms-1 text-muted d-flex align-items-center'
        >
          <img src={refresh} alt='refresh' style={{ opacity: 0.5 }} />
          Refresh
        </Button>
      </div>

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
                  onClick={() => handleTempSort('symbol')}
                >
                  Code
                  <OrderingIndicator
                    target='symbol'
                    ordering={tableOrdering}
                  ></OrderingIndicator>
                </Button>
              </span>
              <span className={`${styles.rowName} d-none d-xxl-block`}>
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
            <span className={styles.rowDelete}></span>
          </div>

          {/* Wrapper to enable/disable hightlight when dragging */}
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
        </div>
      </div>
    </>
  );
};

export default PortfolioPage;
