import React from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import styles from "./invoice.module.css";
import { useNavigate } from "react-router-dom";

const Invoice = (props) => {
    const navigate = useNavigate();
    return (
        <React.Fragment>
            <div className={`mt-4`}>
            <h2 className="fw-bold">Invoice</h2>
            </div>
            <div className={`mt-4 d-flex ${styles.end}`}>
            <Button className="customBtn"onClick={() => navigate("/new/invoice")}>
                Create Invoice
            </Button>
            </div>
        </React.Fragment>
    );
};

Invoice.propTypes = {};

export default Invoice;
