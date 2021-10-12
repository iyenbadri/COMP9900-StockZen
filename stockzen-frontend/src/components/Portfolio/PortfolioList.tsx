import crossIcon from 'assets/icon-outlines/outline-cross.svg';
import handleIcon from 'assets/icon-outlines/outline-drag-handle.svg';
import editIcon from 'assets/icon-outlines/outline-edit-1.svg';
import plusIcon from 'assets/icon-outlines/outline-plus-circle.svg';
import axios from 'axios';
import { TopPerformanceContext } from 'contexts/TopPerformerContext';
import React, { FC, useContext, useEffect, useState } from 'react';
import { Button, Col, Form, Modal } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import { usdFormatter } from 'utils/Utilities';
import styles from './PortfolioList.module.css';
import PortfolioListSummary from './PortfolioListSummary';

interface IPortfolioListRow {
  id: number;
  name: string;
  stock_count: number;
  change: number | null;
  changePercent: number | null;
  marketValue: number | null;
  totalGain: number | null;
  totalGainPercent: number | null;
  updatePortfolioName?: (id: number, name: string) => void;
  showDeleteModal?: (id: number, name: string) => void;
}

const PortfolioListRow: FC<IPortfolioListRow> = (prop) => {
  const { path } = useRouteMatch();

  const { setShowPortfolioSummary } = useContext(TopPerformanceContext);

  useEffect(() => {
    setShowPortfolioSummary(false);
  });

  const [portfolioName, setPortfolioName] = useState<string>(prop.name);
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

  const updatePortfolioName = () => {
    if (prop.updatePortfolioName != null) {
      if (portfolioName.length > 0 && portfolioName.length <= 50) {
        prop.updatePortfolioName(prop.id, portfolioName);
      }
    }
    setIsEditingName(false);
  };

  return (
    <div className={styles.tableRow}>
      <span className={styles.rowPortInfo}>
        <span className={styles.rowHandle}>
          <img src={handleIcon} alt='handle' className={styles.dragHandle} />
        </span>
        <span className={styles.rowPortfolio}>
          {isEditingName ? (
            <Form.Control
              value={portfolioName}
              style={{ width: '100%', padding: 0 }}
              autoFocus
              maxLength={50}
              onChange={(ev) => {
                setPortfolioName(ev.target.value);
              }}
              onBlur={updatePortfolioName}
              onKeyDown={(ev) => {
                console.log(ev.key);
                switch (ev.key) {
                  case 'Enter':
                    updatePortfolioName();
                    break;
                  case 'Escape':
                    setIsEditingName(false);
                    break;
                }
              }}
            />
          ) : (
            <Link to={`${path}/${prop.id}`} className={styles.rowPortfolioLink}>
              {prop.name}
            </Link>
          )}
        </span>
        <span className={styles.rowEditButton}>
          <button
            type='button'
            className={`${styles.editButton} p-0`}
            onClick={(ev) => {
              setIsEditingName(true);
            }}
          >
            <img src={editIcon} alt='edit' width={18} />
          </button>
        </span>
        <span className={styles.rowStocks}>{prop.stock_count}</span>
        <span className={styles.rowMarketValue}>
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
        <button
          className={`p-0 ${styles.deleteButton}`}
          onClick={() => {
            if (prop.showDeleteModal != null) {
              prop.showDeleteModal(prop.id, prop.name);
            }
          }}
        >
          <img src={crossIcon} alt='cross' width={20} />
        </button>
      </span>
    </div>
  );
};

