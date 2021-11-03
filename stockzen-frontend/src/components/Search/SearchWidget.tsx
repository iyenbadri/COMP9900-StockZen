import plusCircle from 'assets/icon-outlines/outline-plus-circle.svg';
import { SearchContext } from 'contexts/SearchContext';
import React, { FC, useContext } from 'react';
import Button from 'react-bootstrap/Button';
import SearchWidgetModal from './SearchWidgetModal';

export interface Prop {
  portfolioId?: string;
  addStock?: (symbol: string, stockPageId: number) => void;
}

const SearchWidget: FC<Prop> = (prop) => {
  const { showSearchInput, search } = useContext(SearchContext);

  return (
    <>
      {/* Button of search */}
      <Button
        variant='light'
        onClick={() => {
          search();
        }}
        className='d-flex align-items-center'
      >
        <img src={plusCircle} alt='plus' className='me-1' /> Add a stock
      </Button>

      {/* The search modal */}
      {showSearchInput && (
        <SearchWidgetModal {...prop} />
      )}
    </>
  );
};

export default SearchWidget;
