import React, { FC } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import Login from './Login';
import Logout from './Logout';
import Register from './Register';
import styles from './User.module.css';

const User: FC = () => {
  const { path } = useRouteMatch();

  return (
    <div className={styles.hero}>
      <Container>
        <Row>
          <Col
            sm={{ offset: 2, span: 8 }}
            lg={{ offset: 3, span: 6 }}
            xl={{ offset: 4, span: 4 }}
          >
            <Switch>
              <Route path={`${path}/login`} component={Login} />
              <Route path={`${path}/register`} component={Register} />
              <Route path={`${path}/logout`} component={Logout} />
            </Switch>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default User;
