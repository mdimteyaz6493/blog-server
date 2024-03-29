const {Router} = require("express")
const {createPost,getPosts,getPost,editPost,getcatPost,getUserPost,deletePost} = require("../controllers/postController")
const authMiddle = require("../middleweres/authMiddle")
const router = Router();

router.post("/",authMiddle,createPost)
router.get("/",getPosts)
router.get("/:id",getPost)
router.patch("/:id",authMiddle,editPost)
router.get("/categories/:category",getcatPost)
router.get("/user/:id",getUserPost)
router.delete("/:id",authMiddle,deletePost)
module.exports = router;