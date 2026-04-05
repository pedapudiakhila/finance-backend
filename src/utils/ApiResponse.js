const ok = (res, data, message = "Success") =>
  res.status(200).json({ success: true, message, data });

const created = (res, data, message = "Created") =>
  res.status(201).json({ success: true, message, data });

const fail = (res, message, statusCode = 400, errors = []) =>
  res.status(statusCode).json({ success: false, message, errors });

module.exports = { ok, created, fail };