import smileIcon from 'assets/icon-outlines/outline-emotxd-smile.svg';
import varticalDot from 'assets/icon-outlines/outline-menu-vertical.svg';
import refreshIcon from 'assets/icon-outlines/outline-refresh-small.svg';
import loadingIcon from 'assets/load_spinner.svg';
import medal1 from 'assets/medal_1.png';
import medal2 from 'assets/medal_2.png';
import medal3 from 'assets/medal_3.png';
import axios from 'axios';
import { RefreshContext } from 'contexts/RefreshContext';
import { SubmissionContext } from 'contexts/SubmissionContext';
import { TopPerformerContext } from 'contexts/TopPerformerContext';
import moment, { Moment } from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { Button, CloseButton, Modal } from 'react-bootstrap';
import styles from './Leaderboard.module.css';
import SubmissionModal from './SubmissionModal';

interface LeaderboardResultResponse {
  userId: number;
  userName: string;
  rank: number;
  percChange: number;
  stocks: string[];
}

interface LeaderboardResponse {
  startDate: Date;
  endDate: Date;
  leaderboard: LeaderboardResultResponse[];
  userRow: LeaderboardResultResponse;
}

interface ChallengeResponse {
  challengeId: number;
  isActive: boolean;
  isOpen: boolean;
  startDate: Date;
  endDate: Date;
}

interface LeaderboardResult {
  userId: number;
  userName: string;
  rank: number;
  percChange: number;
  stocks: string[];
}

interface Leaderboard {
  startDate: Moment;
  endDate: Moment;
  leaderboard: LeaderboardResult[];
  userRow: LeaderboardResult;

  isUserInTop: boolean;
}

interface Challenge {
  challengeId: number;
  isActive: boolean;
  isOpen: boolean;
  startDate: Moment;
  endDate: Moment;
}

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const getMedalIcon = (index: number) => {
  if (index === 1) return medal1;
  if (index === 2) return medal2;
  if (index === 3) return medal3;
};

const getLeaderboardStyle = (index: number) => {
  if (index === 1) return styles.rank1;
  if (index === 2) return styles.rank2;
  if (index === 3) return styles.rank3;
};

