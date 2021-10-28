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

  const numberFomatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })

  // TO DO: API wire up
  const stockData: IStockPageResponse = {
    id: 0,
    code: 'GOOG',
    stockName: 'Alphabet Inc.',
    exchange: '-',
    price: 214.21,
    change: -0.09,
    percChange: 0.08,
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
    longName: 'Alphabet Inc.',
    industry: 'Internet Content & Information',
    sector: 'Communication Services',
    website: 'http://www.abc.xyz',
    longBusinessSummary: "Alphabet Inc. provides online advertising services in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. The company offers performance and brand advertising services. It operates through Google Services, Google Cloud, and Other Bets segments. The Google Services segment provides products and services, such as ads, Android, Chrome, hardware, Google Maps, Google Play, Search, and YouTube, as well as technical infrastructure; and digital content. The Google Cloud segment offers infrastructure and data analytics platforms, collaboration tools, and other services for enterprise customers. The Other Bets segment sells internet and TV services, as well as licensing and research and development services. The company was founded in 1998 and is headquartered in Mountain View, California.",
    prediction: 0,
    confidence: 0
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
        <h5 className={styles.stockName}>{stockData.stockName}</h5>
        <div className={styles.stockCode}>({stockData.code})</div>
      </div>
      <div className={styles.stockSummmary}>
        <div className={`${styles.stockPrice} outerStroke`}>{numberFomatter.format(stockData.price)}</div>
        <div
          className={`${styles.stockChange} ${gainLossClass(stockData.change)}`}
        >
          {numberFomatter.format(stockData.change)}
        </div>
        <div
          className={`${styles.stockPercChange} ${gainLossClass(stockData.change)}`}
        >
          ({numberFomatter.format(stockData.percChange)})
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
          <StockSummary {...stockData} />
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