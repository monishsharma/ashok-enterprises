import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Col, Container, Form, Row } from "react-bootstrap";
import Table from "../../shared/component/table";
import { getMonth, getTodayDate } from "../../helpers/today-date";
import styles from "./attendance.module.css";
import {tableConstants} from "../../constants/tableConstant"
import { employeeList, markAttendance } from "../../store/employee/action";
import PageLoader from "../../shared/component/page-loader";
import PropTypes from "prop-types"

const Attendance = ({
  employeeData,
  markAttendanceConnect,
  employeeListConnect
}) => {

  const {sanitizedDate, date} = getTodayDate();

  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  const [dateValue, setDateValue] = useState(`${year}-${month}-${day}`);
  const [isLoading, setIsLoading] = useState(false);

  const employeeListHandler = () => {
    setIsLoading(true);
    employeeListConnect()
    .then(() => {
      setIsLoading(false)
    })
    .catch(() => {
      setIsLoading(false);
    })
  }

  useEffect(() => {
   employeeListHandler()
  }, []);


  const handleAttendance = async({rowData, punchedTime}) => {
    const punchInTime = new Date(punchedTime);
    setIsLoading(true);
    const {_id: id } = rowData;
    const payload = {
      date: sanitizedDate,
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
    setIsLoading(true);
    const {_id: id } = rowData;
    const payload = {
      date: sanitizedDate,
      isOverTime: punchOutTime.getHours() >= 18 ? true : false,
      checkoutTime: `${punchOutTime.getTime()}`
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
  }

  if (isLoading) return <PageLoader />;

  return (
    <React.Fragment>
        <div className={` ${styles.attendanceWrapper}`}>
          <h2 className="fw-bold">Attendance List</h2>
          <Row className="pt-4 ">
            <Col sm={3}>
            <Form.Control
              type="date"
              value={dateValue}
              placeholder="Enter name"
              min={`${year}-${month}-01`}
              max={`${year}-${month}-${day}`}
            />
            </Col>
          </Row>
        </div>
        <div className="pt-4">
          <Table cols={tableConstants({handleAttendance, handleCheckoutAttendance})} data={employeeData} />
        </div>
    </React.Fragment>
  );
};

Attendance.propTypes = {
  employeeData: PropTypes.array,
  employeeListConnect: PropTypes.func,
  markAttendanceConnect: PropTypes.func
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
    markAttendanceConnect: markAttendance
}, dispatch);


export default connect(mapStateToProps, mapDispatchToProps)(Attendance);
