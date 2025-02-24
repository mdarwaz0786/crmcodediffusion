import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

export const generatePayUForm = ({ amount, productInfo, firstName, email, phone, txnId }) => {
  const { PAYU_MERCHANT_KEY, PAYU_SALT, PAYU_BASE_URL, PAYU_SUCCESS_URL, PAYU_FAILURE_URL } = process.env;

  // Hash sequence
  const hashString = `${PAYU_MERCHANT_KEY}|${txnId}|${amount}|${productInfo}|${firstName}|${email}|||||||||||${PAYU_SALT}`;
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");

  // Auto-submitting PayU form
  return `
    <html>
      <body onload="document.forms[0].submit();">
        <form action="${PAYU_BASE_URL}/_payment" method="post">
          <input type="hidden" name="key" value="${PAYU_MERCHANT_KEY}" />
          <input type="hidden" name="txnid" value="${txnId}" />
          <input type="hidden" name="amount" value="${amount}" />
          <input type="hidden" name="productinfo" value="${productInfo}" />
          <input type="hidden" name="firstname" value="${firstName}" />
          <input type="hidden" name="email" value="${email}" />
          <input type="hidden" name="phone" value="${phone}" />
          <input type="hidden" name="surl" value="${PAYU_SUCCESS_URL}" />
          <input type="hidden" name="furl" value="${PAYU_FAILURE_URL}" />
          <input type="hidden" name="hash" value="${hash}" />
        </form>
      </body>
    </html>
  `;
};
