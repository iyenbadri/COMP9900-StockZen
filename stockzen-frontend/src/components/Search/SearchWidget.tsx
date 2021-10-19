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
  // Extract the portfolioId from properties
  const { portfolioId } = prop;

  // A map function to map the response from backend to frontend object
  // useCallback is used to cache the function
  const mapOptions = useCallback(
    (x: SearchResponse): TypeaheadOption => ({
      stockPageId: x.id,
      code: x.code,
      description: x.stock_name,
      market: Math.round(Math.random() * 100).toString(),
      searchLabel: `${x.code}` + (x.stock_name ? ` : ${x.stock_name}` : ''),
    }),
    []
  );

  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [addedStockPageIds, setAddedStockIds] = useState<number[]>([]);

  // Init
  useEffect(() => {
    // Call to get the list of current stocks in portfolio
    axios
      .get(`/stock/list/${portfolioId}`)
      .then((response: AxiosResponse<StockListResponse[]>) => {
        // Set the list of stock_page_id as added stocks
        setAddedStockIds((added) => {
          return [
            ...added,
            ...response.data.map((stock) => stock.stock_page_id),
          ];
        });
      });
  }, [portfolioId, setAddedStockIds]);

  //const [query, setQuery] = useState<string>('');
  const [options, setOptions] = useState<TypeaheadOption[]>([]);

  return (
    <>
      {/* Button of search */}
      <Button
        variant='light'
        onClick={() => {
          setShowSearchInput(true);
        }}
        className='d-flex align-items-center'
      >
        <img src={plusCircle} alt='plus' className='me-1' /> Add a stock
      </Button>

      {/* The search modal */}
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
          onBlur={() => {
            //setShowSearchInput(false);
          }}
          onSearch={(query) => {
            query = query.toLowerCase();
            setIsLoading(true);
            setOptions([]);

            // Query the search
            axios.get('/search?query=' + encodeURIComponent(query)).then(
              (response: AxiosResponse<SearchResponse[]>) => {
                // Map the object and then set it
                let options = response.data.map(mapOptions);
                setOptions(options);
                setIsLoading(false);
              },
              () => {
                // Set to empty if failed
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
                      {/* Render the add button if it is not added */}
                      {!addedStockPageIds.includes(option.stockPageId) && (
                        <Button
                          variant='transparent'
                          onClick={(ev) => {
                            ev.preventDefault();
                            ev.stopPropagation();

                            // Call add stock
                            prop.addStock(option.code, option.stockPageId);

                            // Add it to the added stocks
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
                      <Link to={'/stock/' + option.stockPageId}>
                        {option.code}
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
