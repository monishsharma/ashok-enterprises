import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Card, Col, Row, Table } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import { getDailySalary, getOverTimeSalary, getSundayCost, getTotalPresent, getTotalSalary, totalWorkingHours } from '../../helpers/employee-detal'
import priceFormatter from '../../helpers/price-formatter'

const SalayDetail = ({
    name,
    working,
    overTime,
    sunday,
    esi,
    perDayAmount,
    overTimeAmount,
    salaryPerDay,
    totalSalary,
    advance
}) => (
    <Card>
            <Card.Body>
                <Card.Title style={{textAlign: 'center', marginBottom: "20px", fontWeight: "bold"}}>{name} @ ₹{salaryPerDay}</Card.Title>
                <Card.Text>
                    <div className="d-flex">
                        <table className="thead">
                            <thead>
                                <tr>
                                    <th>Per Day</th>
                                </tr>
                                <tr>
                                    <th>Overtime</th>
                                </tr>
                                <tr>
                                    <th>Advance</th>
                                </tr>
                                <tr>
                                    <th>Sunday</th>
                                </tr>
                                <tr>
                                    <th>ESI</th>
                                </tr>
                                <tr>
                                    <th>Total</th>
                                </tr>
                            </thead>
                        </table>
                        <table className="tbody">
                            <tbody>
                                <tr>
                                    <td><span className='fw-bold'>₹{priceFormatter(perDayAmount)}</span>{`(${working})`}</td>
                                </tr>
                                <tr>
                                    <td>
                                        <span className='fw-bold'>₹{priceFormatter(overTimeAmount)}</span>{`(${overTime})`}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <span>{advance.advance}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                    <span className='fw-bold'>₹{priceFormatter(sunday.amount)}</span>{`(${sunday.count} sunday)`}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                       <span  > {esi ? "-200" : 0}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                    ₹{priceFormatter(totalSalary)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card.Text>
            </Card.Body>
        </Card>
)

const SalaryCard = ({
    employeeData,
    employeeListConnect
}) => {
    const { month, year } = useParams();


    const [isLoading, setIsLoading] = useState(false);

    const employeeListHandler = () => {
        setIsLoading(true);
        const qp = {
          month:  month
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
    }, []);

    return (
        <React.Fragment>
            <h2 className="fw-bold">Detailed Salary</h2>
            <Row className=" mt-4 detailedSalary">
            {
                    employeeData.map((emp, index) => (
                        <Col   key={index} sm={4} className='mt-2'>
                            <SalayDetail
                                advance={emp.advance[year][month]|| 0}
                                name={emp.name}
                                salaryPerDay={emp.salaryPerDay}
                                esi={emp.esi}
                                perDayAmount={getDailySalary(emp)}
                                overTimeAmount={getOverTimeSalary(emp)}
                                working={getTotalPresent(emp)}
                                sunday={getSundayCost(emp, true)}
                                overTime={totalWorkingHours(emp, "overTimeHours")}
                                totalSalary={getTotalSalary(emp, month, year)}
                            />
                        </Col>
                    ))
                }


            </Row>
        </React.Fragment>
    )
}

SalaryCard.propTypes = {}

export default SalaryCard