import { calculateTime } from "../../helpers/calculate-time";


export const filterEmployee = ({data, date}) => {
    return data[0].attendance.find((item) => item.date === date);
};

const checkTime = (time) => {
    const logOffTime = new Date().setHours(17, 30, 0);
    return new Date(time).getHours() > new Date(logOffTime).getHours() && new Date(time).getMinutes() >= new Date(logOffTime).getMinutes();
}

export const totalHoursWork = (checkinTime, punchOutTime) => {
    const logOffTime = new Date().setHours(17, 30, 0);
    const checkCheckoutTime = checkTime(punchOutTime) ? logOffTime : punchOutTime ;
    const {differenceHrs, differenceMin} = calculateTime(parseInt(checkinTime), parseInt(checkCheckoutTime))
    return {differenceHrs, differenceMin: differenceMin - 30};
}

export const totalOverTime = (checkOutTime) => {
    const logOffTimeForOverTime = new Date().setHours(17, 29, 0);
    const {differenceHrs, differenceMin} = calculateTime(parseInt(logOffTimeForOverTime), parseInt(checkOutTime))
    return {overTimeHours: differenceHrs, overTimeMin: differenceMin};
}