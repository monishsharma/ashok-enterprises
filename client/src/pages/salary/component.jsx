import React, {useState, useEffect, forwardRef} from 'react'
import PropTypes from 'prop-types'
import Table from '../../shared/component/table'
import { useNavigate } from 'react-router-dom';
import { tableConstants } from './tableConstant';
import PageLoader from '../../shared/component/page-loader';
import { Badge, Button, Col, Row } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { getMonth } from '../../helpers/today-date';
import priceFormatter from '../../helpers/price-formatter';
import { totalAdvance, totalSalary } from '../../helpers/employee-detal';
import Advance from './advance';

const Salary = ({
    employeeData,
    employeeListConnect,
    updateEmployeePaymentConnect
}) => {

    const getDateValue = () => {

      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth(); // January is 0, December is 11
      const day = today.getDate();

      let salaryMonth, salaryYear;

      if (day <= 10) {
          // Before or on the 10th, return the previous month
          salaryMonth = month - 1;
          salaryYear = month === 0 ? year - 1 : year; // Handle January case
      } else {
          // After the 10th, return the current month
          salaryMonth = month;
          salaryYear = year;
      }

      // Return a Date object with the calculated month and year
      return new Date(salaryYear, salaryMonth, 1);
  }

  const [dateValue, setDateValue] = useState(new Date(getDateValue()));
    const [showAdvance, setShowAdvance] = useState(false);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const employeeListHandler = () => {
        setIsLoading(true);
        const qp = {
          month:  getMonth(dateValue)
        }
        employeeListConnect({sortByKey: "name", qp})
          .then(() => {
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoading(false);
          });
      };

      useEffect(() => {
        employeeListHandler()
       }, [dateValue]);

    const onClickTable = (list) => {
        const {_id} = list;
        navigate(`/salary/detail/${_id}/${getMonth(dateValue)}/${dateValue.getFullYear()}`)
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

    const toggleAdvance = () => setShowAdvance(!showAdvance);

  if (isLoading) return <PageLoader />;


    return (
        <React.Fragment>
          {
            showAdvance &&
              <Advance
                dateValue={dateValue}
                toggleAdvance={toggleAdvance}
                employeeData={employeeData}
                setIsLoading={setIsLoading}
                isLoading={isLoading}
                employeeListHandler={employeeListHandler}
                updateEmployeePaymentConnect={updateEmployeePaymentConnect}
              />

          }
          <div className='mt-4'>
                <div>
                <Row className='gy-2'>
                  <Col sm={3}>
                    <h2 className="fw-bold">Salary</h2>
                  </Col>
                  <Col sm={{ span:6, offset: 3}}>
                      <Row className='gy-2'>
                        <Col sm={3}>
                          <div className="d-grid">
                            <Button onClick={toggleAdvance}>
                              Advance
                            </Button>
                          </div>
                        </Col>
                        <Col sm={3}>
                          <div className="d-grid">
                            <Button  onClick={() => navigate(`/salary/distribution/${getMonth(dateValue)}/${dateValue.getFullYear()}`)} variant='warning'>
                              Detail
                            </Button>
                          </div>
                        </Col>
                        <Col sm={6}>
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
                  </Col>
                </Row>
            </div>
          </div>


          <div className="mt-4 ">
            <Row className='gap-3'>
              <Col  sm={3}>
                <h5>Total Salary - <Badge bg='success' >{`₹ ${priceFormatter(totalSalary({detail: employeeData, month:  getMonth(dateValue), year:  new Date(dateValue).getFullYear()}))}`}</Badge></h5>
              </Col>
              <Col  sm={3}>
                <h5>Total Advance - <Badge bg='warning'>{`₹ ${priceFormatter(totalAdvance({detail: employeeData, month:  getMonth(dateValue), year:  new Date(dateValue).getFullYear()}))}`}</Badge></h5>
              </Col>
            </Row>
          </div>



          <div className="pt-4">
            <Table  canSearch={false} isClickable={true} onClick={onClickTable} hoverable={true} cols={tableConstants({dateValue})} data={employeeData} />
        </div>
    </React.Fragment>
    )
}

Salary.propTypes = {
    employeeData: PropTypes.array,
    employeeListConnect: PropTypes.func,
    updateEmployeePaymentConnect: PropTypes.func
}

export default Salary;
