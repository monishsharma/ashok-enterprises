import React, {useState, useEffect, forwardRef} from 'react'
import PropTypes from 'prop-types'
import Table from '../../shared/component/table'
import { useNavigate } from 'react-router-dom';
import { tableConstants } from './tableConstant';
import PageLoader from '../../shared/component/page-loader';
import { Button, Col, Row } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { getMonth } from '../../helpers/today-date';
import { sortData } from '../../helpers/sort-data';

const Salary = ({
    employeeData,
    employeeListConnect
}) => {


    const [dateValue, setDateValue] = useState(new Date());
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const employeeListHandler = () => {
        setIsLoading(true);
        employeeListConnect()
          .then(() => {
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoading(false);
          });
      };

      useEffect(() => {
        employeeListHandler()
       }, []);

    const onClickTable = (list) => {
        const {_id} = list;
        navigate(`/salary/detail/${_id}`)
    }

    const handleDateChange = (selectedDate) => {
        setDateValue(selectedDate)
    }

    // eslint-disable-next-line react/display-name, react/prop-types
    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
        <div className="d-grid">
          <Button variant="dark" className="example-custom-input" onClick={onClick} ref={ref}>
           {value}
         </Button>
        </div>
       ));

  if (isLoading) return <PageLoader />;


    return (
        <React.Fragment>
        <div className={`mt-4`}>
            <h2 className="fw-bold">Salary</h2>
        </div>
        <Row className="pt-4 ">
            <Col sm={3}>
            <DatePicker
              selected={dateValue}
              showMonthYearPicker={true}
               dateFormat="MMM, yyyy"
              onChange={handleDateChange}
              withPortal
              customInput={<ExampleCustomInput />}
              // filterDate={isSelectableDate}
            />
            </Col>
          </Row>
        <div className="pt-4">
            <Table isClickable={true} onClick={onClickTable} hoverable={true} cols={tableConstants()} data={sortData(employeeData)} />
        </div>
    </React.Fragment>
    )
}

Salary.propTypes = {
    employeeData: PropTypes.array,
    employeeListConnect: PropTypes.func
}

export default Salary;