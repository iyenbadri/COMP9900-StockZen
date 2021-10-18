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

interface TableOrdering<T extends string> {
    column: T | '',
    ordering: Ordering
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
}
