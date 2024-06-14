export const getTodayDate = (providedDate = "") => {
  const todayDate = providedDate ? new Date(providedDate) :  new Date();
  const month =
    todayDate.getMonth() > 9
      ? parseInt(todayDate.getMonth()) + 1
      : `0${parseInt(todayDate.getMonth()) + 1}`;
  const date =
    todayDate.getDate() > 9 ? todayDate.getDate() : `0${todayDate.getDate()}`;
  const todaysCompleteDate = `${todayDate.getFullYear()}-${month}-${date}`;

  return { sanitizedDate: todaysCompleteDate, date: todayDate };
};

export const getMonth = () => {
  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const d = new Date();
  let monthName = month[d.getMonth()];
  return monthName;
};
