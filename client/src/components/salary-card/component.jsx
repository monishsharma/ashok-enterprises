import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Card, Col, Row, Table } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import { getDailySalary, getOverTimeSalary, getSundayCost, getTotalPresent, getTotalSalary, totalWorkingHours } from '../../helpers/employee-detal'
import priceFormatter from '../../helpers/price-formatter'
import ReactToPrint from 'react-to-print';

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

        <tr>
                    <td className='fw-bold' style={{width: "50px"}}>{name}</td>
                    <td style={{width: "200px"}}><span className='fw-bold'>₹{priceFormatter(perDayAmount)}</span> <br />{`(${working})`}</td>
                    <td style={{width: "150px"}}>
                        <span className='fw-bold'>₹{priceFormatter(overTimeAmount)}</span> <br />{`(${overTime})`}
                    </td>

                    <td style={{width: "100px"}}>
                    <span className='fw-bold'>₹{priceFormatter(sunday.amount)}</span> <br />{`(${sunday.count} sun)`}
                    </td>
                    <td style={{width: "50px"}}>
                        <span  > {esi ? "-200" : 0}</span>
                    </td>
                    <td style={{width: "50px"}} className='fw-bold'>
                    ₹{(priceFormatter(parseInt(totalSalary) +  parseInt(advance.advance)))}
                    </td>
                    <td className='fw-bold' style={{width: "50px"}}>
                        <span>₹{priceFormatter(advance.advance)}</span>
                    </td>
                    <td style={{width: "50px"}} className='fw-bold'>
                    ₹{priceFormatter(totalSalary)}
                    </td>
                    <td style={{width: "100px"}}></td>
                    <td style={{width: "100px"}}></td>
                    <td style={{width: "100px"}}></td>
                    </tr>


)

const SalaryCard = ({
    employeeData,
    employeeListConnect
}) => {
    const componentRef = useRef();
    // const handlePrint = useReactToPrint({
    //   content: () => componentRef.current,
    // });

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
            <h2 className="fw-bold mb-2">Detailed Salary</h2>
            <ReactToPrint
                trigger={() => <Button >Print this out!</Button>}
                content={() => componentRef.current}
            />
            {/* <Button onClick={handlePrint}>Print</Button> */}
            {/* {!isLoading && <div className='detailTable' > */}
            {!isLoading && <div className='detailTable mt-2' ref={componentRef}>

            <table style={{width: "100%", borderCollapse: "collapse"}}>
            <thead>
                <tr>
                    <th style={{fontSize: "25px"}} colSpan={10}>{`${month}, ${year}`}</th>
                </tr>
                <th>Name</th>
                <th>Per Day</th>
                <th>Overtime</th>
                <th>Sunday</th>
                <th>ESI</th>
                <th>Total</th>
                <th>Advance</th>
                <th>Payable</th>
                <th>Bank</th>
                <th>Cash</th>
                <th>Deduct</th>
            </thead>
            <tbody>
            {
                    employeeData.map((emp, index) => (
                            <SalayDetail
                                key={index}
                                advance={emp.advance[year] && emp.advance[year][month] && emp.advance[year][month] || 0}
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
                    ))
                }

            </tbody>
        </table>


            </div>}
        </React.Fragment>
    )
}

SalaryCard.propTypes = {}

export default SalaryCard