const PortfolioList = () => {
  const [deletingPortfolioName, setDeletingPortfolioName] =
    useState<string>('');
  const [deletingPortfolioId, setDeletingPortfolioId] = useState<number>();
  const [showDeletePortfolioModal, setShowDeletePortfolioModal] =
    useState<boolean>(false);
  const [showCreatePortfolioModal, setShowCreatePortfolioModal] =
    useState<boolean>(false);

  // Fetch from /portfolio/list
  const [portfolios, setPortfolios] = useState([
    {
      name: 'My portfolio 1',
      id: 1,
      stock_count: 3,
      marketValue: 29134.3,
      change: 403.1,
      changePercent: 0.59,
      totalGain: 1403.1,
      totalGainPercent: 11.7,
    },
    {
      name: 'My empty portfolio',
      id: 2,
      stock_count: 0,
      marketValue: null,
      change: null,
      changePercent: null,
      totalGain: null,
      totalGainPercent: null,
    },
    {
      name: 'My portfolio 2',
      id: 3,
      stock_count: 15,
      marketValue: 1902.31,
      change: -31.8,
      changePercent: -0.59,
      totalGain: -903.2,
      totalGainPercent: -1.7,
    },
  ]);

  // Add new portfolio to the PortfolioList
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const createPortfolio = (ev: any) => {
    ev.preventDefault();
    let portfolioID = portfolios.length + 1;
    let newPortfolio = {
      name: newPortfolioName,
      id: portfolioID,
      stock_count: 0,
      marketValue: null,
      change: null,
      changePercent: null,
      totalGain: null,
      totalGainPercent: null,
    };
    setPortfolios([...portfolios, newPortfolio]);
    axios.post('/portfolio', { portfolioName: newPortfolioName });
    setNewPortfolioName('');
    setShowCreatePortfolioModal(false);
  };

  // TODO: https://github.com/unsw-cse-comp3900-9900-21T3/capstone-project-9900-h18c-codependent/pull/17/files#r723117690
  // Will have to remove styles from the table header buttons.

  return (
    <>
      <Modal
        show={showDeletePortfolioModal}
        onHide={() => setShowDeletePortfolioModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete portfolio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Do you want to delete portfolio {deletingPortfolioName}?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant={'danger'}
            onClick={(ev) => {
              // TODO: Call backend to delete the portfolio here.
              setPortfolios(
                portfolios.filter((x) => x.id !== deletingPortfolioId)
              );
              setShowDeletePortfolioModal(false);
            }}
          >
            Yes
          </Button>
          <Button
            variant={'secondary'}
            onClick={(ev) => setShowDeletePortfolioModal(false)}
          >
            No
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showCreatePortfolioModal}
        onHide={() => setShowCreatePortfolioModal(false)}
        className={styles.modalWapper}
      >
        <Modal.Header closeButton>
          <Modal.Title className={styles.modalTitle}>
            Create portfolio
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={createPortfolio}>
          <Modal.Body>
            Please enter a name of portfolio to create.
            <Form.Control
              value={newPortfolioName}
              type='text'
              placeholder='Portfolio name'
              className={`my-2 ${styles.rowPortfolio}`}
              style={{ width: '70%', margin: '0 auto' }}
              maxLength={50}
              onChange={(ev) => setNewPortfolioName(ev.target.value)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Col xs={12}>
              <Button type='submit' variant={'zen-4'}>
                Create
              </Button>{' '}
              <Button
                variant={'secondary'}
                onClick={(ev) => setShowCreatePortfolioModal(false)}
              >
                Cancel
              </Button>
            </Col>
          </Modal.Footer>
        </Form>
      </Modal>
      <PortfolioListSummary></PortfolioListSummary>

      <div className={styles.tableToolbar}>
        <h5 className={styles.toolbarText}>My Portfolios</h5>
        <div className={styles.toolbarControls}>
          <Button
            className={styles.toolbarCreateButton}
            variant={'light'}
            onClick={() => setShowCreatePortfolioModal(true)}
          >
            <img
              src={plusIcon}
              alt='plus icon'
              className={styles.toolbarPlusIcon}
            />
            Create a portfolio
          </Button>
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
          <span className={styles.rowEditButton}></span>
          <span className={styles.rowStocks}>
            <Button variant={'light'} size={'sm'}>
              Stocks
            </Button>
          </span>
          <span className={styles.rowMarketValue}>
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
          <PortfolioListRow
            key={port.id}
            {...port}
            showDeleteModal={(id, name) => {
              setDeletingPortfolioId(id);
              setDeletingPortfolioName(name);
              setShowDeletePortfolioModal(true);
            }}
            updatePortfolioName={(id, name) => {
              // TODO: Call backend to rename the portfolio here.
              setPortfolios(
                portfolios.map((x) => {
                  return {
                    ...x,
                    name: x.id === id ? name : x.name,
                  };
                })
              );
            }}
          ></PortfolioListRow>
        );
      })}
    </>
  );
};

export default PortfolioList;
