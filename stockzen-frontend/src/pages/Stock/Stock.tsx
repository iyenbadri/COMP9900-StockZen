import TopPerformerWidget from 'components/Portfolio/TopPerformerWidget';
import StockPage from 'components/Stock/StockPage';
import React, { FC } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { Switch, useRouteMatch } from 'react-router-dom';
import ProtectedRoute from 'utils/ProtectedRoute';

// **************************************************************
// Page to display the stock info
// **************************************************************
const Stock: FC = () => {
  const { path } = useRouteMatch();

  return (
    <Container>
      <Row className='justify-content-evenly pb-5'>
        <Col lg={3} className='d-none d-lg-block'>
          <TopPerformerWidget></TopPerformerWidget>
        </Col>
        <Col xs={12} lg={8}>
          <Switch>
            <ProtectedRoute
              path={`${path}/:stockPageId`}
              component={StockPage}
            />
          </Switch>
        </Col>
      </Row>
    </Container>
  );
};

export default Stock;
