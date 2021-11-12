import plusIcon from 'assets/icon-outlines/outline-plus-small.svg';
import axios, { AxiosResponse } from 'axios';
import { Prop } from 'components/Portfolio/AddStock';
import { SearchContext } from 'contexts/SearchContext';
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { AsyncTypeahead, Menu, MenuItem } from 'react-bootstrap-typeahead';
import { useHistory } from 'react-router-dom';
import styles from './SearchWidgetModal.module.css';

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
  exchange: string;
}

const SearchWidgetModal: FC<Prop> = (prop) => {
  const { portfolioId, addStock } = prop;
  const { showSearchInput, searchAtHeader, endSearch, endAddStock } =
    useContext(SearchContext);

  const history = useHistory();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<TypeaheadOption[]>([]);

  // A map function to map the response from backend to frontend object
  // useCallback is used to cache the function
  const mapOptions = useCallback(
    (x: SearchResponse): TypeaheadOption => ({
      stockPageId: x.id,
      code: x.code,
      description: x.stock_name,
      market: x.exchange,
      searchLabel: `${x.code}` + (x.stock_name ? ` : ${x.stock_name}` : ''),
    }),
    []
  );

  const [addedStockPageIds, setAddedStockIds] = useState<number[]>([]);

  // Init
  useEffect(() => {
    // Call to get the list of current stocks in portfolio
    axios
      .get(`/stock/list/${portfolioId}`)
      .then((response: AxiosResponse<IStockResponse[]>) => {
        setAddedStockIds(response.data.map((stock) => stock.stockPageId));
      });
  }, [portfolioId, setAddedStockIds]);

  const _addStock = (option: TypeaheadOption) => {
    // Call add stock
    addStock!(option.code, option.stockPageId);

    // Add it to the added stocks
    setAddedStockIds([...addedStockPageIds, option.stockPageId]);
  };

  return (
    <Modal
      show={showSearchInput}
      size='lg'
      style={{ marginTop: '25vh' }}
      tabIndex='-1'
      backdrop={true}
      onHide={() => {
        endSearch();
        endAddStock();
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
        onChange={(selected) => {
          if (searchAtHeader) {
            history.push(`/stock/${selected[0].stockPageId}`);
          } else {
            _addStock(selected[0]);
          }

          endSearch();
          endAddStock();
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
                    {!addedStockPageIds.includes(option.stockPageId) &&
                      !searchAtHeader && (
                        <Button
                          variant='transparent'
                          onClick={(ev) => {
                            ev.preventDefault();
                            ev.stopPropagation();

                            _addStock(option);
                          }}
                        >
                          <img
                            src={plusIcon}
                            className={styles.addButtonIcon}
                            alt='add'
                          />
                        </Button>
                      )}
                  </span>
                  <span className={styles.optionSymbol}>
                    {option.code}
                    {/* <Link
                      to={`/stock/${option.stockPageId}`}
                      onClick={() => {
                        endSearch();
                      }}
                      target={searchAtHeader ? '' : '_blank'}
                    >
                      
                    </Link> */}
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
  );
};

export default SearchWidgetModal;
