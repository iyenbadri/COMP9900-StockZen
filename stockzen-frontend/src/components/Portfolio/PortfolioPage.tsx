import refreshIcon from 'assets/icon-outlines/outline-refresh-small.svg';
import axios from 'axios';
import { PortfolioContext } from 'contexts/PortfolioContext';
import { RefreshContext } from 'contexts/RefreshContext';
import { TopPerformerContext } from 'contexts/TopPerformerContext';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useParams } from 'react-router-dom';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import AddStock from './AddStock';
import styles from './PortfolioPage.module.css';
import StockFundamental from './PortfolioPageFundamental';
import MyHoldings from './PortfolioPageHoldings';
import PortfolioPageSummary from './PortfolioPageSummary';

interface RouteRarams {
  portfolioId: string;
}

const PortfolioPage = () => {
  const { portfolioId } = useParams<RouteRarams>();

  // Get the setShowPortfolioSummary from TopPerformerContext
  const { setShowPortfolioSummary } = useContext(TopPerformerContext);

  // Get functions for refresh
  const { subscribe, unsubscribe, refresh } = useContext(RefreshContext);

  const {
    deleteStockModal,
    stopShowDeleteStockModal,
    deletingStockId,
    deletingStockName,
    stocks,
    stockInfo,
    mapStockList,
    setStocks,
    setStockInfo,
    mapStockInfoList,
    holdingsTableOrdering,
    infoTableOrdering
  } = useContext(PortfolioContext);

  const [activeTab, setActiveTab] = useState(0);

  // A function to load the stocks list
  const reloadStockList = useCallback(
    (forceRefresh: boolean) => {
      // Call the API
      axios
        .get(`/stock/list/${portfolioId}?refresh=${forceRefresh ? '1' : '0'}`)
        .then((response) => {
          // Map the response and then set it.
          console.log(response.data);
          setStocks(mapStockList(response.data), holdingsTableOrdering);
          setStockInfo(mapStockInfoList(response.data), infoTableOrdering);
          console.log(stocks);
          console.log(stockInfo);
        });
    },
    [portfolioId, setStocks, mapStockList, setStockInfo, mapStockInfoList,
      holdingsTableOrdering, infoTableOrdering]
  );

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
    stopShowDeleteStockModal();

    axios.delete(`/stock/${deletingStockId}`).then(() => {
      reloadStockList(false);
    });
  };

  return (
    <>
      <Modal
        show={deleteStockModal}
        onHide={() => stopShowDeleteStockModal()}
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
            onClick={(ev) => stopShowDeleteStockModal()}
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
          <MyHoldings />
        </TabPanel>
        <TabPanel>
          <StockFundamental />
        </TabPanel>
      </Tabs>
    </>
  );
};

export default PortfolioPage;
