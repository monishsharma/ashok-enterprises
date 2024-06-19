import { Badge } from "react-bootstrap";
import priceFormatter from "../../helpers/price-formatter";
import { getTotalAbsent, getTotalPresentCount } from "../../helpers/employee-detal";

// This is the table constant/settings which needed to render table elements
export const tableConstants = () => {

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
      title: "Salary Per Day",
      render: (rowData) => {
        return <h5 className={"name"}>₹{priceFormatter(rowData.salaryPerDay)}</h5>;
      },
    },
    {
      title: "Total Present",
      render: (rowData) => (
        <Badge bg={"success"}>
          {getTotalPresentCount(rowData)}
        </Badge>
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
