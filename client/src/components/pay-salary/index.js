import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PaySalary from "./component.jsx";
import { updateEmployeePayment, markAttendance, employeeDetail, updateEmployeeAdvance } from "../../store/employee/action.js";

const mapStateToProps = ({
    employee: {
        detail
    }
}) => ({detail});

const mapDispatchToProps = (dispatch) => bindActionCreators({
    markAttendanceConnect: markAttendance,
    employeeDetailConnect: employeeDetail,
    updateEmployeePaymentConnect: updateEmployeePayment,
    updateEmployeeAdvanceConnect: updateEmployeeAdvance
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PaySalary);
