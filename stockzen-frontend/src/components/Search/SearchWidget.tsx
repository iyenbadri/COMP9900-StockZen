import plusCircle from 'assets/icon-outlines/outline-plus-circle.svg';
import plusIcon from 'assets/icon-outlines/outline-plus-small.svg';
import axios, { AxiosResponse } from 'axios';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { AsyncTypeahead, Menu, MenuItem } from 'react-bootstrap-typeahead';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Link } from 'react-router-dom';
import styles from './SearchWidget.module.css';

interface Prop {
  portfolioId: string;
  addStock: (symbol: string, stockPageId: number) => void;
}

const SearchWidget: FC<Prop> = (prop) => {
  const { portfolioId } = prop;

  const mapOptions = useCallback(
    (x: SearchResponse): TypeaheadOption => ({
      stockPageId: x.id,
      code: x.code,
      description: x.stock_name,
      market: Math.random().toString(),
      searchLabel: `${x.code}` + (x.stock_name ? ` : ${x.stock_name}` : ''),
    }),
    []
  );

  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [addedStockPageIds, setAddedStockIds] = useState<number[]>([]);

  // A function to reload the added stock ids
  const reloadAddedStockIds = useCallback(() => {
    axios
      .get(`/stock/list/${portfolioId}`)
      .then((response: AxiosResponse<StockListResponse[]>) => {
        setAddedStockIds(response.data.map((stock) => stock.stock_page_id));
      });
  }, [portfolioId, setAddedStockIds]);

  //const [query, setQuery] = useState<string>('');
  const [options, setOptions] = useState<TypeaheadOption[]>([]);

  return (
    <>
      <Button
        variant='light'
        onClick={() => {
          // Load the list when user click search
          reloadAddedStockIds();

          // Show the search bar
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
                <MenuItem
                  key={option.stockPageId}
                  option={option}
                  position={index}
                >
                  <div className={styles.searchOption}>
                    <span className={styles.optionAdd}>
                      {!addedStockPageIds.includes(option.stockPageId) && (
                        <Button
                          variant='transparent'
                          onClick={(ev) => {
                            ev.preventDefault();
                            ev.stopPropagation();

                            prop.addStock(option.code, option.stockPageId);
                            setAddedStockIds([
                              ...addedStockPageIds,
                              option.stockPageId,
                            ]);
                          }}
                        >
                          <img src={plusIcon} alt='add' />
                        </Button>
                      )}
                    </span>
                    <span className={styles.optionSymbol}>
                      {/* TODO: Will fix the nested `a` tag bug later. Have to find a way to fix it first */}
                      <Link to={'/stock/' + option.code}>{option.code}</Link>
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
  stockPageId: number;
  code: string;
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
