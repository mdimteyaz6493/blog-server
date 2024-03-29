const HttpError = require("../models/errorModel");
const postModel = require("../models/postModel")
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const {v4:uuid} = require("uuid")
const fs = require('fs');
const path = require('path');

const createPost = async (req, res, next) => {
    try {
        const { title, category, desc, thumbnail } = req.body;

        console.log("Received data:", req.body);

        if (!title || !category || !desc || !thumbnail) {
            return next(new HttpError("Please fill all fields", 422));
        }
        const newPost = await postModel.create({
            title,
            category,
            desc,
            thumbnail,
            creator: req.user.id // Corrected 'creater' to 'creator'
        });

        console.log("New post:", newPost);

        if (!newPost) {
            return next(new HttpError("Post not created", 422));
        }

        // Find user and increase post count by 1
        const currentUser = await userModel.findById(req.user.id);
        const userPostCount = currentUser.posts + 1;

        await userModel.findByIdAndUpdate(req.user.id, { posts: userPostCount });

        res.status(201).json(newPost);
        
    } catch (error) {
        console.error("Error creating post:", error);
        return next(new HttpError(error.message));
    }
};

const getPosts = async(req,res,next)=>{
    try {
        const posts = await postModel.find().sort({updatedAt:-1})
        res.status(200).json(posts)
    } catch (error) {
        return next(new HttpError(error.message));
    }
}
const getPost = async(req,res,next)=>{
   try {
    const postId = req.params.id;
    const post = await postModel.findById(postId)
    if(!post){
        return next(new HttpError("Post not found",404));
    }
    res.status(200).json(post)
   } catch (error) {
    return next(new HttpError(error.message));
   }
}
const editPost = async(req,res,next)=>{
   try {
    let updatedPost;
    const postId = req.params.id;
    let {title,category,desc,thumbnail} = req.body;
    if(!title || !category || !desc || !thumbnail){
        return next(new HttpError("Fill all fields",422));
    }
    updatedPost = await postModel.findByIdAndUpdate(postId,{title,category,desc,thumbnail},{new:true})
    if(!updatedPost){
     return next(new HttpError("Not updated"));
    }
    res.status(200).json(updatedPost)
    
   } catch (error) {
    return next(new HttpError(error.message));
   }
}
const getcatPost = async(req,res,next)=>{
    try {
        const {category} = req.params;
        const catPosts = await postModel.find({category}).sort({createdAt:-1})
        res.status(200).json(catPosts)
    } catch (error) {
        return next(new HttpError(error.message));
    }
}
const getUserPost = async(req,res,next)=>{
    try {
        const {id} = req.params;
        const posts  = await postModel.find({creator:id}).sort({createdAt:-1})
        res.status(200).json(posts)
    } catch (error) {
        return next(new HttpError(error.message));
    }
}
const deletePost = async(req,res,next)=>{
    try {
        const postId = req.params.id;
        if(!postId){
            return next(new HttpError("Post unavailable",422));
        }
        const post = await postModel.findById(postId);
        const fileName = post.thumbnail;
        if(req.user.id == post.creator){
         await postModel.findByIdAndDelete(postId);
        //finder user an reduce post count by 1
         const currentUser = await userModel.findById(req.user.id);
         const userPostCount = currentUser.posts - 1;
         await userModel.findByIdAndUpdate(req.user.id, { posts: userPostCount });
         res.status(201).json("Post deleted successfully ");
        }
    } catch (error) {
        return next(new HttpError(error.message));
    }
}

module.exports = {createPost,getPosts,getPost,editPost,getcatPost,getUserPost,deletePost}