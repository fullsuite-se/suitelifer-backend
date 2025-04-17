import axios from "axios";

export const verifyRecaptchaToken = async (recaptchaToken) => {
  try {
    const response = await axios.post(
      `${process.env.GOOGLE_RECAPTCHA_API_URL}`,
      new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: recaptchaToken,
      })
    );

    const data = response.data;

    if (!data.success) {
      return {
        message: "reCAPTCHA verification failed. Please refresh and try again.",
        isSuccess: false,
        isHuman: false,
      };
    }

    if (data.score < 0.5) {
      return {
        message:
          "Suspicious activity detected. If you're human, please try again.",
        isSuccess: false,
        isHuman: false,
      };
    }

    return {
      message: "Verification successful! You are good to go.",
      isSuccess: true,
      isHuman: true,
    };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return {
      message:
        "An error occurred while verifying reCAPTCHA. Please try again later.",
      isSuccess: false,
      isHuman: false,
      error: true,
    };
  }
};
