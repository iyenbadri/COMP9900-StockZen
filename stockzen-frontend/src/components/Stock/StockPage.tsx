import refreshIcon from 'assets/icon-outlines/outline-refresh-small.svg';
import axios from 'axios';
import { TopPerformerContext } from 'contexts/TopPerformerContext';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useHistory, useParams } from 'react-router-dom';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import CompanyProfile from './CompanyProfile';
import StockHistory from './StockHistory';
import styles from './StockPage.module.css';
import StockSummary from './StockSummary';

interface RouteParams {
  stockPageId: string;
}

const StockPage = () => {
  const reloadStockInfo = () => {
    // TO DO: API wire up 
    window.location.reload();
  }

  const { stockPageId } = useParams<RouteParams>();

  const { setShowPortfolioSummary } = useContext(TopPerformerContext);

  const [stockData, setStockData] = useState<IStockPageResponse>();

  const [loading, setLoading] = useState<boolean>(true);

  const [fetchError, setFetchError] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState(0);

  const history = useHistory();

  // Retrieve backend response data
  const getStockData = useCallback(async () => {
    try {
      let res = await axios.get(`/stock-page/${stockPageId}`);
      if (res.status === 200) {
        setStockData(res.data);
        setLoading(false);
      }
    } catch (e: any) {
      setFetchError(true);
    }
  }, [setStockData]
  );

  useEffect(
    () => {
      getStockData();
    },
    []
  );

  const gainLossClass = (change: number): string => {
    if (change >= 0) {
      return styles.moneyGain;
    } else {
      return styles.moneyLoss;
    }
  }

  if (!(loading)) {
    return (
      <>
        {/* <PortfolioListSummary></PortfolioListSummary> */}
        <div className={styles.stockHeader}>
          <h5 className={styles.stockName}>{stockData?.stockName}</h5>
          <div className={styles.stockCode}>({stockData?.code})</div>
        </div>
        <div className={styles.stockSummmary}>
          <div className={`${styles.stockPrice} outerStroke`}>{stockData?.price}</div>
          <div
            className={`${styles.stockChange} ${stockData?.change ? gainLossClass(stockData?.change) : ''}`}
          >
            {stockData?.change}
          </div>
          <div
            className={`${styles.stockPercChange} ${stockData?.change ? gainLossClass(stockData?.change) : ''}`}
          >
            ({stockData?.percChange})
          </div>
          <div className={styles.update}>
            <Button
              className={styles.updateButton}
              variant={'light'}
              onClick={getStockData}
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
            <StockSummary
              {...stockData!}
            ></StockSummary>
          </TabPanel>
          <TabPanel>
            <StockHistory />
          </TabPanel>
          <TabPanel>
            <CompanyProfile {...stockData!}
            ></CompanyProfile>
          </TabPanel>
        </Tabs>
      </>
    )
  } else if (!(fetchError)) {
    return (
      <>
        <Modal
          show={loading}
          onHide={() => setLoading(false)}
          className={styles.modalWrapper}
        >
          <Modal.Body>
            Loading Data... Please wait
          </Modal.Body>
        </Modal>
      </>
    )
  } else {
    return (
      <>
        <Modal
          show={fetchError}
          onHide={() => setFetchError(false)}
          className={styles.modalWrapper}
        >
          <Modal.Body>
            <div className={'mt-3'}>
              Sorry. Data you required does not exist.<br />
            </div>
            <div className={'my-3'}>
              <Button
                variant={'zen-4'}
                onClick={(ev) => {
                  setFetchError(false)
                  history.goBack();
                }}
              >
                Go Back
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </>
    )
  }
};

export default StockPage;