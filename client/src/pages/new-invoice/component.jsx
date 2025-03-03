import React from 'react'
import PropTypes from 'prop-types'
import Bill from "../../components/bill"
import {Row, Col, Form} from 'react-bootstrap';
import { BILL_BY } from './selector';
import styles from "./style.module.css";

const NewInvoice = props => {
  return (
    <div className={` ${styles.invoiceContainer}`}>
        <h2 className="fw-bold">New Invoice</h2>
        <Row className=''>
          <Col sm={3} >
            <Form.Label>Bill By</Form.Label>
            <Form.Select aria-label="Default select example">
              {
                Object.keys(BILL_BY).map((list, index) => {
                  return (
                    <option key={index} value={BILL_BY[list]}>{BILL_BY[list]}</option>
                  )
                })
              }
            </Form.Select>
          </Col>
        </Row>
        <div className="mt-4">
        <Bill />
        </div>
    </div>
  )
}

NewInvoice.propTypes = {}

export default NewInvoice