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

    // implementing the search result
    const result = await jobCollection.createIndex(
      { title: 1, category: 1 },
      { name: "titleCategory" }
    );

    // creating job search result api
    app.get("/jobSearchByTitle/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await jobCollection
        .find({
          $or: [
            { title: { $regex: searchText, $options: "i" } },
            { category: { $regex: searchText, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
      // console.log(result);
    });

    // inserting data
    app.post("/postJob", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date(); //for sorting jobs
      // console.log(body);
      if (!body) {
        return res.status(404).send({ message: "body data not validated!" });
      }
      const result = await jobCollection.insertOne(body);
      res.send(result);
    });

    //get data with filtering
    app.get("/allJobs/:text", async (req, res) => {
      if (req.params.text === "remote" || req.params.text === "offline") {
        const result = await jobCollection
          .find({ status: req.params.text })
          .sort({ createdAt: -1 }) // 1 for ascending -1 for descending
          .toArray();
        // console.log(result);
        return res.send(result);
      }
      const result = await jobCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });
    // get data for myJob section
    app.get("/myJob/:email", async (req, res) => {
      // console.log(req.params.email);
      const result = await jobCollection
        .find({ postedBy: req.params.email })
        .toArray();
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
