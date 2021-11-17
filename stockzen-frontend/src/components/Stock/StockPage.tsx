import refreshIcon from 'assets/icon-outlines/outline-refresh-small.svg';
import loadSpinner from 'assets/load_spinner.svg';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Modal, Row } from 'react-bootstrap';
import { useHistory, useParams } from 'react-router-dom';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { intFormatter, numberFormatter } from 'utils/Utilities';
import CompanyProfile from './CompanyProfile';
import StockHistory from './StockHistory';
import styles from './StockPage.module.css';
import StockSummary from './StockSummary';

interface RouteParams {
  stockPageId: string;
}

// Display loading spinner while data is being fetched
const ShowSpinner = () => {
  return (
    <div className='text-center'>
      <img src={loadSpinner} alt='loading spinner' className={styles.spinner} />
    </div>
  );
};

// **************************************************************
// Component to display the stock page
// **************************************************************
const StockPage = (props: any) => {
  const { stockPageId } = useParams<RouteParams>();

  // Stock code and name passed to be displayed before retrieval of stock info
  const { code, name } = props.location.state;

  // States
  const [stockData, setStockData] = useState<IStockPageResponse>();
  const [chartData, setChartData] = useState<IStockHistoryResponse[]>([]);
  const [historyData, setHistoryData] = useState<IStockHistoryResponse[]>([]);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState(0);

  const history = useHistory();

  // Retrieve backend response data of stock summary and profile
  const getStockData = useCallback(async () => {
    setIsPageLoading(true);
    try {
      let stock = await axios.get(`/stock-page/${stockPageId}`);
      if (stock.status === 200) {
        setStockData(stock.data);
        setIsPageLoading(false);
      }
    } catch (e: any) {
      return;
    }
  }, [stockPageId, setStockData]);

  // Retrieve backend response data of history
  const getHistoryData = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      let history = await axios.get(`/stock-page/${stockPageId}/history`);
      if (history.status === 200) {
        setChartData(history.data);
        const data = [...history.data].reverse();
        setHistoryData(data);
        setIsHistoryLoading(false);
      }
    } catch (e: any) {
      setFetchError(true);
    }
  }, [stockPageId, setChartData, setHistoryData]);

  // Fetch stock related data again whenever stock or stock info changes
  useEffect(() => {
    getStockData();
    getHistoryData();
  }, [stockPageId, getStockData, getHistoryData]);

  // Get the className of the gain/loss
  const gainLossClass = (change: number): string => {
    if (change >= 0) {
      return styles.moneyGain;
    } else {
      return styles.moneyLoss;
    }
  };

  // Cutomise tooltip in stock chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active) {
      return (
        <div className={styles.tooltip}>
          <div className='text-center'>
            <div>
              <b>{label}</b>
            </div>
          </div>
          <Row className={styles.index}>
            <Col className={styles.indexTitle}>Open</Col>
            <Col className={styles.sep}>:</Col>
            <Col className={styles.indexValue}>
              {numberFormatter.format(payload[1].value)}
            </Col>
          </Row>
          <Row className={styles.index}>
            <Col className={styles.indexTitle}>Close</Col>
            <Col className={styles.sep}>:</Col>
            <Col className={styles.indexValue}>
              {numberFormatter.format(payload[0].value)}
            </Col>
          </Row>
          <Row className={styles.index}>
            <Col className={styles.indexTitle}>High</Col>
            <Col className={styles.sep}>:</Col>
            <Col className={styles.indexValue}>
              {numberFormatter.format(payload[2].value)}
            </Col>
          </Row>
          <Row className={styles.index}>
            <Col className={styles.indexTitle}>Low</Col>
            <Col className={styles.sep}>:</Col>
            <Col className={styles.indexValue}>
              {numberFormatter.format(payload[3].value)}
            </Col>
          </Row>
          <Row className={styles.index}>
            <Col className={styles.indexTitle}>Volume</Col>
            <Col className={styles.sep}>:</Col>
            <Col className={styles.indexValue}>
              {intFormatter.format(payload[4].value)}
            </Col>
          </Row>
        </div>
      );
    } else {
      return null;
    }
  };

  // Render
  return (
    <>
      <div className={styles.stockHeader}>
        <h5 className={styles.stockName}>{name}</h5>
        <div className={styles.stockCode}>({code})</div>
      </div>
      {/* Display spinner if data is being fetched */}
      {isPageLoading && (
        <div className={styles.stockWrapper}>
          <ShowSpinner />
        </div>
      )}
      {/* Display stock data if it is fetched without error */}
      {!isPageLoading && !fetchError && (
        <>
          <div className={styles.stockWrapper}>
            <div className={styles.stockSummmary}>
              {stockData?.price ? (
                <div>
                  <span className={`${styles.stockPrice} outerStroke`}>
                    ${numberFormatter.format(stockData.price)}
                  </span>
                  <span className={styles.stockCurrency}>USD</span>
                </div>
              ) : (
                ''
              )}
              <div
                className={`${styles.stockChange} ${stockData?.change ? gainLossClass(stockData?.change) : ''
                  }`}
              >
                {stockData?.change! > 0 ? '+' : ''}
                {stockData?.change
                  ? numberFormatter.format(stockData.change)
                  : ''}
              </div>
              <div
                className={`${styles.stockPercChange} ${stockData?.change ? gainLossClass(stockData?.change) : ''
                  }`}
              >
                {stockData?.percChange
                  ? `(${numberFormatter.format(stockData.percChange)}%)`
                  : ''}
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
            <div>
              {/* Stock Chart */}
              <ResponsiveContainer width='100%' height={240}>
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 50,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey='close'
                    tick={{ fontSize: 12 }}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type='monotone'
                    dataKey='close'
                    stroke={'#5bc0be'}
                    dot={false}
                  />
                  <Line
                    type='monotone'
                    dataKey='open'
                    strokeWidth={0}
                    dot={false}
                  />
                  <Line
                    type='monotone'
                    dataKey='high'
                    strokeWidth={0}
                    dot={false}
                  />
                  <Line
                    type='monotone'
                    dataKey='low'
                    strokeWidth={0}
                    dot={false}
                  />
                  <Line
                    type='monotone'
                    dataKey='volume'
                    strokeWidth={0}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
      {/* Tabs */}
      <Tabs selectedIndex={activeTab} onSelect={(idx) => setActiveTab(idx)}>
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
        {/* Show spinner in each tab until the data be retrieved */}
        <TabPanel>
          {isPageLoading && <ShowSpinner />}
          {!isPageLoading && <StockSummary {...stockData!}></StockSummary>}
        </TabPanel>
        <TabPanel>
          {isHistoryLoading && <ShowSpinner />}
          {!isHistoryLoading && (
            <div className={styles.historyTable}>
              <div className={styles.historyTitle}>
                <div className={styles.title}>Date</div>
                <div className={styles.title}>Open</div>
                <div className={styles.title}>High</div>
                <div className={styles.title}>Low</div>
                <div className={styles.title}>Close</div>
                <div className={styles.title}>Volume</div>
                <div></div>
              </div>
              {historyData!.map((history, index) => {
                return (
                  <StockHistory
                    key={history.date}
                    date={history.date}
                    open={history.open}
                    high={history.high}
                    low={history.low}
                    close={history.close}
                    volume={history.volume}
                  ></StockHistory>
                );
              })}
            </div>
          )}
        </TabPanel>
        <TabPanel>
          {isPageLoading && <ShowSpinner />}
          {!isPageLoading && <CompanyProfile {...stockData!} />}
        </TabPanel>
      </Tabs>
      {/* Display error message modal if data cannot be retrieved */}
      {fetchError && (
        <>
          <Modal
            show={fetchError}
            onHide={() => {
              setFetchError(false);
              history.goBack();
            }}
            className={styles.modalWrapper}
          >
            <Modal.Header className={`${styles.errormsg} my-0`} closeButton />
            <Modal.Body className={`${styles.errormsg} mt-0`}>
              <div className={'mt-0'}>
                <h4 className={'mb-1'}>Sorry.</h4>
                <div className={styles.msg}>
                  Data you required does not exist.
                  <br />
                </div>
              </div>
              <div className={'my-4'}>
                <Button
                  variant={'zen-4'}
                  onClick={(ev) => {
                    setFetchError(false);
                    history.goBack();
                  }}
                >
                  Go Back
                </Button>
              </div>
            </Modal.Body>
          </Modal>
        </>
      )}
    </>
  );
};

export default StockPage;
