import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() }).array("bills");

export default upload;