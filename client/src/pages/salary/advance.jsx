import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import ModalWrapper from '../../shared/component/modal'
import { Col, Form, Row } from 'react-bootstrap'
import { getMonth } from '../../helpers/today-date'

const Advance = ({
    dateValue,
    setIsLoading,
    toggleAdvance,
    employeeData,
    employeeListHandler,
    updateEmployeePaymentConnect
}) => {

    const month = getMonth(dateValue);
    const year = new Date(dateValue).getFullYear()
    const [values, setValues] = useState({});

    useEffect(() => {
        if (employeeData) {
            setValues(prevValues => {
                let updatedValues = { ...prevValues };
                employeeData.forEach(emp => {
                    if (emp.advance && emp.advance[year] && emp.advance[year][month]) {
                        updatedValues[emp._id] = emp.advance[year][month].advance;
                    }
                });
                return updatedValues;
            });
        }
    }, [employeeData])


    const save = async() => {

        const promises = Object.keys(values).map(async(emp) => {
            setIsLoading(true);
            const queryParams = {
                id: emp,
                year,
                month,
                type: "advance"
            };
            const payload = {
                advance: values[emp],
            };
            try {
                await updateEmployeePaymentConnect(queryParams, payload);
              } catch (err) {
                console.log(err);
              }
            await updateEmployeePaymentConnect(queryParams, payload);
        })

        await Promise.all(promises);
        await employeeListHandler();
        toggleAdvance();
        setIsLoading(false);


    }

    const onChange = (e) => {

        const { name, value } = e.target;

        setValues({
        ...values,
        [name]: parseInt(value),
        });
    }
    return (
        <div className="salary">

        <ModalWrapper
                show={true}
                title={"Advance"}
                onSave={save}
                centered
                isDisabled={!(Object.keys(values)).length}
                handleClose={toggleAdvance}
        >

            <div >
                    {
                        employeeData.map((emp,index) => {
                            return (
                            <Row key={index} className='gy-2'>
                                <Col sm={6}>
                                    <h5 className="name fw-bold">{emp.name}</h5>
                                </Col>
                                <Col sm={6}>
                                <Form.Group key={index} className="mb-3" controlId="formGroupEmail">
                                        <Form.Control name={emp._id}  type="number" placeholder="Enter Amount" onChange={onChange} value={values[emp._id]} />
                                </Form.Group>
                                </Col>
                             </Row>

                            )
                        })
                    }
            </div>


        </ModalWrapper>
        </div>

  )
}

Advance.propTypes = {
    setIsLoading: PropTypes.func,
    employeeListHandler: PropTypes.func,
    dateValue: PropTypes.string,
    toggleAdvance: PropTypes.func,
    employeeData: PropTypes.array,
    updateEmployeePaymentConnect: PropTypes.func
}

export default Advance