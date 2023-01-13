const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

//mongoDb uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mzfy2kt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const serviceCollection = client.db("get-shield").collection("services");
    const usersCollection = client.db("get-shield").collection("users");

    //post a service
    app.post("/service", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });

    //get services
    app.get("/services", async (req, res) => {
      const query = {};
      const services = await serviceCollection.find(query).toArray();
      console.log("---all services are:", services);
      res.send(services);
    });

    //save a user
    app.post("/users", async (req, res) => {
      const userInfo = req.body;

      //checking if user with same email address already inserted
      const query = { email: userInfo.email };
      const alreadyBooked = await usersCollection.find(query).toArray();
      if (alreadyBooked.length) {
        const message = `Already registered with email ${userInfo.email}`;
        return res.send({ acknowledged: false, message });
      }

      const result = await usersCollection.insertOne(userInfo);
      res.send(result);
    });

    //is a admin user
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    //is a normal user
    app.get("/users/buyer/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isUser: user?.role === "user" });
    });

    //
  } finally {
    console.log("----single request done---");
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("getShield is running");
});

app.listen(port, () => console.log(`getShield is running on ${port}`));
