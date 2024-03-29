//Unsupported (404) routes
const notFound=(req,res,next)=>{
    const error = new Error(`not Found - ${req.originalUrl}`)
    res.status(404);
    next(error);
}

//To handle errors
const errorHandler =(error,req,res,next)=>{
    if(res.headerSent){
        return next(error)
    }

    res.status(error.code || 500).json({message:error.message || "An Unknown error occured"})
}


module.exports= {notFound,errorHandler}