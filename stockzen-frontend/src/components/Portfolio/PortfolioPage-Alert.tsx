import React, { FC, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import styles from './PortfolioPage-Panel.module.css';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const PortfolioPageAlert: FC<IProps> = (props) => {
  const { stockId } = props;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      low: '',
      high: '',
    },
  });

  useEffect(
    () => {
      (async () => {
        // Query the current threshold from backend
        const response = await axios.get<PriceAlertResponse>(
          '/price-alert/' + stockId.toString()
        );

        reset({
          low: response.data.low == null ? '' : response.data.low.toString(),
          high: response.data.high == null ? '' : response.data.high.toString(),
        });
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const saveThresholds = async (data: any) => {
    const payload = {
      high: data.high === '' ? null : parseFloat(data.high),
      low: data.low === '' ? null : parseFloat(data.low),
    };

    // Wire up the API call
    await axios.post('/price-alert/' + stockId.toString(), payload);

    reset({
      low: data.low,
      high: data.high,
    });
  };

  return (
    <div style={{ margin: '10px 20px' }}>
      <Form onSubmit={handleSubmit(saveThresholds)}>
        <div className={styles.header}>
          <div className={styles.headerText}>ALERTS</div>
        </div>
        <div className={styles.alertThresholds}>
          <Form.Label>High limit:</Form.Label>
          <Form.Control
            min='0'
            {...register('high')}
            className={styles.alrtThresholdControl}
          />
          <Form.Label>Low limit:</Form.Label>
          <Form.Control
            min='0'
            {...register('low')}
            className={styles.alrtThresholdControl}
          />
        </div>

        <div className='text-center'>
          <Button
            variant={isDirty ? 'primary' : 'disabled'}
            type='submit'
            disabled={!isDirty}
          >
            Save
          </Button>
        </div>
      </Form>
    </div>
  );
};

interface IProps {
  stockId: number;
}

interface PriceAlertResponse {
  high: number | null;
  low: number | null;
}

export default PortfolioPageAlert;
