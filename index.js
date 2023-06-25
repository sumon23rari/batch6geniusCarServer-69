const express=require('express');
const cors=require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const app=express ();
require('dotenv').config()
const port=process.env.PORT || 7000;
// user name usmangoni
//password HbMQlr2ctm33iXoV
// using middleware
app.use(cors())
app.use(express.json())
console.log(process.env.DB_USER)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.awwz688.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
function verifyJWT(req,res,next){
const authHeader=req.headers.authorization;
if (!authHeader) {
 return res.status(401).send({message:'unauthorijet access'})
}
const token=authHeader.split(' ')[1]
jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,function (err,decoded) {
  if (err) {
    return res.status(403).send({message:'unauthorijet access'})
  }
  req.decoded=decoded;
  next()
})
}
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7 fdsfsdf)
    await client.connect();
    app.post('/jwt',async(req,res)=>{
      const user=req.body;
      const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:"9d"})
      res.send({token})
    })
 const serviceCollection=client.db('geniusCar').collection('services');
 const ordersCollection=client.db('geniusCar').collection('orders');
//  get jwt token

//  find all services

app.get('/services',async(req,res)=>{
    const query={};
    const cursor=serviceCollection.find(query);
    const result=await cursor.toArray();
    res.send(result);
});
app.get('/services/:id',async(req,res)=>{
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
    // console.log('query'.query)
    const result = await serviceCollection.findOne(query);
    // console.log('result',result)
    res.send(result);
});
app.get('/orders',verifyJWT,async(req,res)=>{
console.log(req.headers)
const decoded=req.decoded;
if (decoded.email !==req.query.email) {
  res.status(401).send('unauthorizate access')
}
  let query={};
  if (req.query.email) {
   query={email:req.query.email}
  }
  const cursor=ordersCollection.find(query);
  const result=await cursor.toArray()
  res.send(result)
});
app.post('/orders',async(req,res)=>{
const order=req.body;
// console.log(order)
const result=await ordersCollection.insertOne(order)
res.send(result)
});
app.patch('/orders/:id',async(req,res)=>{
  const id=req.params.id;
  const filter={_id:new ObjectId(id)}
  const options={ upsert: true}
  const status=req.body.status;
  const updateDoc = {
    $set: {
      status:status
    },
  };
  const result=await ordersCollection.updateOne(filter,updateDoc,options)
  res.send(result)
})
app.delete('/orders/:id',async(req,res)=>{
  const id=req.params.id;
  console.log('deleteOrders',id)
  const query={_id:new ObjectId(id)};
  const result=await ordersCollection.deleteOne(query)
  res.send(result)
})

  } finally {

   // await client.close();
  }
}
run().catch(console.dir);
app.get('/',(req,res)=>{
    res.send('simple node server running sdkf vercel')
    });


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  });