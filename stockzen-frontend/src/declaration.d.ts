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

interface TableOrdering<T extends string> {
    column: T | '';
    ordering: Ordering;
}

interface OrderingIndicatorProp {
    target: string;
    ordering: TableOrdering<string>;
}



interface StockListResponse {
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
