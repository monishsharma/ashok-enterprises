export const getEmployee = (data,isCheckout) => {
    const employee = [];
    data.filter(emp=> {
        if (emp.attendance && emp.attendance.length) {
            const detail = emp.attendance[0];
            if (isCheckout) {
                if (detail.checkinTime && !detail.checkoutTime) {
                    employee.push(emp);
                }
            } else {
                if (!detail.status && !detail.isAbsent && !detail.checkinTime) {
                    employee.push(emp);
                }
            }

        } else if (!isCheckout) {
            employee.push(emp);
        }
    })
    return employee;
}