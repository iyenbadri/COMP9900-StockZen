import crossIcon from 'assets/icon-outlines/outline-cross.svg';
import editIcon from 'assets/icon-outlines/outline-edit-1.svg';
import handleIcon from 'assets/icon-outlines/outline-menu-vertical.svg';
import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { Link, useRouteMatch } from 'react-router-dom';
import styles from './PortfolioList.module.css';
import PortfolioListSummary from './PortfolioListSummary';

const PortfolioList = () => {
  const { path } = useRouteMatch();
  const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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

  const [portfolios, setPortfolios] = useState([
    {
      name: 'My portfolio 1',
      id: 1,
      stocks: 3,
      marketValue: 29134.3,
      change: 403.1,
      changePercent: 0.59,
      totalGain: 1403.1,
      totalGainPercent: 11.7,
    },
    {
      name: 'My empty portfolio',
      id: 2,
      stocks: 0,
      marketValue: null,
      change: null,
      changePercent: null,
      totalGain: null,
      totalGainPercent: null,
    },
    {
      name: 'My portfolio 2',
      id: 3,
      stocks: 15,
      marketValue: 1902.31,
      change: -31.8,
      changePercent: -0.59,
      totalGain: -903.2,
      totalGainPercent: -1.7,
    },
  ]);

  return (
    <>
      <PortfolioListSummary></PortfolioListSummary>

      <div className={styles.tableToolbar}>
        <h5 className={styles.toolbarText}>My Portfolios</h5>
        <div className={styles.toolbarControls}>
          <Button variant={'light'}>Create a portfolio</Button>
        </div>
      </div>

      <div className={styles.tableHeader}>
        <span className={styles.rowPortInfo}>
          <span className={styles.rowHandle}></span>
          <span className={styles.rowPortfolio}>
            <Button variant={'light'} size={'sm'}>
              Portfolio
            </Button>
          </span>
          <span className={styles.rowStocks}>
            <Button variant={'light'} size={'sm'}>
              Stocks
            </Button>
          </span>
          <span className={styles.rowMargetValue}>
            <Button variant={'light'} size={'sm'}>
              Market value
            </Button>
          </span>
          <span className={styles.rowChange}>
            <Button variant={'light'} size={'sm'}>
              Change
            </Button>
          </span>
          <span className={styles.rowTotalGain}>
            <Button variant={'light'} size={'sm'}>
              Total gain
            </Button>
          </span>
        </span>
        <span className={styles.rowDelete}></span>
      </div>

      {portfolios.map((port, index) => {
        return (
          <div className={styles.tableRow} key={port.id}>
            <span className={styles.rowPortInfo}>
              <span className={styles.rowHandle}>
                <img src={handleIcon} alt='handle' />
              </span>
              <span className={styles.rowPortfolio}>
                <Link
                  to={`${path}/${port.id}`}
                  className={styles.rowPortfolioLink}
                >
                  {port.name}
                </Link>
                <Button
                  variant={'light'}
                  size={'sm'}
                  className={styles.editButton}
                >
                  <img src={editIcon} alt='edit' width={18} />
                </Button>
              </span>
              <span className={styles.rowStocks}>{port.stocks}</span>
              <span className={styles.rowMargetValue}>
                {port.marketValue == null
                  ? '-'
                  : usdFormatter.format(port.marketValue)}
              </span>
              <span
                className={`${styles.rowChange} ${gainLossClass(port.change)}`}
              >
                {port.change == null ? (
                  '-'
                ) : (
                  <>
                    <div className={styles.percent}>{port.changePercent}%</div>
                    <div>{usdFormatter.format(port.change)}</div>
                  </>
                )}
              </span>
              <span
                className={`${styles.rowTotalGain} ${gainLossClass(
                  port.totalGain
                )}`}
              >
                {port.totalGain == null ? (
                  '-'
                ) : (
                  <>
                    <div className={styles.percent}>
                      {port.totalGainPercent}%
                    </div>
                    <div>{usdFormatter.format(port.totalGain)}</div>
                  </>
                )}
              </span>
            </span>
            <span className={styles.rowDelete}>
              <Button variant={'light'} size={'sm'} className={'p-0'}>
                <img src={crossIcon} alt='cross' />
              </Button>
            </span>
          </div>
        );
      })}
    </>
  );
};

export default PortfolioList;
