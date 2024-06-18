import React, { useEffect, useState, forwardRef } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Button, Col, Row } from "react-bootstrap";
import Table from "../../shared/component/table";
import { getMonth, getTodayDate } from "../../helpers/today-date";
import styles from "./attendance.module.css";
import {tableConstants} from "../../constants/tableConstant"
import { employeeList, markAttendance, employeeDetail } from "../../store/employee/action";
import PageLoader from "../../shared/component/page-loader";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import { filterEmployee, totalHoursWork, totalOverTime } from "./selector";

const Attendance = ({
  employeeData,
  markAttendanceConnect,
  employeeListConnect,
  employeeDetailConnect
}) => {

  const {date} = getTodayDate();

  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  const [dateValue, setDateValue] = useState(`${year}-${month}-${day}`);
  const [isLoading, setIsLoading] = useState(false);

  const employeeListHandler = () => {
    setIsLoading(true);
    employeeListConnect({date: dateValue})
    .then(() => {
      setIsLoading(false)
    })
    .catch(() => {
      setIsLoading(false);
    })
  }

  useEffect(() => {
   employeeListHandler()
  }, [dateValue]);


  const handleAttendance = async({rowData, punchedTime}) => {
    const punchInTime = new Date(punchedTime);
    setIsLoading(true);
    const {_id: id } = rowData;
    const payload = {
      date: dateValue,
      status: true,
      isSunday: punchInTime.getDay() == 0,
      checkinTime: `${punchInTime.getTime()}`,
      month: getMonth()
    }
    markAttendanceConnect(id, payload)
    .then(() => {
      employeeListHandler();
      setIsLoading(false);
    })
    .catch((err) => {
      setIsLoading(false);
      console.log(err)
    })
  }

  const handleCheckoutAttendance = async({rowData, punchedTime})  => {
    const punchOutTime = new Date(punchedTime);
    // setIsLoading(true);
    const {_id: id } = rowData;
    const eDetail = await employeeDetailConnect(id);
    const selectedTime = new Date(punchedTime).getHours();
    if (eDetail.checkinTime) {
      const storedPunchedInTime = new Date(parseInt(eAttendance.checkinTime)).getHours();
      if (parseInt(storedPunchedInTime) > parseInt(selectedTime)){
        alert("checkout time cannout be less than checkin time");
        return;
      }
    }
    const isOverTime = punchOutTime.getHours() >= 18 ? true : false;
    const eAttendance = filterEmployee({data: eDetail, date: dateValue})
    const {differenceHrs, differenceMin} = totalHoursWork(eAttendance.checkinTime, punchOutTime.getTime(), dateValue)
    const {overTimeHours, overTimeMin} = totalOverTime(punchedTime, dateValue);
    const payload = {
      date: dateValue,
      isOverTime,
      checkoutTime: `${punchOutTime.getTime()}`,
      totalWorkingHours: {
        hours: parseInt(differenceHrs),
        min: parseInt(differenceMin)
      },
      overTimeHours: isOverTime ?  {
        hours: parseInt(overTimeHours),
        min: parseInt(overTimeMin)
      }:
      {
        hours: 0,
        min: 0
      }
    };
    markAttendanceConnect(id, payload)
    .then(() => {
      employeeListHandler();
      setIsLoading(false);
    })
    .catch((err) => {
      setIsLoading(false);
      console.log(err)
    })
  };

  const handleDateChange = (date) => {
    const {sanitizedDate} = getTodayDate(date);
    setDateValue(sanitizedDate);
  };

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
        <div className={` ${styles.attendanceWrapper}`}>
          <h2 className="fw-bold">Attendance List</h2>
          <Row className="pt-4 ">
            <Col sm={3}>
            <DatePicker
              selected={dateValue}
              minDate={`${year}-${month}-01`}
              maxDate={`${year}-${month}-${day}`}
              onChange={handleDateChange}
              withPortal
              customInput={<ExampleCustomInput />}
              // filterDate={isSelectableDate}
            />
            </Col>
          </Row>
        </div>
        <div className="pt-4">
          <Table cols={tableConstants({handleAttendance, handleCheckoutAttendance, dateValue})} data={employeeData} />
        </div>
    </React.Fragment>
  );
};

Attendance.propTypes = {
  employeeData: PropTypes.array,
  employeeListConnect: PropTypes.func,
  markAttendanceConnect: PropTypes.func,
  employeeDetailConnect: PropTypes.func
}

const mapStateToProps = ({
  employee: {
    data: employeeData
  }
}) => ({
  employeeData
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
    employeeListConnect: employeeList,
    markAttendanceConnect: markAttendance,
    employeeDetailConnect: employeeDetail
}, dispatch);


export default connect(mapStateToProps, mapDispatchToProps)(Attendance);
