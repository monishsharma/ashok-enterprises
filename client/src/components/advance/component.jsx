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
    updateEmployeeAdvanceConnect,
    updateEmployeePaymentConnect
}) => {

    const { id, month, year } = useParams();
    const {advance = {}, extraAdvance = {}} = detail || {};
    const advanceAmount = advance && advance[year] && advance[year][month] && advance[year][month].advance || 0;
    const [isLoading, setIsLoading] = useState(false);
    const [key, setKey] = useState('advanceSalary');
    const [advanceSalary, setAdvanceSalary] = useState(advanceAmount || "");
    const [takeAdvance, setTakeAdvance] = useState("")

    const getDisabledState = () => {
        if (key=== "advanceSalary") {
            return !advanceSalary
        } else {
            return !takeAdvance;
        }
    }

    const save = async() => {
        setIsLoading(true);
        const queryParams = {
            id,
            year,
            month,
            type: "advance"
        }
        const payload = {
            advance: advanceSalary,
        };
        await updateEmployeePaymentConnect(queryParams, payload);
        await employeeDetailConnect({id, month})
        setIsLoading(false);
        close();
    }

    const saveExtraAdvance = async() => {
        setIsLoading(true);
        const payload = {
            total: parseInt(extraAdvance.total || 0) + parseInt(takeAdvance),
            detail: {
                amount: parseInt(takeAdvance),
                time: new Date().getTime()
            }
        };
        await updateEmployeeAdvanceConnect(id, payload);
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
            onSave={key === "advanceSalary" ? save : saveExtraAdvance}
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
                        <Form.Label>Extra Advance</Form.Label>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="basic-addon1">-₹</InputGroup.Text>
                            <Form.Control type="number" placeholder="advance" value={takeAdvance} onChange={(e) => {setTakeAdvance(e.target.value)}} />
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
