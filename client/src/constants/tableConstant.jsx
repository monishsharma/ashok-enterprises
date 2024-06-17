import { Badge, Button } from "react-bootstrap";
import TimePicker from "../shared/component/time=picker";
import { formatTime } from "../helpers/today-date";

// This is the table constant/settings which needed to render table elements
export const tableConstants = ({handleAttendance, handleCheckoutAttendance, dateValue}) => {



  const getOverTimeValue = (rowData) => {
    const filterData = rowData.attendance.find(list => list.date === dateValue && list.isOverTime);
    return !!(filterData && filterData.isOverTime);
    // if (rowData.attendance && rowData.attendance.length) {
    //   return rowData.attendance.every((list) => list.date === sanitizedDate && list.isOverTime)
    // }
  }


  const renderAction = ({ rowData, btnText, key, variant }) => {
    const onClick = key === "checkinTime" ? handleAttendance : handleCheckoutAttendance;
    let component = (
      <Button
        size="sm"
        variant={variant}
        disabled={key==="checkoutTime"}
        // onClick={onClick({rowData, key})}
      >
        {btnText}
      </Button>
    );

    const callBack = ({punchedTime, list, index}) => {
      const selectedTime = new Date(punchedTime).getHours();
      if (list.checkinTime) {
        const storedPunchedInTime = new Date(parseInt(list.checkinTime)).getHours();
        if (parseInt(storedPunchedInTime) > parseInt(selectedTime)){
          alert("checkout time cannout be less than checkin time");
          return;
        }
      }
      onClick({rowData, punchedTime,index, list})
    }

    if (rowData.attendance && rowData.attendance.length) {
      rowData.attendance.map((list, index) => {
        const disabledState = variant === "warning" && !list.checkinTime
        if (list.date === dateValue) {
          component = list[key] ? (
            <span>{formatTime(list[key])}</span>
          ) : (
            <TimePicker dateValue={dateValue} callBack={({punchedTime}) => callBack({punchedTime, list, index})} isDisabled={disabledState}>
              <Button
                size="sm"
                variant={variant}
                disabled={disabledState}
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
