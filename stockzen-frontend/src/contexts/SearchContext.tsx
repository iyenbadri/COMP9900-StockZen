import { createContext, FC, useState } from 'react';

interface ISearchContext {
  showSearchInput: boolean;
  searchAtHeader: boolean;
  addStock: () => void;
  search: () => void;
  endSearch: () => void;
}

const searchDefaultValues: ISearchContext = {
  showSearchInput: false,
  searchAtHeader: true,
  addStock: () => { },
  search: () => { },
  endSearch: () => { },
}

export const SearchContext = createContext<ISearchContext>(searchDefaultValues);

const SearchProvider: FC = ({ children }): any => {
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [searchAtHeader, setSearchAtHeader] = useState<boolean>(true);

  const addStock = () => {
    setSearchAtHeader(false);
    setShowSearchInput(true);
  }

  const search = () => {
    setShowSearchInput(true);
  }

  const endSearch = () => {
    setShowSearchInput(false);
  }

  return (
    <SearchContext.Provider
      value={{
        showSearchInput,
        searchAtHeader,
        addStock,
        search,
        endSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export default SearchProvider;