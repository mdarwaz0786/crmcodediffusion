import express from "express";
import { createLeed, deleteLeed, getAllLeeds, getLeedById, updateLeed } from "../controllers/leeds.controller.js";

const router = express.Router();

router.post("/create-leed", createLeed);
router.get("/all-leed", getAllLeeds);
router.get("/single-leed/:id", getLeedById);
router.put("/update-leed/:id", updateLeed);
router.delete("/delete-leed/:id", deleteLeed);

export default router;
