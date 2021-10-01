import React, { FC } from 'react';

interface IProps {
  firstName: string;
  lastName: string;
}

const RegisterSuccessful: FC<IProps> = (props) => {
  return (
    <>
      <div>
        Welcome {props.firstName} {props.lastName}!
      </div>
      <div>
        Your account registration is success. You can login to your new account
        now.
      </div>
    </>
  );
};

export default RegisterSuccessful;
