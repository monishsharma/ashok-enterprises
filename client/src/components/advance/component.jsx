import React, {useState} from "react";
import PropTypes from "prop-types";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import ModalWrapper from "../../shared/component/modal";
import { Form, InputGroup } from "react-bootstrap";
import { useParams } from "react-router-dom";
import PageLoader from "../../shared/component/page-loader";

const Advance = ({
    close,
    detail,
    employeeDetailConnect,
    updateEmployeePaymentConnect
}) => {

    const { id, month, year } = useParams();
    const {advance = {}, extraAdvance = {}} = detail || {};
    const advanceAmount = advance && advance[year] && advance[year][month] && advance[year][month].advance || 0;
    const extraAmountFromDatabase = extraAdvance && extraAdvance[year] && extraAdvance[year][month] && extraAdvance[year][month] || {};
    const [isLoading, setIsLoading] = useState(false);
    const [key, setKey] = useState('advanceSalary');

    const [advanceSalary, setAdvanceSalary] = useState(advanceAmount || "");
    const [extraAdvanceAmount, setExtraAdvance] = useState(extraAmountFromDatabase.advance || "");
    const [extraAdvanceDeuctionThisMonth, setExtraAdvanceDeuctionThisMonth] = useState(extraAmountFromDatabase.deduct || "");

    const getDisabledState = () => {
        if (key=== "advanceSalary") {
            return !advanceSalary
        }
    }

    const setExtraAdvanceHandler = (value) => {
        setExtraAdvanceDeuctionThisMonth(value);
        setExtraAdvance(extraAmountFromDatabase.advance && value ? parseInt(extraAmountFromDatabase.advance) - parseInt(value) : extraAmountFromDatabase.advance)
    }

    const save = async() => {
        setIsLoading(true);
        const queryParams = {
            id,
            year,
            month,
            type: key ==="advanceSalary" ? "advance" : "extraAdvance"
        }
        const payload = {
            advance: key ==="advanceSalary" ? advanceSalary : extraAdvanceAmount,
            ...(key === "extraAdvance" && {
                deduct: extraAdvanceDeuctionThisMonth
            })
        };
        await updateEmployeePaymentConnect(queryParams, payload);
        await employeeDetailConnect({id, month})
        setIsLoading(false);
        close();
    }

    if (isLoading) return <PageLoader />


    return (
        <React.Fragment>
        <ModalWrapper
            show={true}
            title={"Advance"}
            saveButtonText={"save"}
            onSave={save}
            isDisabled={getDisabledState()}
            handleClose={close}
        >
            <Tabs
                defaultActiveKey="advanceSalary"
                id="justify-tab-example"
                className="mb-3"
                onSelect={(k) => setKey(k)}
                justify
            >
            <Tab eventKey="advanceSalary" title="Advance Salary">
                <Form.Group className="mb-3">
                        <Form.Label>Advance salary</Form.Label>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="basic-addon1">-₹</InputGroup.Text>
                            <Form.Control type="number" placeholder="advance" value={advanceSalary} onChange={(e) => {setAdvanceSalary(e.target.value)}} />
                        </InputGroup>
                </Form.Group>
            </Tab>
            <Tab eventKey="extraAdvance" title="Extra Advance">
                <Form.Group className="mb-3">
                        <Form.Label>Extra Advance Amount</Form.Label>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="basic-addon1">₹</InputGroup.Text>
                            <Form.Control type="number" placeholder="Amount" value={extraAdvanceAmount} onChange={(e) => {
                                setExtraAdvance(e.target.value);
                            }} />
                        </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                        <Form.Label>Amount This Month</Form.Label>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="basic-addon1">-₹</InputGroup.Text>
                            <Form.Control disabled={extraAmountFromDatabase.deduct} type="number" placeholder="Amount This Month" value={extraAdvanceDeuctionThisMonth} onChange={(e) => {setExtraAdvanceHandler(e.target.value)}} />
                        </InputGroup>
                </Form.Group>
            </Tab>
            </Tabs>
        </ModalWrapper>
        </React.Fragment>
    );
};

Advance.propTypes = {
    detail: PropTypes.any,
    close: PropTypes.func,
    employeeDetailConnect: PropTypes.func,
    updateEmployeePaymentConnect: PropTypes.func
};

export default Advance;
