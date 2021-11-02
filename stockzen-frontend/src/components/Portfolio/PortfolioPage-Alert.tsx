import React, { FC, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import styles from './PortfolioPage-Panel.module.css';
import { useForm } from 'react-hook-form';

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
        // TODO: Query the current threshold from backend
        const response = await Promise.resolve<{
          low: number | null;
          high: number | null;
        }>({
          high: null,
          low: null,
        });

        reset({
          low: response.low == null ? '' : response.low.toString(),
          high: response.high == null ? '' : response.high.toString(),
        });
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const saveThresholds = (data: any) => {
    const payload = {
      stockId: stockId,
      high: data.high,
      low: data.low,
    };

    // TODO: Wire up the API call

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

export default PortfolioPageAlert;
