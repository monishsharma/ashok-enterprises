import React, { forwardRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Calender from "../../shared/component/calendar";
import { Button, Card, Col, Row } from "react-bootstrap";
import { getMonth } from "../../helpers/today-date";
import "./style.css";
import moment from "moment";
import DatePicker from "react-datepicker";

const Dashboard = ({ data, employeeListConnect }) => {
  const getDateValue = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // January is 0, December is 11
    const day = today.getDate();

    let salaryMonth, salaryYear;

    if (day <= 10) {
      // Before or on the 10th, return the previous month
      if (month === 0) {
        // If current month is January, go to December of the previous year
        salaryMonth = 11; // December
        salaryYear = year - 1;
      } else {
        salaryMonth = month - 1;
        salaryYear = year;
      }
    } else {
      // After the 10th, return the current month
      salaryMonth = month;
      salaryYear = year;
    }

    // Return a Date object with the calculated month and year
    return new Date(salaryYear, salaryMonth);
  };

  const [dateValue, setDateValue] = useState(new Date(getDateValue()));
  const [isLoading, setIsLoading] = useState(false);

  const employeeListHandler = () => {
    setIsLoading(true);
    const qp = {
      month: getMonth(dateValue),
      year: new Date(dateValue).getFullYear(),
    };
    employeeListConnect({ sortByKey: "empCode", qp })
      .then(() => {
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    employeeListHandler();
  }, [dateValue]);

  const handleDateChange = (selectedDate) => {
    setDateValue(selectedDate);
  };

  // eslint-disable-next-line react/display-name
  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    <div className="d-flex ">
      <Button
        variant="dark"
        className="example-custom-input"
        onClick={onClick}
        ref={ref}
      >
        {value}
      </Button>
    </div>
  ));

  return (
    <React.Fragment>
      <Row className="gy-2">
        <Col sm={3}>
          <h2 className="fw-bold mt-4 mb-4">Dashboard</h2>
        </Col>
      </Row>
      <DatePicker
        selected={dateValue}
        showMonthYearPicker={true}
        dateFormat="MMM, yyyy"
        onChange={handleDateChange}
        withPortal
        customInput={<ExampleCustomInput />}
        // filterDate={isSelectableDate}
      />

      <div className="dashboardContainer">
        <div className="colContainer">
          <div className="calendarCard">
            <div className="pt-2 pb-4 nameContainer"></div>
          </div>
        </div>
        {data.map((emp, index) => {
          return (
            <div className="colContainer" key={index}>
              <div className="calendarCard">
                <div className="pt-2 pb-4 nameContainer">
                  <h4 className="name">{emp.name}</h4>
                </div>
                <Calender employee={emp} />
              </div>
            </div>
          );
        })}
      </div>
    </React.Fragment>
  );
};

Dashboard.propTypes = {
  data: PropTypes.array,
  employeeListConnect: PropTypes.func,
};

export default Dashboard;
