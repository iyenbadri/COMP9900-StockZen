import { createContext, FC, useState } from 'react';

interface ISearchContext {
  showSearchInput: boolean;
  search: () => void;
  endSearch: () => void;
}

const searchDefaultValues: ISearchContext = {
  showSearchInput: false,
  search: () => { },
  endSearch: () => { },
}

export const SearchContext = createContext<ISearchContext>(searchDefaultValues);

const SearchProvider: FC = ({ children }): any => {
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);

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
        search,
        endSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export default SearchProvider;