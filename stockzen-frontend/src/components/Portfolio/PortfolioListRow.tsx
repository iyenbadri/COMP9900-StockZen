import crossIcon from 'assets/icon-outlines/outline-cross.svg';
import handleIcon from 'assets/icon-outlines/outline-drag-handle.svg';
import editIcon from 'assets/icon-outlines/outline-edit-1.svg';
import React, { FC, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import Form from 'react-bootstrap/Form';
import { Link, useRouteMatch } from 'react-router-dom';
import { numberFormatter, usdFormatter } from 'utils/Utilities';
import styles from './PortfolioList.module.css';

interface IPortfolioListRow {
  isTempSort?: boolean;
  index: number;
  port: IPortfolio;
  updatePortfolioName?: (id: number, name: string) => void;
  showDeleteModal?: (id: number, name: string) => void;
}

// **************************************************************
// Component to display the row in the portfolio list
// **************************************************************
const PortfolioListRow: FC<IPortfolioListRow> = (prop) => {
  const { port: portfolio } = prop;
  const { path } = useRouteMatch();

  // State
  const [portfolioName, setPortfolioName] = useState<string>(portfolio.name);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  // Class of gain/loss
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

  // Function to update the portfolio name
  const updatePortfolioName = () => {
    if (prop.updatePortfolioName != null) {
      if (portfolioName.length > 0 && portfolioName.length <= 50) {
        prop.updatePortfolioName(portfolio.portfolioId, portfolioName);
      }
    }
    setIsEditingName(false);
  };

  // Render
  return (
    <Draggable draggableId={portfolio.draggableId} index={prop.index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          <div className={styles.tableRow}>
            <div className={styles.rowPortInfo}>
              <div className={styles.rowHandle}>
                {/* DnD Handle */}
                <img
                  src={handleIcon}
                  alt='handle'
                  className={styles.dragHandle}
                  {...provided.dragHandleProps}
                />
              </div>

              {/* Portfolio Name */}
              <div className={styles.rowPortfolio}>
                {/* Show the input when editing */}
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
                  // Show the link
                  <Link
                    to={`${path}/${portfolio.portfolioId}`}
                    className={styles.rowPortfolioLink}
                  >
                    {portfolio.name}
                  </Link>
                )}
              </div>

              {/* Edit button */}
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

              <div className={styles.rowStocks}>{portfolio.stockCount}</div>

              {/* Market value */}
              <div className={styles.rowMarketValue}>
                {portfolio.marketValue == null
                  ? '-'
                  : usdFormatter.format(portfolio.marketValue)}
              </div>

              {/* Change */}
              <div
                className={`${styles.rowChange} ${gainLossClass(
                  portfolio.change
                )}`}
              >
                {portfolio.change == null ? (
                  '-'
                ) : (
                  <>
                    <div className={styles.percent}>
                      {numberFormatter.format(portfolio.changePercent || 0)}%
                    </div>
                    <div>{usdFormatter.format(portfolio.change)}</div>
                  </>
                )}
              </div>

              {/* Gain/Loss */}
              <div
                className={`${styles.rowTotalGain} ${gainLossClass(
                  portfolio.totalGain
                )}`}
              >
                {portfolio.totalGain == null ? (
                  '-'
                ) : (
                  <>
                    <div className={styles.percent}>
                      {numberFormatter.format(portfolio.totalGainPercent || 0)}%
                    </div>
                    <div>{usdFormatter.format(portfolio.totalGain)}</div>
                  </>
                )}
              </div>
            </div>

            {/* Delete button */}
            <div className={styles.rowDelete}>
              <button
                className={`p-0 ${styles.deleteButton}`}
                onClick={() => {
                  if (prop.showDeleteModal != null) {
                    prop.showDeleteModal(portfolio.portfolioId, portfolio.name);
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
