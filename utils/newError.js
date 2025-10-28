const newError = (message, details, status) => {
  const error = new Error(message);
  error.details = details;
  error.status = status;
  return error;
};

export default newError;
