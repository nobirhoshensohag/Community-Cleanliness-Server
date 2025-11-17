const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;



const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster1.h19g7bt.mongodb.net/?appName=Cluster1`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// middleware
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Smart server is running");
});


async function run() {
  try {
    
    await client.connect();


     const db = client.db("issue_report");
    const issueCollection = db.collection("issues");
    const contributionCollection = db.collection("contribution");
     const usersCollection = db.collection("users");

    // USERS APIs
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        res.send({
          message: "user already exits. do not need to insert again",
        });
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    });

    //issue related APIs
    app.post("/issues", async (req, res) => {
      const newIssue = req.body;
      const result = await issueCollection.insertOne(newIssue);
      res.send(result);
    });

    app.get("/issues", async (req, res) => {
      const cursor = issueCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/latest-issues", async (req, res) => {
      const projectFields = {
        _id: 1,
        title: 1,
        description: 1,
        category: 1,
        location: 1,
        image: 1,
      };
      const query = issueCollection
        .find()
        .limit(6)
        .skip(7)
        .project(projectFields);
      const result = await query.toArray();
      res.send(result);
    });

   app.get("/issues/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await issueCollection.findOne(query);
      res.send(result);
    });

    //contribution related APIs
    app.post("/contributions", async (req, res) => {
      const newContribution = req.body;
      const result = await contributionCollection.insertOne(newContribution);
      res.send(result);
    });
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
    
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});