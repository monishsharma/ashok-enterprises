import moment from "moment";

export const getTodayDate = (providedDate = "") => {
  const todayDate = providedDate ? new Date(providedDate) :  new Date();
  const month =
    todayDate.getMonth() + 1 > 9
      ? parseInt(todayDate.getMonth()) + 1
      : `0${parseInt(todayDate.getMonth()) + 1}`;
  const date = todayDate.getDate() > 9 ? todayDate.getDate() : `0${todayDate.getDate()}`;
  const todaysCompleteDate = `${todayDate.getFullYear()}-${month}-${date}`;

  return { sanitizedDate: todaysCompleteDate, date: todayDate };
};

export   const month = [
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

export const getMonth = (customDate) => {
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

  const d = customDate ? new Date(customDate) : new Date();
  let monthName = month[d.getMonth()];
  return monthName;
};

export const  formatTime = (time) => {
  const formattedTime = moment(parseInt(time)).format("hh:mm: a");
  return time ? formattedTime : 'N/A';
};