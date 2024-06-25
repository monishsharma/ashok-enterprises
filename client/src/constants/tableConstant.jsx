import { Badge, Button, Form } from "react-bootstrap";
import TimePicker from "../shared/component/time=picker";
import { formatTime } from "../helpers/today-date";

// This is the table constant/settings which needed to render table elements
export const tableConstants = ({handleAttendance, handleCheckoutAttendance, dateValue, markAbsent}) => {



  const getOverTimeValue = (rowData) => {
    const filterData = rowData.attendance.find(list => list.date === dateValue && list.isOverTime);
    return !!(filterData && filterData.isOverTime);
  }


  const renderAction = ({ rowData, btnText, key, variant }) => {

    let btnDisabled = variant === "warning";

    const callBack = ({punchedTime}) => {

      onClick({rowData, punchedTime})
    }

    const onClick = key === "checkinTime" ? handleAttendance : handleCheckoutAttendance;
    let component = (
      <TimePicker dateValue={dateValue} callBack={({punchedTime}) => callBack({punchedTime})} isDisabled={btnDisabled}>
      <Button
        size="sm"
        variant={variant}
        disabled={btnDisabled}
        // onClick={onClick({rowData, list, key})}
      >
        {btnText}
      </Button>
    </TimePicker>
    );



    if (rowData.attendance && rowData.attendance.length) {
      rowData.attendance.map((list, index) => {
        btnDisabled = variant === "warning" && !list.checkinTime;
        if (list.date === dateValue) {
          component = list[key] ? (
            <TimePicker dateValue={dateValue} callBack={({punchedTime}) => callBack({punchedTime, list, index})} isDisabled={btnDisabled}>
            <span>{formatTime(list[key])}</span>
            </TimePicker>
          ) : (
            <TimePicker dateValue={dateValue} callBack={({punchedTime}) => callBack({punchedTime, list, index})} isDisabled={btnDisabled}>
              <Button
                size="sm"
                variant={variant}
                disabled={btnDisabled}
                // onClick={onClick({rowData, list, key})}
              >
                {btnText}
              </Button>
            </TimePicker>

          );
        }
      });
    }
    return component;
  };

  const isAbsent = (rowData) => {
    const filterData =  rowData.attendance.find((item) => item.date === dateValue);
    if (filterData) return filterData.isAbsent && !filterData.checkinTim;
    return false;
  }

  const disabledStateCheckbox = (rowData) => {
    const filterData =  rowData && rowData.attendance.find((item) => item.date === dateValue);
    if (filterData) return filterData.checkinTime;
    return false;
  }

  return [
    {
      title: "ID",
      render: (rowData) => {
        return <span>{rowData.id}</span>;
      },
    },
    {
      title: "Name",
      render: (rowData) => {
        return <h5 className={"name"}>{rowData.name}</h5>;
      },
    },
    {
      title: "Absent",
      render: (rowData) => {
        return (<Form.Check // prettier-ignore
                type="checkbox"
                id="custom-switch"
                checked={isAbsent(rowData)}
                disabled={disabledStateCheckbox(rowData)}
                onChange={(e) => markAbsent({e, rowData})}
              />);
      },
    },
    {
      title: "Check In",
      render: (rowData) =>
        renderAction({
          rowData,
          btnText: "Check In",
          key: "checkinTime",
          variant: "success",
        }),
    },
    {
      title: "Check Out",
      render: (rowData) =>
        renderAction({
          rowData,
          btnText: "Check Out",
          key: "checkoutTime",
          variant: "warning",
        }),
    },
    {
      title: "OverTime",
      render: (rowData) => {
        const isOverTime = getOverTimeValue(rowData);
        return (
          <Badge bg={isOverTime ? "success" : "warning"}>
            {
              isOverTime ? "Yes" : "No"
            }
          </Badge>
        );
      },
    },
  ];
};
