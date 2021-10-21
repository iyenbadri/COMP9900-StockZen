import refreshIcon from 'assets/icon-outlines/outline-refresh-small.svg';
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import styles from './StockPage.module.css';

// interface Stockdata {
//   stockId: number;
//   symbol: string;
//   name: string;
//   price: number;
//   change: number;
//   changePercent: number;
//   averagePrice: number;
//   profit: number;
//   profitPercent: number;
//   value: number;
// }

const StockPage = () => {
  const reloadStockInfo = () => {
    // TO DO: API wireup 
    window.location.reload();
  }

  const gainLossClass = (change: number): string => {
    if (change >= 0) {
      return styles.moneyGain;
    } else {
      return styles.moneyLoss;
    }
  }

  const [activeTab, setActiveTab] = useState(0);

  const tabContents = (
    <Tabs>
      <TabList>
        <Tab>Summary</Tab>
        <Tab>Historical Data</Tab>
        <Tab>Profile</Tab>
      </TabList>

      <TabPanel>
        <h4>Summary Content</h4>
      </TabPanel>
      <TabPanel>
        <h4>Historical Data Content</h4>
      </TabPanel>
      <TabPanel>
        <h4>Company Related Content</h4>
      </TabPanel>
    </Tabs>
  );

  return (
    <>
      {/* <PortfolioListSummary></PortfolioListSummary> */}
      <div className={styles.stockHeader}>
        <h5 className={styles.stockName}>Alphabet Inc.</h5>
        <div className={styles.stockCode}>(GOOG)</div>
      </div>
      <div className={styles.stockSummmary}>
        <div className={`${styles.stockPrice} outerStroke`}> 2,823.66</div>
        <div
          className={`${styles.stockChange} ${gainLossClass(-0.09)}`}
        >
          -0.09
        </div>
        <div
          className={`${styles.stockPercChange} ${gainLossClass(-0.09)}`}
        >
          (0.08%)
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
          <h4>Summary Content</h4>
        </TabPanel>
        <TabPanel>
          <h4>Historical Data Content</h4>
        </TabPanel>
        <TabPanel>
          <h4>Company Related Content</h4>
        </TabPanel>
      </Tabs>
    </>


  )
};

export default StockPage;