import plusCircle from 'assets/icon-outlines/outline-plus-circle.svg';
import SearchWidgetModal from 'components/Search/SearchWidgetModal';
import { SearchContext } from 'contexts/SearchContext';
import React, { FC, useContext } from 'react';
import Button from 'react-bootstrap/Button';
import styles from './PortfolioList.module.css';

export interface Prop {
  portfolioId?: string;
  addStock?: (symbol: string, stockPageId: number) => void;
}

const AddStock: FC<Prop> = (prop) => {
  const { showSearchInput, addStock } = useContext(SearchContext);

  return (
    <>
      {/* Button of search */}
      <Button
        variant='light'
        onClick={() => {
          addStock();
        }}
        className={`d-flex align-items-center ${styles.toolbarCreateButton}`}
      >
        <img src={plusCircle} alt='plus' className='me-1' /> Add a stock
      </Button>

      {/* The search modal */}
      {showSearchInput && <SearchWidgetModal {...prop} />}
    </>
  );
};

export default AddStock;
