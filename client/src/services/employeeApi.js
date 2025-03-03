
export default (api) => {

    const getEmployeeList = ({ date, month, year }) => {
        let queryParams = "";
        if (date) {
            queryParams = `?date=${date}`;
        } else if (month) {
            queryParams = `?month=${month}`;
            if (year) {
                queryParams += `&year=${year}`;
            }
        }
        return api.get(`/employee/list${queryParams}`);
    };

    const getEmployeeDetail = ({id, month, year}) => {
        let queryParams = "";
        if (month) {
            queryParams = `?month=${month}`;
            if (year) {
                queryParams += `&year=${year}`;
            }
        }
        return api.get(`/employee/detail/${id}${queryParams}`);
    }

    const getEmployeeAttendanceList = () => {
        return api.get("/attendance/list");
    };

    const postEmployee = (payload) => {
        return api.post("/employee/new", payload);
    };

    const editEmployee = (id, payload) => {
        return api.patch(`/employee/edit/${id}`, payload);
    };

    const deleteEmployee = (id) => {
        return api.delete(`/employee/delete/${id}`);
    };

    const markAttendance = (id, payload) => {
        return api.patch(`/employee/${id}`, payload)
    };

    const updateEmployeePayment = (queryParams, payload) => {
        return api.patch(`/employee/update/${queryParams.type}/${queryParams.id}/${queryParams.year}/${queryParams.month}`, payload)
    };

    const updateEmployeeAdvance = (id, payload) => {
        return api.patch(`/employee/extra/advance/${id}`, payload)
    };

    const checkoutAllEmployee = (payload) => {
        return api.patch(`/employee/checkout/all`, payload)
    };


    return {
        getEmployeeList,
        checkoutAllEmployee,
        updateEmployeeAdvance,
        postEmployee,
        editEmployee,
        deleteEmployee,
        markAttendance,
        getEmployeeDetail,
        updateEmployeePayment,
        getEmployeeAttendanceList
    };
};
