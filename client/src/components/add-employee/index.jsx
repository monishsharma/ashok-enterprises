import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import { Form, InputGroup } from "react-bootstrap";
import ModalWrapper from '../../shared/component/modal';
import { addEmployee, editEmployee } from '../../store/employee/action';
import PageLoader from "../../shared/component/page-loader"

const AddEmployee = ({
    isEditing,
    employeeId = null,
    selectedName,
    selectedSalary,
    showModal,
    addEmployeeHandlerToggle
}) => {

    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [salary, setSalary] = useState("");

    useEffect(() => {
      if (selectedName || selectedSalary) {
        setName(selectedName);
        setSalary(selectedSalary);
      }
    }, [selectedName, selectedSalary])


    const getDisabledState = () => !(name.length > 3 && parseInt(salary) > 0);

    const addEmployeeHandler = async() => {
        setIsLoading(true);
        const payload = {
            name,
            salaryPerDay: salary
        };
        try {
            if (isEditing) {
                await editEmployee(employeeId, payload)
            } else {
                await addEmployee(payload)
            }
            setName("");
            setSalary("");
            setIsLoading(false);
            addEmployeeHandlerToggle();
        } catch(err) {
            setIsLoading(false);
        }
    }

    return (
        <React.Fragment>
            {isLoading && <PageLoader />}
            <ModalWrapper
                show={showModal}
                title={"Add Employee"}
                onSave={addEmployeeHandler}
                isDisabled={getDisabledState()}
                handleClose={addEmployeeHandlerToggle}
        >
            <Form.Group className="mb-3" controlId="formGroupEmail">
                <Form.Label className="font-weight-bold">Name</Form.Label>
                <Form.Control type="name" placeholder="Enter name" value={name} onChange={(e) => {setName(e.target.value)}} />
            </Form.Group>


                <Form.Group className="mb-3">
                    <Form.Label>Salary Per/Day</Form.Label>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon1">₹</InputGroup.Text>
                        <Form.Control type="number" placeholder="Salary per/day" value={salary} onChange={(e) => {setSalary(e.target.value)}} />
                    </InputGroup>
            </Form.Group>
        </ModalWrapper>
        </React.Fragment>
    )
}

AddEmployee.propTypes = {
    showModal: PropTypes.bool,
    isEditing: PropTypes.bool,
    employeeId: PropTypes.any,
    selectedName: PropTypes.string,
    selectedSalary: PropTypes.any,
    addEmployeeHandlerToggle: PropTypes.func
}

export default AddEmployee