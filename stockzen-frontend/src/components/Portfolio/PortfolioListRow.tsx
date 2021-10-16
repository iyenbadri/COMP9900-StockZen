import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import crossIcon from 'assets/icon-outlines/outline-cross.svg';
import handleIcon from 'assets/icon-outlines/outline-drag-handle.svg';
import editIcon from 'assets/icon-outlines/outline-edit-1.svg';
import React, { FC, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { Link, useRouteMatch } from 'react-router-dom';
import { usdFormatter } from 'utils/Utilities';
import styles from './PortfolioList.module.css';

interface IPortfolioListRow extends IPortfolio {
  isTempSort: boolean;
  updatePortfolioName?: (id: number, name: string) => void;
  showDeleteModal?: (id: number, name: string) => void;
}

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
          {!prop.isTempSort && (
            <img
              src={handleIcon}
              alt='handle'
              className={styles.dragHandle}
              {...listeners}
            />
          )}
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
              {prop.portfolioId}: {prop.name}
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

export default PortfolioListRow;
