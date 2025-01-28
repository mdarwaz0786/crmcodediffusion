import firebase from "firebase-admin";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(readFileSync(new URL('./serviceAccountKeys.json', import.meta.url)));

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

export default firebase;