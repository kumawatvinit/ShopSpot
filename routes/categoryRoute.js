import express from "express";
import { isAdmin, requireSignin } from "./../middlewares/authMiddleware.js";
import { CreateCategoryController, DeleteCategoryController, GetAllCategoriesController, GetCategoryController, UpdateCategoryController } from "../controllers/categoryController.js";

const router = express.Router();

// routes
router.post(
  "/create-category",
  requireSignin,
  isAdmin,
  CreateCategoryController
);

// update category
router.put("/update-category/:id", requireSignin, isAdmin, UpdateCategoryController);

// get all categories
router.get("/categories", GetAllCategoriesController);

// get single category
router.get("/single-category/:slug", GetCategoryController);

// delete category
router.delete("/delete-category/:id", requireSignin, isAdmin, DeleteCategoryController);

export default router;
