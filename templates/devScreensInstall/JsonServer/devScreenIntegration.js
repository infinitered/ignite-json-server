module.exports = (req, res, next) => {
  if (req.url === '/users?q=GantMan' || req.url === '/users?q=gantman') {
    req.url = '/gantman'
  }
  if (req.url === '/users?q=skellock') {
    req.url = '/skellock'
  }
  next()
}
