const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Tes");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,(req,res)=>{
  console.log('Success');
});
