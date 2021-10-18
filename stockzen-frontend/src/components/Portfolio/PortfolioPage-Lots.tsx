import crossIcon from 'assets/icon-outlines/outline-cross.svg';
import plusCircle from 'assets/icon-outlines/outline-plus-circle.svg';
import { LotType } from 'enums';
import moment, { Moment } from 'moment';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { useForm } from 'react-hook-form';
import styles from './PortfolioPage-Panel.module.css';

const PortfolioPageLots: FC<IPortfolioPageLotProp> = (props) => {
  // const [currentPrice, setCurrentPrice] = useState(12);
  // const [priceChange, setPriceChange] = useState(1.1);
  const { stockId, currentPrice, priceChange, onSizeChanged } = props;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingLotId, setDeletingLotId] = useState<number>();
  const [deletingLotType, setDeletingLotType] = useState<LotType>(
    LotType.Bought
  );
  const [showAddLotBoughtModal, setShowAddLotBoughtModal] = useState(false);
  const [showAddLotSoldModal, setShowAddLotSoldModal] = useState(false);

  const [lotsBought, setLotsBought] = useState<ILotBought[]>([]);
  const [boughtTotal, setBoughtTotal] = useState<ILotTotal>({
    units: 0,
    pricePerUnit: 0,
    price: 0,
  });

  const [lotsSold, setLotsSold] = useState<ILotSold[]>([]);
  const [soldTotal, setSoldTotal] = useState<ILotTotal>({
    units: 0,
    pricePerUnit: 0,
    price: 0,
  });

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'decimal',
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }),
    []
  );

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

  useEffect(() => {
    setBoughtTotal(sumLot(lotsBought));
    onSizeChanged();
  }, [lotsBought, setBoughtTotal, sumLot, onSizeChanged]);

  useEffect(() => {
    setSoldTotal(sumLot(lotsSold));
    onSizeChanged();
  }, [lotsSold, setSoldTotal, sumLot, onSizeChanged]);

  useEffect(() => {
    setLotsBought([
      {
        lotId: Math.random(),
        tradeDate: moment(new Date(2021, 3, 12)),
        units: 10,
        pricePerUnit: 2,
      },
      {
        lotId: Math.random(),
        tradeDate: moment(new Date(2021, 4, 1)),
        units: 5,
        pricePerUnit: 15,
      },
      {
        lotId: Math.random(),
        tradeDate: moment(new Date(2021, 4, 14)),
        units: 5,
        pricePerUnit: 17,
      },
      {
        lotId: Math.random(),
        tradeDate: moment(new Date(2021, 4, 14)),
        units: Math.random() * 10000,
        pricePerUnit: Math.random() * 100,
      },
      {
        lotId: Math.random(),
        tradeDate: moment(new Date(2021, 4, 14)),
        units: Math.random() * 10000,
        pricePerUnit: Math.random() * 100,
      },
    ]);

    setLotsSold([
      {
        lotId: Math.random(),
        tradeDate: moment(new Date(2021, 10, 12)),
        units: 10,
        pricePerUnit: 2,
      },
      {
        lotId: Math.random(),
        tradeDate: moment(new Date(2021, 11, 12)),
        units: Math.random() * 10000,
        pricePerUnit: Math.random() * 100,
      },
      {
        lotId: Math.random(),
        tradeDate: moment(new Date(2021, 11, 15)),
        units: Math.random() * 10000,
        pricePerUnit: Math.random() * 100,
      },
    ]);
  }, [setLotsBought, setLotsSold]);

  const handleAddBoughtLot = async (data: any) => {
    const payload = {
      stockId: stockId,
      tradeDate: moment(data.tradeDate),
      units: parseFloat(data.units),
      pricePerUnit: parseFloat(data.pricePerUnit),
    };

    // TODO: Wire up the API
    const response = await Promise.resolve();

    // TODO: Update the whole list
    setLotsBought((lots: ILotBought[]) => {
      return [...lots, { ...payload, lotId: Math.random() }].sort(
        (a, b) => a.tradeDate.unix() - b.tradeDate.unix()
      );
    });

    setShowAddLotBoughtModal(false);
  };

  const handleAddSoldLot = async (data: any) => {
    const payload = {
      stockId: stockId,
      tradeDate: moment(data.tradeDate),
      units: parseFloat(data.units),
      pricePerUnit: parseFloat(data.pricePerUnit),
    };

    // TODO: Wire up the API
    const response = await Promise.resolve();

    // TODO: Reload the whole list instead
    setLotsSold((lots: ILotSold[]) => {
      return [...lots, { ...payload, lotId: Math.random() }].sort(
        (a, b) => a.tradeDate.unix() - b.tradeDate.unix()
      );
    });

    setShowAddLotSoldModal(false);
  };

  const handleDeleteLot = () => {
    switch (deletingLotType) {
      case LotType.Bought:
        // TODO: Wire up the API
        // axios.delete('/lot', {lotId: deletingLotId}).then(()=>{

        // });

        // TODO: Reload the whole list instead
        setLotsBought((lots: ILotSold[]) => {
          return lots.filter((x) => x.lotId !== deletingLotId);
        });
        break;
      case LotType.Sold:
        // TODO: Wire up the API
        // axios.delete('/lot', {lotId: deletingLotId}).then(()=>{

        // });

        // TODO: Reload the whole list instead
        setLotsSold((lots: ILotSold[]) => {
          return lots.filter((x) => x.lotId !== deletingLotId);
        });
        break;
    }
    setShowDeleteModal(false);
  };

  return (
    <>
      {showAddLotBoughtModal && (
        <Modal
          show={showAddLotBoughtModal}
          onHide={() => setShowAddLotBoughtModal(false)}
          size='sm'
        >
          <Modal.Body>
            <Form
              autoComplete='off'
              onSubmit={handleSubmit(handleAddBoughtLot)}
            >
              <h5>Add new lot:Bought</h5>

              <Form.Group>
                <Form.Label>Trade Date</Form.Label>
                <Form.Control
                  type='date'
                  {...register('tradeDate', {
                    required: true,
                  })}
                ></Form.Control>

                <Form.Text className={styles.errorMessage}>
                  {errors.tradeDate?.type === 'required' &&
                    'Trade date is required'}
                </Form.Text>
              </Form.Group>

              <Form.Group>
                <Form.Label>Units</Form.Label>
                <Form.Control
                  type='number'
                  min='0'
                  {...register('units', {
                    required: true,
                  })}
                ></Form.Control>

                <Form.Text className={styles.errorMessage}>
                  {errors.units?.type === 'required' && 'Units is required'}
                </Form.Text>
              </Form.Group>

              <Form.Group>
                <Form.Label>Price/unit</Form.Label>
                <Form.Control
                  type='number'
                  {...register('pricePerUnit', {
                    required: true,
                  })}
                ></Form.Control>

                <Form.Text className={styles.errorMessage}>
                  {errors.pricePerUnit?.type === 'required' &&
                    'Price/unit is required'}
                </Form.Text>
              </Form.Group>

              <div className='text-center mt-4'>
                <Button type='submit' variant='zen-3'>
                  OK
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}

      {showAddLotSoldModal && (
        <Modal
          show={showAddLotSoldModal}
          onHide={() => setShowAddLotSoldModal(false)}
          size='sm'
        >
          <Modal.Body>
            <Form autoComplete='off' onSubmit={handleSubmit(handleAddSoldLot)}>
              <h5>Add new lot:Sold</h5>

              <Form.Group>
                <Form.Label>Trade Date</Form.Label>
                <Form.Control
                  type='date'
                  {...register('tradeDate', {
                    required: true,
                  })}
                ></Form.Control>

                <Form.Text className={styles.errorMessage}>
                  {errors.tradeDate?.type === 'required' &&
                    'Trade date is required'}
                </Form.Text>
              </Form.Group>

              <Form.Group>
                <Form.Label>Units</Form.Label>
                <Form.Control
                  type='number'
                  min="0"
                  {...register('units', {
                    required: true,
                  })}
                ></Form.Control>

                <Form.Text className={styles.errorMessage}>
                  {errors.units?.type === 'required' && 'Units is required'}
                </Form.Text>
              </Form.Group>

              <Form.Group>
                <Form.Label>Price/unit</Form.Label>
                <Form.Control
                  type='number'
                  {...register('pricePerUnit', {
                    required: true,
                  })}
                ></Form.Control>

                <Form.Text className={styles.errorMessage}>
                  {errors.pricePerUnit?.type === 'required' &&
                    'Price/unit is required'}
                </Form.Text>
              </Form.Group>

              <div className='text-center mt-4'>
                <Button type='submit' variant='zen-3'>
                  OK
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}

      {showDeleteModal && (
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Delete lot</Modal.Title>
          </Modal.Header>
          <Modal.Body>Do you want to this list?</Modal.Body>
          <Modal.Footer>
            <Button variant={'danger'} onClick={handleDeleteLot}>
              Yes
            </Button>
            <Button
              variant={'secondary'}
              onClick={(ev) => setShowDeleteModal(false)}
            >
              No
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <div style={{ margin: '10px 20px' }}>
        <div className={styles.header}>
          <div className={styles.actionButtonContainer}>
            <Button
              variant='transparent'
              size='sm'
              className='text-zen-2'
              onClick={() => {
                setShowAddLotBoughtModal(true);
              }}
            >
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

        <hr style={{ marginBottom: '5px', marginTop: '5px' }} />

        {lotsBought.map((lot) => (
          <div key={`lot-${lot.lotId}`} className={styles.lotRow}>
            <div className={styles.lotTradeDate}>
              {lot.tradeDate.format('DD/MM/YYYY')}
            </div>
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
            <div className={styles.lotDelete}>
              <Button
                variant='transparent'
                className={`p-0 ${styles.deleteButton}`}
                onClick={() => {
                  setDeletingLotType(LotType.Bought);
                  setDeletingLotId(lot.lotId);
                  setShowDeleteModal(true);
                }}
              >
                <img src={crossIcon} alt='cross' />
              </Button>
            </div>
          </div>
        ))}

        <hr style={{ marginBottom: '5px', marginTop: '5px' }} />

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
            <Button
              variant='transparent'
              size='sm'
              className='text-zen-2'
              onClick={() => setShowAddLotSoldModal(true)}
            >
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

        <hr style={{ marginBottom: '5px', marginTop: '5px' }} />

        {lotsSold.map((lot) => (
          <div key={`lot-${lot.lotId}`} className={styles.lotRow}>
            <div className={styles.lotTradeDate}>
              {lot.tradeDate.format('DD/MM/YYYY')}
            </div>
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
            <div className={styles.lotDelete}>
              <Button
                variant='transparent'
                className={`p-0 ${styles.deleteButton}`}
                onClick={() => {
                  setDeletingLotType(LotType.Sold);
                  setDeletingLotId(lot.lotId);
                  setShowDeleteModal(true);
                }}
              >
                <img src={crossIcon} alt='cross' />
              </Button>
            </div>
          </div>
        ))}

        <hr style={{ marginBottom: '5px', marginTop: '5px' }} />

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
  tradeDate: Moment;
  units: number;
  pricePerUnit: number;
}

interface ILotSold extends ILot {
  lotId: number;
  tradeDate: Moment;
  units: number;
  pricePerUnit: number;
}

interface IPortfolioPageLotProp {
  readonly stockId: number;
  readonly currentPrice: number;
  readonly priceChange: number;

  readonly onSizeChanged: () => void;
}

export default PortfolioPageLots;
