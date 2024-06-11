import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import Table from "../../shared/component/table";
import { getMonth, getTodayDate } from "../../helpers/today-date";
import styles from "./attendance.module.css";
import {tableConstants} from "../../constants/tableConstant"
import { employeeList, markAttendance } from "../../store/employee/action";
import moment from "moment";
import PageLoader from "../../shared/component/page-loader";

const Attendance = () => {

  const {sanitizedDate, date} = getTodayDate();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const employeeListHandler = () => {
    setIsLoading(true);
    employeeList()
    .then((res) => {
      setEmployees(res);
      setIsLoading(false)
    })
    .catch(() => {
      setIsLoading(false);
    })
  }

  useEffect(() => {
   employeeListHandler()
  }, []);


  const handleAttendance = ({rowData}) => async() => {
    setIsLoading(true);
    const {_id: id } = rowData;
    const payload = {
      date: sanitizedDate,
      status: true,
      isSunday: date.getDay() == 0,
      checkinTime: date.getTime(),
      month: getMonth()
    }
    markAttendance(id, payload)
    .then(() => {
      employeeListHandler();
      setIsLoading(false);
    })
    .catch((err) => {
      setIsLoading(false);
      console.log(err)
    })
  }

  const handleCheckoutAttendance = ({rowData}) => async() => {
    setIsLoading(true);
    const {_id: id } = rowData;
    const payload = {
      date: sanitizedDate,
      isOverTime: date.getHours() >= 18 ? true : false,
      checkoutTime: date.getTime()
    };
    markAttendance(id, payload)
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
      <Container fluid>
        <div className={` ${styles.attendanceWrapper}`}>
          <h2 className="fw-bold">Attendance List</h2>
          <p className="pt-4 ">{"Today's Date"} - <span>{moment(new Date()).format('Do MMM, YYYY')}</span></p>
        </div>
        <div className="pt-4">
          <Table cols={tableConstants({handleAttendance, handleCheckoutAttendance})} data={employees} />
        </div>
      </Container>
    </React.Fragment>
  );
};


export default Attendance;
