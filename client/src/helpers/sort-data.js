export const sortData = (data, key) => [...data].sort((a,b) => a[key].localeCompare(b[key]))