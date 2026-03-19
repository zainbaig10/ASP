import logger from "./logger.js";

export const handleSuccessResponse = (
  res,
  data = null,
  msg = "Success",
  status = 200
) => {
  logger.info(msg);

  return res.status(status).json({
    success: true,
    msg,
    data,
  });
};

export const handleErrorResponse = (
  res,
  error,
  msg = "Internal Server Error",
  status = 500
) => {
  logger.error(`${msg} - ${error.message}`);

  return res.status(status).json({
    success: false,
    msg,
    error: error.message,
  });
};

export const handleNotFound = (res, model, id) => {
  const msg = `${model} not found for id ${id}`;
  logger.warn(msg);

  return res.status(404).json({
    success: false,
    msg,
  });
};

export const handleAlreadyExists = (res, model, field) => {
  const msg = `${model} already exists for ${field}`;
  logger.warn(msg);

  return res.status(409).json({
    success: false,
    msg,
  });
};

export const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page ?? "1", 10), 1);
  const pageSize = Math.min(
    Math.max(parseInt(query.pageSize ?? "10", 10), 1),
    100
  );

  const skip = (page - 1) * pageSize;

  return { page, pageSize, skip };
};
