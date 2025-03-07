const bodyParser = require("body-parser")
const express = require("express")
const routernotification = require("./routes/notofication")
var admin = require("firebase-admin");

const app = express()
var serviceAccount = require("../notification-1e987-firebase-adminsdk-fbsvc-f23379c12c.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

app.use(bodyParser.json())
app.use("/", routernotification)
app.listen(3000, () =>
    console.log("connected successfully notification server !"))