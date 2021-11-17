import plusIcon from 'assets/icon-outlines/outline-plus-small.svg';
import axios, { AxiosResponse } from 'axios';
import { SubmissionContext } from 'contexts/SubmissionContext';
import { useCallback, useContext, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { AsyncTypeahead, Menu, MenuItem } from 'react-bootstrap-typeahead';
import styles from './SubmissionModal.module.css';
import SubmissionStockList from './SubmissionStockList';

/* Response from backend of stock search */
interface SearchResponse {
  id: number;
  code: string;
  stock_name: string;
  exchange: string;
}

// **************************************************************
// Component to display the leaderboard submission modal
// which pops up only if user has not submitted one yet
// **************************************************************
const SubmissionModal = () => {
  // Get states and functions for submission modal from context
  const { setSubmit, selectedStockPageIds, selectedStocks, addSelectedStock,
    submissionError, setSubmissionSuccess, setSubmissionError }
    = useContext(SubmissionContext);

  // States
  const [selectionError, setSelectionError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<TypeaheadOption[]>([]);

  // Access DOM element to reset and set focus on input field of search in modal
  const typeaheadRef = useRef<AsyncTypeahead<TypeaheadOption>>(null);

  // Map backend search response to options in search 
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

  // Try submission and get response from backend server
  const makeSubmission = async () => {
    try {
      let response = await axios.post('/challenge/submit', selectedStockPageIds);
      if (response.status === 200) {
        setSubmit(false);
        setSubmissionSuccess(true);
      }
    } catch (e: any) {
      setSubmissionError(true);
      setErrorMessage('An error occurred. Please try again later.')
    }
  }

  // Add the stock that user selects as a result of search
  const handleClick = (ev: any, option: TypeaheadOption) => {
    const stock: ISelectedStock = {
      stockPageId: option.stockPageId,
      code: option.code,
      stockName: option.description
    };

    ev.preventDefault();
    ev.stopPropagation();
    addSelectedStock(stock);
  }

  // Check if selected stock list satifies length requirement(=5) when submitted
  const handleSubmit = () => {
    if (selectedStockPageIds.length !== 5) {
      setSelectionError(true);
      setErrorMessage('Please select 5 stocks')
    } else {
      makeSubmission();
    }
  }

  // Render a modal
  return (
    <>
      <Form
        className={styles.submissionForm}
        onSubmit={makeSubmission}
      >
        <div className={styles.container}>
          <div className={`mx-2 ${styles.search}`}>
            {/* Search part where user can choose stock to add */}
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
                    // Map the object and set it as option
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
          {/* Stock list part where user can check selected stocks */}
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
        {/* Display error message below the submit button */}
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