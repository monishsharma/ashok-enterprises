import React, { useEffect, useState, forwardRef } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Button, Col, Row } from "react-bootstrap";
import Table from "../../shared/component/table";
import { getMonth, getTodayDate } from "../../helpers/today-date";
import styles from "./attendance.module.css";
import {tableConstants} from "../../constants/tableConstant"
import { employeeList, markAttendance, employeeDetail, checkoutAllEmployee, fetchBiometricData, bulkAttendance } from "../../store/employee/action";
import PageLoader from "../../shared/component/page-loader";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import { filterEmployee, toMinutes, totalHoursWork, totalOverTime, toTimestamp } from "./selector";
import TimePicker from "../../shared/component/time=picker";
import { useOutletContext } from "react-router-dom";
import BulkUploader from "../../components/bulk-uploader";
import moment from 'moment'



const Attendance = ({
  employeeData,
  bulkAttendanceConnect,
  markAttendanceConnect,
  employeeListConnect,
  employeeDetailConnect,
  fetchBiometricDataConnect
}) => {

  const {date} = getTodayDate();
  const {ref} = useOutletContext();
  const scroll = localStorage.getItem("scroll");
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const [dateValue, setDateValue] = useState(`${year}-${month}-${day}`);

  const [showBulkAttendanceUploader, setShowBulkAttendanceUploader] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);

  // const hasEmptyCheckinTime = employeeData.filter(employee =>
  //     employee.attendance.some(attendance =>
  //       attendance.date === dateValue && attendance.checkinTime
  //     )
  //   );
  const [isLoading, setIsLoading] = useState(false);
  const employeeListHandler = async() => {
    setIsLoading(true);
    employeeListConnect({date: dateValue, sortByKey: "empCode"})
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
  const bulUploaderToggle = (isCheckoutBulk = false) => {
    setIsCheckout(isCheckoutBulk);
    setShowBulkAttendanceUploader(!showBulkAttendanceUploader);
  };

  const toTotalMinutes = (hours, minutes) => {
    return (parseInt(hours) * 60) + parseInt(minutes);
  }



const SHIFT_END = "17:30";
const OT_CUTOFF = "19:30";
const MAX_OT_MIN = 120;      // 2 hours
const LUNCH_BREAK_MIN = 30;

const fetchBiometricData = async () => {
  setIsLoading(true);

  const fromDate = moment(dateValue).format("DD/MM/YYYY");

  try {
    const { data } = await fetchBiometricDataConnect({
      fromDate,
      toDate: fromDate,
    });

    const bulkRecords = [];

    for (const d of data) {
      const employee = employeeData.find(
        e => e.empCode === d.Empcode
      );
      if (!employee?._id) continue;

      /* =====================================================
         ABSENT USERS
      ====================================================== */
      if (d.Status === "A") {
        bulkRecords.push({
          employeeId: employee._id,
          date: dateValue,
          year: new Date(dateValue).getFullYear(),
          month: getMonth(dateValue),
          isSunday: new Date(dateValue).getDay() === 0,

          status: false,
          isAbsent: true,
          isOverTime: false,

          checkinTime: null,
          checkoutTime: null,

          totalWorkingHours: { hours: 0, min: 0 },
          overTimeHours: { hours: 0, min: 0 },

          remark: "Absent (from eTime)",
        });
        continue;
      }

      /* =====================================================
         PRESENT USERS
      ====================================================== */

      const checkin = moment(
        `${d.DateString} ${d.INTime}`,
        "DD/MM/YYYY HH:mm"
      );

      const actualCheckout = moment(
        `${d.DateString} ${d.OUTTime}`,
        "DD/MM/YYYY HH:mm"
      );

      const cutoffCheckout = moment(
        `${d.DateString} ${OT_CUTOFF}`,
        "DD/MM/YYYY HH:mm"
      );

      const finalCheckout = actualCheckout.isAfter(cutoffCheckout)
        ? cutoffCheckout
        : actualCheckout;

      /* ---------- TOTAL WORK ---------- */
      let totalMinutes =
        finalCheckout.diff(checkin, "minutes") - LUNCH_BREAK_MIN;

      totalMinutes = Math.max(0, totalMinutes);

      /* ---------- OT ---------- */
      const shiftEnd = moment(
        `${d.DateString} ${SHIFT_END}`,
        "DD/MM/YYYY HH:mm"
      );

      let otMinutes = finalCheckout.diff(shiftEnd, "minutes");
      otMinutes = Math.max(0, Math.min(otMinutes, MAX_OT_MIN));

      bulkRecords.push({
        employeeId: employee._id,
        date: dateValue,
        year: new Date(dateValue).getFullYear(),
        month: getMonth(dateValue),
        isSunday: new Date(dateValue).getDay() === 0,

        status: true,
        isAbsent: false,
        isOverTime: otMinutes > 0,

        checkinTime: checkin.valueOf(),
        checkoutTime: finalCheckout.valueOf(),

        totalWorkingHours: {
          hours: Math.floor(totalMinutes / 60),
          min: totalMinutes,
        },

        overTimeHours: {
          hours: Math.floor(otMinutes / 60),
          min: otMinutes,
        },

        remark: actualCheckout.isAfter(cutoffCheckout)
          ? "OT capped at 19:30"
          : d.Remark || "",
      });
    }

    /* =====================================================
       BULK SAVE – SINGLE API CALL
    ====================================================== */

    if (bulkRecords.length > 0) {
      await bulkAttendanceConnect(bulkRecords);
    }

    await employeeListHandler();
  } catch (err) {
    console.error("Bulk attendance sync failed:", err);
  } finally {
    setIsLoading(false);
  }
};


if (isLoading) return <PageLoader/>

  return (
    <React.Fragment>
      {/* {isLoading && <PageLoader />} */}
       {/* {showBulkAttendanceUploader && <BulkUploader
          data={employeeData}
          variant={isCheckout ? "warning": "success"}
          showModal={showBulkAttendanceUploader}
          onClose={bulUploaderToggle}
          dateValue={dateValue}
          isCheckout={isCheckout}
          employeeListHandler={employeeListHandler}
        />} */}
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
              <Col md={4} style={{marginLeft: "10px"}}>
                <div className="gap-2 btnContainer">
              <Button variant="success" style={{width: `100%`}} onClick={fetchBiometricData}>
                Fetch  Data
              </Button>
            {/* <TimePicker dateValue={dateValue} callBack={({punchedTime}) => allPresentHandler({punchedTime})} >
              <Button variant="success" style={{width: `100%`}}>
                All Present
              </Button>
            </TimePicker> */}
            {/* <TimePicker dateValue={dateValue} callBack={({punchedTime}) => checkoutAll({punchedTime})} isDisabled={hasEmptyCheckinTime.length < 5}> */}
              {/* <Button onClick={()=> bulUploaderToggle(true)} variant="warning"  disabled={hasEmptyCheckinTime.length < 5}>
                Checkout All
              </Button> */}
            {/* </TimePicker> */}
            {/* <Button variant="success" onClick={() => bulUploaderToggle(false)}>
                Bulk Uploader
              </Button> */}
            </div>
              </Col>
            </Col>
          </Row>
        </div>
        <div className="pt-4 customTable" style={{minHeight: "1607px"}} >
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
    bulkAttendanceConnect: bulkAttendance,
    employeeDetailConnect: employeeDetail,
    checkoutAllEmployeeConnect: checkoutAllEmployee,
    fetchBiometricDataConnect: fetchBiometricData
}, dispatch);


export default connect(mapStateToProps, mapDispatchToProps)(Attendance);
