import crypto from 'crypto';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

export const generatePayUUrl = async ({ amount, productInfo, firstName, email, phone, txnId }) => {
  const { PAYU_MERCHANT_KEY, PAYU_SALT, PAYU_BASE_URL } = process.env;

  const successUrl = `${process.env.SERVER_URL}/api/v1/payment/success`;
  const failureUrl = `${process.env.SERVER_URL}/api/v1/payment/failure`;

  const hashString = `${PAYU_MERCHANT_KEY}|${txnId}|${amount}|${productInfo}|${firstName}|${email}|||||||||||${PAYU_SALT}`;
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");

  const formData = new URLSearchParams({
    key: PAYU_MERCHANT_KEY,
    txnid: txnId,
    amount,
    productinfo: productInfo,
    firstname: firstName,
    email,
    phone,
    surl: successUrl,
    furl: failureUrl,
    hash,
  });

  try {
    const response = await axios.post(`${PAYU_BASE_URL}/_payment`, formData.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  } catch (error) {
    throw error;
  };
};
