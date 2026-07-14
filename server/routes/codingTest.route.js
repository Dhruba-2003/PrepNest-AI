import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  generateCodingChallenge,
  executeCode,
  getUserCodingTests,
  getCodingTestById,
  deleteCodingTest,
} from "../controllers/codingTest.controller.js";

const codingTestRouter = express.Router();

codingTestRouter.post("/generate", isAuth, generateCodingChallenge);
codingTestRouter.post("/execute", isAuth, executeCode);
codingTestRouter.get("/history", isAuth, getUserCodingTests);
codingTestRouter.get("/:id", isAuth, getCodingTestById);
codingTestRouter.delete("/:id", isAuth, deleteCodingTest);

export default codingTestRouter;
