export const sortData = (data) => [...data].sort((a,b) => a.name.localeCompare(b.name))