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

const Salary = ({
    employeeData,
    employeeListConnect
}) => {


    const [dateValue, setDateValue] = useState(new Date());
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

  if (isLoading) return <PageLoader />;


    return (
        <React.Fragment>
          <div className='mt-4'>
                <div className='d-flex justify-content-between align-items-center'>
                    <h2 className="fw-bold">Salary</h2>
                    <Row >
                        <Col lg={12}>
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
            <Table canSearch={false} isClickable={true} onClick={onClickTable} hoverable={true} cols={tableConstants({dateValue})} data={employeeData} />
        </div>
    </React.Fragment>
    )
}

Salary.propTypes = {
    employeeData: PropTypes.array,
    employeeListConnect: PropTypes.func
}

export default Salary;