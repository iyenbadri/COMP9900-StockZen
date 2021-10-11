import crossIcon from 'assets/icon-outlines/outline-cross.svg';
import editIcon from 'assets/icon-outlines/outline-edit-1.svg';
import handleIcon from 'assets/icon-outlines/outline-menu-vertical.svg';
import axios from 'axios';
import { TopPerformerContext } from 'contexts/TopPerformerContext';
import React, { FC, useContext, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Col from 'react-bootstrap/Col';
import { Link, useRouteMatch } from 'react-router-dom';
import styles from './PortfolioList.module.css';
import PortfolioListSummary from './PortfolioListSummary';

interface IPortfolioResponse {
  id: number;
  portfolioName: string;
  stockCount: number;
  value: number;
  change: number;
  percChange: number;
  gain: number;
  percGain: number;
}

interface IPortfolio {
  portfolioId: number;
  name: string;
  stock_count: number;
  change: number | null;
  changePercent: number | null;
  marketValue: number | null;
  totalGain: number | null;
  totalGainPercent: number | null;
}

interface IPortfolioListRow extends IPortfolio {
  updatePortfolioName?: (id: number, name: string) => void;
  showDeleteModal?: (id: number, name: string) => void;
}

const PortfolioListRow: FC<IPortfolioListRow> = (prop) => {
  const { path } = useRouteMatch();
  const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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
        prop.updatePortfolioName(prop.portfolioId, portfolioName);
      }
    }
    setIsEditingName(false);
  };

  return (
    <div className={styles.tableRow}>
      <span className={styles.rowPortInfo}>
        <span className={styles.rowHandle}>
          <img src={handleIcon} alt='handle' />
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
            <Link
              to={`${path}/${prop.portfolioId}`}
              className={styles.rowPortfolioLink}
            >
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
              prop.showDeleteModal(prop.portfolioId, prop.name);
            }
          }}
        >
          <img src={crossIcon} alt='cross' />
        </button>
      </span>
    </div>
  );
};

const PortfolioList = () => {
  const { setShowPortfolioSummary } = useContext(TopPerformerContext);

  const [deletingPortfolioName, setDeletingPortfolioName] =
    useState<string>('');
  const [deletingPortfolioId, setDeletingPortfolioId] = useState<number>();
  const [showDeletePortfolioModal, setShowDeletePortfolioModal] =
    useState<boolean>(false);
  const [showCreatePortfolioModal, setShowCreatePortfolioModal] =
    useState<boolean>(false);

  const mapPortfolioList = (
    portfolioList: IPortfolioResponse[]
  ): IPortfolio[] => {
    return portfolioList.map((x: IPortfolioResponse) => ({
      portfolioId: x.id,
      name: x.portfolioName,
      stock_count: x.stockCount,
      marketValue: x.value,
      change: x.change,
      changePercent: x.percChange,
      totalGain: x.gain,
      totalGainPercent: x.percGain,
    }));
  };

  const [portfolios, setPortfolios] = useState<IPortfolio[]>([]);

  const reloadPortfolioList = () => {
    axios.get('/portfolio/list').then((response) => {
      // const mockData: IPortfolio[] = [
      //   {
      //     name: 'My portfolio 1',
      //     portfolioId: -1,
      //     stock_count: 3,
      //     marketValue: 29134.3,
      //     change: 403.1,
      //     changePercent: 0.59,
      //     totalGain: 1403.1,
      //     totalGainPercent: 11.7,
      //   },
      //   {
      //     name: 'My empty portfolio',
      //     portfolioId: -2,
      //     stock_count: 0,
      //     marketValue: null,
      //     change: null,
      //     changePercent: null,
      //     totalGain: null,
      //     totalGainPercent: null,
      //   },
      //   {
      //     name: 'My portfolio 2',
      //     portfolioId: -3,
      //     stock_count: 15,
      //     marketValue: 1902.31,
      //     change: -31.8,
      //     changePercent: -0.59,
      //     totalGain: -903.2,
      //     totalGainPercent: -1.7,
      //   },
      // ];

      // setPortfolios([...mockData, ...mapPortfolioList(response.data)]);

      setPortfolios(mapPortfolioList(response.data));
    });
  };

  useEffect(() => {
    setShowPortfolioSummary(false);
    reloadPortfolioList();
  }, []);

  const handlePortfolioRename = (portfolioId: number, name: string) => {
    axios.put(`/portfolio/${portfolioId}`, { newName: name }).then(() => {
      setPortfolios(
        portfolios!.map((x) => {
          return {
            ...x,
            name: x.portfolioId === portfolioId ? name : x.name,
          };
        })
      );
    });
  };

  const handlePortfolioDelete = () => {
    setShowDeletePortfolioModal(false);

    axios.delete(`/portfolio/${deletingPortfolioId}`).then(() => {
      reloadPortfolioList();
    });
  };

  // Add new portfolio to the PortfolioList
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const createPortfolio = (ev: any) => {
    ev.preventDefault();
    // let portfolioID = portfolios.length + 1;
    // let newPortfolio = {
    //   name: newPortfolioName,
    //   portfolioId: portfolioID,
    //   stockCount: 0,
    //   marketValue: null,
    //   change: null,
    //   changePercent: null,
    //   totalGain: null,
    //   totalGainPercent: null,
    // };
    // setPortfolios([...portfolios, newPortfolio]);
    axios.post('/portfolio', { portfolioName: newPortfolioName }).then(() => {
      setNewPortfolioName('');

      reloadPortfolioList();
    });

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
          <Button variant={'danger'} onClick={handlePortfolioDelete}>
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
            variant={'light'}
            onClick={() => setShowCreatePortfolioModal(true)}
          >
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

      {portfolios!.map((port, index) => {
        return (
          <PortfolioListRow
            key={port.portfolioId}
            {...port}
            showDeleteModal={(portfolioId, name) => {
              setDeletingPortfolioId(portfolioId);
              setDeletingPortfolioName(name);
              setShowDeletePortfolioModal(true);
            }}
            updatePortfolioName={handlePortfolioRename}
          ></PortfolioListRow>
        );
      })}
    </>
  );
};

export default PortfolioList;
