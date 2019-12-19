
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const dateToMysqlDateTime = (date) => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

module.exports = {sleep:sleep,dateToMysqlDateTime:dateToMysqlDateTime};
