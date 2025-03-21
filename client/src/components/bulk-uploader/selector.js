
export const getEmployee = (data) => {
    const employee = [];
    data.filter(emp=> {
        if (emp.attendance && emp.attendance.length) {
            const detail = emp.attendance[0];
            if (!detail.status && !detail.isAbsent && !detail.checkinTime) {
                employee.push(emp);
            }
        } else {
            employee.push(emp);
        }
    })
    return employee;
}