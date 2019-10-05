const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/Auth')
const multer = require('multer')
const sharp = require('sharp')

router.post('/users',async (req,res)=>{
  const user = new User(req.body)
  try{
    await user.save()
    const token = await user.generateAuthToken()
    res.status(201).send({user,token})
  }catch(error){
    res.status(400).send(error)
  }
})

router.post('/users/login',async(req,res)=>{
  try{
    const user = await User.findByCredentials(req.body.email,req.body.password)
    const token = await user.generateAuthToken()
    res.send({user,token})
  }catch(e){
    res.status(400).send()
  }
})

router.post('/users/logout',auth,async(req,res)=>{
  try{
    req.user.tokens = req.user.tokens.filter((token)=>{
      return token.token !== req.token
    })

    await req.user.save()
    res.send()
  }catch(e){
    res.status(500).send()
  }
})

router.post('/users/logoutAll',auth,async(req,res)=>{
  try{
    req.user.tokens = []

    await req.user.save()
    res.send()
  }catch(e){
    res.status(500).send()
  }
})

router.get('/users/me',auth,async(req,res)=>{
  res.send(req.user)
})

router.patch('/users/me',auth,async(req,res)=>{

  const updates = Object.keys(req.body)
  const allowedUpdates = ['name','email','password','age']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if(!isValidOperation){
    return res.status(400).send({error:'Invalid Update(s)!'})
  }

  try{
    updates.forEach((update)=>req.user[update] = req.body[update])
    await req.user.save()
    res.send(req.user)
  }catch(e){
    res.status(400).send(e)
  }
})

router.delete('/users/me',auth,async (req,res)=>{

  try{
    await req.user.remove()
    res.send(req.user)
  }catch(e){
    res.status(500).send(e)
    console.log(e)
  }
})

const upload = multer()
router.post('/users/me/profilePic',auth,upload.single('profilePic'),async (req,res)=>{
  const buffer = await sharp(req.file.buffer).png().resize({width:250,height:250}).toBuffer()
  req.user.profilePic = buffer
  await req.user.save()
  res.send('Profile Picture Uploaded Successfully')
},(error,req,res,next)=>{
  res.status(400).send({error:error.Message})
})

router.delete('/users/me/profilePic',auth,async (req,res)=>{
  req.user.profilePic = undefined
  await req.user.save()
  res.send()
},(error,req,res,next)=>{
  res.status(400).send({error:error.Message})
})

router.get('/users/:id/profilePic',async (req,res)=>{
  try{
    const user = await User.findById(req.params.id)
    if(!user || !user.profilePic){
      throw new Error()
    }
    res.set('Content-Type','image/png')
    res.send(user.profilePic)
  }catch(e){
    res.status(404).send()
  }
})

module.exports = router
