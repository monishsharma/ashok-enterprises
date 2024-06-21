import moment from "moment";
import { formatTime } from "../../helpers/today-date";
import { Badge } from "react-bootstrap";

// This is the table constant/settings which needed to render table elements
export const tableConstants = ({onClick}) => {


    const renderDate = (rowData) => {
        return moment(rowData.date).format("ddd, DD MMM")
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
            title: "S.No",
            render: (rowData) => {
            return <span>{rowData.id}</span>;
            },
        },
        {
            title: "Deduct",
            render: (rowData)=> {
                return (
                    rowData.status &&
                        <div className="pointer-cursor" onClick={() => onClick(rowData)}>
                           {
                            rowData.deductionTime? <p className="text-danger">{rowData.deductionTime}</p> :  <Badge bg="danger" size="sm">-</Badge>
                           }
                        </div>

                )
            }
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
