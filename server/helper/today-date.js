export const getTodayDate = () => {
    const todayDate = new Date();
    const month = todayDate.getMonth() > 9 ? parseInt(todayDate.getMonth()) + 1 : `0${parseInt(todayDate.getMonth())+1}`
    const date = todayDate.getDate() > 9 ? todayDate.getDate() : `0${todayDate.getDate()}`;
    const todaysCompleteDate = `${todayDate.getFullYear()}-${month}-${date}`;

    return {sanitizedDate: todaysCompleteDate, date: todayDate};
}