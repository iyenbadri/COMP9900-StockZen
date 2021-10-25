import refreshIcon from 'assets/icon-outlines/outline-refresh-small.svg';
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import CompanyProfile from './CompanyProfile';
import StockHistory from './StockHistory';
import styles from './StockPage.module.css';
import StockSummary from './StockSummary';

const StockPage = () => {
  const reloadStockInfo = () => {
    // TO DO: API wire up 
    window.location.reload();
  }

  // TO DO: API wire up
  const stockData: IStockInfo = {
    stockId: 0,
    symbol: 'GOOG',
    name: 'Alphabet Inc.',
    price: 214.21,
    change: -0.09,
    changePercent: 0.08,
    avgPrice: 252.40,
    profit: 203.10,
    profitPercent: 0.89,
    value: 2001.65,
    summary: {
      prevClose: 2848.3,
      open: 2843.84,
      bid: 0,
      bidSize: 900,
      ask: 0,
      askSize: 800,
      dayHigh: 2856.99,
      dayLow: 2832.74,
      fiftyTwoWeekHigh: 2936.41,
      fiftyTwoWeekLow: 1514.62,
      volume: 742496,
      avgVolume: 1064861,
      marketCap: 1899503288320,
      beta: 1.025925,
    }
  }

  const gainLossClass = (change: number): string => {
    if (change >= 0) {
      return styles.moneyGain;
    } else {
      return styles.moneyLoss;
    }
  }

  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      {/* <PortfolioListSummary></PortfolioListSummary> */}
      <div className={styles.stockHeader}>
        <h5 className={styles.stockName}>{stockData.name}</h5>
        <div className={styles.stockCode}>({stockData.symbol})</div>
      </div>
      <div className={styles.stockSummmary}>
        <div className={`${styles.stockPrice} outerStroke`}>{stockData.price}</div>
        <div
          className={`${styles.stockChange} ${gainLossClass(stockData.change)}`}
        >
          {stockData.change}
        </div>
        <div
          className={`${styles.stockPercChange} ${gainLossClass(stockData.change)}`}
        >
          ({stockData.changePercent})
        </div>
        <div className={styles.update}>
          <Button
            className={styles.updateButton}
            variant={'light'}
            onClick={reloadStockInfo}
          >
            <img
              src={refreshIcon}
              alt='refresh'
              style={{ opacity: 0.5 }}
            />
            Refresh
          </Button>
        </div>
      </div>
      <div className={styles.chartPlaceholder}>
        <h3>Chart Placeholder</h3>
      </div>
      <Tabs
        selectedIndex={activeTab}
        onSelect={idx => setActiveTab(idx)}
      >
        <TabList className={styles.tableBar}>
          <Tab
            className={`${activeTab === 0 ? styles.activeTab : styles.tabs}`}
          >
            Summary
          </Tab>
          <Tab
            className={`${activeTab === 1 ? styles.activeTab : styles.tabs}`}
          >
            Historical Data
          </Tab>
          <Tab
            className={`${activeTab === 2 ? styles.activeTab : styles.tabs}`}
          >
            Profile
          </Tab>
        </TabList>
        <TabPanel>
          <StockSummary {...stockData.summary} />
        </TabPanel>
        <TabPanel>
          <StockHistory />
        </TabPanel>
        <TabPanel>
          <CompanyProfile />
        </TabPanel>
      </Tabs>
    </>


  )
};

export default StockPage;