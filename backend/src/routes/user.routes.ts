import { Router } from "express";

import {
  createUser,
  getUserById,
  getUserByEmail,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";

const router = Router();

// Create user
router.post("/", createUser);

// Get all users
router.get("/", getAllUsers);

// Get user by email
router.get("/email", getUserByEmail);

// Get user by ID
router.get("/:id", getUserById);

// Update user
router.patch("/:id", updateUser);

// Delete user
router.delete("/:id", deleteUser);

export default router;