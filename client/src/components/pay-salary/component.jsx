import {useState} from 'react'
import PropTypes from 'prop-types'
import { useParams } from "react-router-dom";
import ModalWrapper from '../../shared/component/modal'
import { Container, Form } from 'react-bootstrap'
import { getTotalSalary } from '../../helpers/employee-detal';
import PageLoader from "../../shared/component/page-loader";

const PaySalary = ({
    detail,
    showPaymentDetail,
    paymentDetailHandle,
    employeeDetailConnect,
    updateEmployeePaymentConnect
}) => {

    const {payment = {}} = detail;
    const { id, month, year } = useParams();
    const monthlyPayment = payment && payment[year] && payment[year][month] || {};
    const [bankDeposited, setBankDeposited] = useState(monthlyPayment.bankDeposit || "");
    const [isLoading, setIsLoading] = useState(false);
    const total = parseInt(getTotalSalary(detail,month, year) - parseInt(bankDeposited || 0));


    const calculateBankDeposit = ({target: {value}}) => {
        setBankDeposited(value)
    };

    const save = async() => {
        setIsLoading(true);
        const queryParams = {
            id,
            year,
            month,
            type: "payment"
        }
        const payload = {
            cash: total,
            isPaid: true,
            bankDeposit: bankDeposited
        };
        await updateEmployeePaymentConnect(queryParams, payload);
        await employeeDetailConnect({id, month})
        setIsLoading(false);
        paymentDetailHandle();
    }

    if (isLoading) return <PageLoader />

    return (
        <ModalWrapper
            show={showPaymentDetail}
            title={"Payment"}
            saveButtonText={monthlyPayment.isPaid ? "Already Paid" : 'Mark Paid'}
            onSave={save}
            isDisabled={monthlyPayment.isPaid}
            handleClose={paymentDetailHandle}
        >
            <Container>
            <Form.Group className="mb-3" controlId="formGroupEmail">
                    <Form.Label className="font-weight-bold">Bank Deposit</Form.Label>
                    <Form.Control disabled={monthlyPayment.isPaid} type="number" placeholder="Enter Amount" value={bankDeposited} onChange={(e) => {calculateBankDeposit(e)}} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formGroupEmail">
                    <Form.Label className="font-weight-bold">Cash</Form.Label>
                    <Form.Control type="number" placeholder="Enter Amount" disabled value={total} />
            </Form.Group>
            </Container>
        </ModalWrapper>
    )
}

PaySalary.propTypes = {
    showModal: PropTypes.bool,
    detail: PropTypes.any,
    paymentDetailHandle: PropTypes.func,
    showPaymentDetail: PropTypes.bool,
    employeeDetailConnect: PropTypes.func,
    updateEmployeePaymentConnect: PropTypes.func
}

export default PaySalary