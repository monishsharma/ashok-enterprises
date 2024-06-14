import { combineReducers } from "redux";
import EmployeesReducer from "./employee/reducer";
const rootReducer = combineReducers({
    employee: EmployeesReducer
});


export default rootReducer;
