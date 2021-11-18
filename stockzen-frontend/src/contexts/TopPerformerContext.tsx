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

// Responses from backend
interface ITopPerformerResponse {
  stockPageId: number;
  code: string;
  stockName: string;
  price: number;
  percChange: number;
}

interface IPortfolioPerformanceResponse {
  holdings: number;
  today: number;
  overall: number;
}

interface ITopPerformer {
  stockPageId: number;
  code: string;
  stockName: string;
  price: number;
  changePercent: number;
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

// Function to map the top perfomer response
const mapTopPerformer = (x: ITopPerformerResponse): ITopPerformer => ({
  stockPageId: x.stockPageId,
  code: x.code,
  stockName: x.stockName,
  price: x.price,
  changePercent: x.percChange / 100,
});

// Top Performer context provider
const TopPerformerProvider: FC = ({ children }): any => {
  // Get context
  const { subscribe, unsubscribe } = useContext(RefreshContext);
  const { isAuthenticated } = useContext(UserContext);

  // Display/hide the portfolio summary
  const [showPortfolioSummary, setShowPortfolioSummary] =
    useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [topPerformers, setTopPerformers] = useState<ITopPerformer[]>([]);

  const [lastUpdateDate, setLastUpdateDate] = useState<Date | null>(null);

  const [portfolioSummary, setPortfolioSummary] =
    useState<IPortfolioPerformance | null>(null);

  // Function to load the top performer data
  const reloadTopPerformer = async () => {
    if (isAuthenticated) {
      setLastUpdateDate(new Date());

      try {
        const summary = await axios.get<IPortfolioPerformanceResponse>(
          '/portfolio/list/summary'
        );

        setPortfolioSummary({
          holding: summary.data.holdings,
          todayChangePercent: summary.data.today / 100,
          overallChangePercent: summary.data.overall / 100,
        });
      } catch {}

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
  useEffect(
    () => {
      reloadTopPerformer();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAuthenticated]
  );

  // Set up the refresh functionality
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
