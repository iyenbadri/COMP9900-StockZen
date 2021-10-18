import RegisterForm from 'components/User/RegisterForm';
import RegisterSuccessful from 'components/User/RegisterSuccessful';
import React, { FC, useState } from 'react';

const Register: FC = () => {
  const [isRegisterSuccessful, setRegisterSuccessful] =
    useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');

  return (
    <>
      {!isRegisterSuccessful && (
        <RegisterForm
          onRegisterSuccess={(firstName, lastName) => {
            setFirstName(firstName);
            setLastName(lastName);
            setRegisterSuccessful(true);
          }}
        ></RegisterForm>
      )}
      {isRegisterSuccessful && (
        <RegisterSuccessful
          firstName={firstName}
          lastName={lastName}
        ></RegisterSuccessful>
      )}
    </>
  );
};

export default Register;
