export const toTimestamp = (dateStr, timeStr) => {
  if (!timeStr || timeStr === "--:--") return null;

  const [dd, mm, yyyy] = dateStr.split("/");
  const [hh, min] = timeStr.split(":");

  return new Date(`${yyyy}-${mm}-${dd} ${hh}:${min}`).getTime();
};

export const toMinutes = (hhmm) => {
  if (!hhmm || hhmm === "00:00") return 0;
  const [h, m] = hhmm.split(":");
  return (+h * 60) + (+m);
};

export const toISODate = (dateStr) => {
    const [dd, mm, yyyy] = dateStr.split("/");
    return `${yyyy}-${mm}-${dd}`;
  };