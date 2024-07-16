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
    updateEmployeeAdvanceConnect,
    updateEmployeePaymentConnect
}) => {

    const {payment = {}, extraAdvance = {}, advance} = detail;
    const { id, month, year } = useParams();
    const monthlyPayment = payment && payment[year] && payment[year][month] || {};
    const [bankDeposited, setBankDeposited] = useState(monthlyPayment.bankDeposit || "");
    const [isLoading, setIsLoading] = useState(false);
    const advanceAmount = advance && advance[year] && advance[year][month] && advance[year][month].advance || 0;

    const [deductExtraAdvanceAmount, setDeductExtraAdvanceAmount] = useState(monthlyPayment.advanceDeposit || "");
    const [remainingAdvance, setremainingAdvance] = useState(extraAdvance.total || "")
    const [cashAmount, setCashAmount] = useState(monthlyPayment.cash || "");
    const remaingSalary = getTotalSalary(detail,month, year) -  (parseInt(cashAmount || 0) + parseInt(bankDeposited || 0) + parseInt(deductExtraAdvanceAmount || 0)) || 0

    const calculateBankDeposit = ({target: {value}}) => {
        if (parseInt(value || 0) <= getTotalSalary(detail,month, year)) {
            setBankDeposited(value);
            const cashAmount = getTotalSalary(detail,month, year) - parseInt(value || 0)
            setCashAmount(parseInt(cashAmount))
        }
    };

    const calculateCashAmount = (value) => {
        if (parseInt(value || 0) <= getTotalSalary(detail,month, year)) {
            setCashAmount(value)
        }
    };

    const calculateAdvanceAmount = (value) => {
        if (parseInt(value || 0) <= getTotalSalary(detail,month, year)) {
            setDeductExtraAdvanceAmount(value);
            setremainingAdvance(parseInt(extraAdvance.total || 0) - parseInt(value || 0))
            const bankamount = getTotalSalary(detail,month, year) - parseInt(value || 0) - parseInt(cashAmount)
            setBankDeposited(parseInt(bankamount))
        }
    };


    const handleAdvancePayment = async() => {
        const payload = {
            total: remainingAdvance,
            detail: {
                amount: parseInt(deductExtraAdvanceAmount),
                time: new Date().getTime(),
                type: "deposit",
                balance: parseInt(extraAdvance.total || 0) - parseInt(deductExtraAdvanceAmount)
            }
        };
        await updateEmployeeAdvanceConnect(id, payload);
        await employeeDetailConnect({id, month})
    }

    const save = async() => {
        setIsLoading(true);
        const queryParams = {
            id,
            year,
            month,
            type: "payment"
        }
        const payload = {
            cash: cashAmount,
            isPaid: true,
            bankDeposit: bankDeposited,
            remaingSalary,
            advanceDeposit: deductExtraAdvanceAmount
        };
        await updateEmployeePaymentConnect(queryParams, payload);
        if (deductExtraAdvanceAmount) {
            await handleAdvancePayment();
        }
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
            isDisabled={monthlyPayment.isPaid || remaingSalary !== 0}
            handleClose={paymentDetailHandle}
        >
            <Container>
                <Form.Group className="mb-3" controlId="formGroupEmail">
                        <Form.Label className="font-weight-bold">Bank Deposit</Form.Label>
                        <Form.Control disabled={true} type="number" placeholder="Enter Amount" value={bankDeposited} onChange={(e) => {calculateBankDeposit(e)}} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formGroupEmail">
                        <Form.Label className="font-weight-bold">Cash</Form.Label>
                        <Form.Control disabled={monthlyPayment.isPaid } type="number" placeholder="Enter Amount"  value={cashAmount}  onChange={(e) => {
                                calculateCashAmount(e.target.value)
                            }} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formGroupEmail">
                        <Form.Label className="font-weight-bold">Minus Advance This Month</Form.Label>
                        <Form.Control disabled={monthlyPayment.isPaid } type="number" placeholder="Enter Amount" value={deductExtraAdvanceAmount} onChange={(e) => {
                            calculateAdvanceAmount(e.target.value)
                            }}
                        />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formGroupEmail">
                        <Form.Label className="font-weight-bold">Advance From Salary</Form.Label>
                        <Form.Control type="number" placeholder="Enter Amount" disabled value={`-${advanceAmount}`} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formGroupEmail">
                        <Form.Label className="font-weight-bold">Remaining Advance</Form.Label>
                        <Form.Control type="number" placeholder="Enter Amount" disabled value={remainingAdvance} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formGroupEmail">
                        <Form.Label className="font-weight-bold">Total Salary</Form.Label>
                        <Form.Control type="number" placeholder="Enter Amount" disabled value={parseInt(getTotalSalary(detail,month, year))} />
                </Form.Group>
                {
                    remaingSalary !== 0 && <p className='text-danger'>{remaingSalary} left to adjust </p>
                }
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
    updateEmployeeAdvanceConnect: PropTypes.func,
    updateEmployeePaymentConnect: PropTypes.func
}

export default PaySalary