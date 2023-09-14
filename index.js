const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, Collection } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongo connection

// const uri = "mongodb+srv://job-portal:eZ6yzAuPm31E0bpd@cluster0.zynq1cd.mongodb.net/?retryWrites=true&w=majority";
const uri = "mongodb://127.0.0.1:27017";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    // creating mongodb collection
    const jobCollection = client.db("jobPortal").collection("jobs");
    // inserting data
    app.post("/postJob", async (req, res) => {
      const body = req.body;
      console.log(body);
      if (!body) {
        return res.status(404).send({ message: "body data not validated!" });
      }
      const result = await jobCollection.insertOne(body);
    //   res.send(result);
    });

    //get data
    app.get("/allJobs", async (req, res) => {
        const result = await jobCollection.find({}).toArray();
        res.send(result);
    });


    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("project manager is working");
});
app.listen(port, () => {
  console.log(`project manger is working on port ${port}`);
});
