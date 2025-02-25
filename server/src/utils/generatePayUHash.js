import crypto from "crypto";

function generatePayUHash({ key, txnid, amount, productinfo, firstname, email, salt }) {
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
  return crypto.createHash("sha512").update(hashString).digest("hex");
};

export default generatePayUHash;
