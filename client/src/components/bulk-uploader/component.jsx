import  { useState } from 'react'
import PropTypes from 'prop-types';
import ModalWrapper from '../../shared/component/modal';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import TimePicker from '../../shared/component/time=picker';
import { getEmployee } from './selector';
import { formatTime, getMonth } from '../../helpers/today-date';
import PageLoader from '../../shared/component/page-loader';


const BulkUploader = ({
    showModal,
    data,
    dateValue,
    onClose,
    markAttendanceConnect,
    employeeListHandler
}) => {

    const list = getEmployee(data);
    const [isLoading, setIsLoading] = useState(false);
    const [timeSelected, setTimeSelected] = useState("");
    const [selectedList, setSelectedList] = useState([]);

    const disabledState = () => !(selectedList.length);

    const handleTime = ({punchedTime}) => {
        const punchOutTime = new Date(punchedTime);
        setTimeSelected(punchOutTime);
    }

    const onChange = (e, activeEmp) => {
        const copy = [...selectedList];
        if (e.target.checked) {
            setSelectedList([
                ...copy,
                activeEmp._id
            ]);
        } else {
            const index = selectedList.findIndex(list => list === activeEmp._id);
            if (index !== -1) {
                copy.splice(index, 1)
            }
            setSelectedList(copy);
        }

    };

    const onSave = async() => {
        const promises = selectedList.map(async (id) => {
        setIsLoading(true);
        const payload = {
            date: dateValue,
            status: true,
            isAbsent: false,
            isSunday: timeSelected.getDay() == 0,
            checkinTime: `${timeSelected.getTime()}`,
            month: getMonth(dateValue),
            year: timeSelected.getFullYear()
            };

            try {
            await markAttendanceConnect(id, payload);
            } catch (err) {
            console.log(err);
            }
        });

        await Promise.all(promises);
        await employeeListHandler();
        onClose();
        setIsLoading(false);
    }

    const onChangeSelectAll = (e) => {
        if (e.target.checked) {
            let allList = []
            list.map(emp => {
                allList.push(emp._id);
            })
            setSelectedList(allList);
        } else{
            setSelectedList([]);
        }
    }
    if (isLoading) return <PageLoader />

    return (
        <div>
            <ModalWrapper
                show={showModal}
                title={"Bulk Present Uploader"}
                onSave={onSave}
                isDisabled={disabledState()}
                handleClose={onClose}
            >
                <div>
                    <h6>Select Time Slot</h6>
                    <TimePicker dateValue={dateValue} callBack={({punchedTime}) => handleTime({punchedTime})} >
                        <Button variant="success" style={{width: `100%`}} size='sm'>
                            {
                                timeSelected ? formatTime(timeSelected.getTime()) : "Select Time"
                            }
                        </Button>
                    </TimePicker>
                    {timeSelected &&
                    <div className='mt-3'>
                        <h6 className='mb-3'>Select Employee</h6>
                        <div  className="mb-3" style={{marginLeft: "12px"}}>
                            <Form.Check
                                type={"checkbox"}
                                className='elistCheckbox'
                                id={`default`}
                                label={'select all'}
                                onChange={(e) => onChangeSelectAll(e)}
                            />
                        </div>
                        <Container>
                        <Row className='row-cols-2'>
                            {
                            list.map((emp, index) => {
                                return (
                                    <Col key={`default-${index}`} md={4}>
                                    <div  className="mb-3">
                                        <Form.Check
                                            type={"checkbox"}
                                            className='elistCheckbox'
                                            id={`default-${index}`}
                                            label={emp.name}
                                            checked={selectedList.includes(emp._id)}
                                            onChange={(e) => onChange(e, emp)}
                                        />
                                    </div>
                                    </Col>
                                )
                            } )
                            }
                            </Row>
                        </Container>
                    </div>}
                </div>
            </ModalWrapper>
        </div>
    )
}

BulkUploader.propTypes = {
    showModal: PropTypes.bool,
    onSave: PropTypes.func,
    onClose: PropTypes.func,
    data: PropTypes.any,
    dateValue: PropTypes.string,
    markAttendanceConnect: PropTypes.func,
    employeeListHandler: PropTypes.func
}

export default BulkUploader