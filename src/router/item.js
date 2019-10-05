const express = require('express')
const router = new express.Router()
const auth = require('../middleware/Auth')
const Item = require('../models/item')

router.post('/items',auth,async (req,res) => {

  const item = new Item({
    ...req.body,
    owner:req.user._id
  })

  try{
    await item.save()
    res.status(201).send(item)
  }catch(e){
    res.status(400).send(e)
  }
})

router.get('/items',auth,async (req,res) => {

  const match = {}
  const sort = {}

  if(req.query.delivered){
    match.delivered = req.query.delivered === 'true'
  }

  if(req.query.sortBy){
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc'? -1 : 1
  }

  try{
    await req.user.populate({
      path:'items',
      match,
      options:{
        limit:parseInt(req.query.limit),
        skip:parseInt(req.query.skip),
        sort
      }
    }).execPopulate()
    res.send(req.user.items)
  }catch(e){
    res.status(500).send(e)
  }
})

router.get('/items/:id',auth,async(req,res)=>{
  const _id = req.params.id

  try{
    const item = await Item.findOne({_id,owner:req.user._id})
    if(!item){
      return res.status(404).send()
    }
    res.send(item)
  }catch(e){
    res.status(500).send()
  }
})

router.patch('/items/:id',auth,async (req,res)=>{

  const updates = Object.keys(req.body)
  const allowedUpdates = ['itemName','delivered']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if(!isValidOperation){
    return res.status(400).send({error:'Invalid Update(s)!'})
  }

  try{
    const item = await Item.findById({_id:req.params.id,owner:req.user._id})
    if(!item){
      return res.status(404).send()
    }
    updates.forEach((update)=>item[update] = req.body[update])
    await item.save()
    res.send(item)
  }catch(e){
    res.status(400).send(e)
  }
})

router.delete('/items/:id',auth,async (req,res)=>{
const _id = req.params.id

  try{
    const item = await Item.findOneAndDelete({_id,owner:req.user._id})
    if(!item){
      return res.status(404).send()
    }
    res.send(item)
  }catch(e){
    res.status(400).send(e)
  }
})

module.exports = router
