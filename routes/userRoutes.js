import express from "express";
import { adminDeleteUser, adminGetAllUsers, adminGetSingleUser, adminUpdateUserProfile, forgotPassword, getUserDetails, loginUser, logOutUser, registerUser, resetPassword, updatePassword, updateProfile } from "../controller/userController.js";
import { roleBasedAccess, userAuth } from "../middleware/userAuth.js";


const userRoutes = express.Router();

userRoutes.route('/register').post(registerUser);
userRoutes.route('/login').post(loginUser);
userRoutes.route('/logout').post(logOutUser);
userRoutes.route('/forgot/password').post(forgotPassword);
userRoutes.route("/reset/password/:token").post(resetPassword);
userRoutes.route("/profile").get(userAuth,getUserDetails);

userRoutes.route("/password/update").put(userAuth,updatePassword);
userRoutes.route("/profile/update").put(userAuth,updateProfile);

//* Admin
userRoutes.route("/admin/users").get(userAuth,roleBasedAccess,adminGetAllUsers);

userRoutes.route("/admin/user/:id")
.put(userAuth,roleBasedAccess,adminUpdateUserProfile)
.delete(userAuth,roleBasedAccess,adminDeleteUser)
.get(userAuth,roleBasedAccess,adminGetSingleUser);




export default userRoutes;