import { TopPerformerContext } from 'contexts/TopPerformerContext';
import React, { useContext, useEffect } from 'react';
import refresh from 'assets/icon-outlines/outline-refresh-small.svg';
import Button from 'react-bootstrap/Button';
import styles from './Leaderboard.module.css';
import varticalDot from 'assets/icon-outlines/outline-menu-vertical.svg';
import medal1 from 'assets/medal_1.png';
import medal2 from 'assets/medal_2.png';
import medal3 from 'assets/medal_3.png';

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
      <h2 className={styles.pageHeader}>Portfolio Challenge</h2>
      <div className={styles.contentPadder}>
        <div>
          <span className={styles.leaderboardTitle}>Leaderboard</span>{' '}
          <Button
            variant='light'
            className='ms-1 text-muted d-flex-inline align-items-center'
          >
            <img src={refresh} alt='refresh' style={{ opacity: 0.5 }} />
            Refresh
          </Button>
        </div>

        <div className={styles.challengeDateMessage}>
          Current challenge: 00:00{' '}
          <span className={styles.challengeDate}>31/10/2021</span> - 23:59{' '}
          <span className={styles.challengeDate}>13/11/2021</span>
        </div>

        <div className={styles.leaderboardTable}>
          <div className={styles.leaderboardTableHeader}>
            <div className={styles.rowYou}></div>
            <div className={styles.rowRank}>Rank</div>
            <div className={styles.rowUser}>User</div>
            <div className={styles.rowGain}>Portfolio Gain</div>
            <div className={styles.rowTopStock}>Top Stock</div>
          </div>
        </div>

        <div className={styles.leaderboardTableRow}>
          <div className={styles.rowYou}></div>
          <div className={`${styles.rowInfo} ${styles.rank1}`}>
            <div className={styles.rowRank}>
              <img src={medal1} alt='1' height='35' />
            </div>
            <div className={styles.rowUser}>User Name</div>
            <div className={styles.rowGain}>32.05%</div>
            <div className={styles.rowTopStock}>GOOG</div>
          </div>
        </div>

        <div className={styles.leaderboardTableRow}>
          <div className={styles.rowYou}></div>
          <div className={`${styles.rowInfo} ${styles.rank2}`}>
            <div className={styles.rowRank}>
              <img src={medal2} alt='2' height='35' />
            </div>
            <div className={styles.rowUser}>User Name</div>
            <div className={styles.rowGain}>25.10%</div>
            <div className={styles.rowTopStock}>TSLA</div>
          </div>
        </div>

        <div className={styles.leaderboardTableRow}>
          <div className={styles.rowYou}></div>
          <div className={`${styles.rowInfo} ${styles.rank3}`}>
            <div className={styles.rowRank}>
              <img src={medal3} alt='3' height='35' />
            </div>
            <div className={styles.rowUser}>User Name</div>
            <div className={styles.rowGain}>10.10%</div>
            <div className={styles.rowTopStock}>ABC</div>
          </div>
        </div>

        <div className={styles.leaderboardTableRow}>
          <div className={styles.rowYou}></div>
          <div className={styles.rowInfo}>
            <div className={styles.rowRank}>4</div>
            <div className={styles.rowUser}>User Name</div>
            <div className={styles.rowGain}>10.10%</div>
            <div className={styles.rowTopStock}>ABC</div>
          </div>
        </div>

        <div className={styles.leaderboardTableRow}>
          <div className={styles.rowYou}></div>
          <div className={styles.rowInfo}>
            <div className={styles.rowRank}>5</div>
            <div className={styles.rowUser}>User Name</div>
            <div className={styles.rowGain}>10.10%</div>
            <div className={styles.rowTopStock}>ABC</div>
          </div>
        </div>

        <div className={styles.leaderboardTableRow}>
          <div className={styles.rowYou}></div>
          <div className={styles.rowMore}>
            <img src={varticalDot} alt='more' />
          </div>
        </div>

        <div className={styles.leaderboardTableRow}>
          <div className={styles.rowYou}>You</div>
          <div className={styles.rowInfo}>
            <div className={styles.rowRank}>1,289</div>
            <div className={styles.rowUser}>User Name</div>
            <div className={styles.rowGain}>3.10%</div>
            <div className={styles.rowTopStock}>XYZ</div>
          </div>
        </div>
      </div>
      <hr />

      <div className={styles.contentPadder}>
        <div
          className={`${styles.challengeDateMessage} ${styles.nextChallengeMessage}`}
        >
          Next challenge: 00:00{' '}
          <span className={styles.challengeDate}>14/11/2021</span> - 23:59{' '}
          <span className={styles.challengeDate}>27/11/2021</span>
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
