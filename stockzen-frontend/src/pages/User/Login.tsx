import LoginForm from 'components/User/LoginForm';
import { UserContext } from 'contexts/UserContext';
import React, { FC, useContext } from 'react';
import { useHistory } from 'react-router-dom';

const Login: FC = () => {
  const { authenticate } = useContext(UserContext);

  const history = useHistory();

  const doAuthen = () => {
    authenticate();
    history.push('/portfolio');
  };

  return (
    <>
      <LoginForm
        onLoginSuccess={() => {
          doAuthen();
        }}
      ></LoginForm>
    </>
  );
};

export default Login;
