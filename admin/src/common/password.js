import bcrypt from "bcrypt";

/**
 * Encrypt the Password using bcrypt algo
 */
const encryptPassword = (Password, salt) => {
  return bcrypt.hashSync(Password, salt);
};

/**
 * Compare the Password using bcrypt algo
 */
const comparePassword = (Password, hash) => {
  return bcrypt.compareSync(Password, hash);
};

/**
 * Generates Salt for the Password
 */
const generateSalt = (length = 6) => {
  return bcrypt.genSaltSync(length);
};

export default { encryptPassword, comparePassword, generateSalt };
