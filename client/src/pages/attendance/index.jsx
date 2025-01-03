import React, { useEffect, useState, forwardRef } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Button, Col, Row } from "react-bootstrap";
import Table from "../../shared/component/table";
import { getMonth, getTodayDate } from "../../helpers/today-date";
import styles from "./attendance.module.css";
import {tableConstants} from "../../constants/tableConstant"
import { employeeList, markAttendance, employeeDetail, checkoutAllEmployee } from "../../store/employee/action";
import PageLoader from "../../shared/component/page-loader";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import { filterEmployee, totalHoursWork, totalOverTime } from "./selector";
import TimePicker from "../../shared/component/time=picker";
import { useOutletContext } from "react-router-dom";
import BulkUploader from "../../components/bulk-uploader";


const Attendance = ({
  employeeData,
  markAttendanceConnect,
  employeeListConnect,
  employeeDetailConnect
}) => {

  const {date} = getTodayDate();
  const {ref} = useOutletContext();
  const scroll = localStorage.getItem("scroll");
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const [dateValue, setDateValue] = useState(`${year}-${month}-${day}`);

  const [showBulkAttendanceUploader, setShowBulkAttendanceUploader] = useState(false);

  const hasEmptyCheckinTime = employeeData.filter(employee =>
      employee.attendance.some(attendance =>
        attendance.date === dateValue && attendance.checkinTime
      )
    );
  const [isLoading, setIsLoading] = useState(false);
  const employeeListHandler = async() => {
    setIsLoading(true);
    employeeListConnect({date: dateValue, sortByKey: "name"})
    .then(() => {
      setIsLoading(false);
    })
    .catch(() => {
      setIsLoading(false);
    })
  }

  useEffect(() => {
   employeeListHandler()
  }, [dateValue]);

  useEffect(() => {
    if(!isLoading&& employeeData.length) {
      ref.current.scrollTop = scroll;
    }
  }, [isLoading, employeeData])


  const markAbsent = async({rowData, e}) => {
      const {_id: id } = rowData;
      setIsLoading(true);
      const payload = {
        date: dateValue,
        isAbsent: e.target.checked,
        status: false,
        isSunday: new Date(`${dateValue}`).getDay() == 0,
        checkinTime: ``,
        checkoutTime: ``,
        year: new Date(dateValue).getFullYear(),
        month: getMonth(dateValue)
      };
      markAttendanceConnect(id, payload)
      .then(async() => {
        await employeeListHandler();
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err)
      })
  }

  const checkoutAll = async ({ punchedTime }) => {
    const promises = employeeData.map(async (data) => {
      setIsLoading(true);
      const emp = data.attendance.find(e => e.date === dateValue);
      if (emp && emp.status && emp.checkinTime && !emp.isAbsent && !emp.checkoutTime) {
        const punchOutTime = new Date(punchedTime);
        const { _id: id } = data;
        const { checkinTime } = emp;
        const isOverTime = punchOutTime.getHours() >= 18;
        const { differenceHrs, differenceMin } = totalHoursWork(checkinTime, punchOutTime.getTime(), dateValue);
        const { overTimeHours, overTimeMin } = totalOverTime(punchedTime, dateValue);

        const payload = {
          date: dateValue,
          isOverTime,
          checkoutTime: `${punchOutTime.getTime()}`,
          totalWorkingHours: {
            hours: parseInt(differenceHrs),
            min: parseInt(differenceMin)
          },
          overTimeHours: isOverTime ? {
            hours: parseInt(overTimeHours),
            min: parseInt(overTimeMin)
          } : {
            hours: 0,
            min: 0
          }
        };

        try {
          await markAttendanceConnect(id, payload);
        } catch (err) {
          console.log(err);
        }
      }
    });

    await Promise.all(promises);
    await employeeListHandler();
    setIsLoading(false);
  };


  const allPresentHandler = ({punchedTime: time}) => {
    setIsLoading(true);
    const punchInTime = new Date(time);
    const checkoutTime = new Date().setHours(punchInTime.getHours() + 8, 30, 0);
    const {differenceHrs, differenceMin} = totalHoursWork(punchInTime.getTime(), new Date(checkoutTime).getTime(), dateValue)

    const payload = {
      date: dateValue,
      status: true,
      isAbsent: false,
      allPresent: true,
      isSunday: punchInTime.getDay() == 0,
      checkinTime: `${punchInTime.getTime()}`,
      month: getMonth(),
      year: punchInTime.getFullYear(),
      checkoutTime,
      totalWorkingHours: {
        hours: parseInt(differenceHrs),
        min: parseInt(differenceMin)
      },
      overTimeHours: {
        hours: 0,
        min: 0
      }
    };
    console.log(JSON.stringify(payload))
    setIsLoading(false)
  }
  const handleAttendance = async({rowData, punchedTime}) => {
    const punchInTime = new Date(punchedTime);
    setIsLoading(true);
    const {_id: id } = rowData;
    const payload = {
      date: dateValue,
      status: true,
      isAbsent: false,
      isSunday: punchInTime.getDay() == 0,
      checkinTime: `${punchInTime.getTime()}`,
      month: getMonth(dateValue),
      year: punchInTime.getFullYear()
    }
    markAttendanceConnect(id, payload)
    .then(async() => {
      await employeeListHandler();
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
    const eDetail = await employeeDetailConnect({id});
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
    .then(async() => {
      await employeeListHandler();
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
  const bulUploaderToggle = () => {
    setShowBulkAttendanceUploader(!showBulkAttendanceUploader);
  }

if (isLoading) return <PageLoader/>

  return (
    <React.Fragment>
      {/* {isLoading && <PageLoader />} */}
       {showBulkAttendanceUploader && <BulkUploader
          data={employeeData}
          showModal={showBulkAttendanceUploader}
          onClose={bulUploaderToggle}
          dateValue={dateValue}
          employeeListHandler={employeeListHandler}
        />}
        <div className={` ${styles.attendanceWrapper}`}>
          <h2 className="fw-bold">Attendance List</h2>
          <Row className="pt-4 ">
            <Col md={3}>
              <DatePicker
              dateFormat="dd/MM/yyyy"
                selected={dateValue}
              
                maxDate={`${year}-${month}-${day}`}
                onChange={handleDateChange}
                withPortal
                customInput={<ExampleCustomInput />}
                // filterDate={isSelectableDate}
              />

            </Col>
            <Col md={9}>
            <div className="gap-2 btnContainer">
            <TimePicker dateValue={dateValue} callBack={({punchedTime}) => allPresentHandler({punchedTime})} >
              <Button variant="success" style={{width: `100%`}}>
                All Present
              </Button>
            </TimePicker>
            <TimePicker dateValue={dateValue} callBack={({punchedTime}) => checkoutAll({punchedTime})} isDisabled={hasEmptyCheckinTime.length < 5}>
              <Button variant="warning"  style={{width: `100%`}} disabled={hasEmptyCheckinTime.length < 5}>
                Checkout All
              </Button>
            </TimePicker>
            <Button variant="success" onClick={bulUploaderToggle}>
                Bulk Uploader
              </Button>
            </div>
            </Col>
          </Row>
        </div>
        <div className="pt-4" style={{minHeight: "1607px"}} >
          <Table canSearch={false} cols={tableConstants({handleAttendance, handleCheckoutAttendance, dateValue, markAbsent})} data={employeeData} />
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
    employeeDetailConnect: employeeDetail,
    checkoutAllEmployeeConnect: checkoutAllEmployee
}, dispatch);


export default connect(mapStateToProps, mapDispatchToProps)(Attendance);
