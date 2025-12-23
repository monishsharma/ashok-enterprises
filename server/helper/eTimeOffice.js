import axios from "axios";

const ETIME_URL =
  "https://api.etimeoffice.com/api/DownloadInOutPunchData";

export const fetchEtimeAttendance = async ({ fromDate, toDate }) => {
  const response = await axios.get(ETIME_URL, {
    params: {
      Empcode: "ALL",
      FromDate: fromDate,
      ToDate: toDate,
    },
    auth: {
      username: "ASHOKENTP:ASHOKENTPA:Ashok@123:true",
      password: "" // password is EMPTY
    },
  });

  return response.data.InOutPunchData || [];
};
