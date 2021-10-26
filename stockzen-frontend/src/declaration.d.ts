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

// Stock data for StockPage
// This is just a draft reseponse from the backend,
// will change later to match what is actually retrieved
interface IStockInfo {
    stockId: number;
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    avgPrice: number;
    profit: number;
    profitPercent: number;
    value: number;
    summary: IStockSummary;
    profile: IStockProfile;
}

// Stock summary response (draft)
interface IStockSummary {
    prevClose: number | null;        // previousClose
    open: number | null;             // open
    bid: number | null;              // bid
    bidSize: number | null;          // bidSize
    ask: number | null;              // ask
    askSize: number | null;          // askSize
    dayHigh: number | null;          // dayHigh
    dayLow: number | null;           // dahLow
    fiftyTwoWeekHigh: number | null; // fiftyTwoWeekHigh
    fiftyTwoWeekLow: number | null;  // fiftyTwoWeekLow
    volume: number | null;           // volume24Hr
    avgVolume: number | null;        // averageVolume
    marketCap: number | null;        // marketCap
    beta: number | null;             // beta
    // PERatio: number;
    // EPS: number;
    // earningDate: string;
    // forwardDividendNYield: string;
    // exDividendDate: string;
    // targetEst: string;
}

// Company profile response (draft)
interface IStockProfile {
    longName: string;
    industry: string | null;
    sector: string | null;
    website: string | null;
    longBusinessSummary: string | null;
}

// The reponse got from backend (Will change it later to match the actual)
interface IStockResponse {
    id: number;
    code: string;
    stock_page_id: number;
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

// The reponse got from backend (Will change it later to match the actual)
interface IStockResponse {
    id: number;
    code: string;
    stock_page_id: number;
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

// Temp sort parameters
interface TableOrdering<T extends string> {
    column: T | '',
    ordering: Ordering
}

interface OrderingIndicatorProp {
    target: string;
    ordering: TableOrdering<string>;
}
