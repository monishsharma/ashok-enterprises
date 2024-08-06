import React from 'react'
import { Form } from 'react-bootstrap';
import "./style.css";
import PropTypes from 'prop-types'


const TransparentInput = ({
    type = "text",
    name,
    value,
    onChange,
    placeholder
}) => {
  return (
    <div className="transparentInput">
        <input
            type={type}
            name={name}
            onChange={onChange}
            placeholder={placeholder}
            value={value}
        />
    </div>
  )
}

TransparentInput.propTypes = {
    type: PropTypes.string,
    name: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
}

export default TransparentInput;