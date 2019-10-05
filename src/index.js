const express = require('express')
require('./db/mongoose')
const userRouter = require('./router/user')
const itemRouter = require('./router/item')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(itemRouter)

app.listen(port,()=>{
  console.log(`Server is up on port ${port}`)
})