const Leaderboard = () => {
  // Get the setShowPortfolioSummary from context
  const { setShowPortfolioSummary } = useContext(TopPerformerContext);
  const { refresh, subscribe, unsubscribe } = useContext(RefreshContext);

  // Get submission result from context
  const { submissionSuccess, setSubmissionSuccess } = useContext(SubmissionContext);

  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [nextChallenge, setNextChallenge] = useState<Challenge | null>(null);
  const [submit, setSubmit] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isUserPortfolioSubmitted, setIsUserPortfolioSubmitted] =
    useState<boolean>(true);

  const reloadLeaderboard = async () => {
    var leaderboard = await axios.get<LeaderboardResponse>(
      '/challenge/leaderboard'
    );

    setLeaderboard({
      ...leaderboard.data,
      startDate: moment(leaderboard.data.startDate),
      endDate: moment(leaderboard.data.endDate),
      isUserInTop: leaderboard.data.leaderboard.some(
        (x) =>
          leaderboard.data.userRow != null &&
          x.userId === leaderboard.data.userRow.userId
      ),
    });
  };

  const reloadNextChallenge = async () => {
    var summary = await axios.get<ChallengeResponse>('/challenge/status');

    setNextChallenge({
      ...summary.data,
      startDate: moment(summary.data.startDate),
      endDate: moment(summary.data.endDate),
    });
  };

  const reloadUserSubmission = async () => {
    try {
      var summary = await axios.get<{ hasSubmission: boolean }>(
        '/challenge/status/user'
      );

      setIsUserPortfolioSubmitted(summary.data.hasSubmission);
    } catch {
      setIsUserPortfolioSubmitted(true);
    }
  };

  useEffect(
    () => {
      setShowPortfolioSummary(true);

      const reload = () => {
        setIsLoading(true);

        Promise.all([
          reloadLeaderboard(),
          reloadNextChallenge(),
          reloadUserSubmission(),
        ]).then(() => {
          setIsLoading(false);
        });
      };

      reload();

      subscribe(reload);

      return () => {
        unsubscribe(reload);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      {/* Shows message if submission successful */}
      <Modal
        centered
        show={submissionSuccess}
        onHide={() => setSubmissionSuccess(false)}
        className={styles.successModal}
      >
        <Modal.Header
          className={styles.successModalHeader}
          closeButton
        ></Modal.Header>
        <Modal.Body className={styles.successModalBody}>
          <h5>Submission Successful</h5>
          Good Luck! <img src={smileIcon} alt='smile face' />
        </Modal.Body>
      </Modal>
      <h2 className={styles.pageHeader}>Portfolio Challenge</h2>
      <div className={styles.contentPadder}>
        <div className='mb-3'>
          <span className={styles.leaderboardTitle}>Leaderboard</span>{' '}
          <Button
            variant='light'
            className='ms-1 text-muted d-flex-inline align-items-center'
            onClick={() => {
              refresh();
            }}
          >
            <img src={refreshIcon} alt='refresh' style={{ opacity: 0.5 }} />
            Refresh
          </Button>
        </div>

        {isLoading && (
          <div className='text-center'>
            <img src={loadingIcon} alt='loading' />
          </div>
        )}

        {!isLoading && leaderboard != null && (
          <>
            <div className={styles.challengeDateMessage}>
              Current challenge: {leaderboard?.startDate.format('HH:mm')}{' '}
              <span className={styles.challengeDate}>
                {leaderboard?.startDate.format('DD/MM/YYYY')}
              </span>{' '}
              - {leaderboard?.endDate.format('HH:mm')}{' '}
              <span className={styles.challengeDate}>
                {leaderboard?.endDate.format('DD/MM/YYYY')}
              </span>
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

            {leaderboard.leaderboard.map((x, index) => (
              <div className={styles.leaderboardTableRow}>
                <div className={styles.rowYou}>
                  {leaderboard.userRow.userId === x.userId ? 'You' : ''}
                </div>
                <div
                  className={`${styles.rowInfo} ${getLeaderboardStyle(
                    index + 1
                  )}`}
                >
                  <div className={styles.rowRank}>
                    {index < 3 ? (
                      <img
                        src={getMedalIcon(index + 1)}
                        alt={(index + 1).toString()}
                        height='35'
                      />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className={styles.rowUser}>{x.userName}</div>
                  <div className={styles.rowGain}>
                    {percentFormatter.format(x.percChange)}
                  </div>
                  <div className={styles.rowTopStock}>{x.stocks[0]}</div>
                </div>
              </div>
            ))}

            {!leaderboard?.isUserInTop &&
              leaderboard.userRow != null &&
              leaderboard.userRow.userId != null && (
                <>
                  <div className={styles.leaderboardTableRow}>
                    <div className={styles.rowYou}></div>
                    <div className={styles.rowMore}>
                      <img src={varticalDot} alt='more' />
                    </div>
                  </div>

                  <div className={styles.leaderboardTableRow}>
                    <div className={styles.rowYou}>You</div>
                    <div className={`${styles.rowInfo}`}>
                      <div className={styles.rowRank}>
                        {leaderboard.userRow.rank}
                      </div>
                      <div className={styles.rowUser}>
                        {leaderboard?.userRow.userName}
                      </div>
                      <div className={styles.rowGain}>
                        {leaderboard != null &&
                          percentFormatter.format(
                            leaderboard.userRow.percChange
                          )}
                      </div>
                      <div className={styles.rowTopStock}>
                        {leaderboard.userRow != null &&
                          leaderboard.userRow.stocks != null &&
                          leaderboard.userRow.stocks.length > 0 &&
                          leaderboard?.userRow.stocks[0]}
                      </div>
                    </div>
                  </div>
                </>
              )}
          </>
        )}
      </div>
      <hr />

      <div className={styles.contentPadder}>
        {isLoading && (
          <div className='text-center'>
            <img src={loadingIcon} alt='loading' />
          </div>
        )}

        {!isLoading && (
          <>
            {!nextChallenge?.isOpen && (
              <div className='text-center'>
                There is currently no scheduled Portfolio Challenge upcoming.
              </div>
            )}
            {nextChallenge?.isOpen && (
              <>
                <div
                  className={`${styles.challengeDateMessage} ${styles.nextChallengeMessage}`}
                >
                  Next challenge:{' '}
                  {nextChallenge != null && (
                    <>
                      {nextChallenge?.startDate.format('HH:mm')}{' '}
                      <span className={styles.challengeDate}>
                        {nextChallenge?.startDate.format('DD/MM/YYYY')}
                      </span>{' '}
                      - {nextChallenge?.endDate.format('HH:mm')}{' '}
                      <span className={styles.challengeDate}>
                        {nextChallenge?.endDate.format('DD/MM/YYYY')}
                      </span>
                    </>
                  )}
                  {nextChallenge == null && '-'}
                </div>

                {isUserPortfolioSubmitted && (
                  <div className={'text-center'}>
                    You have submitted the portfolio for the upcoming Portfolio
                    Challenge
                  </div>
                )}
                {!isUserPortfolioSubmitted && (
                  <div>
                    You have not submitted a portfolio for the next challenge
                    period yet.
                    <br />
                    <Button
                      variant='transparent'
                      className={styles.submitPortfolio}
                      onClick={() => setSubmit(true)}
                    >
                      Submit Portfolio
                    </Button>
                    <Modal
                      centered
                      show={submit}
                      className={styles.modal}
                      size='xl'
                      // styles={{ maxWidth: '800px', width: '80%' }}
                      onHide={() => setSubmit(false)}
                    >
                      <Modal.Header
                        className={`mt-3 mb-0 ${styles.modalHeader}`}
                        onClick={() => setSubmit(false)}
                      >
                        <h4 className='text-center'>Submit your portfolio</h4>
                        <p className={styles.description}>
                          Pick between 5 stocks to be added to your public portfolio.<br />
                          Over the next 2 weeks, you can see how you are performing on the leaderboard.<br />
                        </p>
                        <CloseButton className={styles.closeButton}></CloseButton>
                      </Modal.Header>
                      <Modal.Body className={'mt-0'}>
                        <SubmissionModal />
                      </Modal.Body>
                    </Modal>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Leaderboard;
