import { EmployeeService } from "../../services";
import  Types from './actionTypes';


const setData = (data) => ({
    type: Types.SET_EMPLOYEE_DATA,
    data
});


const setEmployeeDetail = (data) => ({
    type: Types.SET_EMPLOYEE_DETAIL,
    data
});



export const employeeList = (query) => (dispatch) => {
    return new Promise((resolve, reject) => {
        EmployeeService.getEmployeeList(query)
        .then((res) => {
            dispatch(setData(res.data));
            resolve(res.data);
        })
        .catch((err) => {
            reject(err);
        })
    })
}

export const employeeDetail = (id) => (dispatch) => {
    return new Promise((resolve, reject) => {
        EmployeeService.getEmployeeDetail(id)
        .then((res) => {
            dispatch(setEmployeeDetail(res.data));
            resolve(res.data);
        })
        .catch((err) => {
            reject(err);
        })
    })
}

export const addEmployee = (payload) => () => {
    return new Promise((resolve, reject) => {
        EmployeeService.postEmployee(payload)
        .then((res) => {
            resolve(res.data);
        })
        .catch((err) => {
            reject(err);
        })
    })
}

export const editEmployee = (id, payload) => () => {
    return new Promise((resolve, reject) => {
        EmployeeService.editEmployee(id, payload)
        .then((res) => {
            resolve(res.data);
        })
        .catch((err) => {
            reject(err);
        })
    })
}

export const deleteEmployee = (id) => () => {
    return new Promise((resolve, reject) => {
        EmployeeService.deleteEmployee(id)
        .then((res) => {
            resolve(res.data);
        })
        .catch((err) => {
            reject(err);
        })
    })
}


export const markAttendance = (id, payload) => () => {
    return new Promise((resolve, reject) => {
        EmployeeService.markAttendance(id, payload)
        .then((res) => {
            resolve(res.data);
        })
        .catch((err) => {
            reject(err);
        })
    })
}