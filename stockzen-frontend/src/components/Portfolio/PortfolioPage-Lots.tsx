import { TopPerformerContext } from 'contexts/TopPerformerContext';
import moment from 'moment';
import React, {
  FC,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { Link } from 'react-router-dom';
import styles from './PortfolioPage-Panel.module.css';
import Button from 'react-bootstrap/Button';
import plusCircle from 'assets/icon-outlines/outline-plus-circle.svg';

// interface IProps {
//   firstName: string;
//   lastName: string;
// }

interface ILot {
  units: number;
  pricePerUnit: number;
}

interface ILotTotal {
  units: number;
  pricePerUnit: number;
  price: number;
}

interface ILotBought extends ILot {
  lotId: number;
  tradeDate: string;
  units: number;
  pricePerUnit: number;
}

interface ILotSold extends ILot {
  lotId: number;
  tradeDate: string;
  units: number;
  pricePerUnit: number;
}

interface IPortfolioPageLotPro {
  currentPrice: number;
  priceChange: number;
}

const PortfolioPageLots: FC<IPortfolioPageLotPro> = (props) => {
  const [lotsBought, _setLotsBought] = useState<ILotBought[]>([]);
  const [boughtTotal, _setBoughtTotal] = useState<ILotTotal>({
    units: 0,
    pricePerUnit: 0,
    price: 0,
  });

  const [lotsSold, _setLotsSold] = useState<ILotSold[]>([]);
  const [soldTotal, _setSoldTotal] = useState<ILotTotal>({
    units: 0,
    pricePerUnit: 0,
    price: 0,
  });

  // const [currentPrice, setCurrentPrice] = useState(12);
  // const [priceChange, setPriceChange] = useState(1.1);
  const { currentPrice, priceChange } = props;

  const numberFormatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  const sumLot = useCallback((lots: ILot[]): ILotTotal => {
    const sum = lots.reduce(
      (total, lot) => ({
        units: total.units + lot.units,
        price: total.price + lot.units * lot.pricePerUnit,
      }),
      { units: 0, price: 0 }
    );

    return {
      units: sum.units,
      pricePerUnit: sum.units === 0 ? 0 : sum.price / sum.units,
      price: sum.price,
    };
  }, []);

  const setLotsBought = useCallback((lots: ILotBought[]) => {
    _setLotsBought(lots);

    _setBoughtTotal(sumLot(lots));
  }, []);

  const setLotsSold = useCallback((lots: ILotSold[]) => {
    _setLotsSold(lots);

    _setSoldTotal(sumLot(lots));
  }, []);

  useEffect(() => {
    setLotsBought([
      {
        lotId: Math.random(),
        tradeDate: '12/03/2021',
        units: 10,
        pricePerUnit: 2,
      },
      {
        lotId: Math.random(),
        tradeDate: '01/04/2021',
        units: 5,
        pricePerUnit: 15,
      },
      {
        lotId: Math.random(),
        tradeDate: '14/04/2021',
        units: 5,
        pricePerUnit: 17,
      },
      {
        lotId: Math.random(),
        tradeDate: '14/04/2021',
        units: Math.random() * 10000,
        pricePerUnit: Math.random() * 100,
      },
      {
        lotId: Math.random(),
        tradeDate: '14/04/2021',
        units: Math.random() * 10000,
        pricePerUnit: Math.random() * 100,
      },
    ]);

    setLotsSold([
      {
        lotId: Math.random(),
        tradeDate: '12/10/2021',
        units: 10,
        pricePerUnit: 2,
      },
      {
        lotId: Math.random(),
        tradeDate: '14/11/2021',
        units: Math.random() * 10000,
        pricePerUnit: Math.random() * 100,
      },
      {
        lotId: Math.random(),
        tradeDate: '15/11/2021',
        units: Math.random() * 10000,
        pricePerUnit: Math.random() * 100,
      },
    ]);
  }, []);

  return (
    <>
      <div style={{ margin: '10px 20px' }}>
        <div className={styles.header}>
          <div className={styles.actionButtonContainer}>
            <Button variant='transparent' size='sm' className='text-zen-2'>
              <img src={plusCircle} alt='add' />
              Add new
            </Button>
          </div>
          <div className={styles.headerText}>BOUGHT</div>
        </div>

        <div className={`${styles.lotRow} ${styles.rowHeader}`}>
          <div className={styles.lotTradeDate}>Trade Date</div>
          <div className={styles.lotUnits}>Units</div>
          <div className={styles.lotPricePerUnit}>Price/unit</div>
          <div className={styles.lotValue}>Value</div>
          <div className={styles.lotChange}>Change</div>
          <div className={styles.lotDelete}></div>
        </div>

        <hr style={{ marginBottom: '10px', marginTop: '0' }} />

        {lotsBought.map((lot) => (
          <div key={`lot-${lot.lotId}`} className={styles.lotRow}>
            <div className={styles.lotTradeDate}>{lot.tradeDate}</div>
            <div className={styles.lotUnits}>
              {numberFormatter.format(lot.units)}
            </div>
            <div className={styles.lotPricePerUnit}>
              {numberFormatter.format(lot.pricePerUnit)}
            </div>
            <div className={styles.lotValue}>
              {numberFormatter.format(lot.units * currentPrice)}
            </div>
            <div className={styles.lotChange}>
              {numberFormatter.format(lot.units * priceChange)}
            </div>
            <div className={styles.lotDelete}></div>
          </div>
        ))}

        <hr style={{ marginBottom: '10px', marginTop: '0' }} />

        <div className={styles.lotRow}>
          <div className={styles.lotTradeDate}>TOTAL</div>
          <div className={styles.lotUnits}>
            {numberFormatter.format(boughtTotal.units)}
          </div>
          <div className={styles.lotPricePerUnit}>
            {numberFormatter.format(boughtTotal.pricePerUnit)}
          </div>
          <div className={styles.lotValue}>
            {numberFormatter.format(boughtTotal.units * currentPrice)}
          </div>
          <div className={styles.lotChange}>
            {numberFormatter.format(boughtTotal.units * priceChange)}
          </div>
          <div className={styles.lotDelete}></div>
        </div>
      </div>
      <hr />
      <div style={{ margin: '10px 20px' }}>
        <div className={styles.header}>
          <div className={styles.actionButtonContainer}>
            <Button variant='transparent' size='sm' className='text-zen-2'>
              <img src={plusCircle} alt='add' />
              Add new
            </Button>
          </div>
          <div className={styles.headerText}>SOLD</div>
        </div>

        <div className={`${styles.lotRow} ${styles.rowHeader}`}>
          <div className={styles.lotTradeDate}>Trade Date</div>
          <div className={styles.lotUnits}>Units</div>
          <div className={styles.lotPricePerUnit}>Price/unit</div>
          <div className={styles.lotValue}>Amount</div>
          <div className={styles.lotChange}>Realised</div>
          <div className={styles.lotDelete}></div>
        </div>

        <hr style={{ marginBottom: '10px', marginTop: '0' }} />

        {lotsSold.map((lot) => (
          <div key={`lot-${lot.lotId}`} className={styles.lotRow}>
            <div className={styles.lotTradeDate}>{lot.tradeDate}</div>
            <div className={styles.lotUnits}>
              {numberFormatter.format(lot.units)}
            </div>
            <div className={styles.lotPricePerUnit}>
              {numberFormatter.format(lot.pricePerUnit)}
            </div>
            <div className={styles.lotValue}>
              {numberFormatter.format(lot.units * lot.pricePerUnit)}
            </div>
            <div className={styles.lotChange}>
              {numberFormatter.format(
                lot.units * (lot.pricePerUnit - boughtTotal.pricePerUnit)
              )}
            </div>
            <div className={styles.lotDelete}></div>
          </div>
        ))}

        <hr style={{ marginBottom: '10px', marginTop: '0' }} />

        <div className={styles.lotRow}>
          <div className={styles.lotTradeDate}>TOTAL</div>
          <div className={styles.lotUnits}>
            {numberFormatter.format(soldTotal.units)}
          </div>
          <div className={styles.lotPricePerUnit}>
            {numberFormatter.format(soldTotal.pricePerUnit)}
          </div>
          <div className={styles.lotValue}>
            {numberFormatter.format(soldTotal.price)}
          </div>
          <div className={styles.lotChange}>
            {numberFormatter.format(
              soldTotal.price - boughtTotal.pricePerUnit * soldTotal.units
            )}
          </div>
          <div className={styles.lotDelete}></div>
        </div>
      </div>
    </>
  );
};

export default PortfolioPageLots;
