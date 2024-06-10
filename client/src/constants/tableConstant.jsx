import { Badge, Button } from "react-bootstrap";
import styles from "./attendance.module.css";
import moment from "moment";
import { getTodayDate } from "../helpers/today-date";

// This is the table constant/settings which needed to render table elements
export const tableConstants = ({handleAttendance, handleCheckoutAttendance}) => {

  const {sanitizedDate} = getTodayDate();

  const formatTime = (time) => {
    return moment(parseInt(time)).format("hh:mm: a");
  };

  const getOverTimeValue = (rowData) => {
    if (rowData.attendance && rowData.attendance.length) {
      return rowData.attendance.every((list) => list.date === sanitizedDate && list.isOverTime)
    }
  }


  const renderAction = ({ rowData, btnText, key, variant }) => {
    const onClick = key === "checkinTime" ? handleAttendance : handleCheckoutAttendance;
    let component = (
      <Button
        size="sm"
        variant={variant}
        disabled={key==="checkoutTime"}
        onClick={onClick({rowData, key})}
      >
        {btnText}
      </Button>
    );
    if (rowData.attendance && rowData.attendance.length) {
      rowData.attendance.map((list) => {
        const disabledState = variant === "warning" && !list.checkinTime
        if (list.date === sanitizedDate) {
          component = list[key] ? (
            <span>{formatTime(list[key])}</span>
          ) : (
            <Button
              size="sm"
              variant={variant}
              disabled={disabledState}
              onClick={onClick({rowData, list, key})}
            >
              {btnText}
            </Button>
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
        return <h5 className={styles.name}>{rowData.name}</h5>;
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
