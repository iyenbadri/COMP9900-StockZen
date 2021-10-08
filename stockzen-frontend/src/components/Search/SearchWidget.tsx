import React, { FC, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { AsyncTypeahead, Menu, MenuItem } from 'react-bootstrap-typeahead';
import listings from './listing.json';
import styles from './SearchWidget.module.css';
import plusCircle from 'assets/icon-outlines/outline-plus-circle.svg';
import { Link } from 'react-router-dom';

interface Prop {
  addStock?: (symbol: string) => void;
}

interface TypeaheadOption {
  id: string;
  symbol: string;
  description: string;
  market: string;
}

const SearchWidget: FC<Prop> = (prop) => {
  const mapOptions = (x: {
    symbol: string;
    description: string;
    market: string;
  }) => ({
    id: x.symbol,
    symbol: x.symbol,
    description: x.description,
    market: x.market,
  });

  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  //const [query, setQuery] = useState<string>('');
  const [options, setOptions] = useState<TypeaheadOption[]>(
    listings.map(mapOptions)
  );

  return (
    <>
      <Button
        variant='light'
        onClick={() => {
          setShowSearchInput(true);
        }}
      >
        <img src={plusCircle} alt='plus' />
        Add a stock
      </Button>

      <Modal
        show={showSearchInput}
        size='lg'
        style={{ marginTop: '25vh' }}
        tabIndex='-1'
        backdrop={true}
        onHide={() => {
          setShowSearchInput(false);
        }}
      >
        <AsyncTypeahead
          id='add-a-widget'
          isLoading={isLoading}
          labelKey='symbol'
          maxResults={30}
          minLength={1}
          paginate={false}
          options={options}
          placeholder='Begin typing stock symbol or name'
          //onInputChange={(query) => setQuery(query)}
          onBlur={() => {
            //setShowSearchInput(false);
          }}
          onSearch={(query) => {
            query = query.toLowerCase();
            setIsLoading(true);
            let options = listings
              .filter(
                (x) =>
                  x.symbol.toLowerCase().indexOf(query) !== -1 ||
                  x.description.toLowerCase().indexOf(query) !== -1
              )
              .map(mapOptions);
            setOptions(options);
            setIsLoading(false);
          }}
          renderMenu={(results, menuProps) => (
            <Menu {...menuProps} className={styles.options}>
              {results.map((option, index) => (
                <MenuItem option={option} position={index}>
                  <div key={option.id} className={styles.searchOption}>
                    <span className={styles.optionAdd}>
                      <Button
                        variant='transparent'
                        onClick={(ev) => {
                          ev.preventDefault();
                          ev.stopPropagation();

                          if (prop.addStock != null) {
                            prop.addStock(option.symbol);
                          }
                        }}
                      >
                        +
                      </Button>
                    </span>
                    <span className={styles.optionSymbol}>
                      <Link to={'/stock/' + option.symbol}>
                        {option.symbol}
                      </Link>
                    </span>
                    <span className={styles.optionDescription}>
                      <div>{option.description}</div>
                    </span>
                    <span className={styles.optionMarket}>{option.market}</span>
                  </div>
                </MenuItem>
              ))}
            </Menu>
          )}
        ></AsyncTypeahead>
      </Modal>

      {/* <Form.Control
        placeholder=''
        onChange={(ev) => setSearchQuery(ev.target.value)}
      ></Form.Control> */}
    </>
  );
};

export default SearchWidget;
