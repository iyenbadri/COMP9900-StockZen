import React, { FC } from 'react';
import { CloseButton, Modal } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import GuestRoute from 'utils/GuestRoute';
import Login from './Login';
import Logout from './Logout';
import Register from './Register';
import styles from './User.module.css';

const User: FC = () => {
  const { path } = useRouteMatch();
  const history = useHistory();
  const location = useLocation();

  return (
    <Container>
      <Row>
        <Col
          sm={{ offset: 1, span: 10 }}
          md={{ offset: 2, span: 8 }}
          lg={{ offset: 3, span: 6 }}
        >
          <Modal
            centered
            className={styles.modal}
            show={true}
            backdrop='static'
            keyboard={false}
          >
            {!(location.pathname === '/user/logout') && (
              <CloseButton
                className={styles.closeButton}
                onClick={() => {
                  history.goBack();
                }}
              ></CloseButton>
            )}
            <Modal.Body className={styles.modalBody}>
              <Switch>
                <GuestRoute path={`${path}/login`} component={Login} />
                <GuestRoute path={`${path}/register`} component={Register} />
                <Route path={`${path}/logout`} component={Logout} />
              </Switch>
            </Modal.Body>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
};

export default User;
