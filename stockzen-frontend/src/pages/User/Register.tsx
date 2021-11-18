import RegisterForm from 'components/User/RegisterForm';
import RegisterSuccessful from 'components/User/RegisterSuccessful';
import React, { FC, useState } from 'react';

// **************************************************************
// Page of the user registration
// **************************************************************
const Register: FC = () => {
  // States
  const [isRegisterSuccessful, setRegisterSuccessful] =
    useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');

  return (
    <>
      {/* Display the Register success component if registration is successful */}
      {!isRegisterSuccessful && (
        <RegisterForm
          onRegisterSuccess={(firstName, lastName) => {
            setFirstName(firstName);
            setLastName(lastName);
            setRegisterSuccessful(true);
          }}
        ></RegisterForm>
      )}

      {/* Show the registration modal otherwise */}
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
