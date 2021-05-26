import validator from "validator";

export const validatePassword = (value) => {
  if (value.toLowerCase().includes("password")) {
    return {
      status: "invalid",
      error:
        "Password must not contain 'password' word, choose strong password!",
    };
  }
  const options = {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumber: 1,
    minSymbols: 1,
  };
  if (!validator.isStrongPassword(value, options)) {
    return {
      status: "invalid",
      error: "Choose strong password!",
    };
  }
  return {
    status: "valid",
  };
};
