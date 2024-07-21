import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Salary from "./component.jsx";
import { employeeList, updateEmployeePayment } from "../../store/employee/action.js";

const mapStateToProps = ({
    employee: {
        data: employeeData
    }
}) => ({employeeData});

const mapDispatchToProps = (dispatch) => bindActionCreators({
    employeeListConnect: employeeList,
    updateEmployeePaymentConnect: updateEmployeePayment
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Salary);
