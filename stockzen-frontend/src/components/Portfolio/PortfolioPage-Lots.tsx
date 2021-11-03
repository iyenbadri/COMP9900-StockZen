import crossIcon from 'assets/icon-outlines/outline-cross.svg';
import editIcon from 'assets/icon-outlines/outline-edit-1.svg';
import plusCircle from 'assets/icon-outlines/outline-plus-circle.svg';
import axios, { AxiosResponse } from 'axios';
import { LotType } from 'enums';
import moment, { Moment } from 'moment';
import React, { FC, useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { useForm } from 'react-hook-form';
import styles from './PortfolioPage-Panel.module.css';

// Number formatter
const numberFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const mapBoughtLotResponse = (lot: ILotBoughtResponse): ILotBought => ({
  lotId: lot.id,
  tradeDate: moment(lot.tradeDate, 'YYYY-MM-DD'),
  units: lot.units,
  unitPrice: lot.unitPrice,
});

const mapSoldLotResponse = (lot: ILotSoldResponse): ILotSold => ({
  lotId: lot.id,
  tradeDate: moment(lot.tradeDate, 'YYYY-MM-DD'),
  units: lot.units,
  unitPrice: lot.unitPrice,
});

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

  const reloadBoughtLotsList = async () => {
    let response: AxiosResponse<ILotBoughtResponse[]> = await axios.get(
      '/lot/buy/list/' + stockId.toString()
    );

    setLotsBought(
      response.data
        .map(mapBoughtLotResponse)
        .sort((a, b) => a.tradeDate.unix() - b.tradeDate.unix())
    );
  };

  const reloadSoldLotsList = async () => {
    let response: AxiosResponse<ILotSoldResponse[]> = await axios.get(
      '/lot/sell/list/' + stockId.toString()
    );

    setLotsSold(
      response.data
        .map(mapSoldLotResponse)
        .sort((a, b) => a.tradeDate.unix() - b.tradeDate.unix())
    );
  };

  // Set lots to dummy data
  useEffect(() => {
    reloadBoughtLotsList();

    reloadSoldLotsList();
  }, []);

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
              tradeDate: tradeDate.format('YYYY-MM-DD'),
              units: units,
              unitPrice: unitPrice,
            };

            // Wire up the API
            await axios.post('/lot/buy/' + stockId.toString(), payload);
          }
          break;
        case LotType.Sold:
          {
            // Payload to call API
            const payload = {
              tradeDate: tradeDate.format('YYYY-MM-DD'),
              units: units,
              unitPrice: unitPrice,
            };

            // Wire up the API
            await axios.post('/lot/sell/' + stockId.toString(), payload);
          }
          break;
      }
    },
    []
  );

  // Handler of add bought lot
  const handleAddBoughtLot = async (data: any) => {
    await addLot(
      LotType.Bought,
      stockId,
      moment(data.tradeDate),
      parseFloat(data.units),
      parseFloat(data.unitPrice)
    );

    await reloadBoughtLotsList();

    setShowAddLotBoughtModal(false);
  };

  // Hanlder of add sold lot
  const handleAddSoldLot = async (data: any) => {
    await addLot(
      LotType.Sold,
      stockId,
      moment(data.tradeDate),
      parseFloat(data.units),
      parseFloat(data.unitPrice)
    );

    await reloadSoldLotsList();

    setShowAddLotSoldModal(false);
  };

  // Handler of delete lot
  const handleDeleteLot = async () => {
    switch (deletingLotType) {
      case LotType.Bought:
        // Wire up the API
        await axios.delete('/lot/buy/' + deletingLotId!.toString());

        // Reload the whole list instead
        await reloadBoughtLotsList();
        break;
      case LotType.Sold:
        await axios.delete('/lot/sell/' + deletingLotId!.toString());
        // Reload the whole list instead
        await reloadSoldLotsList();
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
        // Wire up the API
        await axios.delete('/lot/buy/' + editingLotId!.toString());

        // Reload the whole list instead
        await reloadBoughtLotsList();

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

        // Wire up the API
        await axios.delete('/lot/sell/' + editingLotId!.toString());

        // Reload the whole list instead
        await reloadSoldLotsList();

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

        {lotsBought.length !== 0 && (
          <>
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
                      setEditingLotTradeDate(
                        lot.tradeDate.format('YYYY-MM-DD')
                      );
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
          </>
        )}

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

        {lotsSold.length !== 0 && (
          <>
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
                      setEditingLotTradeDate(
                        lot.tradeDate.format('YYYY-MM-DD')
                      );
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
          </>
        )}

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

interface ILotBoughtResponse {
  id: number;
  tradeDate: string;
  units: number;
  unitPrice: number;
}

interface ILotSold extends ILot {
  lotId: number;
  tradeDate: Moment;
  units: number;
  unitPrice: number;
}

interface ILotSoldResponse {
  id: number;
  tradeDate: string;
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
