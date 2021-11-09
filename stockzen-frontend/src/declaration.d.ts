interface IPortfolio {
    draggableId: string;
    ordering: number;
    portfolioId: number;
    name: string;
    stockCount: number;
    change: number | null;
    changePercent: number | null;
    marketValue: number | null;
    totalGain: number | null;
    totalGainPercent: number | null;
}

// The response from the backend (This is just a draft, will change
// later to match what is actually get)
interface IPortfolioResponse {
    id: number;
    order: number;
    portfolioName: string;
    stockCount: number;
    value: number;
    change: number;
    percChange: number;
    gain: number;
    percGain: number;
}

// The stock data for PortfolioPage and PortfolioPageRow
interface IStock {
    ordering: number;
    stockId: number;
    stockPageId: number;
    draggableId: string;
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    averagePrice: number;
    profit: number;
    profitPercent: number;
    value: number;
    prediction: number;
    confidence: number;
}

// The reponse got from backend (Will change it later to match the actual)
interface IStockResponse {
    id: number;
    code: string;
    stockPageId: number;
    stockName: string;
    price: number;
    change: number;
    percChange: number;
    avgPrice: number;
    unitsHeld: number;
    gain: number;
    percGain: number;
    value: number;
    order: number;
    prediction: number;
    confidence: number;
}

// The stock data for fundamental tab in portfolio page
interface IStockFundamental {
    ordering: number;
    stockId: number;
    stockPageId: number;
    draggableId: string;
    symbol: string;
    name: string;
    dayHigh: number | null;
    dayLow: number | null;
    fiftyTwoWeekHigh: number | null;
    fiftyTwoWeekLow: number | null;
    volume: number | null;
    avgVolume: number | null;
    marketCap: number | null;
    beta: number | null;
}

interface IStockPageResponse {
    id: number;
    code: string;
    stockName: string;
    exchange: string;
    price: number;
    change: number;
    percChange: number;
    prevClose: number;
    open: number;
    bid: number;
    bidSize: number;
    ask: number;
    askSize: number;
    dayHigh: number;
    dayLow: number;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    volume: number;
    avgVolume: number;
    marketCap: number;
    beta: number | null;
    longName: string;
    industry: string;
    sector: string;
    website: string;
    longBusinessSummary: string;
    prediction: number;
    confidence: number;
}

interface IStockHistoryResponse {
    stockPageId: number;
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

// Temp sort parameters
interface TableOrdering<T extends string> {
    column: T | '',
    ordering: Ordering
}

interface OrderingIndicatorProp {
    target: string;
    ordering: TableOrdering<string>;
}
