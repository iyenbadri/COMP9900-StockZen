import crossIcon from 'assets/icon-outlines/outline-cross.svg';
import handleIcon from 'assets/icon-outlines/outline-drag-handle.svg';
import editIcon from 'assets/icon-outlines/outline-edit-1.svg';
import React, { FC, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import Form from 'react-bootstrap/Form';
import { Link, useRouteMatch } from 'react-router-dom';
import { percFormatter, usdFormatter } from 'utils/Utilities';
import styles from './PortfolioList.module.css';

interface IPortfolioListRow {
  isTempSort?: boolean;
  updatePortfolioName?: (id: number, name: string) => void;
  showDeleteModal?: (id: number, name: string) => void;
  index: number;
  port: IPortfolio;
}

const PortfolioListRow: FC<IPortfolioListRow> = (prop) => {
  const { port } = prop;
  const { path } = useRouteMatch();

  const [portfolioName, setPortfolioName] = useState<string>(port.name);
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
        prop.updatePortfolioName(port.portfolioId, portfolioName);
      }
    }
    setIsEditingName(false);
  };

  return (
    <Draggable draggableId={port.draggableId} index={prop.index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          <div className={styles.tableRow}>
            <div className={styles.rowPortInfo}>
              <div className={styles.rowHandle}>
                <img
                  src={handleIcon}
                  alt='handle'
                  className={styles.dragHandle}
                  {...provided.dragHandleProps}
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
                    to={`${path}/${port.portfolioId}`}
                    className={styles.rowPortfolioLink}
                  >
                    {port.name}
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
              <div className={styles.rowStocks}>{port.stockCount}</div>
              <div className={styles.rowMarketValue}>
                {port.marketValue == null
                  ? '-'
                  : usdFormatter.format(port.marketValue)}
              </div>
              <div
                className={`${styles.rowChange} ${gainLossClass(port.change)}`}
              >
                {port.change == null ? (
                  '-'
                ) : (
                  <>
                    <div className={styles.percent}>
                      {percFormatter.format(port.changePercent || 0)}%
                    </div>
                    <div>{usdFormatter.format(port.change)}</div>
                  </>
                )}
              </div>
              <div
                className={`${styles.rowTotalGain} ${gainLossClass(
                  port.totalGain
                )}`}
              >
                {port.totalGain == null ? (
                  '-'
                ) : (
                  <>
                    <div className={styles.percent}>
                      {percFormatter.format(port.totalGainPercent || 0)}%
                    </div>
                    <div>{usdFormatter.format(port.totalGain)}</div>
                  </>
                )}
              </div>
            </div>
            <div className={styles.rowDelete}>
              <button
                className={`p-0 ${styles.deleteButton}`}
                onClick={() => {
                  if (prop.showDeleteModal != null) {
                    prop.showDeleteModal(port.portfolioId, port.name);
                  }
                }}
              >
                <img src={crossIcon} alt='cross' width={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default PortfolioListRow;
