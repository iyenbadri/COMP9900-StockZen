import { DndContext, DragEndEvent, useDndMonitor } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import crossIcon from 'assets/icon-outlines/outline-cross.svg';
import handleIcon from 'assets/icon-outlines/outline-drag-handle.svg';
import editIcon from 'assets/icon-outlines/outline-edit-1.svg';
import plusIcon from 'assets/icon-outlines/outline-plus-circle.svg';
import axios from 'axios';
import { TopPerformerContext } from 'contexts/TopPerformerContext';
import React, { FC, useContext, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { Link, useRouteMatch } from 'react-router-dom';
import { usdFormatter } from 'utils/Utilities';
import styles from './PortfolioList.module.css';
import PortfolioListSummary from './PortfolioListSummary';
import { CSS } from '@dnd-kit/utilities';

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
  id: string;
  portfolioId: number;
  name: string;
  stockCount: number;
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

const PortfolioList = () => {
  const { setShowPortfolioSummary } = useContext(TopPerformerContext);

  const [deletingPortfolioName, setDeletingPortfolioName] =
    useState<string>('');
  const [deletingPortfolioId, setDeletingPortfolioId] = useState<number>();
  const [showDeletePortfolioModal, setShowDeletePortfolioModal] =
    useState<boolean>(false);
  const [showCreatePortfolioModal, setShowCreatePortfolioModal] =
    useState<boolean>(false);

  const [isDragging, setIsDragging] = useState<boolean>(false);

  const mapPortfolioList = (
    portfolioList: IPortfolioResponse[]
  ): IPortfolio[] => {
    return portfolioList.map((x: IPortfolioResponse) => ({
      id: x.id.toString(),
      portfolioId: x.id,
      name: x.portfolioName,
      stockCount: x.stockCount,
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
    axios.post('/portfolio', { portfolioName: newPortfolioName }).then(() => {
      setNewPortfolioName('');

      reloadPortfolioList();
    });

    setShowCreatePortfolioModal(false);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (ev: DragEndEvent) => {
    setIsDragging(false);

    const { active, over } = ev;
    if (over !== null) {
      if (active.id !== over.id) {
        setPortfolios((portfolios) => {
          const oldIndex = portfolios.findIndex((x) => x.id === active.id);
          const newIndex = portfolios.findIndex((x) => x.id === over.id);
          const newList = arrayMove(portfolios, oldIndex, newIndex);

          // TODO: Call API to reorder the list.

          return newList;
        });
      }
    }
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
            <Button variant={'light'} size={'sm'}>
              Portfolio
            </Button>
          </div>
          <div className={styles.rowEditButton}></div>
          <div className={styles.rowStocks}>
            <Button variant={'light'} size={'sm'}>
              Stocks
            </Button>
          </div>
          <div className={styles.rowMarketValue}>
            <Button variant={'light'} size={'sm'}>
              Market value
            </Button>
          </div>
          <div className={styles.rowChange}>
            <Button variant={'light'} size={'sm'}>
              Change
            </Button>
          </div>
          <div className={styles.rowTotalGain}>
            <Button variant={'light'} size={'sm'}>
              Total gain
            </Button>
          </div>
        </div>
        <div className={styles.rowDelete}></div>
      </div>

      <div className={isDragging ? styles.dragging : styles.notDragging}>
        <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <SortableContext items={portfolios}>
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
          </SortableContext>
        </DndContext>
      </div>
    </>
  );
};

const PortfolioListRow: FC<IPortfolioListRow> = (prop) => {
  const { path } = useRouteMatch();

  const [portfolioName, setPortfolioName] = useState<string>(prop.name);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: prop.portfolioId.toString(),
      attributes: { role: 'portfolio' },
    });

  const style = { transform: CSS.Transform.toString(transform), transition };

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
    <div
      ref={setNodeRef}
      className={styles.tableRow}
      style={style}
      {...attributes}
    >
      <div className={styles.rowPortInfo}>
        <div className={styles.rowHandle}>
          <img
            src={handleIcon}
            alt='handle'
            className={styles.dragHandle}
            {...listeners}
          />
        </div>
        <div className={styles.rowPortfolio}>
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
        </div>
        <div className={styles.rowEditButton}>
          <button
            type='button'
            className={`${styles.editButton} p-0`}
            onClick={(ev) => {
              setIsEditingName(true);
            }}
          >
            <img src={editIcon} alt='edit' width={18} />
          </button>
        </div>
        <div className={styles.rowStocks}>{prop.stockCount}</div>
        <div className={styles.rowMarketValue}>
          {prop.marketValue == null
            ? '-'
            : usdFormatter.format(prop.marketValue)}
        </div>
        <div className={`${styles.rowChange} ${gainLossClass(prop.change)}`}>
          {prop.change == null ? (
            '-'
          ) : (
            <>
              <div className={styles.percent}>{prop.changePercent}%</div>
              <div>{usdFormatter.format(prop.change)}</div>
            </>
          )}
        </div>
        <div
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
        </div>
      </div>
      <div className={styles.rowDelete}>
        <button
          className={`p-0 ${styles.deleteButton}`}
          onClick={() => {
            if (prop.showDeleteModal != null) {
              prop.showDeleteModal(prop.portfolioId, prop.name);
            }
          }}
        >
          <img src={crossIcon} alt='cross' width={20} />
        </button>
      </div>
    </div>
  );
};

export default PortfolioList;
