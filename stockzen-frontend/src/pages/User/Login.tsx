import LoginForm from 'components/User/LoginForm';
import { UserContext } from 'contexts/UserContext';
import React, { FC, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';

const Login: FC = () => {
  const { authenticate } = useContext(UserContext);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const history = useHistory();

  const doAuthen = () => {
    authenticate();
    history.push('/portfolio');
  };

  return (
    <>
      <LoginForm
        onLoginSuccess={(email, password) => {
          setEmail(email);
          setPassword(password);
          doAuthen();
        }}
      ></LoginForm>
    </>
  );
};

export default Login;
