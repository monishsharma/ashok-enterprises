import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types"
import { Button } from "react-bootstrap";
import Table from "../../shared/component/table";
import { tableConstants } from "./tableConstant";
import { deleteEmployee, employeeList } from "../../store/employee/action";
import PageLoader from "../../shared/component/page-loader";
import AddEmployee from "../../components/add-employee"
import styles from "./style.module.css";
import { useNavigate } from 'react-router-dom';


const Employee = ({
  employeeData,
  employeeListConnect,
  deleteEmployeeConnect
}) => {

  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState({});

  const employeeListHandler = () => {
    setIsLoading(true);
    employeeListConnect({sortByKey: "name"})
      .then(() => {
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    employeeListHandler()
   }, []);

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
      salary: rowData.salaryPerDay,
      esi: rowData.esi || false
    });
    setShowModal(true);
  }

  const deleteEmployeeHandler = (rowData) => {
    setIsLoading(true);
    deleteEmployeeConnect(rowData._id)
    .then(async() => {
      employeeListHandler()
      setIsLoading(false);
    })
    .catch(() => {
      setIsLoading(false);
    })
  }

  const onClickTable = (list) => {
    const {_id} = list;
    navigate(`/employee/detail/${_id}`)
  }

  if (isLoading) return <PageLoader />;

  return (
    <React.Fragment>
      <AddEmployee
        showModal={showModal}
        isEditing={isEditing}
        selectedEsi={selectedEmployee.esi}
        employeeId={selectedEmployee.id}
        selectedName={selectedEmployee.name}
        selectedSalary={selectedEmployee.salary}
        employeeListHandler={employeeListHandler}
        addEmployeeHandlerToggle={addEmployeeHandlerToggle}
      />
        <div className={`mt-4`}>
          <h2 className="fw-bold">Employee List</h2>
        </div>
        <div className={`mt-4 d-flex ${styles.end}`}>
          <Button className="customBtn" onClick={addEmployeeHandlerToggle}>
            Add Employee
          </Button>
        </div>
        <div className="pt-4">
          <Table canSearch={false} isClickable={false} onClick={onClickTable} hoverable={true} cols={tableConstants({editEmployee, deleteEmployeeHandler})} data={employeeData} />
        </div>
    </React.Fragment>
  );
};

Employee.propTypes = {
  employeeData: PropTypes.array,
  deleteEmployeeConnect: PropTypes.func,
  employeeListConnect: PropTypes.func
}

const mapStateToProps = ({
  employee: {
    data: employeeData
  }
}) => ({
  employeeData
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
    employeeListConnect: employeeList,
    deleteEmployeeConnect: deleteEmployee
}, dispatch);


export default connect(mapStateToProps, mapDispatchToProps)(Employee);
