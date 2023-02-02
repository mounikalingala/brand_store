const express= require("express")
const mongoose=require("mongoose")
const Registeruser=require("./model")
const middleware=require("./middleware")
const jwt=require("jsonwebtoken")
const cors=require("cors")
const app=express()

mongoose.connect("mongodb+srv://mounika:mounika@cluster0.4qioyol.mongodb.net/?retryWrites=true&w=majority").then(
    ()=>console.log("DB connected")
)

app.use(express.json())
app.use(cors({origin:"*"}))

app.post("/signup",async(req,res)=>{
    try{
      const {username,email,password,confirmpassword}=req.body
      let exist= await Registeruser.findOne({email})
      if(exist){
        return res.status(400).send("User Already Exist")
      }
      if(password!==confirmpassword){
        return res.status(400).send("Password not matched")
      }
      let newUser=new Registeruser({
        username,
        email,
        password,
        confirmpassword
      })
      await newUser.save()
      res.status(200).send("Register Successfully")
    }
    catch(err){
      console.log(err)
      return res.status(500).send("Internal Server Error")
    }
})

app.post("/signin", async(req,res)=>{
    try {
        const {email,password}=req.body
        let exist=await Registeruser.findOne({email})
        if(!email){
            return res.status(400).send("User Notfound")
        }
        if (exist.password!==password){
            return res.status(400).send("Invalid Cradentials")
        }
        let payload={
            user:{
                id:exist.id
            }
        }
        jwt.sign(payload,'jwtToken',{expiresIn:40000000},
        (err,token)=>{
            if(err) throw err;
            return res.json({token})
        })
    } catch (err) {
        console.log(err)
      return res.status(500).send("Server Error")
    }
})

app.get("/brandstore",middleware,async(req,res)=>{
    try {
        let exist=await Registeruser.findById(req.user.id)
        if(!exist){
            return res.status(400).send("User Notfound")
        }
        res.json(exist)
    } catch (err) {
        console.log(err)
        return res.status(500).send("Invalid token")
    }
})

app.listen(3008,()=>{
    console.log("server running...")
})