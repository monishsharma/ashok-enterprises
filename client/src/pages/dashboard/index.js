import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Dashboard from "./component.jsx";
import { employeeList, markAttendance } from "../../store/employee/action.js";

const mapStateToProps = ({
    employee: {
        data
    }
}) => ({data});

const mapDispatchToProps = (dispatch) => bindActionCreators({
    employeeListConnect: employeeList,
    markAttendanceConnect: markAttendance
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
