import handleIcon from 'assets/icon-outlines/outline-menu-vertical.svg';
import refresh from 'assets/icon-outlines/outline-refresh-small.svg';
import axios from 'axios';
import SearchWidget from 'components/Search/SearchWidget';
import { TopPerformerContext } from 'contexts/TopPerformerContext';
import React, { FC, useContext, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { Link, useParams } from 'react-router-dom';
import styles from './PortfolioPage.module.css';
import PortfolioPageSummary from './PortfolioPageSummary';

interface RouteRarams {
  portfolioId?: string | undefined;
}

interface StockListResponse {
  id: number;
  code: string;
  stockName: string;
  price: number;
  change: number;
  percChange: number;
  avgPrice: number;
  unitsHeld: number;
  gain: number;
  percGain: number;
  value: number;
}

interface StockData {
  stockId: number;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  averagePrice: number;
  profit: number;
  profitPercent: number;
  value: number;
}

interface StockRowData {
  readonly stockData: StockData;
}

const Portfolio = () => {
  //const [showSearchWidget, setShowSearchWidget] = useState<boolean>(false);
  const { setShowPortfolioSummary } = useContext(TopPerformerContext);

  const { portfolioId } = useParams<RouteRarams>();
  const [stocks, setStocks] = useState<StockData[]>([]);

  const mapStockList = (data: StockListResponse[]): StockData[] => {
    return data.map((x) => ({
      stockId: x.id,
      symbol: x.code,
      name: x.stockName,
      price: x.price,
      change: x.change,
      changePercent: x.percChange,
      averagePrice: x.avgPrice,
      profit: x.gain,
      profitPercent: x.percGain,
      value: x.value,
    }));
  };

  const reloadStockList = () => {
    axios.get(`/stock/list/${portfolioId}`).then((response) => {
      setStocks(mapStockList(response.data));
    });
  };

  useEffect(() => {
    setShowPortfolioSummary(true);
    reloadStockList();
  }, []);

  const handleAddStock = (symbol: string, stockPageId: number) => {
    axios
      .post(`/stock/${portfolioId}`, { stockPageId: stockPageId })
      .then(() => {
        reloadStockList();
      });
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

      <div className={styles.tableHeader}>
        <span className={styles.rowStockInfo}>
          <span className={styles.rowHandle}></span>
          <span className={styles.rowCode}>
            <Button variant={'light'} size={'sm'}>
              Code
            </Button>
          </span>
          <span className={`${styles.rowName} d-block d-sm-none d-xl-block`}>
            <Button variant={'light'} size={'sm'}>
              Name
            </Button>
          </span>
          <span className={styles.rowPrice}>
            <Button variant={'light'} size={'sm'}>
              Price
            </Button>
          </span>
          <span className={styles.rowChange}>
            <Button variant={'light'} size={'sm'}>
              Change
            </Button>
          </span>
          <span className={`${styles.rowAveragePrice} d-block d-lg-none`}>
            <Button variant={'light'} size={'sm'}>
              Avg price
            </Button>
          </span>
          <span className={styles.rowProfit}>
            <Button variant={'light'} size={'sm'}>
              Profit
            </Button>
          </span>
          <span className={styles.rowValue}>
            <Button variant={'light'} size={'sm'}>
              Value
            </Button>
          </span>
          <span className={styles.rowPredict}>
            <Button variant={'light'} size={'sm'}>
              Predict
            </Button>
          </span>
        </span>
        {/* <span className={styles.rowDelete}></span> */}
      </div>

      {stocks.map((x) => {
        return <StockRow key={x.stockId} stockData={x}></StockRow>;
      })}
    </>
  );
};

const StockRow: FC<StockRowData> = (prop) => {
  const numberFormatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
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
    <div className={styles.tableRow}>
      <span className={styles.rowStockInfo}>
        <span className={styles.rowHandle}>
          <img src={handleIcon} alt='handle' />
        </span>
        <span className={styles.rowCode}>
          <Link
            to={`/stock/${prop.stockData.symbol}`}
            className={styles.rowStockLink}
          >
            {prop.stockData.symbol}
          </Link>
        </span>
        <span className={`${styles.rowName} d-block d-sm-none d-xl-block`}>
          {prop.stockData.name}
        </span>
        <span className={styles.rowPrice}>
          {numberFormatter.format(prop.stockData.price)}
        </span>
        <span
          className={`${styles.rowChange} ${gainLossClass(
            prop.stockData.change
          )}`}
        >
          {prop.stockData.change == null ? (
            '-'
          ) : (
            <>
              <div className={styles.percent}>
                {prop.stockData.changePercent}%
              </div>
              <div>{prop.stockData.change}</div>
            </>
          )}
        </span>
        <span className={`${styles.rowAveragePrice} d-block d-lg-none`}>
          {prop.stockData.averagePrice}
        </span>
        <span
          className={`${styles.rowProfit} ${gainLossClass(
            prop.stockData.profit
          )}`}
        >
          {prop.stockData.profit == null ? (
            '-'
          ) : (
            <>
              <div className={styles.percent}>
                {prop.stockData.profitPercent}%
              </div>
              <div>{prop.stockData.profit}</div>
            </>
          )}
        </span>
        <span className={styles.rowValue}>
          {numberFormatter.format(prop.stockData.value)}
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
  );
};

export default Portfolio;
