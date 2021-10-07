import React, { FC, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { AsyncTypeahead, Menu, MenuItem } from 'react-bootstrap-typeahead';
import listings from './listing.json';
import styles from './SearchWidget.module.css';
import plusCircle from 'assets/icon-outlines/outline-plus-circle.svg';

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
      {!showSearchInput && (
        <Button
          variant='light'
          onClick={() => {
            setShowSearchInput(true);
          }}
        >
          <img src={plusCircle} alt='plus' />
          Add a stock
        </Button>
      )}

      {showSearchInput && (
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
            setShowSearchInput(false);
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
                      <button
                        onClick={(ev) => {
                          if (prop.addStock != null) {
                            prop.addStock(option.symbol);
                          }
                        }}
                      >
                        +
                      </button>
                    </span>
                    <span className={styles.optionSymbol}>{option.symbol}</span>
                    <span className={styles.optionDescription}>
                      {option.description}
                    </span>
                    <span className={styles.optionMarket}>{option.market}</span>
                  </div>
                </MenuItem>
              ))}
            </Menu>
          )}
        ></AsyncTypeahead>
      )}

      {/* <Form.Control
        placeholder=''
        onChange={(ev) => setSearchQuery(ev.target.value)}
      ></Form.Control> */}
    </>
  );
};

export default SearchWidget;
