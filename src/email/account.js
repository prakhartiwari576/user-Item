const sgMail = require('@sendgrid/Mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const sendWelcomeEmail = (email,name)=>{
  sgMail.send({
    to:email,
    from:'prakhartiwari576@gmail.com',
    subject:'Thanks for joining in',
    text:`Welcome to Amazon, ${name}`
  })
}

const sendCancelationEmail = (email,name)=>{
  sgMail.send({
    to:email,
    from:'prakhartiwari576@gmail.com',
    subject:'Good Bye'
    ,text:`It was nice being with you ${name}`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
}
