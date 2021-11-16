import plusIcon from 'assets/icon-outlines/outline-plus-small.svg';
import axios, { AxiosResponse } from 'axios';
import { SubmissionContext } from 'contexts/SubmissionContext';
import { useCallback, useContext, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { AsyncTypeahead, Menu, MenuItem } from 'react-bootstrap-typeahead';
import styles from './SubmissionModal.module.css';
import SubmissionStockList from './SubmissionStockList';

// Check if it can be declared globally (-- SearchWidgetModal.tsx)
interface SearchResponse {
  id: number;
  code: string;
  stock_name: string;
  exchange: string;
}

const SubmissionModal = () => {
  const { setSubmit, selectedStockPageIds, selectedStocks, addSelectedStock,
    submissionError, setSubmissionSuccess, setSubmissionError }
    = useContext(SubmissionContext);
  const [selectionError, setSelectionError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<TypeaheadOption[]>([]);

  const typeaheadRef = useRef<AsyncTypeahead<TypeaheadOption>>(null);

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

  const makeSubmission = async () => {
    try {
      let response = await axios.post('/challenge/submit', selectedStockPageIds);
      if (response.status === 200) {
        setSubmit(false);
        setSubmissionSuccess(true);
      }
    } catch (e: any) {
      setSubmissionError(true);
      // Server error response
      setErrorMessage('An error occurred. Please try again later.')
    }
  }

  const handleClick = (ev: any, option: TypeaheadOption) => {
    const stock: ISelectedStock = {
      stockPageId: option.stockPageId,
      code: option.code,
      stockName: option.description
    };

    ev.preventDefault();
    ev.stopPropagation();
    if (selectedStockPageIds.length > 5) {
      setSelectionError(true);
    } else {
      addSelectedStock(stock);
    }
  }

  const handleSubmit = () => {
    // Error if selected stock list doesn't have 5 stocks
    if (selectedStockPageIds.length !== 5) {
      setSelectionError(true);
      setErrorMessage('Please select 5 stocks')
    } else {
      makeSubmission();
    }
  }

  return (
    <>
      <Form
        className={styles.submissionForm}
        onSubmit={makeSubmission}
      >
        <div className={styles.container}>
          <div className={`mx-2 ${styles.search}`}>
            <AsyncTypeahead
              id='add-a-widget'
              isLoading={isLoading}
              labelKey='searchLabel'
              delay={350}
              maxResults={30}
              minLength={2}
              paginate={false}
              options={options}
              className={styles.input}
              placeholder='Search stock with symbol or name'
              ref={typeaheadRef}
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
                      style={{ pointerEvents: selectedStockPageIds.some(x => x.stockPageId === option.stockPageId) ? 'none' : 'auto' }}
                      onClick={(ev) => {
                        handleClick(ev, option);
                        if (typeaheadRef.current !== null) {
                          typeaheadRef.current.clear();
                        }
                      }}
                    >
                      <div className={styles.searchOption}>
                        <span className={styles.optionAdd}>
                          {!selectedStockPageIds.some(x => x.stockPageId === option.stockPageId) && (
                            <Button
                              variant='transparent'
                              onClick={(ev) => {
                                handleClick(ev, option);
                                if (typeaheadRef.current !== null) {
                                  typeaheadRef.current.clear();
                                }
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
            >
            </AsyncTypeahead>

          </div>
          <div className={`mx-2 ${styles.stockList}`}>
            <div className={styles.listName}>Selected Stocks</div>
            <ol className={styles.selectedStockList}>
              {selectedStocks.map((stock) => (
                <SubmissionStockList
                  key={stock.stockPageId}
                  port={stock}
                ></SubmissionStockList>
              ))}
            </ol>
          </div>
        </div>
        <div>
          <Button
            type='button'
            className={`mb-2 ${styles.submitButton}`}
            onClick={(ev) => {
              handleSubmit();
            }}>
            Submit
          </Button>
        </div>
        {(selectionError || submissionError) && (
          <div className={styles.selectionErrorMsg}>
            {errorMessage}
          </div>
        )}
      </Form>
    </>
  );
}

export default SubmissionModal;