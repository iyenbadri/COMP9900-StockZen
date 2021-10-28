import { TopPerformerContext } from 'contexts/TopPerformerContext';
import React, { useContext, useEffect } from 'react';
import refresh from 'assets/icon-outlines/outline-refresh-small.svg';
import Button from 'react-bootstrap/Button';
import styles from './Leaderboard.module.css';

const Leaderboard = () => {
  // Get the setShowPortfolioSummary from context
  const { setShowPortfolioSummary } = useContext(TopPerformerContext);

  useEffect(
    () => {
      setShowPortfolioSummary(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <h2 className='text-center'>Portfolio Challenge</h2>
      <div className={styles.contentPadder}>
        <div>
          Leaderboard{' '}
          <Button
            variant='light'
            className='ms-1 text-muted d-flex-inline align-items-center'
          >
            <img src={refresh} alt='refresh' style={{ opacity: 0.5 }} />
            Refresh
          </Button>
        </div>

        <div>
          Current challenge: 00:00{' '}
          <span className={styles.challengeDate}>05/09/2021</span> - 23:59{' '}
          <span className={styles.challengeDate}>18/09/2021</span>
        </div>

        <div>Leaderboard table</div>
      </div>
      <hr />

      <div className={styles.contentPadder}>
        <div>
          Next challenge: 00:00{' '}
          <span className={styles.challengeDate}>05/09/2021</span>- 23:59{' '}
          <span className={styles.challengeDate}>18/09/2021</span>
        </div>

        <div>
          You have not submitted a portfolio for the next challenge period yet.
          <br />
          <Button variant='transparent' className={styles.submitPortfolio}>
            Submit Portfolio
          </Button>
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
