import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Link, useRouteMatch } from 'react-router-dom';
import styles from './PortfolioList.module.css';
import PortfolioListSummary from './PortfolioListSummary';

const PortfolioList = () => {
  const { path } = useRouteMatch();
  const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const [portfolios, setPortfolios] = useState([
    {
      name: 'My portfolio 1',
      id: 1,
      stocks: 3,
      marketValue: 29134.3,
      change: 403.1,
      totalGain: 1403.1,
    },
    {
      name: 'My empty portfolio',
      id: 2,
      stocks: 0,
      marketValue: null,
      change: null,
      totalGain: null,
    },
    {
      name: 'My portfolio 2',
      id: 3,
      stocks: 15,
      marketValue: 1902.31,
      change: -31.8,
      totalGain: -903.2,
    },
  ]);

  return (
    <>
      <PortfolioListSummary></PortfolioListSummary>

      <Row>
        <Col>
          <h3>My Portfolios</h3>
        </Col>
        <Col className='text-end'>
          <Button variant={'light'}>Create a portfolio</Button>
        </Col>
      </Row>

      <table className={styles.portfolioTable}>
        <thead>
          <tr>
            <th></th>
            <th className={styles.rowPortfolio}>
              <Button variant={'light'} size={'sm'}>
                Portfolio
              </Button>
            </th>
            <th className={styles.rowStocks}>
              <Button variant={'light'} size={'sm'}>
                Stocks
              </Button>
            </th>
            <th className={styles.rowMargetValue}>
              <Button variant={'light'} size={'sm'}>
                Market value
              </Button>
            </th>
            <th className={styles.rowChange}>
              <Button variant={'light'} size={'sm'}>
                Change
              </Button>
            </th>
            <th className={styles.rowTotalGain}>
              <Button variant={'light'} size={'sm'}>
                Total gain
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {portfolios.map((port, index) => {
            return (
              <tr className={styles.tableRow} key={port.id}>
                <td className={styles.rowHandle}></td>
                <td>
                  <Link
                    to={`${path}/${port.id}`}
                    className={styles.rowPortfolio}
                  >
                    {port.name}
                  </Link>
                </td>
                <td className={styles.rowStocks}>{port.stocks}</td>
                <td className={styles.rowMargetValue}>
                  {port.marketValue == null
                    ? '-'
                    : usdFormatter.format(port.marketValue)}
                </td>
                <td className={styles.rowChange}>
                  {port.change == null ? '-' : usdFormatter.format(port.change)}
                </td>
                <td className={styles.rowTotalGain}>
                  {port.totalGain == null
                    ? '-'
                    : usdFormatter.format(port.totalGain)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default PortfolioList;
