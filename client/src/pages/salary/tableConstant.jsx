import { Badge } from "react-bootstrap";
import priceFormatter from "../../helpers/price-formatter";

// This is the table constant/settings which needed to render table elements
export const tableConstants = () => {

  const getTotalPresent = (rowData) => {
    const presentCount =  rowData.attendance.filter(list => list.status);
    return presentCount && presentCount.length ? presentCount.length : 0;
  };

  const getTotalAbsent = (rowData) => {
    const presentCount =  rowData.attendance.filter(list => !list.status);
    return presentCount && presentCount.length ? presentCount.length : 0;
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
      title: "Salary Per Day",
      render: (rowData) => {
        return <h5 className={"name"}>₹{priceFormatter(rowData.salaryPerDay)}</h5>;
      },
    },
    {
      title: "Total Present",
      render: (rowData) => (
        <Badge bg={"success"}>
          {getTotalPresent(rowData)}
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
