import moment from "moment";

export const addSalaryOfSunday = (rowData, month, year) => {
  const sundayCount = rowData && rowData.attendance && rowData.attendance.filter(item =>
  (item.month === month && parseInt(item.year) === parseInt(year) && item.isSunday && item.status ));

  return sundayCount && sundayCount.length || 0;
}

export const salaryPerDay = (rowData, perDay) => {
  const costPerHour = parseInt(perDay) / 8;
  if (rowData.totalWorkingHours) {
    const TotalWorkInHour = parseInt(rowData.totalWorkingHours.min) / 60;
    return Math.round(TotalWorkInHour * costPerHour)
  }
  return 0;
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

export const getTotalPresentCount = (rowData) => {
  const presentCount =  rowData && rowData.attendance.filter(list => list.status);
  return presentCount && presentCount.length ? presentCount.length : 0;
};

export const getTotalPresent = (rowData) => {
    let presentMin =  totalWorkingHours(rowData, "totalWorkingHours", true);

    const duration = moment.duration(presentMin, "minutes")
    const durationHours = duration.asHours();
    const hoursPerDay = 8;
    const decimalDays = durationHours / hoursPerDay;
    const days = Math.floor(decimalDays); // Get the whole number part (days)
    const hoursDecimal = (decimalDays - days) * 24; // Convert remaining decimal to hours
    const hours = Math.floor(hoursDecimal); // Get whole number part of hours
    const minutes = Math.round((hoursDecimal - hours) * 60); // Convert remaining decimal to minutes and round

    // Construct the output string
    let output = `${days} days`;
    if (hours > 0 || minutes > 0) {
        output += `, ${hours} hours`;
    }
    if (minutes > 0) {
        output += `, ${minutes} minutes`;
    }

    return output
  };

export const getTotalAbsent = (rowData) => {
    const presentCount =  rowData && rowData.attendance.filter(list => !list.status);
    return presentCount && presentCount.length ? presentCount.length : 0;
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

export const totalSalary = ({detail, month, year}) => {
  let total = 0;
  detail.map(emp => {
      total += getTotalSalary(emp, month, year);
  });
  return total;
}

export const totalAdvance = ({detail, month, year}) => {
  let total = 0;
  detail.map(emp => {
      total += getTotalAdvance(emp, month, year);
  });
  return total;
}


export const getAdvancePAymentFromSalary = (rowData, month, year) => {
  return rowData && rowData.advance && rowData.advance[year] && rowData.advance[year][month] && parseInt(rowData.advance[year][month].advance) || 0;
}

export const getExtraAdvancePayment = (rowData, needObj = false) => {
  const detail = rowData && rowData.extraAdvance && rowData.extraAdvance.total;
  if (needObj) {
    return detail;
  }
  return detail || 0;
}

export const getTotalAdvance = (rowData, month, year) => {
  return (rowData && getAdvancePAymentFromSalary(rowData, month, year) || 0)
};

export const getTotalSalary = (rowData, month, year) => {
  return (rowData && (
    (parseInt(getDailySalary(rowData)) +
    parseInt(getOverTimeSalary(rowData)) +
    parseInt(getSundayCost(rowData)))
  ) - 200) - getAdvancePAymentFromSalary(rowData, month, year) || 0
};

