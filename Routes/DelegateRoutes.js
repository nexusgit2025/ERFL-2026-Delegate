import express from "express";
import {
  registerDelegate,
  getAllDelegates,
  getSingleDelegate,
} from "../Controller/DelegateController.js";

const router = express.Router();

router.post("/register", registerDelegate);
router.get("/all", getAllDelegates);
router.get("/:id", getSingleDelegate);

export default router;
