// utils/generatePayUUrl.js
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

export const generatePayUUrl = ({ amount, productInfo, firstName, email, txnId }) => {
  const { PAYU_MERCHANT_KEY, PAYU_SALT, PAYU_BASE_URL } = process.env;

  const successUrl = `${process.env.SERVER_URL}/api/v1/payment/success`;
  const failureUrl = `${process.env.SERVER_URL}/api/v1/payment/failure`;

  const hashString = `${PAYU_MERCHANT_KEY}|${txnId}|${amount}|${productInfo}|${firstName}|${email}|||||||||||${PAYU_SALT}`;
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");

  const paymentUrl = `${PAYU_BASE_URL}/_payment?key=${PAYU_MERCHANT_KEY}&txnid=${txnId}&amount=${amount}&productinfo=${productInfo}&firstname=${firstName}&email=${email}&phone=&surl=${successUrl}&furl=${failureUrl}&hash=${hash}`;

  return paymentUrl;
};
