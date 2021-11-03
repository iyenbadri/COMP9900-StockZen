import { arrayMoveImmutable } from 'array-move';
import orderDown from 'assets/icon-outlines/outline-chevron-down-small.svg';
import orderUp from 'assets/icon-outlines/outline-chevron-up-small.svg';
import plusIcon from 'assets/icon-outlines/outline-plus-circle.svg';
import refreshIcon from 'assets/icon-outlines/outline-refresh-small.svg';
import axios from 'axios';
import { TopPerformerContext } from 'contexts/TopPerformerContext';
import { RefreshContext } from 'contexts/RefreshContext';
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

// Define posible sort columns
type PortfolioColumn =
  | 'name'
  | 'marketValue'
  | 'totalGain'
  | 'change'
  | 'stockCount';

const OrderingIndicator: FC<OrderingIndicatorProp> = (props) => {
  // Extract the parameter from properties
  // target is the current column
  // ordering is the sorting parameter (how is it sorting now)
  const { target, ordering } = props;

  return (
    <>
      {/* Show if the sorting column is the same as current column */}
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
  // Get the setShowPortfolioSummary from context
  const { setShowPortfolioSummary } = useContext(TopPerformerContext);

  const { subscribe, unsubscribe, refresh } = useContext(RefreshContext);

  // States for delete a portfolio. name, id, showModel
  const [deletingPortfolioName, setDeletingPortfolioName] =
    useState<string>('');
  const [deletingPortfolioId, setDeletingPortfolioId] = useState<number>();
  const [showDeletePortfolioModal, setShowDeletePortfolioModal] =
    useState<boolean>(false);

  // States for create portfolio
  const [showCreatePortfolioModal, setShowCreatePortfolioModal] =
    useState<boolean>(false);

  // State for sorting.
  const [tableOrdering, setTableOrdering] = useState<
    TableOrdering<PortfolioColumn>
  >({
    column: '',
    ordering: Ordering.Unknown,
  });

  // List of portfolios
  const [portfolios, _setPortfolios] = useState<IPortfolio[]>([]);

  // State of dnd (to disable hightlight)
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Function to set the portfolio list
  // The list need to be sorted before it set.
  const setPortfolios = useCallback(
    (
      portfolios: IPortfolio[],
      tableOrdering: TableOrdering<PortfolioColumn>
    ) => {
      if (tableOrdering.column === '') {
        // If there is no sorting then sort the port by its `order`

        portfolios = portfolios.sort((a, b) => a.ordering - b.ordering);
      } else {
        // Else sort by the value of the column

        portfolios = portfolios.sort((a, b) => {
          if (tableOrdering.column !== '') {
            // This if to remove the TS complain

            // Read the column value
            const keyA = a[tableOrdering.column] ?? 0;
            const keyB = b[tableOrdering.column] ?? 0;

            // Compare the value and then return it
            if (keyA > keyB) {
              // Return the comparison order.
              // 1 mean A is higher than B, -1 mean A is lower than B, 0 if equals.

              // Return the value of ordering
              return tableOrdering.ordering;
            } else if (keyB > keyA) {
              // Return the opposite of it.
              return -tableOrdering.ordering;
            } else {
              // Sort by the `order` if the value in column is the same.
              return a.ordering - b.ordering;
            }
          } else {
            // Default the sorting by its `order`

            return a.ordering - b.ordering;
          }
        });
      }

      // Set the sorted portfolios
      _setPortfolios(portfolios);
    },
    [_setPortfolios]
  );

  // a function to map response from backend to pattern in frontend.
  // useCallback is used to speed up it a bit.
  const mapPortfolioList = useCallback(
    (portfolioList: IPortfolioResponse[]): IPortfolio[] => {
      return portfolioList.map((port: IPortfolioResponse) => ({
        draggableId: `portfolio-${port.id}`,
        ordering: port.order,
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

  // Define a function to reload the portfolio list from backend.
  const reloadPortfolioList = useCallback(() => {
    // API call
    axios.get('/portfolio/list').then((response) => {
      // Map the result and then set it to state.
      setPortfolios(mapPortfolioList(response.data), tableOrdering);
    });
  }, [tableOrdering, setPortfolios, mapPortfolioList]);

  // An init function
  useEffect(
    () => {
      // Hide the summary in the top performer widget.
      setShowPortfolioSummary(false);

      // Load the portfolio list
      reloadPortfolioList();

      const refresh = () => {
        reloadPortfolioList();
      };

      subscribe(refresh);

      return () => {
        unsubscribe(refresh);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Handler of portfolio renmae
  const handlePortfolioRename = (portfolioId: number, name: string) => {
    // Api call
    axios.put(`/portfolio/${portfolioId}`, { newName: name }).then(() => {
      // Update the portfolio name if portfolioId is matched,
      const newList = portfolios!.map((x) => ({
        ...x,
        name: x.portfolioId === portfolioId ? name : x.name,
      }));

      // Set the portfolio list.
      setPortfolios(newList, tableOrdering);
    });
  };

  // Handler of portfolio delete
  const handlePortfolioDelete = () => {
    // Hide the portfolio delete modal
    setShowDeletePortfolioModal(false);

    // Call the API
    axios.delete(`/portfolio/${deletingPortfolioId}`).then(() => {
      // Reload the portfolio list
      reloadPortfolioList();
    });
  };

  // Add new portfolio to the PortfolioList
  const [newPortfolioName, setNewPortfolioName] = useState('');

  // Handler of portfolio creation
  const createPortfolio = (ev: any) => {
    ev.preventDefault();

    // Call the API
    axios.post('/portfolio', { portfolioName: newPortfolioName }).then(() => {
      // Clear the portfolio name from modal.
      setNewPortfolioName('');

      // Reload the portfolio list
      reloadPortfolioList();
    });

    // Hide the modal
    setShowCreatePortfolioModal(false);
  };

  // Handler of drag start
  // It set te dragging state to true.
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Handler of drag end
  const handleDragEnd = (result: DropResult, provided: ResponderProvided) => {
    // Set dragging to false
    setIsDragging(false);

    // Check if it dropped in the list. Do nothing if it is dropped outside
    if (result.destination != null) {
      // Call to update the list
      _setPortfolios((portfolios) => {
        // Move item from source to desctinamte (according to where it's moved)
        const newList = arrayMoveImmutable(
          portfolios,
          result.source.index,
          result.destination!.index
        );

        // Update the `order` of portfolio
        for (let i = 0; i < newList.length; i++) {
          newList[i].ordering = i;
        }

        // Call API to update the portfolio list in backend
        axios.put(
          '/portfolio/list',
          newList.map((x) => ({ id: x.portfolioId, order: x.ordering }))
        );

        // Return the list to set it.
        return newList;
      });

      // Force set order to non.
      setTableOrdering({ column: '', ordering: Ordering.Unknown });
    }
  };

  // Handler of temp sort
  const handleTempSort = (columnName: PortfolioColumn) => {
    // Update the table sorting state
    setTableOrdering(
      (
        ordering: TableOrdering<PortfolioColumn>
      ): TableOrdering<PortfolioColumn> => {
        if (ordering.column === columnName) {
          // If it is the same column then just change its direction
          // Rotate the direction as Asc -> Desc -> None

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
          // Else set it as sorting column and set direction to asc
          ordering = { column: columnName, ordering: Ordering.Ascending };
        }

        // Call this function to do the sorting
        setPortfolios(portfolios, ordering);

        // Return to set the ordering
        return ordering;
      }
    );
  };

  return (
    <>
      {/* Delete portfolio modal */}
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

      {/* Create portfolio Modal */}
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

      {/* Toolbar */}
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

          <Button
            variant='light'
            className='ms-1 text-muted d-inline-flex align-items-center'
            onClick={() => refresh()}
          >
            <img src={refreshIcon} alt='refresh' style={{ opacity: 0.5 }} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Header of the table */}
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

      {/* A wrapper to enable/disable hightlight */}
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
