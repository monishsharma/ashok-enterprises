import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import PageLoader from "../../shared/component/page-loader";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Card from "../../shared/component/card";
import {
  getDailySalary,
  getOverTimeSalary,
  getSundayCost,
  getTotalAbsent,
  getTotalPresent,
  getTotalSalary,
  totalWorkingHours,
} from "../../helpers/employee-detal";
import priceFormatter from "../../helpers/price-formatter";
import Table from "../../shared/component/table";
import { tableConstants } from "./tableConstant";
import { Col, Form, Row } from "react-bootstrap";

const EmployeeDetail = ({ detail = {}, employeeDetailConnect }) => {
  const { id } = useParams();
  const { name, salaryPerDay, attendance = [] } = detail || {};
  const [isLoading, setIsLoading] = useState(false);
  const [key, setKey] = useState("info");

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      employeeDetailConnect(id)
        .then(() => setIsLoading(false))
        .catch(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) return <PageLoader />;

  return (
    <div className="mt-4 ">
      <h5 className="fw-bold fs-1 text-capitalize text-center">{name}</h5>
      <div className="mt-4">
        <div className="cardBox">
          <Card
            number={`₹${priceFormatter(salaryPerDay)}`}
            cardName={"Salary/Hour"}
            color={"#0d6efd"}
          >
            <span>&#8377;</span>
          </Card>
          <Card
            number={totalWorkingHours(detail, "totalWorkingHours")}
            cardName={"Working Hours"}
            color={"#20c997"}
            icon={"time-outline"}
          />
          <Card
            number={totalWorkingHours(detail, "overTimeHours")}
            cardName={"OverTime"}
            color={"#ffc107"}
            icon={"time-outline"}
          />
          <Card
            number={`${getTotalPresent(detail)} days`}
            cardName={"Present"}
            color={"#198754"}
            icon={"calendar-outline"}
          />
          <Card
            number={`${getTotalAbsent(detail)} days`}
            cardName={"Absent"}
            color={"#dc3545"}
            icon={"calendar-outline"}
          />
        </div>
        <div className="mt-4">
          <Tabs
            id="controlled-tab-example"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3"
          >
            <Tab eventKey="info" title="Info">
              <Table
                isClickable={false}
                cols={tableConstants()}
                data={attendance}
              />
            </Tab>
            <Tab eventKey="salary" title="Salary">
              <div className="mt-4">
                <Row>
                  <Col md={4}>
                    <Form.Label htmlFor="inputPassword5">
                      Total Salary Per Day
                    </Form.Label>
                    <Form.Control
                      disabled
                      value={getDailySalary(detail)}
                      size="lg"
                      type="text"
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label htmlFor="inputPassword5">
                      Total Overtime Salary
                    </Form.Label>
                    <Form.Control
                      disabled
                      size="lg"
                      type="text"
                      value={getOverTimeSalary(detail)}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label htmlFor="inputPassword5">
                      Total Sundays
                    </Form.Label>
                    <Form.Control
                      disabled
                      size="lg"
                      type="text"
                      value={getSundayCost(detail)}
                    />
                  </Col>
                  <Col md={4} className="mt-2">
                    <Form.Label htmlFor="inputPassword5">
                      NSIC
                    </Form.Label>
                    <Form.Control
                      disabled
                      size="lg"
                      type="text"
                      value={"-200"}
                    />
                  </Col>
                  <Col md={4} className="mt-2">
                    <Form.Label htmlFor="inputPassword5">
                      Total
                    </Form.Label>
                    <Form.Control
                      disabled
                      size="lg"
                      type="text"
                      value={getTotalSalary(detail)}
                    />
                  </Col>
                </Row>
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

EmployeeDetail.propTypes = {
  detail: PropTypes.any,
  employeeDetailConnect: PropTypes.func,
};

export default EmployeeDetail;
