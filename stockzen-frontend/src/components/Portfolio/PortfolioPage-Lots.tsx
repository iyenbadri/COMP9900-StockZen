import crossIcon from 'assets/icon-outlines/outline-cross.svg';
import plusCircle from 'assets/icon-outlines/outline-plus-circle.svg';
import editIcon from 'assets/icon-outlines/outline-edit-1.svg';
import { LotType } from 'enums';
import moment, { Moment } from 'moment';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { useForm } from 'react-hook-form';
import styles from './PortfolioPage-Panel.module.css';

const PortfolioPageLots: FC<IPortfolioPageLotProp> = (props) => {
  // Deconstruct the properties
  const { stockId, currentPrice, priceChange, onSizeChanged } = props;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // States for deleting lot
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingLotId, setDeletingLotId] = useState<number>();
  const [deletingLotType, setDeletingLotType] = useState<LotType>(
    LotType.Bought
  );

  // State for adding lot
  const [showAddLotBoughtModal, setShowAddLotBoughtModal] = useState(false);
  const [showAddLotSoldModal, setShowAddLotSoldModal] = useState(false);

  // States for editing lot
  const [showEditingLotModal, setShowEditingLotModal] = useState(false);
  const [editingLotType, setEditingLotType] = useState<LotType>(LotType.Bought);
  const [editingLotId, setEditingLotId] = useState<number>();
  const [editingLotTradeDate, setEditingLotTradeDate] = useState<string>();
  const [editingLotUnits, setEditingLotUnits] = useState<string>();
  const [editingLotUnitPrice, setEditingLotUnitPrice] = useState<string>();

  // Bought lots
  const [lotsBought, setLotsBought] = useState<ILotBought[]>([]);
  const [boughtTotal, setBoughtTotal] = useState<ILotTotal>({
    units: 0,
    unitPrice: 0,
    price: 0,
  });

  // Sold lots
  const [lotsSold, setLotsSold] = useState<ILotSold[]>([]);
  const [soldTotal, setSoldTotal] = useState<ILotTotal>({
    units: 0,
    unitPrice: 0,
    price: 0,
  });

  // Number formatter
  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'decimal',
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }),
    []
  );

  // Function to sum the lots
  const sumLot = useCallback((lots: ILot[]): ILotTotal => {
    const sum = lots.reduce(
      (total, lot) => ({
        units: total.units + lot.units,
        price: total.price + lot.units * lot.unitPrice,
      }),
      { units: 0, price: 0 }
    );

    return {
      units: sum.units,
      unitPrice: sum.units === 0 ? 0 : sum.price / sum.units,
      price: sum.price,
    };
  }, []);

  // Watch the lotsBought and update the total when it changed
  useEffect(() => {
    setBoughtTotal(sumLot(lotsBought));
    onSizeChanged();
  }, [lotsBought, setBoughtTotal, sumLot, onSizeChanged]);

  // Watch the lotsSold and update the total when it changed
  useEffect(() => {
    setSoldTotal(sumLot(lotsSold));
    onSizeChanged();
  }, [lotsSold, setSoldTotal, sumLot, onSizeChanged]);

  // Set lots to dummy data
  useEffect(() => {
    setLotsBought([
      {
        lotId: Math.random(),
        tradeDate: moment(new Date(2021, 3, 12)),
        units: 10,
        unitPrice: 2,
      },
      {
        lotId: Math.random(),
        tradeDate: moment(new Date(2021, 4, 1)),
        units: 5,
        unitPrice: 15,
      },
      {
        lotId: Math.random(),
        tradeDate: moment(new Date(2021, 4, 14)),
        units: 5,
        unitPrice: 17,
      },
      {
        lotId: Math.random(),
        tradeDate: moment(new Date(2021, 4, 14)),
        units: Math.random() * 10000,
        unitPrice: Math.random() * 100,
      },
      {
        lotId: Math.random(),
        tradeDate: moment(new Date(2021, 4, 14)),
        units: Math.random() * 10000,
        unitPrice: Math.random() * 100,
      },
    ]);

    setLotsSold([
      {
        lotId: Math.random(),
        tradeDate: moment(new Date(2021, 10, 12)),
        units: 10,
        unitPrice: 2,
      },
      {
        lotId: Math.random(),
        tradeDate: moment(new Date(2021, 11, 12)),
        units: Math.random() * 10000,
        unitPrice: Math.random() * 100,
      },
      {
        lotId: Math.random(),
        tradeDate: moment(new Date(2021, 11, 15)),
        units: Math.random() * 10000,
        unitPrice: Math.random() * 100,
      },
    ]);
  }, [setLotsBought, setLotsSold]);

  // Handler of add lot (both bought and sold)
  const addLot = useCallback(
    async (
      lotType: LotType,
      stockId: number,
      tradeDate: Moment,
      units: number,
      unitPrice: number
    ) => {
      switch (lotType) {
        case LotType.Bought:
          {
            // Payload to call API
            const payload = {
              stockId: stockId,
              tradeDate: tradeDate,
              units: units,
              unitPrice: unitPrice,
            };

            // TODO: Wire up the API
            const response = await Promise.resolve();

            // TODO: Reload the whole list instead
            // Update the lotsBought (with sorted)
            setLotsBought((lots: ILotBought[]) => {
              return [
                // The old lots
                ...lots,

                // The newly created lot
                {
                  lotId: Math.random(),
                  stockId: stockId,
                  tradeDate: tradeDate,
                  units: units,
                  unitPrice: unitPrice,
                },
              ].sort((a, b) => a.tradeDate.unix() - b.tradeDate.unix());
            });
          }
          break;
        case LotType.Sold:
          {
            // Payload to call API
            const payload = {
              stockId: stockId,
              tradeDate: tradeDate,
              units: units,
              unitPrice: unitPrice,
            };

            // TODO: Wire up the API
            const response = await Promise.resolve();

            // TODO: Reload the whole list instead
            // Set the lots sold
            setLotsSold((lots: ILotSold[]) => {
              return [
                // The old lots
                ...lots,

                // The newly created lot
                {
                  lotId: Math.random(),
                  stockId: stockId,
                  tradeDate: tradeDate,
                  units: units,
                  unitPrice: unitPrice,
                },
              ].sort((a, b) => a.tradeDate.unix() - b.tradeDate.unix());
            });
          }
          break;
      }
    },
    []
  );

  // Handler of add bought lot
  const handleAddBoughtLot = async (data: any) => {
    addLot(
      LotType.Bought,
      stockId,
      moment(data.tradeDate),
      parseFloat(data.units),
      parseFloat(data.unitPrice)
    );

    setShowAddLotBoughtModal(false);
  };

  // Hanlder of add sold lot
  const handleAddSoldLot = async (data: any) => {
    addLot(
      LotType.Sold,
      stockId,
      moment(data.tradeDate),
      parseFloat(data.units),
      parseFloat(data.unitPrice)
    );

    setShowAddLotSoldModal(false);
  };

  // Handler of delete lot
  const handleDeleteLot = () => {
    switch (deletingLotType) {
      case LotType.Bought:
        // TODO: Wire up the API
        // axios.delete('/lot', {lotId: deletingLotId}).then(()=>{

        // });

        // TODO: Reload the whole list instead
        // Update the lots list to exclude the deleted lot
        setLotsBought((lots: ILotSold[]) => {
          return lots.filter((x) => x.lotId !== deletingLotId);
        });
        break;
      case LotType.Sold:
        // TODO: Wire up the API
        // axios.delete('/lot', {lotId: deletingLotId}).then(()=>{

        // });

        // TODO: Reload the whole list instead
        // Update the lots list to exclude the deleted lot
        setLotsSold((lots: ILotSold[]) => {
          return lots.filter((x) => x.lotId !== deletingLotId);
        });
        break;
    }
    setShowDeleteModal(false);
  };

  // Handler of edit lot
  const handleEditLot = async (data: any) => {
    switch (editingLotType) {
      case LotType.Bought:
        // Add the edited lot
        await addLot(
          LotType.Bought,
          stockId,
          moment(data.tradeDate),
          parseFloat(data.units),
          parseFloat(data.unitPrice)
        );

        // Delete the old lot
        // TODO: Wire up the API
        // axios.delete('/lot', {lotId: editingLotId}).then(()=>{

        // });

        // TODO: Reload the whole list instead
        // Filter out the edited lot ( the old one)
        setLotsBought((lots: ILotSold[]) => {
          return lots.filter((x) => x.lotId !== editingLotId);
        });

        break;
      case LotType.Sold:
        // Add the edited lot
        await addLot(
          LotType.Sold,
          stockId,
          moment(data.tradeDate),
          parseFloat(data.units),
          parseFloat(data.unitPrice)
        );

        // TODO: Wire up the API
        // axios.delete('/lot', {lotId: editingLotId}).then(()=>{

        // });

        // TODO: Reload the whole list instead
        // Filter out the edited lot ( the old one)
        setLotsSold((lots: ILotSold[]) => {
          return lots.filter((x) => x.lotId !== editingLotId);
        });

        break;
    }
    setShowEditingLotModal(false);
  };

  return (
    <>
      {/* Modal to add the bought lot */}
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
              <h5>Add new lot: Bought</h5>

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
                  step='0.01'
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
                  step='0.01'
                  {...register('unitPrice', {
                    required: true,
                  })}
                ></Form.Control>

                <Form.Text className={styles.errorMessage}>
                  {errors.unitPrice?.type === 'required' &&
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

      {/* Modal to add the sold lot */}
      {showAddLotSoldModal && (
        <Modal
          show={showAddLotSoldModal}
          onHide={() => setShowAddLotSoldModal(false)}
          size='sm'
        >
          <Modal.Body>
            <Form autoComplete='off' onSubmit={handleSubmit(handleAddSoldLot)}>
              <h5>Add new lot: Sold</h5>

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
                  step='0.01'
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
                  step='0.01'
                  {...register('unitPrice', {
                    required: true,
                  })}
                ></Form.Control>

                <Form.Text className={styles.errorMessage}>
                  {errors.unitPrice?.type === 'required' &&
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

      {/* Modal to edit lot */}
      {showEditingLotModal && (
        <Modal
          show={showEditingLotModal}
          onHide={() => setShowEditingLotModal(false)}
          size='sm'
        >
          <Modal.Body>
            <Form autoComplete='off' onSubmit={handleSubmit(handleEditLot)}>
              <h5>
                Edit new lot:
                {editingLotType === LotType.Bought ? 'Bought' : 'Sold'}
              </h5>

              <Form.Group>
                <Form.Label>Trade Date</Form.Label>
                <Form.Control
                  type='date'
                  {...register('tradeDate', {
                    required: true,
                    value: editingLotTradeDate,
                  })}
                  onChange={(ev) => {
                    setEditingLotTradeDate(ev.target.value);
                  }}
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
                  step='0.01'
                  {...register('units', {
                    required: true,
                    value: editingLotUnits,
                  })}
                  onChange={(ev) => {
                    setEditingLotUnits(ev.target.value);
                  }}
                ></Form.Control>

                <Form.Text className={styles.errorMessage}>
                  {errors.units?.type === 'required' && 'Units is required'}
                </Form.Text>
              </Form.Group>

              <Form.Group>
                <Form.Label>Price/unit</Form.Label>
                <Form.Control
                  type='number'
                  step='0.01'
                  {...register('unitPrice', {
                    required: true,
                    value: editingLotUnitPrice,
                  })}
                  onChange={(ev) => {
                    setEditingLotUnitPrice(ev.target.value);
                  }}
                ></Form.Control>

                <Form.Text className={styles.errorMessage}>
                  {errors.unitPrice?.type === 'required' &&
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

      {/* Modal to delete lot (confirm) */}
      {showDeleteModal && (
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Delete Lot</Modal.Title>
          </Modal.Header>
          <Modal.Body>Do you want to delete this list?</Modal.Body>
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
        {/* Header of bought lot section */}
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

        {/* Header of bought lot table */}
        <div className={`${styles.lotRow} ${styles.rowHeader}`}>
          <div className={styles.lotTradeDate}>Trade Date</div>
          <div className={styles.lotUnits}>Units</div>
          <div className={styles.lotUnitPrice}>Price/unit</div>
          <div className={styles.lotValue}>Value</div>
          <div className={styles.lotChange}>Change</div>
          <div className={styles.lotActions}></div>
        </div>

        <hr style={{ marginBottom: '5px', marginTop: '5px' }} />

        {/* List of bought lots */}
        {lotsBought.map((lot) => (
          <div key={`lot-${lot.lotId}`} className={styles.lotRow}>
            <div className={styles.lotTradeDate}>
              {lot.tradeDate.format('DD/MM/YYYY')}
            </div>
            <div className={styles.lotUnits}>
              {numberFormatter.format(lot.units)}
            </div>
            <div className={styles.lotUnitPrice}>
              {numberFormatter.format(lot.unitPrice)}
            </div>
            <div className={styles.lotValue}>
              {numberFormatter.format(lot.units * currentPrice)}
            </div>
            <div className={styles.lotChange}>
              {numberFormatter.format(lot.units * priceChange)}
            </div>

            {/* Actions of lot in bought section */}
            <div className={styles.lotActions}>
              <Button
                variant='transparent'
                className={`p-0 ${styles.editButton}`}
                onClick={() => {
                  setEditingLotType(LotType.Bought);
                  setEditingLotId(lot.lotId);
                  setEditingLotTradeDate(lot.tradeDate.format('YYYY-MM-DD'));
                  setEditingLotUnits(lot.units.toString());
                  setEditingLotUnitPrice(lot.unitPrice.toString());
                  setShowEditingLotModal(true);
                }}
              >
                <img src={editIcon} alt='edit this row of bought lots' />
              </Button>

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

        {/* Summary row of bought lots */}
        <div className={styles.lotRow}>
          <div className={styles.lotTradeDate}>TOTAL</div>
          <div className={styles.lotUnits}>
            {numberFormatter.format(boughtTotal.units)}
          </div>
          <div className={styles.lotUnitPrice}>
            {numberFormatter.format(boughtTotal.unitPrice)}
          </div>
          <div className={styles.lotValue}>
            {numberFormatter.format(boughtTotal.units * currentPrice)}
          </div>
          <div className={styles.lotChange}>
            {numberFormatter.format(boughtTotal.units * priceChange)}
          </div>
          <div className={styles.lotActions}></div>
        </div>
      </div>

      <hr />

      <div style={{ margin: '10px 20px' }}>
        {/* Header of sold lots section */}
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

        {/* Header of sold lots table */}
        <div className={`${styles.lotRow} ${styles.rowHeader}`}>
          <div className={styles.lotTradeDate}>Trade Date</div>
          <div className={styles.lotUnits}>Units</div>
          <div className={styles.lotUnitPrice}>Price/unit</div>
          <div className={styles.lotValue}>Amount</div>
          <div className={styles.lotChange}>Realised</div>
          <div className={styles.lotActions}></div>
        </div>

        <hr style={{ marginBottom: '5px', marginTop: '5px' }} />

        {/* List of sold lots */}
        {lotsSold.map((lot) => (
          <div key={`lot-${lot.lotId}`} className={styles.lotRow}>
            <div className={styles.lotTradeDate}>
              {lot.tradeDate.format('DD/MM/YYYY')}
            </div>
            <div className={styles.lotUnits}>
              {numberFormatter.format(lot.units)}
            </div>
            <div className={styles.lotUnitPrice}>
              {numberFormatter.format(lot.unitPrice)}
            </div>
            <div className={styles.lotValue}>
              {numberFormatter.format(lot.units * lot.unitPrice)}
            </div>
            <div className={styles.lotChange}>
              {numberFormatter.format(
                lot.units * (lot.unitPrice - boughtTotal.unitPrice)
              )}
            </div>

            {/* Action of lot in sold section */}
            <div className={styles.lotActions}>
              <Button
                variant='transparent'
                className={`p-0 ${styles.editButton}`}
                onClick={() => {
                  setEditingLotType(LotType.Sold);
                  setEditingLotId(lot.lotId);
                  setEditingLotTradeDate(lot.tradeDate.format('YYYY-MM-DD'));
                  setEditingLotUnits(lot.units.toString());
                  setEditingLotUnitPrice(lot.unitPrice.toString());
                  setShowEditingLotModal(true);
                }}
              >
                <img src={editIcon} alt='edit this row of sold lots' />
              </Button>

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

        {/* Summary row of sold lots */}
        <div className={styles.lotRow}>
          <div className={styles.lotTradeDate}>TOTAL</div>
          <div className={styles.lotUnits}>
            {numberFormatter.format(soldTotal.units)}
          </div>
          <div className={styles.lotUnitPrice}>
            {numberFormatter.format(soldTotal.unitPrice)}
          </div>
          <div className={styles.lotValue}>
            {numberFormatter.format(soldTotal.price)}
          </div>
          <div className={styles.lotChange}>
            {numberFormatter.format(
              soldTotal.price - boughtTotal.unitPrice * soldTotal.units
            )}
          </div>
          <div className={styles.lotActions}></div>
        </div>
      </div>
    </>
  );
};

interface ILot {
  units: number;
  unitPrice: number;
}

interface ILotTotal {
  units: number;
  unitPrice: number;
  price: number;
}

interface ILotBought extends ILot {
  lotId: number;
  tradeDate: Moment;
  units: number;
  unitPrice: number;
}

interface ILotSold extends ILot {
  lotId: number;
  tradeDate: Moment;
  units: number;
  unitPrice: number;
}

interface IPortfolioPageLotProp {
  readonly stockId: number;
  readonly currentPrice: number;
  readonly priceChange: number;

  readonly onSizeChanged: () => void;
}

export default PortfolioPageLots;
