import { fetchUser } from "./fetchUser"

const AuthenticateUserAndAdmin=async (req, res, next)=>{
    fetchUser(req, res, ()=>{
        if(req.user.isAdmin){
            next()
        }else{
            res.status(403).json("You are not allowed to that")
        }
    })
}

export {AuthenticateUserAndAdmin}; 