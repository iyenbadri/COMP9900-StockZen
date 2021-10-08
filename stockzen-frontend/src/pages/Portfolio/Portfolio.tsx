import PortfolioList from 'components/Portfolio/PortfolioList';
import TopPerformerWidget from 'components/Portfolio/TopPerformerWidget';
import React, { FC } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { Switch, useRouteMatch } from 'react-router-dom';
import ProtectedRoute from 'utils/ProtectedRoute';

const User: FC = () => {
  const { path } = useRouteMatch();

  return (
    <Container>
      <Row>
        <Col lg={4} className='d-none d-lg-block'>
          <TopPerformerWidget></TopPerformerWidget>
        </Col>
        <Col xs={12} lg={8}>
          <Switch>
            <ProtectedRoute exact path={`${path}`} component={PortfolioList} />
          </Switch>
        </Col>
      </Row>
    </Container>
  );
};

export default User;
