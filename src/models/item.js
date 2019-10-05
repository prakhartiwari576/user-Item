const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
  itemName:{
    type:String,
    required:true,
    trim:true
  },
  delivered:{
    type:Boolean,
    default:false
  },
  owner:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'User'    
  }
},{
  timestamps:true
})

const Item = mongoose.model('Item',itemSchema)

module.exports = Item
