import Leaderboard from 'components/Challenge/Leaderboard';
import TopPerformerWidget from 'components/Portfolio/TopPerformerWidget';
import React, { FC } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { Switch, useRouteMatch } from 'react-router-dom';
import ProtectedRoute from 'utils/ProtectedRoute';

const Challenge: FC = () => {
  const { path } = useRouteMatch();

  return (
    <Container>
      <Row className='justify-content-evenly'>
        <Col lg={3} className='d-none d-lg-block'>
          <TopPerformerWidget></TopPerformerWidget>
        </Col>
        <Col xs={12} lg={8}>
          <Switch>
            <ProtectedRoute exact path={`${path}`} component={Leaderboard} />
          </Switch>
        </Col>
      </Row>
    </Container>
  );
};

export default Challenge;
