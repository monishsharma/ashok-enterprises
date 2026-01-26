import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Calender from "../../shared/component/calendar";
import { Card, Col, Row } from "react-bootstrap";
import { getMonth } from "../../helpers/today-date";
import "./style.css";
import moment from "moment";

const Dashboard = ({ data, employeeListConnect }) => {
  const [isLoading, setIsLoading] = useState(false);

  const employeeListHandler = () => {
    setIsLoading(true);
    const qp = {
      month: getMonth(),
      year: new Date().getFullYear(),
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
  }, []);

  return (
    <React.Fragment>
      <h2 className="fw-bold mt-4 mb-4">
        Dashboard -{" "}
        <span className="fw-normal"> {moment().format("MMMM, YY")}</span>
      </h2>
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
