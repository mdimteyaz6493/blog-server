const {Router} = require("express")
const {userRegistration,loginUser,getUser,changeAvatar,editUser,getAuthor} = require("../controllers/userController")
const authMiddle = require("../middleweres/authMiddle");

const router = Router();


router.post("/register",userRegistration)
router.post("/login",loginUser)
router.get("/:id",getUser)
router.get("/",getAuthor)
router.post("/changeAvatar",authMiddle,changeAvatar)
router.patch("/edit-user/:id",authMiddle,editUser)

module.exports = router;