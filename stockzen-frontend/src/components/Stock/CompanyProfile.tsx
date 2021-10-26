import linkIcon from 'assets/icon-outlines/outline-link.svg';
import React, { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import styles from './CompanyProfile.module.css';

const CompanyProfile: FC<IStockProfile> = (prop) => {
  return (
    <>
      <div className={styles.profileWrapper}>
        <div>
          <div className={styles.companyName}>{prop.name}</div>
          <a
            href={prop.website === null ? '-' : prop.website}
            target='_blank'
            rel='noreferrer'>
            <img className={styles.linkImg} src={linkIcon} alt='website link'></img>
          </a>
        </div>
        <Row className={`mb-2`}>
          <Col><b>Industry: </b>{prop.industry}</Col>
          <Col><b>Sector: </b>{prop.sector}</Col>
        </Row>
        <div className={`mb-1`}><b>Business Summary</b></div>
        <div className={`${styles.description}`}>{prop.longBusinessSummary}</div>
      </div>

    </>
  );
};

export default CompanyProfile;