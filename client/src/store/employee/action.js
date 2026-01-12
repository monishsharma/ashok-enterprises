import { sortData } from "../../helpers/sort-data";
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



export const employeeList = ({date, sortByKey = "", qp = {}}) => (dispatch) => {
    return new Promise((resolve, reject) => {
        EmployeeService.getEmployeeList({date, month: qp.month, ...(qp.year && {year: qp.year})})
        .then((res) => {
            let data = [...res.data];
            if (sortByKey) {
                data = sortData(data, sortByKey)
            }
            dispatch(setData(data));
            resolve(data);
        })
        .catch((err) => {
            console.log(err)
            reject(err);
        })
    })
}

export const employeeDetail = ({id, month, year}) => (dispatch) => {
    return new Promise((resolve, reject) => {
        EmployeeService.getEmployeeDetail({id, month, year})
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
export const bulkAttendance = (id, payload) => () => {
    return new Promise((resolve, reject) => {
        EmployeeService.bulkAttendance(id, payload)
        .then((res) => {
            resolve(res.data);
        })
        .catch((err) => {
            reject(err);
        })
    })
}



export const updateEmployeePayment = (queryParams, payload) => () => {
    return new Promise((resolve, reject) => {
        EmployeeService.updateEmployeePayment(queryParams, payload)
        .then((res) => {
            resolve(res.data);
        })
        .catch((err) => {
            reject(err);
        })
    })
}

export const updateEmployeeAdvance = (id, payload) => () => {
    return new Promise((resolve, reject) => {
        EmployeeService.updateEmployeeAdvance(id, payload)
        .then((res) => {
            resolve(res.data);
        })
        .catch((err) => {
            reject(err);
        })
    })
}

export const checkoutAllEmployee = (id, payload) => () => {
    return new Promise((resolve, reject) => {
        EmployeeService.checkoutAllEmployee(id, payload)
        .then((res) => {
            resolve(res.data);
        })
        .catch((err) => {
            reject(err);
        })
    })
}

export const fetchBiometricData = (payload) => () => {
    return new Promise((resolve, reject) => {
        EmployeeService.fetchBiometricData(payload)
        .then((res) => {
            resolve(res.data);
        })
        .catch((err) => {
            reject(err);
        })
    })
}

export const getSalarySlip = ({month,year}) => () => {
    return new Promise((resolve, reject) => {
        EmployeeService.getSalarySlip({month,year})
        .then((res) => {
            resolve(res);
        })
        .catch((err) => {
            reject(err);
        })
    })
}