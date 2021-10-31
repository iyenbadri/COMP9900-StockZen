import searchIcon from 'assets/icon-outlines/outline-search.svg';
import { Prop } from 'components/Portfolio/AddStock';
import { SearchContext } from 'contexts/SearchContext';
import React, { FC, useContext } from 'react';
import { Form } from 'react-bootstrap';
import styles from './SearchWidgetHeader.module.css';
import SearchWidgetModal from './SearchWidgetModal';


const SearchWidgetHeader: FC<Prop> = (prop) => {
  const { showSearchInput, search, endSearch } = useContext(SearchContext);

  return (
    <>
      <Form className={`${styles.searchBox}`}>
        <Form.Label>
          <img className={styles.searchImg} src={searchIcon} alt='search'></img>
        </Form.Label>
        <Form.Control
          className={styles.searchEntry}
          placeholder='Search stock'
          onClick={() => {
            search();
          }}
        ></Form.Control>
        {showSearchInput && (
          <SearchWidgetModal {...prop} />
        )}
      </Form>
    </>
  );
};

export default SearchWidgetHeader;