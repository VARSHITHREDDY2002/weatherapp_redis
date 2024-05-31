const express=require("express");
const axios=require('axios');
const bodyParser=require('body-parser');
const redis=require('redis');
const app=express();



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine','ejs');

const client = redis.createClient({
    port: 6380 // Specify the port here
  });

client.on('error', (err) => {
    console.log('Redis error:', err);
});

client.on('connect', () => {
    console.log('Connected to Redis');
});


app.post('/home',async function(req,res){

const city=req.body.city;
console.log(city);
client.get(city, async (err, data) => {
    try {
        if (err) {
            console.log(err);
        } else if (data) {
            console.log('cached data');
            res.json(JSON.parse(data));
        } else {
            const response = await axios.get(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}/today?unitGroup=us&key=ZFPGS6WBCXST5YV6W4UXLV45H&contentType=json`);
            console.log(response.data);
            await client.setEx(city, 3600, JSON.stringify(response.data));
            console.log('original data');
            res.json(response.data);
        }
    } catch (error) {
        console.error('Error retrieving or processing data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


})


app.get('/',function(req,res){
    res.render('home');
})

app.listen(3000,()=>{
    console.log("server running on port 3000");
})