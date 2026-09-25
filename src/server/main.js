import dotenv from "dotenv";
import express from "express";
import ViteExpress from "vite-express";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import session from "express-session";
import compression from "compression";
// import favicon from "serve-favicon";
// import path from "path";
// import morgan from "morgan";

dotenv.config()
const app = express();

const logger = (req,res,next) => {
    console.log( 'url:', req.method, req.url )
    next()
}

const calc_urgency = function (due, length) {
    let dateEntered = new Date(due);
    let dateNow = Date.now()

    // time left to do work
    let timeUntil = (dateEntered - dateNow) + (dateEntered.getTimezoneOffset() * 60 * 1000)

    let daysMs = function(days) {
        return days * 24 * 60 * 60 * 1000
    }
    // console.log(dateEntered)
    // console.log(dateNow)
    // console.log(timeUntil)

    let urgency = (due === "") ? "N/A" : "Low"

    const urgencyBias = {
        "Short": +2,
        "Normal": 0,
        "Long": -3
    };

    let bias_ms = (daysMs(urgencyBias[length]))
        // console.log(`BIAS: ${length}`)

    if (timeUntil < 0) {
        urgency = "Overdue"
    }
    else if (timeUntil + bias_ms < daysMs(1)) {
        urgency = "Danger"
    }
    else if (timeUntil + bias_ms < daysMs(3)) {
        urgency = "High"
    }
    else if (timeUntil + bias_ms < daysMs(7)) {
        urgency = "Normal"
    }

    return urgency
}

app.use( logger )
// app.use(favicon('public/favicon.ico'));
app.use(compression());
app.use(session({ 
    secret: process.env.PASSPORT_SECRET, 
    resave: false, 
    saveUninitialized: false 
}));
app.use(passport.initialize());
app.use(passport.session());
// app.use( express.static( 'public' ) )
// app.use(morgan('combined'));

// from example code
app.get('/auth/github',
passport.authenticate('github', { scope: [ 'user:email' ] }));

// from example code
app.get('/auth/github/callback', 
passport.authenticate('github', { failureRedirect: '/' }),
function(req, res) {
    res.redirect('/');
});

// DB init
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})
let collection = null
let users = null

const openDB = async () => {
    await client.connect()
    collection = await client.db("todo").collection("items")
    users = await client.db("todo").collection("users")
    console.log('Connected to DB')

    console.log(process.env.GITHUB_CLIENTID)
    console.log(process.env.GITHUB_CLIENTSECRET)
}

// open DB connection
openDB()

// from example code
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// from example code
passport.deserializeUser(async function(obj, done) {
    const user = await users.findOne({ id: obj })
    // console.log(`Deserializing: ${obj} --> ${JSON.stringify(user)}`)
    done(null, user);
});

// from example code
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENTID,
    clientSecret: process.env.GITHUB_CLIENTSECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
},
async function(accessToken, refreshToken, profile, done) {
    // console.log(JSON.stringify(profile))
    let user_obj = {id: profile.id, username: profile.username}
    const user = await users.findOne({ id: profile.id })

    if (!user) {
        await users.insertOne( user_obj )
    }

    done(null, user_obj)
}
));

console.log("this ran")
// Registering GET middleware
app.get('/entries', ensureAuthenticated, async (req, res) => {
    if (collection !== null) {
        const docs = await collection.find({user: req.user.id}).toArray()
        res.json( docs )
    }
})

// from example code
app.get('/logout', function(req, res, next){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

app.get('/user/username', function(req, res) {
    if (req.isAuthenticated()) {
        res.json(req.user.username)
    } else {
        res.json(undefined)
    }
    
})

// Registering POST middleware
app.post( '/submit', ensureAuthenticated, express.json(), async ( req, res ) => {
    // new JSON Format => (_id, name, duration, urgency, due)
    // -1 id == new entry
    // empty name == delete entry
    console.log(`Submit: ${JSON.stringify( req.body )}`)
    if (req.body.id === -1) {
        // Add
        req.body.urgency = calc_urgency(req.body.due, req.body.duration)
        req.body.user = req.user.id
        console.log(`ADDING FOR USER ${JSON.stringify(req.user)})`)
        delete req.body.id
        await collection.insertOne( req.body )
        // res.json( result )
        // appdata.push(req.body)
    }
    else if (req.body.name === "") {
        await collection.deleteOne({ 
            _id:new ObjectId( req.body.id ) 
        })
    }
    else {
        // Edit
        await collection.updateOne(
            { _id: new ObjectId( req.body.id ) },
            { $set:{ name:req.body.name, 
                duration:req.body.duration,
                due: req.body.due,
                urgency:calc_urgency(req.body.due, req.body.duration) } }
        )
    }

    if (collection !== null) {
        const docs = await collection.find({user: req.user.id}).toArray()
        res.json( docs )
    }
})

// Start listening for requests
ViteExpress.listen(app, process.env.PORT || 3000 )

function ensureAuthenticated(req, res, next) {
    console.log("Ensuring auth", req.isAuthenticated()) 
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/')
}
