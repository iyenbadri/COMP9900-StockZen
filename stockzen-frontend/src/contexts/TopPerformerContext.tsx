import axios from 'axios';
import { RefreshContext } from 'contexts/RefreshContext';
import { UserContext } from 'contexts/UserContext';
import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useState,
} from 'react';

interface ITopPerformer {
  stockPageId: number;
  symbol: string;
  price: number;
  changePercent: number;
}

interface ITopPerformerResponse {
  stockPageId: number;
  code: string;
  price: number;
  percChange: number;
}

interface IPortfolioPerformance {
  holding: number;
  todayChangePercent: number;
  overallChangePercent: number;
}

interface ITopPerformerContext {
  showPortfolioSummary: boolean;
  setShowPortfolioSummary: (show: boolean) => void;
  topPerformers: ITopPerformer[];
  isLoading: boolean;
  lastUpdateDate: Date | null;
  portfolioSummary: IPortfolioPerformance | null;
}

const contextDefaultValues: ITopPerformerContext = {
  showPortfolioSummary: false,
  setShowPortfolioSummary: (show: boolean) => {},
  topPerformers: [],
  isLoading: true,
  lastUpdateDate: null,
  portfolioSummary: null,
};

export const TopPerformerContext =
  createContext<ITopPerformerContext>(contextDefaultValues);

const mapTopPerformer = (x: ITopPerformerResponse): ITopPerformer => ({
  stockPageId: x.stockPageId,
  symbol: x.code,
  price: x.price,
  changePercent: x.percChange / 100,
});

const TopPerformerProvider: FC = ({ children }): any => {
  const { subscribe, unsubscribe } = useContext(RefreshContext);
  const { isAuthenticated } = useContext(UserContext);

  const [showPortfolioSummary, setShowPortfolioSummary] =
    useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [topPerformers, setTopPerformers] = useState<ITopPerformer[]>([]);

  const [lastUpdateDate, setLastUpdateDate] = useState<Date | null>(null);

  const [portfolioSummary, setPortfolioSummary] =
    useState<IPortfolioPerformance | null>(null);

  const reloadTopPerformer = async () => {
    if (isAuthenticated) {
      setLastUpdateDate(new Date());

      setPortfolioSummary({
        holding: Math.random() * 2000,
        todayChangePercent: (Math.random() * 10 - 5) / 100,
        overallChangePercent: (Math.random() * 10 - 5) / 100,
      });

      try {
        const topPerformers = await axios.get<ITopPerformerResponse[]>(
          '/stock-page/top'
        );

        setTopPerformers(topPerformers.data.map(mapTopPerformer));

        setIsLoading(false);
      } catch {}
    }
  };

  // Reload when isAuthenticated is changed.
  useEffect(() => {
    reloadTopPerformer();
  }, [isAuthenticated]);

  useEffect(
    () => {
      reloadTopPerformer();

      subscribe(reloadTopPerformer);

      return () => {
        unsubscribe(reloadTopPerformer);
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
        portfolioSummary,
        lastUpdateDate,
        topPerformers,
        isLoading,
      }}
    >
      {children}
    </TopPerformerContext.Provider>
  );
};

export default TopPerformerProvider;
