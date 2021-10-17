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
