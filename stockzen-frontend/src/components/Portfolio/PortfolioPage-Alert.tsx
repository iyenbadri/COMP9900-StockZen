import React, { FC, useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import styles from './PortfolioPage-Panel.module.css';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import bellIcon from 'assets/icon-outlines/outline-bell.svg';

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

  const [lowThresholdAlerted, setLowThresholdAlerted] =
    useState<boolean>(false);

  const [highThresholdAlerted, setHighThresholdAlerted] =
    useState<boolean>(false);

  useEffect(
    () => {
      (async () => {
        // Query the current threshold from backend
        const response = await axios.get<PriceAlertResponse>(
          '/price-alert/' + stockId.toString()
        );

        setLowThresholdAlerted(response.data.isLowThresholdAlerted ?? true);
        setHighThresholdAlerted(response.data.isHighThresholdAlerted ?? true);

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

    setLowThresholdAlerted(data.low === '');
    setHighThresholdAlerted(data.high === '');
  };

  return (
    <div style={{ margin: '10px 20px' }}>
      <Form onSubmit={handleSubmit(saveThresholds)}>
        <div className={styles.header}>
          <div className={styles.headerText}>ALERTS</div>
        </div>
        <div className={styles.alertThresholds}>
          <Form.Label>High limit:</Form.Label>
          <InputGroup className={styles.alertThresholdInputGroup}>
            <Form.Control
              min='0'
              {...register('high')}
              className={styles.alertThresholdControl}
            />
            <InputGroup.Text>
              <img
                src={bellIcon}
                className={highThresholdAlerted ? styles.alertAlerted : ''}
                alt={highThresholdAlerted ? 'alerted' : 'alert set'}
                title={highThresholdAlerted ? 'alerted' : 'alert set'}
                width={16}
              />
            </InputGroup.Text>
          </InputGroup>

          <Form.Label>Low limit:</Form.Label>
          <InputGroup className={styles.alertThresholdInputGroup}>
            <Form.Control
              min='0'
              {...register('low')}
              className={styles.alertThresholdControl}
            />

            <InputGroup.Text>
              <img
                src={bellIcon}
                className={lowThresholdAlerted ? styles.alertAlerted : ''}
                alt={lowThresholdAlerted ? 'alerted' : 'alert set'}
                title={lowThresholdAlerted ? 'alerted' : 'alert set'}
                width={16}
              />
            </InputGroup.Text>
          </InputGroup>
        </div>

        <div className='text-center mt-4'>
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
  isHighThresholdAlerted: boolean | null;
  isLowThresholdAlerted: boolean | null;
}

export default PortfolioPageAlert;
