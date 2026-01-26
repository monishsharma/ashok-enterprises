export const addSalaryOfSunday = (rowData, month, year) => {
  const sundayCount =
    rowData &&
    rowData.attendance &&
    rowData.attendance.filter(
      (item) =>
        item.month === month &&
        Number(item.year) === Number(year) &&
        item.isSunday &&
        item.status,
    );

  return (sundayCount && sundayCount.length) || 0;
};

export const salaryPerDay = (rowData, perDay) => {
  const costPerHour = Number(perDay) / 8;
  if (rowData.totalWorkingHours) {
    const TotalWorkInHour = Number(rowData.totalWorkingHours.min) / 60;
    return Number(TotalWorkInHour * costPerHour);
  }
  return 0;
};

export const overTimePerDay = (rowData, perDay) => {
  if (rowData) {
    const costPerHour = Number(perDay) / 8 + 4;
    if (rowData.overTimeHours) {
      const TotalWorkInHour = Number(rowData.overTimeHours.min) / 60;
      return Number(TotalWorkInHour * costPerHour);
    }
  }
};

export const totalWorkingHours = (rowData, key) => {
  let time = 0;
  rowData &&
    rowData.attendance.forEach((item) => {
      if (item[key]) {
        time += item[key].min;
      }
    });
  return time;
};

export const getTotalPresentCount = (rowData) => {
  const presentCount =
    rowData && rowData.attendance.filter((list) => list.status);
  return presentCount && presentCount.length ? presentCount.length : 0;
};

export const getTotalPresent = (rowData) => {
  let presentMin = totalWorkingHours(rowData, "totalWorkingHours");

  const hours = presentMin / 60;

  // Calculate the number of days (8 hours per day) and remaining hours
  const days = Math.floor(hours / 8);
  const remainingHours = hours % 8;

  // Construct the output string
  let output = `${days} days`;
  if (remainingHours > 0) {
    output += `, ${remainingHours.toFixed(1)} hours`;
  }

  return output;
};

export const getTotalAbsent = (rowData) => {
  const presentCount =
    rowData && rowData.attendance.filter((list) => !list.status);
  return presentCount && presentCount.length ? presentCount.length : 0;
};

export const getDailySalary = (rowData) => {
  if (rowData) {
    const costPerHour = Number(rowData.salaryPerDay) / 8;
    const TotalWorkInMin = Number(
      totalWorkingHours(rowData, "totalWorkingHours"),
    );
    const TotalWorkInHour = Number(TotalWorkInMin) / 60;
    return Number(costPerHour * TotalWorkInHour);
  }
};

export const getOverTimeSalary = (rowData) => {
  if (rowData) {
    const costPerHour = Number(rowData.salaryPerDay) / 8 + 4;
    const TotalWorkInMin = totalWorkingHours(rowData, "overTimeHours");
    const TotalWorkInHour = Number(TotalWorkInMin) / 60;
    return Number(costPerHour * TotalWorkInHour);
  }
};

export const getSundayCost = (rowData, count = false) => {
  if (rowData) {
    const costPerSunday = 20;
    const totalSunday =
      rowData &&
      rowData.attendance.filter((item) => item.isSunday && item.status);
    if (count) {
      return {
        count: totalSunday.length,
        amount: costPerSunday * totalSunday.length,
      };
    }
    return Number(costPerSunday * totalSunday.length);
  }
};

export const totalSalary = ({ detail, month, year }) => {
  let total = 0;
  detail.map((emp) => {
    total += getTotalSalary(emp, month, year);
  });
  return total;
};

export const totalAdvance = ({ detail, month, year }) => {
  let total = 0;
  detail.map((emp) => {
    total += getTotalAdvance(emp, month, year);
  });
  return total;
};

export const getAdvancePAymentFromSalary = (rowData, month, year) => {
  return (
    (rowData &&
      rowData.advance &&
      rowData.advance[year] &&
      rowData.advance[year][month] &&
      Number(rowData.advance[year][month].advance)) ||
    0
  );
};

export const getExtraAdvancePayment = (rowData, needObj = false) => {
  const detail = rowData && rowData.extraAdvance && rowData.extraAdvance.total;
  if (needObj) {
    return detail;
  }
  return detail || 0;
};

export const getTotalAdvance = (rowData, month, year) => {
  return (rowData && getAdvancePAymentFromSalary(rowData, month, year)) || 0;
};

export const deductESI = (rowData) => {
  return rowData && rowData.esi ? 200 : 0;
};

export const addSundayCost = (rowData) => {
  return rowData.isSunday && rowData.status ? 20 : 0;
};

export const getTotalSalary = (rowData, month, year) => {
  return (
    (rowData &&
      Math.round(getDailySalary(rowData)) +
        Math.round(getOverTimeSalary(rowData)) +
        Math.round(getSundayCost(rowData)) -
        deductESI(rowData)) -
      getAdvancePAymentFromSalary(rowData, month, year) || 0
  );
};
