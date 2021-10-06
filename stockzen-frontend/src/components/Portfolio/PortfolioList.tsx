import crossIcon from 'assets/icon-outlines/outline-cross.svg';
import editIcon from 'assets/icon-outlines/outline-edit-1.svg';
import handleIcon from 'assets/icon-outlines/outline-menu-vertical.svg';
import React, { FC, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Input from 'react-bootstrap/Input';
import { Link, useRouteMatch } from 'react-router-dom';
import styles from './PortfolioList.module.css';
import PortfolioListSummary from './PortfolioListSummary';
//import EditPortfolioName from './EditPortfolioName';

interface IPortfolioListRow {
  id: number;
  name: string;
  stocks: number;
  change: number | null;
  changePercent: number | null;
  marketValue: number | null;
  totalGain: number | null;
  totalGainPercent: number | null;
  updatePortfolioName?: (name: string) => void;
}

const PortfolioListRow: FC<IPortfolioListRow> = (prop) => {
  const { path } = useRouteMatch();
  const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const [isEditingName, setIsEditingName] = useState<boolean>(false);

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
      <span className={styles.rowPortInfo}>
        <span className={styles.rowHandle}>
          <img src={handleIcon} alt='handle' />
        </span>
        <span className={styles.rowPortfolio}>
          {isEditingName ? (
            <Input value={prop.name} onBlur={(ev: React.FocusEvent<HTMLInputElement>)=>{prop.updatePortfolioName?(ev.target.value)}} />
          ) : (
            <Link to={`${path}/${prop.id}`} className={styles.rowPortfolioLink}>
              {prop.name}
            </Link>
          )}

          <button className={`${styles.editButton} p-0`}>
            <img src={editIcon} alt='edit' width={18} />
          </button>
        </span>
        <span className={styles.rowStocks}>{prop.stocks}</span>
        <span className={styles.rowMargetValue}>
          {prop.marketValue == null
            ? '-'
            : usdFormatter.format(prop.marketValue)}
        </span>
        <span className={`${styles.rowChange} ${gainLossClass(prop.change)}`}>
          {prop.change == null ? (
            '-'
          ) : (
            <>
              <div className={styles.percent}>{prop.changePercent}%</div>
              <div>{usdFormatter.format(prop.change)}</div>
            </>
          )}
        </span>
        <span
          className={`${styles.rowTotalGain} ${gainLossClass(prop.totalGain)}`}
        >
          {prop.totalGain == null ? (
            '-'
          ) : (
            <>
              <div className={styles.percent}>{prop.totalGainPercent}%</div>
              <div>{usdFormatter.format(prop.totalGain)}</div>
            </>
          )}
        </span>
      </span>
      <span className={styles.rowDelete}>
        <button className={`p-0 ${styles.deleteButton}`}>
          <img src={crossIcon} alt='cross' />
        </button>
      </span>
    </div>
  );
};

const PortfolioList = () => {
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

  // TODO: https://github.com/unsw-cse-comp3900-9900-21T3/capstone-project-9900-h18c-codependent/pull/17/files#r723117690
  // Will have to remove styles from the table header buttons.

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
        return <PortfolioListRow key={port.id} {...port}></PortfolioListRow>;
      })}
    </>
  );
};

export default PortfolioList;
