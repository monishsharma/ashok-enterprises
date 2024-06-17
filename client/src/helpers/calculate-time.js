export const calculateTime =(time1, time2) => {
    const date1 = new Date(time1).getTime();
    const date2 = new Date(time2).getTime();

    const differenceMs = Math.abs(date2 - date1);

    const differenceMin = differenceMs / (1000 * 60);

    const differenceHrs = differenceMs / (1000 * 60 * 60);

    return {differenceMin, differenceHrs};
}