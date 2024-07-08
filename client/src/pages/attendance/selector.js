import { calculateTime } from "../../helpers/calculate-time";


export const filterEmployee = ({data, date}) => {
    return data[0].attendance.find((item) => item.date === date);
};

const checkTime = (time) => {
    const logOffTime = new Date(time).setHours(17, 30, 0);
    return new Date(time).getTime() >= new Date(logOffTime).getTime();
}

export const totalHoursWork = (checkinTime, punchOutTime, dateValue) => {
    const logOffTime = new Date(dateValue).setHours(17, 30, 0);
    const lunchTimingEnds = new Date(dateValue).setHours(13, 30, 0);
    const sundayCheckoutTime = new Date(dateValue).setHours(14, 0, 0);
    const checkCheckoutTime = checkTime(punchOutTime) ? logOffTime : punchOutTime ;
    const {differenceHrs, differenceMin} = calculateTime(parseInt(checkinTime), parseInt(checkCheckoutTime));
    const timeDiff =  (checkCheckoutTime > lunchTimingEnds && new Date(dateValue).getDay() !== 0) ? differenceMin - 30 : (checkCheckoutTime > sundayCheckoutTime ? differenceMin - 30 : differenceMin);
    return {differenceHrs, differenceMin: timeDiff};
}

export const totalOverTime = (checkOutTime, dateValue) => {
    const logOffTimeForOverTime = new Date(dateValue).setHours(17, 30, 0);
    const {differenceHrs, differenceMin} = calculateTime(parseInt(logOffTimeForOverTime), parseInt(checkOutTime))
    return {overTimeHours: differenceHrs, overTimeMin: differenceMin};
}