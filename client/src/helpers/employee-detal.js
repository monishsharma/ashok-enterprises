import moment from "moment";

export const getTotalPresent = (rowData) => {
    const presentCount =  rowData && rowData.attendance.filter(list => list.status);
    return presentCount && presentCount.length ? presentCount.length : 0;
  };

export const getTotalAbsent = (rowData) => {
    const presentCount =  rowData && rowData.attendance.filter(list => !list.status);
    return presentCount && presentCount.length ? presentCount.length : 0;
  }

export const totalWorkingHours = (rowData, key, getTimeOnly = false) => {
  let time = 0;
  rowData && rowData.attendance.forEach(item => {
    if (item[key]) {
      time += item[key].min
    }
  });
  if (getTimeOnly) return time;

  const duration = moment.duration(time, "minutes")
  return `${parseInt(duration.asHours())}hr, ${parseInt(duration.minutes())} min`
}

export const getDailySalary = (rowData) => {
  if(rowData) {
    const costPerHour = parseInt(rowData.salaryPerDay) / 8;
    const TotalWorkInMin = parseInt(totalWorkingHours(rowData, "totalWorkingHours", true));
    const TotalWorkInHour = parseInt(TotalWorkInMin) / 60;
    return parseInt(costPerHour * TotalWorkInHour);
  }

}

export const getOverTimeSalary = (rowData) => {
  if(rowData) {
    const costPerHour = (parseInt(rowData.salaryPerDay) / 8) + 4;
    const TotalWorkInMin = totalWorkingHours(rowData, "overTimeHours", true);
    const TotalWorkInHour = parseInt(TotalWorkInMin) / 60;
    return parseInt(costPerHour * TotalWorkInHour);
  }

}

export const getSundayCost = (rowData) => {
  if(rowData) {
    const costPerSunday = 20;
    const totalSunday = rowData && rowData.attendance.filter(item => item.isSunday && item.status);
    return parseInt(costPerSunday * totalSunday.length);
  }

}

export const getTotalSalary = (rowData) => {
  return (
    parseInt(getDailySalary(rowData)) +
    parseInt(getOverTimeSalary(rowData)) +
    parseInt(getSundayCost(rowData))
  ) - 200
};

