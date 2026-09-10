import express from 'express'
import path from 'path'
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const publicPath = path.resolve('public')

app.use(express.static(publicPath));
app.set('view engine', 'ejs')

const dbName = "node-project"
const collectionName = "todo"
const url = "mongodb://localhost:27017"
const client = new MongoClient(url)

const connection = async () => {
    const connect = await client.connect();
    return await connect.db(dbName)
}

app.use(express.urlencoded({ extended: false }))

app.get('/', async (req, resp) => {
    const db = await connection();
    const collection = db.collection(collectionName);
    const result = await collection.find().toArray();
    resp.render("list", { result })
})

app.get('/add', (req, resp) => {
    resp.render("add")
})

app.get('/update', (req, resp) => {
    resp.render("update")
})

app.post('/add', async (req, resp) => {
    const db = await connection();
    const collection = db.collection(collectionName);
    const result = collection.insertOne(req.body)
    if (result) {
        resp.redirect('/')
    } else {
        resp.redirect('/add')
    }
})

app.post('/update', (req, resp) => {
    resp.redirect('/')
})

app.get('/delete/:id', async (req, resp) => {
    const db = await connection();
    const collection = db.collection(collectionName);
    const result = collection.deleteOne({ _id: new ObjectId(req.params.id) })
    if (result) {
        resp.redirect('/')
    } else {
        resp.send('Some Error occured! Try again later.')
    }
})

app.get('/update/:id', async (req, resp) => {
    const db = await connection();
    const collection = db.collection(collectionName);
    const result = await collection.findOne({ _id: new ObjectId(req.params.id) })
    if (result) {
        resp.render('update', { result })
    } else {
        resp.send('Some Error occured! Try again later.')
    }
})

app.post('/update/:id', async (req, resp) => {
    const db = await connection();
    const collection = db.collection(collectionName);
    const filter = { _id: new ObjectId(req.params.id) };
    const updatedData = {
        $set: {
            title: req.body.title,
            description: req.body.description
        }
    };
    const result = await collection.updateOne(filter, updatedData)
    if (result) {
        resp.redirect('/')
    } else {
        resp.send('Some Error occured! Try again later.')
    }
})

// multi delete tasks
app.post('/multi-delete', async (req, resp) => {
    const db = await connection();
    const collection = db.collection(collectionName);
    //console.log(req.body.selectedTask);

    let selectedTask = undefined;
    if (Array.isArray(req.body.selectedTask)) {
        selectedTask = req.body.selectedTask.map((id) => new ObjectId(id));
    } else {
        selectedTask = [new ObjectId(req.body.selectedTask)]
    }
    console.log(selectedTask);
    
    const result = await collection.deleteMany({ _id: { $in: selectedTask } })

    if (result) {
        resp.redirect('/')
    } else {
        resp.send('Some Error occured! Try again later.')
    }
    //resp.send("ok")
})

app.listen(3200);
