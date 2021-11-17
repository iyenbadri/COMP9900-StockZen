import { createContext, FC, useState } from 'react';

interface addedStockPageIds {
  stockPageId: number;
}

interface ISubmission {
  submit: boolean;
  setSubmit: (submit: boolean) => void;
  selectedStocks: ISelectedStock[];
  selectedStockPageIds: addedStockPageIds[];
  addSelectedStock: (stock: ISelectedStock) => void;
  deleteSelectedStock: (stockId: number) => void;
  submissionSuccess: boolean;
  setSubmissionSuccess: (success: boolean) => void;
  submissionError: boolean;
  setSubmissionError: (submissionError: boolean) => void;
}

const submissionDefaultValues: ISubmission = {
  submit: false,
  setSubmit: (submit: boolean) => { },
  selectedStocks: [],
  selectedStockPageIds: [],
  addSelectedStock: (stock: ISelectedStock) => { },
  deleteSelectedStock: (stockId: number) => { },
  submissionSuccess: false,
  setSubmissionSuccess: (success: boolean) => { },
  submissionError: false,
  setSubmissionError: (submissionError: boolean) => { },
}

export const SubmissionContext =
  createContext<ISubmission>(submissionDefaultValues);

// **************************************************************
// Submission context provider
// **************************************************************
const SubmissionProvider: FC = ({ children }): any => {
  const [submit, setSubmit] = useState<boolean>(false);
  const [selectedStocks, setSelectedStocks] = useState<ISelectedStock[]>([]);
  const [selectedStockPageIds, setSelectedstockPageIds] = useState<addedStockPageIds[]>([]);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<boolean>(false);

  const addSelectedStock = (stock: ISelectedStock) => {
    const newStockPageId: addedStockPageIds = {
      stockPageId: stock.stockPageId
    }
    setSelectedStocks([...selectedStocks, stock]);
    setSelectedstockPageIds([...selectedStockPageIds, newStockPageId]);
  }

  const deleteSelectedStock = (stockId: number) => {
    setSelectedStocks(selectedStocks.filter(selectedStocks => {
      return selectedStocks.stockPageId !== stockId;
    }))
    setSelectedstockPageIds(selectedStockPageIds.filter(selectedStockPageIds => {
      return selectedStockPageIds.stockPageId !== stockId;
    }))
  }

  return (
    <SubmissionContext.Provider
      value={{
        submit,
        setSubmit,
        selectedStocks,
        selectedStockPageIds,
        addSelectedStock,
        deleteSelectedStock,
        submissionSuccess,
        setSubmissionSuccess,
        submissionError,
        setSubmissionError,
      }}
    >
      {children}
    </SubmissionContext.Provider>
  );
};

export default SubmissionProvider;
