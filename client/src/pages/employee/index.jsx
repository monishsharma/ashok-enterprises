import React, { useState, useEffect } from "react";
import { Button, Container } from "react-bootstrap";
import Table from "../../shared/component/table";
import { tableConstants } from "./tableConstant";
import { deleteEmployee, employeeList } from "../../store/employee/action";
import PageLoader from "../../shared/component/page-loader";
import AddEmployee from "../../components/add-employee"


const Employee = () => {

  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState({});

  const employeeListHandler = () => {
    setIsLoading(true);
    employeeList()
      .then((res) => {
        setIsLoading(false);
        setEmployees(res);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!showModal)  employeeListHandler()
   }, [showModal]);

  const addEmployeeHandlerToggle = () => {
    setIsEditing(false);
    setSelectedEmployee({})
    setShowModal(!showModal);
  };

  const editEmployee = (rowData) => {
    setIsEditing(true);
    setSelectedEmployee({
      id: rowData._id,
      name: rowData.name,
      salary: rowData.salaryPerDay
    });
    setShowModal(true);
  }

  const deleteEmployeeHandler = (rowData) => {
    setIsLoading(true);
    deleteEmployee(rowData._id)
    .then(() => {
      employeeListHandler()
      setIsLoading(false);
    })
    .catch(() => {
      setIsLoading(false);
    })
  }

  if (isLoading) return <PageLoader />;

  return (
    <React.Fragment>
      <AddEmployee
        showModal={showModal}
        isEditing={isEditing}
        employeeId={selectedEmployee.id}
        selectedName={selectedEmployee.name}
        selectedSalary={selectedEmployee.salary}
        addEmployeeHandlerToggle={addEmployeeHandlerToggle}
      />
      <Container fluid>
        <div className={`mt-4`}>
          <h2 className="fw-bold">Employee List</h2>
        </div>
        <div className="pb-4 d-flex justify-content-end">
          <Button className="customBtn" onClick={addEmployeeHandlerToggle}>
            Add Employee
          </Button>
        </div>
        <div className="p-4">
          <Table hoverable={true} cols={tableConstants({editEmployee, deleteEmployeeHandler})} data={employees} />
        </div>
      </Container>
    </React.Fragment>
  );
};

Employee.propTypes = {};

export default Employee;
