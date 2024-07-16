import { Badge } from "react-bootstrap";
import priceFormatter from "../../helpers/price-formatter";
import { getExtraAdvancePayment, getTotalAbsent, getTotalSalary } from "../../helpers/employee-detal";
import { getMonth } from "../../helpers/today-date";

// This is the table constant/settings which needed to render table elements
export const tableConstants = ({dateValue}) => {

  const month = getMonth(dateValue);
  const year = new Date(dateValue).getFullYear();

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
      title: "Total Salary",
      render: (rowData) => {
        return <h5 className={"name"}>₹{priceFormatter(getTotalSalary(rowData, month, year))}</h5>;
      },
    },
    {
      title: "Salary Advance",
      render: (rowData) => (
        <h5>
          {`₹ ${priceFormatter(getExtraAdvancePayment(rowData, true) || 0)}`}
        </h5>
      )
    },
    {
      title: "Total Absent",
      render: (rowData) => (
        <Badge bg={"danger"}>
          {getTotalAbsent(rowData)}
        </Badge>
      )
    }
  ];
};
