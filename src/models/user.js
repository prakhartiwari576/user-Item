const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Item = require('../models/item')

const userSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
    trim:true
  },
  email:{
    type:String,
    unique:true,
    required:true,
    trim:true,
    lowercase:true,
    validate(value){
      if(!validator.isEmail(value)){
        throw new Error('Email is invalid')
      }
    }
  },
  password:{
    required:true,
    type:String,
    minlength:7,
    trim:true,
  },
  age:{
    type:Number,
    default:0,
    validate(value){
      if(value<0){
        throw new Error('Age must be a positive value')
      }
    }
  },
  tokens:[{
    token:{
      type:String,
      required:true
    }
  }],
  profilePic:{
    type:Buffer
  }
},{
  timestamps:true
})

userSchema.virtual('items',{
  ref:'Item',
  localField:'_id',
  foreignField:'owner'
})

userSchema.methods.toJSON = function() {
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar

  return userObject
}

userSchema.methods.generateAuthToken = async function (){
  const user = this
  const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)

  user.tokens = user.tokens.concat({token:token})
  await user.save()
  return token
}

userSchema.statics.findByCredentials = async (email,password) => {
  const user = await User.findOne({
    email:email
  })

  if(!user){
    throw new Error('Unable to Login')
  }

  const isMatch = await bcrypt.compare(password,user.password)

  if(!isMatch){
    throw new Error('Unable to Login')
  }

  return user
}

userSchema.pre('save',async function(next){
  const user = this

  if(user.isModified('password')){
    user.password = await bcrypt.hash(user.password,8)
  }

  next()
})

userSchema.pre('remove',async function(next){
  const user = this
  await Item.deleteMany({owner:user._id})
  next()
})

const User = mongoose.model('User',userSchema)
User.createIndexes();
module.exports = User
