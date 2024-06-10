
export default (api) => {

    const getEmployeeList = () => {
        return api.get("/employee/list");
    };

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



    return {
        getEmployeeList,
        postEmployee,
        editEmployee,
        deleteEmployee,
        markAttendance,
        getEmployeeAttendanceList
    };
};
