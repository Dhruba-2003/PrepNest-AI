import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  generateMockTest,
  submitMockTest,
  getUserMockTests,
  getMockTestById,
  deleteMockTest,
} from "../controllers/mockTest.controller.js";

const mockTestRouter = express.Router();

mockTestRouter.post("/generate", isAuth, generateMockTest);
mockTestRouter.post("/submit", isAuth, submitMockTest);
mockTestRouter.get("/history", isAuth, getUserMockTests);
mockTestRouter.get("/:id", isAuth, getMockTestById);
mockTestRouter.delete("/:id", isAuth, deleteMockTest);

export default mockTestRouter;
