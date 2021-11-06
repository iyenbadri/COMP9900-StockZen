import React, {
  createContext,
  FC,
  useState,
  useContext,
  useEffect,
} from 'react';
import { RefreshContext } from 'contexts/RefreshContext';
import axios from 'axios';

interface ITopPerformer {
  stockPageId: number;
  symbol: string;
  price: number;
  changePercent: number;
}

interface ITopPerformerResponse {
  stockPageId: number;
  symbol: string;
  price: number;
  percChange: number;
}

interface ITopPerformerContext {
  showPortfolioSummary: boolean;
  setShowPortfolioSummary: (show: boolean) => void;
  topPerformers: ITopPerformer[];
  isLoading: boolean;
}

const contextDefaultValues: ITopPerformerContext = {
  showPortfolioSummary: false,
  setShowPortfolioSummary: (show: boolean) => {},
  topPerformers: [],
  isLoading: true,
};

export const TopPerformerContext =
  createContext<ITopPerformerContext>(contextDefaultValues);

const mapTopPerformer = (x: ITopPerformerResponse): ITopPerformer => ({
  stockPageId: x.stockPageId,
  symbol: x.symbol,
  price: x.price,
  changePercent: x.percChange / 100,
});

const TopPerformerProvider: FC = ({ children }): any => {
  const { subscribe, unsubscribe } = useContext(RefreshContext);

  const [showPortfolioSummary, setShowPortfolioSummary] =
    useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [topPerformers, setTopPerformers] = useState<ITopPerformer[]>([]);

  useEffect(
    () => {
      const reloadTopPerformar = async () => {
        const topPerformers = await axios.get<ITopPerformerResponse[]>(
          '/stock-page/top'
        );

        setTopPerformers(topPerformers.data.map(mapTopPerformer));

        setIsLoading(false);
      };

      reloadTopPerformar();

      subscribe(reloadTopPerformar);

      return () => {
        unsubscribe(reloadTopPerformar);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <TopPerformerContext.Provider
      value={{
        showPortfolioSummary,
        setShowPortfolioSummary,
        topPerformers,
        isLoading,
      }}
    >
      {children}
    </TopPerformerContext.Provider>
  );
};

export default TopPerformerProvider;
