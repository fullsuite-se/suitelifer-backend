import { verifyRecaptchaToken } from "../utils/verifyRecaptchaToken.js";

export const recaptcha = async (req, res, next) => {
  const { recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({ message: "reCAPTCHA token is required." });
  }

  const recaptcha = await verifyRecaptchaToken(recaptchaToken);

  if (!recaptcha.isSuccess) {
    return res.status(400).json({ message: recaptcha.message });
  }

  if (!recaptcha.isHuman) {
    return res.status(403).json({ message: recaptcha.message });
  }

  next();
};
