import React from 'react'
import PropTypes from 'prop-types'
import { Col, Form, Row } from 'react-bootstrap'

const TransparentSelect = props => {
  return (
    <Row>
        <Col sm={12}>
        <Form.Select aria-label="Default select example" style={{width: "150px"}}>
            <option>Open this select menu</option>
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
        </Form.Select>
        </Col>
    </Row>
  )
}

TransparentSelect.propTypes = {}

export default TransparentSelect