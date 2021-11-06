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
  change: number;
}

interface ITopPerformerResponse {
  stockPageId: number;
  symbol: string;
  price: number;
  gain: number;
}

interface ITopPerformerContext {
  showPortfolioSummary: boolean;
  setShowPortfolioSummary: (show: boolean) => void;
  topPerformers: ITopPerformer[];
}

const contextDefaultValues: ITopPerformerContext = {
  showPortfolioSummary: false,
  setShowPortfolioSummary: (show: boolean) => {},
  topPerformers: [],
};

export const TopPerformerContext =
  createContext<ITopPerformerContext>(contextDefaultValues);

const mapTopPerformer = (x: ITopPerformerResponse): ITopPerformer => ({
  stockPageId: x.stockPageId,
  symbol: x.symbol,
  price: x.price,
  change: x.gain,
});

const TopPerformerProvider: FC = ({ children }): any => {
  const { subscribe, unsubscribe } = useContext(RefreshContext);

  const [showPortfolioSummary, setShowPortfolioSummary] =
    useState<boolean>(false);

  const [topPerformers, setTopPerformers] = useState<ITopPerformer[]>([]);

  useEffect(() => {
    const reloadTopPerformar = async () => {
      const topPerformers = await axios.get<ITopPerformerResponse[]>(
        '/stock-page/top'
      );

      setTopPerformers(topPerformers.data.map(mapTopPerformer));
    };

    console.log('RELOAD');

    reloadTopPerformar();

    subscribe(reloadTopPerformar);

    return () => {
      unsubscribe(reloadTopPerformar);
    };
  }, []);

  return (
    <TopPerformerContext.Provider
      value={{
        showPortfolioSummary,
        setShowPortfolioSummary,
        topPerformers,
      }}
    >
      {children}
    </TopPerformerContext.Provider>
  );
};

export default TopPerformerProvider;
