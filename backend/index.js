require('dotenv').config();

const connectToMongo=require('./db');
const express = require('express')
var cors = require('cors')

connectToMongo();

const app = express()
const port = 5000

console.log("Loaded Email:", process.env.EMAIL_USER)

app.use(cors())
app.use(express.json())//to use req.body in json

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })
//Available routes
app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))
  
  

app.listen(port, () => {
  console.log(`iNotebook backend listening at http://localhost:${port}`)
})
