import priceFormatter from "../../helpers/price-formatter";
import styles from "./style.module.css";

// This is the table constant/settings which needed to render table elements
export const tableConstants = ({editEmployee, deleteEmployeeHandler}) => {

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
      title: "Edit",
      render: (rowData) => (
        <span className={styles.icon} onClick={() => editEmployee(rowData)}>
            <ion-icon name="pencil" ></ion-icon>
        </span>
      ),
    },
    {
      title: "Delete",
      render: (rowData) => (
        <span className={`${styles.icon} ${styles.iconDelete}`}  onClick={() => deleteEmployeeHandler(rowData)}>
            <ion-icon name="trash-outline"></ion-icon>
        </span>
      ),
    },
  ];
};
