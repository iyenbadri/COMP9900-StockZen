import { arrayMoveImmutable } from 'array-move';
import orderDown from 'assets/icon-outlines/outline-chevron-down-small.svg';
import orderUp from 'assets/icon-outlines/outline-chevron-up-small.svg';
import plusIcon from 'assets/icon-outlines/outline-plus-circle.svg';
import axios from 'axios';
import { TopPerformerContext } from 'contexts/TopPerformerContext';
import { Ordering } from 'enums';
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  DropResult,
  ResponderProvided,
} from 'react-beautiful-dnd';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import styles from './PortfolioList.module.css';
import PortfolioListRow from './PortfolioListRow';
import PortfolioListSummary from './PortfolioListSummary';

interface IPortfolioResponse {
  id: number;
  ordering: undefined;
  portfolioName: string;
  stockCount: number;
  value: number;
  change: number;
  percChange: number;
  gain: number;
  percGain: number;
}

interface OrderingIndicatorProp {
  target: string;
  ordering: TableOrdering<string>;
}

type PortfolioColumn =
  | 'name'
  | 'marketValue'
  | 'totalGain'
  | 'change'
  | 'stockCount';

const OrderingIndicator: FC<OrderingIndicatorProp> = (props) => {
  const { target, ordering } = props;
  return (
    <>
      {target === ordering.column && (
        <img
          width={24}
          height={24}
          src={ordering.ordering === Ordering.Ascending ? orderUp : orderDown}
          alt='order-indicator'
        />
      )}
      {/* {target !== ordering.column && (
        <span
          style={{ display: 'inline-block', width: '24px', height: '24px' }}
        >
          &nbsp;
        </span>
      )} */}
    </>
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
  const [tableOrdering, setTableOrdering] = useState<
    TableOrdering<PortfolioColumn>
  >({
    column: '',
    ordering: Ordering.Unknown,
  });
  const [portfolios, _setPortfolios] = useState<IPortfolio[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const setPortfolios = useCallback(
    (
      portfolios: IPortfolio[],
      tableOrdering: TableOrdering<PortfolioColumn>
    ) => {
      if (tableOrdering.column === '') {
        portfolios = portfolios.sort((a, b) => a.ordering - b.ordering);
      } else {
        portfolios = portfolios.sort((a, b) => {
          if (tableOrdering.column !== '') {
            const keyA = a[tableOrdering.column] ?? 0;
            const keyB = b[tableOrdering.column] ?? 0;

            if (keyA > keyB) {
              return tableOrdering.ordering;
            } else if (keyB > keyA) {
              return -tableOrdering.ordering;
            } else {
              return a.ordering - b.ordering;
            }
          } else {
            return a.ordering - b.ordering;
          }
        });
      }

      _setPortfolios(portfolios);
    },
    [_setPortfolios]
  );

  const mapPortfolioList = useCallback(
    (portfolioList: IPortfolioResponse[]): IPortfolio[] => {
      return portfolioList.map((port: IPortfolioResponse) => ({
        draggableId: `portfolio-${port.id}`,
        ordering: port.ordering ?? Math.random(), // TODO: map to API response
        portfolioId: port.id,
        name: port.portfolioName,
        stockCount: port.stockCount,
        marketValue: port.value,
        change: port.change,
        changePercent: port.percChange,
        totalGain: port.gain,
        totalGainPercent: port.percGain,
      }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const reloadPortfolioList = useCallback(() => {
    axios.get('/portfolio/list').then((response) => {
      setPortfolios(mapPortfolioList(response.data), tableOrdering);
    });
  }, [tableOrdering, setPortfolios, mapPortfolioList]);

  useEffect(
    () => {
      setShowPortfolioSummary(false);
      reloadPortfolioList();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handlePortfolioRename = (portfolioId: number, name: string) => {
    axios.put(`/portfolio/${portfolioId}`, { newName: name }).then(() => {
      const newList = portfolios!.map((x) => ({
        ...x,
        name: x.portfolioId === portfolioId ? name : x.name,
      }));

      setPortfolios(newList, tableOrdering);
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
    axios.post('/portfolio', { portfolioName: newPortfolioName }).then(() => {
      setNewPortfolioName('');

      reloadPortfolioList();
    });

    setShowCreatePortfolioModal(false);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (result: DropResult, provided: ResponderProvided) => {
    setIsDragging(false);

    if (result.destination != null) {
      _setPortfolios((portfolios) => {
        const newList = arrayMoveImmutable(
          portfolios,
          result.source.index,
          result.destination!.index
        );

        for (let i = 0; i < newList.length; i++) {
          newList[i].ordering = i;
        }

        // TODO: Call API to reorder the list in the backend.

        return newList;
      });
      setTableOrdering({ column: '', ordering: Ordering.Unknown });
    }
  };

  const handleTempSort = (columnName: PortfolioColumn) => {
    setTableOrdering(
      (
        ordering: TableOrdering<PortfolioColumn>
      ): TableOrdering<PortfolioColumn> => {
        if (ordering.column === columnName) {
          switch (ordering.ordering) {
            case Ordering.Ascending:
              ordering = { ...ordering, ordering: Ordering.Descending };
              break;
            case Ordering.Descending:
              ordering = { column: '', ordering: Ordering.Unknown };
              break;
            default:
              ordering = { ...ordering, ordering: Ordering.Ascending };
              break;
          }
        } else {
          ordering = { column: columnName, ordering: Ordering.Ascending };
        }

        setPortfolios(portfolios, ordering);

        return ordering;
      }
    );
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
        <div className={styles.rowPortInfo}>
          <div className={styles.rowHandle}></div>
          <div className={styles.rowPortfolio}>
            <Button
              variant={'transparent'}
              size={'sm'}
              onClick={() => handleTempSort('name')}
            >
              Portfolio
            </Button>

            <OrderingIndicator
              target='name'
              ordering={tableOrdering}
            ></OrderingIndicator>
          </div>
          <div className={styles.rowEditButton}></div>

          <div className={styles.rowStocks}>
            <Button
              variant={'transparent'}
              size={'sm'}
              onClick={() => handleTempSort('stockCount')}
            >
              Stocks
            </Button>
            <OrderingIndicator
              target='stockCount'
              ordering={tableOrdering}
            ></OrderingIndicator>
          </div>

          <div className={styles.rowMarketValue}>
            <Button
              variant={'transparent'}
              size={'sm'}
              onClick={() => handleTempSort('marketValue')}
            >
              Market value
            </Button>
            <OrderingIndicator
              target='marketValue'
              ordering={tableOrdering}
            ></OrderingIndicator>
          </div>

          <div className={styles.rowChange}>
            <Button
              variant={'transparent'}
              size={'sm'}
              onClick={() => handleTempSort('change')}
            >
              Change
            </Button>
            <OrderingIndicator
              target='change'
              ordering={tableOrdering}
            ></OrderingIndicator>
          </div>

          <div className={styles.rowTotalGain}>
            <Button
              variant={'transparent'}
              size={'sm'}
              onClick={() => handleTempSort('totalGain')}
            >
              Total gain
            </Button>
            <OrderingIndicator
              target='totalGain'
              ordering={tableOrdering}
            ></OrderingIndicator>
          </div>
        </div>
        <div className={styles.rowDelete}></div>
      </div>

      <div
        className={`${isDragging ? styles.dragging : styles.notDragging} ${
          tableOrdering.column !== '' ? styles.tempSort : ''
        }`}
      >
        <DragDropContext
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          <Droppable droppableId='portfolio-list' type='portfolio'>
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {portfolios!.map((port, index) => (
                  <PortfolioListRow
                    key={port.portfolioId}
                    index={index}
                    port={port}
                    isTempSort={tableOrdering.column !== ''}
                    showDeleteModal={(portfolioId, name) => {
                      setDeletingPortfolioId(portfolioId);
                      setDeletingPortfolioName(name);
                      setShowDeletePortfolioModal(true);
                    }}
                    updatePortfolioName={handlePortfolioRename}
                  ></PortfolioListRow>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </>
  );
};

export default PortfolioList;
