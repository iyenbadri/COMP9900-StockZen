import plusCircle from 'assets/icon-outlines/outline-plus-circle.svg';
import plusIcon from 'assets/icon-outlines/outline-plus-small.svg';
import axios, { AxiosResponse } from 'axios';
import React, { FC, useState } from 'react';
import { AsyncTypeahead, Menu, MenuItem } from 'react-bootstrap-typeahead';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Link } from 'react-router-dom';
import styles from './SearchWidget.module.css';

interface Prop {
  addStock: (symbol: string, stockPageId: number) => void;
}

const SearchWidget: FC<Prop> = (prop) => {
  const mapOptions = (x: SearchResponse): TypeaheadOption => ({
    stockId: x.id,
    symbol: x.code,
    description: x.stock_name,
    market: Math.random().toString(),
    searchLabel: `${x.code}` + (x.stock_name ? ` : ${x.stock_name}` : ''),
  });

  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [addedSymbols, setAddedSymbols] = useState<string[]>([]);

  // TODO : Use API to update the addedSymbols

  //const [query, setQuery] = useState<string>('');
  const [options, setOptions] = useState<TypeaheadOption[]>([]);

  return (
    <>
      <Button
        variant='light'
        onClick={() => {
          setShowSearchInput(true);
        }}
        className='d-flex align-items-center'
      >
        <img src={plusCircle} alt='plus' className='me-1' /> Add a stock
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
          labelKey='searchLabel'
          delay={350}
          maxResults={30}
          minLength={2}
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

            axios.get('/search?query=' + encodeURIComponent(query)).then(
              (response: AxiosResponse<SearchResponse[]>) => {
                let options = response.data.map(mapOptions);
                setOptions(options);
                setIsLoading(false);
              },
              () => {
                setOptions([]);
                setIsLoading(false);
              }
            );
          }}
          renderMenu={(results, menuProps) => (
            <Menu {...menuProps} className={styles.options}>
              {results.map((option, index) => (
                <MenuItem key={option.stockId} option={option} position={index}>
                  <div className={styles.searchOption}>
                    <span className={styles.optionAdd}>
                      {!addedSymbols.includes(option.symbol) && (
                        <Button
                          variant='transparent'
                          onClick={(ev) => {
                            ev.preventDefault();
                            ev.stopPropagation();

                            prop.addStock(option.symbol, option.stockId);
                            setAddedSymbols([...addedSymbols, option.symbol]);
                          }}
                        >
                          <img src={plusIcon} alt='add' />
                        </Button>
                      )}
                    </span>
                    <span className={styles.optionSymbol}>
                      {/* TODO: Will fix the nested `a` tag bug later. Have to find a way to fix it first */}
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
    </>
  );
};

interface TypeaheadOption {
  stockId: number;
  symbol: string;
  description: string;
  market: string;
  searchLabel: string;
}

interface SearchResponse {
  id: number;
  code: string;
  stock_name: string;
}

export default SearchWidget;
