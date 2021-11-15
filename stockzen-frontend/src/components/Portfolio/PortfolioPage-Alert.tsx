import React, { FC, useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import styles from './PortfolioPage-Panel.module.css';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import bellIcon from 'assets/icon-outlines/outline-bell.svg';

// **************************************************************
// Component to display the price alert
// **************************************************************
const PortfolioPageAlert: FC<IProps> = (props) => {
  const { stockId } = props;

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      low: '',
      high: '',
    },
  });

  // States
  const [lowThresholdAlerted, setLowThresholdAlerted] =
    useState<boolean>(false);

  const [highThresholdAlerted, setHighThresholdAlerted] =
    useState<boolean>(false);

  // Component setup
  useEffect(
    () => {
      (async () => {
        // Query the current threshold from backend
        const response = await axios.get<PriceAlertResponse>(
          '/price-alert/' + stockId.toString()
        );

        // Set the states
        setLowThresholdAlerted(response.data.isLowThresholdAlerted ?? true);
        setHighThresholdAlerted(response.data.isHighThresholdAlerted ?? true);

        // Set the form values
        reset({
          low: response.data.low == null ? '' : response.data.low.toString(),
          high: response.data.high == null ? '' : response.data.high.toString(),
        });
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Function to save the thresholds
  const saveThresholds = async (data: any) => {
    // Payload
    const payload = {
      high: data.high === '' ? null : parseFloat(data.high),
      low: data.low === '' ? null : parseFloat(data.low),
    };

    // Wire up the API call
    await axios.post('/price-alert/' + stockId.toString(), payload);

    // Set the form data
    reset({
      low: data.low,
      high: data.high,
    });

    // Set the state
    setLowThresholdAlerted(data.low === '');
    setHighThresholdAlerted(data.high === '');
  };

  // Render
  return (
    <div style={{ margin: '10px 20px' }}>
      <Form onSubmit={handleSubmit(saveThresholds)}>
        <div className={styles.header}>
          <div className={styles.headerText}>ALERTS</div>
        </div>
        <div className={styles.alertThresholds}>
          {/* High limit */}
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

          {/* Low limit */}
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

        {/* Save button */}
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
