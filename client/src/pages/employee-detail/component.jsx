import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import PageLoader from "../../shared/component/page-loader";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Card from "../../shared/component/card";
import {
  deductESI,
  getAdvancePAymentFromSalary,
  getDailySalary,
  getExtraAdvancePayment,
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
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import ModalWrapper from "../../shared/component/modal";
import { sortData } from "../../helpers/sort-data";
import PaySalary from "../../components/pay-salary/index";
import Advance from "../../components/advance";
import { getExtraAdvacnePaymentForThisMonth } from "../../helpers/payment-detail";
import Timeline from "../../shared/component/timeline";
import moment from "moment";

const EmployeeDetail = ({ detail = {}, employeeDetailConnect, markAttendanceConnect }) => {
  const { id, month, year } = useParams();
  const { name, salaryPerDay, attendance = [], extraAdvance = {} } = detail || {};
  const {detail:extraAdvanceDetail = [], total} = extraAdvance || {}
  const revExtraAdvanceDetail = [...extraAdvanceDetail].sort(function(x, y){
    return y.time - x.time;
});
  const [isLoading, setIsLoading] = useState(false);
  const [key, setKey] = useState("info");
  const [hoursToDeduct, setHoursToDeduct] = useState("");
  const [minToDeduct, setMinToDeduct] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [dayDetail, setDayDetail] = useState(null);
  const [showPaymentDetail, setShowPaymentDetail] = useState(false);
  const [showAdvanceDetail, setShowAdvanceDetail] = useState(false);


  useEffect(() => {
    if (id) {
      setIsLoading(true);
      employeeDetailConnect({id, month})
        .then(() => setIsLoading(false))
        .catch(() => setIsLoading(false));
    }
  }, [id]);


  const deductTime = () => {
    setIsLoading(true);
    const {date, totalWorkingHours} = dayDetail;
    const deductionTime = `${hoursToDeduct ? `${hoursToDeduct}h` : ""} ${minToDeduct ? `${minToDeduct}min` : ""}`
    const hourInMin = parseInt(hoursToDeduct || 0) * 60;
    const payload={
      deductionTime,
      date,
      totalWorkingHours:{
        hours: parseInt(totalWorkingHours.hours) - parseInt(hoursToDeduct || 0),
        min: parseInt(totalWorkingHours.min) - parseInt(minToDeduct || 0) - parseInt(hourInMin)
      }
    };
    markAttendanceConnect(id, payload)
    .then(async() => {
      await employeeDetailConnect({id, month});
      addEmployeeHandlerToggle();
      setDayDetail(null);
      setHoursToDeduct("");
      setMinToDeduct("");
      setIsLoading(false);
    })
    .catch((err) => {
      setIsLoading(false);
      console.log(err)
    })


  }

  const addEmployeeHandlerToggle = () => setShowModal(!showModal);

  const showAdavanceDetailToggle = () => setShowAdvanceDetail(!showAdvanceDetail);


  const onClick = (rowData) => {
    setDayDetail(rowData);
    addEmployeeHandlerToggle()
  }

  const paymentDetailHandle = () => setShowPaymentDetail(!showPaymentDetail);


  const getAdvanceDate = (date) => {
   return  moment(date).format("DD MMM, yy, h:mm a")
  }

  if (isLoading) return <PageLoader />;

  return (
    <React.Fragment>
      {
        showPaymentDetail &&
        <PaySalary
          id={id}
          attendance={attendance}
          showPaymentDetail={showPaymentDetail}
          paymentDetailHandle={paymentDetailHandle}
        />
      }
      {
        showAdvanceDetail &&
        <Advance
          close={showAdavanceDetailToggle}
        />
      }
      <ModalWrapper
        show={showModal}
        title={"Minus Time"}
        onSave={deductTime}
        isDisabled={!(hoursToDeduct || minToDeduct)}
        handleClose={addEmployeeHandlerToggle}
      >
        <Container>
        <Form.Group className="mb-3" controlId="formGroupEmail">
                <Form.Label className="font-weight-bold">Hours</Form.Label>
                <Form.Control type="number" placeholder="Enter Hours" value={hoursToDeduct} onChange={(e) => {setHoursToDeduct(e.target.value)}} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formGroupEmail">
                <Form.Label className="font-weight-bold">Mins</Form.Label>
                <Form.Control type="number" placeholder="Enter Mins" value={minToDeduct} onChange={(e) => {setMinToDeduct(e.target.value)}} />
          </Form.Group>
        </Container>
      </ModalWrapper>
      <div className="mt-4 ">
        <div className="actionBtn">
          <div>
            <h5 className="fw-bold fs-2 text-capitalize ">{name}, &#8377;{salaryPerDay}/ Day</h5>
          </div>
          { <div>
            <Button style={{marginRight: '5px'}} onClick={() => showAdavanceDetailToggle()}>Advance</Button>
            <Button variant="success" onClick={() => paymentDetailHandle()}>Pay</Button>
          </div>}
        </div>
        <div className="mt-4">
          <div className="cardBox">
            <Card
              number={`₹ ${priceFormatter(getTotalSalary(detail, month, year))}`}
              cardName={"Total Salary"}
              color={"#0d6efd"}
            >
              <span>&#8377;</span>
            </Card>
            <Card
              number={`₹ ${priceFormatter(getExtraAdvancePayment(detail))}`}
              cardName={"Extra Payment"}
              color={"#6610f2"}
            >
              <span>&#8377;</span>
            </Card>
            <Card
              number={getTotalPresent(detail)}
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
              variant="pills"
              onSelect={(k) => setKey(k)}
              className="mb-3"
            >
              <Tab eventKey="info" title="Info">
                <Table
                  isClickable={false}
                  cols={tableConstants({onClick, salaryPerDay})}
                  data={sortData(attendance, "date")}
                />
              </Tab>
              <Tab eventKey="salary" title="Salary">
                <div className="mt-4">
                  <Row>
                    <Col md={4}>
                      <Form.Label>
                        Salary Per Month
                      </Form.Label>
                      <Form.Control
                        disabled
                        value={getDailySalary(detail)}
                        size="lg"
                        type="text"
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Label>
                        Overtime Salary
                      </Form.Label>
                      <Form.Control
                        disabled
                        size="lg"
                        type="text"
                        value={getOverTimeSalary(detail)}
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Label>
                        Sundays
                      </Form.Label>
                      <Form.Control
                        disabled
                        size="lg"
                        type="text"
                        value={getSundayCost(detail)}
                      />
                    </Col>
                    <Col md={4} className="mt-3 mb-2">
                      <Form.Label>
                        ESI
                      </Form.Label>
                      <Form.Control
                        disabled
                        size="lg"
                        type="text"
                        value={`${deductESI(detail)}`}
                      />
                    </Col>
                    <Col md={4} className="mt-3 mb-2">
                      <Form.Label>
                        Advance from salary
                      </Form.Label>
                      <Form.Control
                        disabled
                        size="lg"
                        type="text"
                        value={`-${getAdvancePAymentFromSalary(detail, month,year)}`}
                      />
                    </Col>
                    <Col md={4} className="mt-3 mb-2">
                      <Form.Label>
                        Extra Advance Minus
                      </Form.Label>
                      <Form.Control
                        disabled
                        size="lg"
                        type="text"
                        value={`-${getExtraAdvacnePaymentForThisMonth(detail)}`}
                      />
                    </Col>
                    <Col md={4} className="mt-3 mb-4 pb-4">
                      <Form.Label>
                        Total Salary
                      </Form.Label>
                      <Form.Control
                        disabled
                        size="lg"
                        type="text"
                        value={getTotalSalary(detail,month, year)}
                      />
                    </Col>
                  </Row>
                </div>
              </Tab>
              {!!(revExtraAdvanceDetail.length) && <Tab eventKey="Advance History" title="Advance History">
                <section className="bsb-timeline-1 py-2 py-xl-4">
                  <div className="container">
                    <div className="row">
                      <div className="col-12">

                        <ul className="timeline">
                          {
                            revExtraAdvanceDetail.map((item, index) => {
                              return (
                                <Timeline
                                  key={index}
                                  name={name}
                                  total={total}
                                  amount={item.amount}
                                  isDeposited={item.type}
                                  balance={item.balance}
                                  date={getAdvanceDate(item.time)}
                                />

                              )
                            })
                          }
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>
              </Tab>}
            </Tabs>
          </div>
        </div>
    </div>
    </React.Fragment>
  );
};


export default EmployeeDetail;
