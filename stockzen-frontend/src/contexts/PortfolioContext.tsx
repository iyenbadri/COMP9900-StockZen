import { arrayMoveImmutable } from 'array-move';
import axios from 'axios';
import { Ordering } from 'enums';
import React, { createContext, FC, useCallback, useState } from 'react';
import {
  DropResult,
  ResponderProvided
} from 'react-beautiful-dnd';
import { useParams } from 'react-router-dom';

/* Context of portfolio page that consists of two tabs
    (1) MyHoldings 
        - list of stocks in portfolio with summary information (e.g. price, change, etc)
    (2) Fundamentals 
        - list of stocks in portfolio with fundamental information (e.g. market capacity, beta, etc)
*/

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

interface IPortfolioContext {
  deleteStockModal: boolean;
  showDeleteStockModal: () => void;
  stopShowDeleteStockModal: () => void;
  deletingStockId: number;
  deletingStockName: string;
  deleteStockId: (id: number) => void;
  deleteStockName: (name: string) => void;
  stocks: IStock[];                     // List of stocks with summary in the portfolio
  mapStockList: (data: IStockResponse[]) => IStock[];
  setStocks: (stocks: IStock[], holdingsTableOrdering: TableOrdering<HoldingsColumn>) => void;
  stockInfo: IStockFundamental[];       // Fundamental information of holding stocks in portfolio
  mapStockInfoList: (data: IStockResponse[]) => any;
  setStockInfo: (stocks: IStockFundamental[], infoTableOrdering: TableOrdering<FundamentalColumn>) => void;
  isDragging: boolean;                  // State of dragging
  handleDragStart: () => void;
  handleDragEnd: (result: DropResult, provided: ResponderProvided) => void;
  handleTempSort: (activeTab: number, columnName: HoldingsColumn | FundamentalColumn) => void;
  holdingsTableOrdering: TableOrdering<HoldingsColumn>;
  infoTableOrdering: TableOrdering<FundamentalColumn>;
}

const portfolioDefaultValues: IPortfolioContext = {
  deleteStockModal: false,
  showDeleteStockModal: () => { },
  stopShowDeleteStockModal: () => { },
  deletingStockId: 0,
  deletingStockName: '',
  deleteStockId: (id: number) => { },
  deleteStockName: (name: string) => { },
  stocks: [],
  mapStockList: (data: IStockResponse[]) => [],
  setStocks: (stocks: IStock[], holdingsTableOrdering: TableOrdering<HoldingsColumn>) => { },
  stockInfo: [],
  mapStockInfoList: (data: IStockResponse[]) => [],
  setStockInfo: (stocks: IStockFundamental[], infoTableOrdering: TableOrdering<FundamentalColumn>) => { },
  isDragging: false,
  handleDragStart: () => { },
  handleDragEnd: (result: DropResult, provided: ResponderProvided) => { },
  handleTempSort: (activeTab: number, columnName: HoldingsColumn | FundamentalColumn) => { },
  holdingsTableOrdering: {
    column: '',
    ordering: Ordering.Unknown,
  },
  infoTableOrdering: {
    column: '',
    ordering: Ordering.Unknown,
  }
}

interface RouteParams {
  portfolioId: string;
}

export const PortfolioContext = createContext<IPortfolioContext>(portfolioDefaultValues);


const PortfolioProvider: FC = ({ children }): any => {
  // Extract the portfolioId from route
  const { portfolioId } = useParams<RouteParams>();

  // States for delete a stock
  const [deleteStockModal, setDeleteStockModal] = useState(false);
  const [deletingStockId, setDeletingStockId] = useState(0);
  const [deletingStockName, setDeletingStockName] = useState('');
  const [stocks, _setStocks] = useState<IStock[]>([]);
  const [stockInfo, _setStockInfo] = useState<IStockFundamental[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const showDeleteStockModal = () => {
    setDeleteStockModal(true);
  }

  const stopShowDeleteStockModal = () => {
    setDeleteStockModal(false);
  }

  const deleteStockId = (id: number) => {
    setDeletingStockId(id);
  }

  const deleteStockName = (name: string) => {
    setDeletingStockName(name);
  }

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

  const orderColumns = (
    ordering: TableOrdering<HoldingsColumn> | TableOrdering<FundamentalColumn>,
    columnName: HoldingsColumn | FundamentalColumn
  ) => {
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
  }

  // Handler of them sort
  const handleTempSort = (
    activeTab: number,
    columnName: HoldingsColumn | FundamentalColumn
  ) => {
    if (activeTab === 0) {
      setHoldingsTableOrdering(
        (
          ordering: TableOrdering<HoldingsColumn>
        ): TableOrdering<HoldingsColumn> => {
          orderColumns(ordering, columnName);

          // Call setStocks to update the list (do the sorting);
          setStocks(stocks, ordering);

          return ordering;
        })
    }
    else {
      setInfoTableOrdering(
        (
          ordering: TableOrdering<FundamentalColumn>
        ): TableOrdering<FundamentalColumn> => {

          orderColumns(ordering, columnName);

          // Call setStocks to update the list (do the sorting);
          setStockInfo(stockInfo, ordering);

          return ordering;
        })
    }
  };

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

  // The function to map response from backend to frontend object
  const mapStockInfoList = useCallback(
    (data: IStockResponse[]): any => {
      // let emptyTable : IStockFundamental[] = [];
      // let infoTable = data
      //   ? 
      return data.map(async (stock) => {
        const res = await axios.get(`/stock-page/${stock.stockPageId}`);
        const infoRes = res.data;
        return {
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
      })
      // : emptyTable;
      // return infoTable;
    },
    []
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
      console.log('this is processed');
    },
    [_setStocks]
  );

  // A function to do the sorting in Fundamental table
  const setStockInfo = useCallback(
    (stocks: IStockFundamental[], infoTableOrdering: TableOrdering<FundamentalColumn>) => {
      if (infoTableOrdering.column === '') {
        stocks = stocks.sort((a, b) => a.ordering - b.ordering);
      } else {
        stocks = stocks.sort((a, b) => {
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


  return (
    <PortfolioContext.Provider
      value={{
        deleteStockModal,
        showDeleteStockModal,
        stopShowDeleteStockModal,
        deletingStockId,
        deletingStockName,
        deleteStockId,
        deleteStockName,
        stocks,
        mapStockList,
        setStocks,
        stockInfo,
        mapStockInfoList,
        setStockInfo,
        isDragging,
        handleDragStart,
        handleDragEnd,
        handleTempSort,
        holdingsTableOrdering,
        infoTableOrdering,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export default PortfolioProvider;
