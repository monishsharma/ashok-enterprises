import { calculateTime } from "../../helpers/calculate-time";


export const filterEmployee = ({data, date}) => {
    return data[0].attendance.find((item) => item.date === date);
}

export const totalHoursWork = (checkinTime, punchOutTime) => {
    const logOffTime = new Date().setHours(17, 30, 0);
    const {differenceHrs, differenceMin} = calculateTime(parseInt(checkinTime), parseInt(punchOutTime))
    return {differenceHrs, differenceMin: differenceMin - 30};
}

export const totalOverTime = (checkOutTime) => {
    const logOffTimeForOverTime = new Date().setHours(17, 29, 0);
    const {differenceHrs, differenceMin} = calculateTime(parseInt(logOffTimeForOverTime), parseInt(checkOutTime))
    return {overTimeHours: differenceHrs, overTimeMin: differenceMin};
}