import moment from "moment";
import { formatTime } from "../../helpers/today-date";
import { Badge } from "react-bootstrap";

// This is the table constant/settings which needed to render table elements
export const tableConstants = () => {


    const renderDate = (rowData) => {
        return moment(rowData.date).format("DD MMM")
    }

    const safeCheck = (rowData, key) => {
        if (rowData && rowData[key]) {
            const duration = moment.duration(rowData[key].min, "minutes")
             return `${duration.hours()}h ${duration.minutes()}min`
        }
        return "0h 0min"
    }

    return [

        {
            title: "ID",
            render: (rowData) => {
            return <span>{rowData.id}</span>;
            },
        },

        {
            title: "Date",
            render: (rowData)=> {
                return renderDate(rowData)
            }
        },
        {
            title: "Status",
            render: (rowData)=> {
                return (
                    <Badge bg={rowData.status ? "success" : "danger"}>
                        {
                            rowData.status ? "Present" : "Absent"
                        }
                    </Badge>
                )
            }
        },
        {
            title: "Sunday",
            render: (rowData)=> {
                return (
                    <Badge bg={rowData.isSunday ? "success" : "warning"}>
                        {
                            rowData.isSunday ? "Yes" : "No"
                        }
                    </Badge>
                )
            }
        },
        {
            title: "Checkin",
            render: (rowData)=> {
                return formatTime(rowData.checkinTime)
            }
        },

        {
            title: "Checkout",
            render: (rowData)=> {
                return formatTime(rowData.checkoutTime) || 'N/A'
            }
        },
        {
            title: "Working Hours",
            render: (rowData)=> {
                return safeCheck(rowData, "totalWorkingHours")
            }
        },
        {
            title: "Overtime Hours",
            render: (rowData)=> {
                return safeCheck(rowData, "overTimeHours")
            }
        }

    ];
  };