import { createContext, FC, useState } from 'react';

interface ISearchContext {
  showSearchInput: boolean;
  searchAtHeader: boolean;
  addStock: () => void;
  endAddStock: () => void;
  search: () => void;
  endSearch: () => void;
}

const searchDefaultValues: ISearchContext = {
  showSearchInput: false,
  searchAtHeader: true,
  addStock: () => {},
  endAddStock: () => {},
  search: () => {},
  endSearch: () => {},
};

export const SearchContext = createContext<ISearchContext>(searchDefaultValues);

// **************************************************************
// Search context provider
// **************************************************************
const SearchProvider: FC = ({ children }): any => {
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [searchAtHeader, setSearchAtHeader] = useState<boolean>(true);

  const addStock = () => {
    setSearchAtHeader(false);
    setShowSearchInput(true);
  };

  const endAddStock = () => {
    setSearchAtHeader(true);
  };

  const search = () => {
    setShowSearchInput(true);
  };

  const endSearch = () => {
    setShowSearchInput(false);
    setSearchAtHeader(true);
  };

  return (
    <SearchContext.Provider
      value={{
        showSearchInput,
        searchAtHeader,
        addStock,
        endAddStock,
        search,
        endSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export default SearchProvider;
