import moment from "moment";

export const formatMinutes = (minutes = 0) => {
  const d = moment.duration(minutes, "minutes");
  return {
    hours: Math.floor(d.asHours()),
    minutes: d.minutes(),
    formatted: `${String(Math.floor(d.asHours())).padStart(2, "0")}:${String(d.minutes()).padStart(2, "0")}`,
  };
};