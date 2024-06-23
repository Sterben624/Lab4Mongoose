const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const jsonParser = express.json();

const url = "mongodb://localhost:27017/";
const dbName = "carsdb";
const collectionName = "cars";

mongoose.connect(url + dbName);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "Помилка підключення до MongoDB:"));
db.once("open", () => {
    console.log("Підключено до MongoDB");
});

const carSchema = new mongoose.Schema({
    make: String,
    model: String,
    year: Number
});

const Car = mongoose.model("Car", carSchema);

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public.html"));
});

app.get("/cars", getCars);
app.get("/cars/:id", getCarById);
app.post("/cars", jsonParser, createCar);
app.delete("/cars/:id", deleteCar);
app.put("/cars/:id", jsonParser, updateCar);

app.listen(3000, () => {
    console.log("Сервер слухає порт 3000");
});

async function getCars(req, res) {
    try {
        const cars = await Car.find({});
        res.send(cars);
    } catch (err) {
        console.error("Помилка отримання списку автомобілів", err);
        res.status(500).send("Помилка отримання списку автомобілів");
    }
}

async function getCarById(req, res) {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).send('Автомобіль не знайдено');
        }
        res.send(car);
    } catch (err) {
        console.error('Помилка при отриманні автомобіля за ID', err);
        res.status(500).send('Помилка при отриманні автомобіля за ID');
    }
}

async function createCar(req, res) {
    try {
        const { make, model, year } = req.body;
        const car = new Car({ make, model, year });
        await car.save();
        res.send(car);
    } catch (err) {
        console.error("Помилка при додаванні автомобіля", err);
        res.status(500).send("Помилка при додаванні автомобіля");
    }
}

async function deleteCar(req, res) {
    try {
        const result = await Car.deleteOne({ _id: req.params.id });
        if (result.deletedCount === 0) {
            return res.status(404).send('Автомобіль не знайдено');
        }
        res.send({ message: 'Автомобіль успішно видалено' });
    } catch (err) {
        console.error('Помилка при видаленні автомобіля', err);
        res.status(500).send('Помилка при видаленні автомобіля');
    }
}

async function updateCar(req, res) {
    try {
        const { make, model, year } = req.body;
        const updatedCar = await Car.findByIdAndUpdate(req.params.id, { make, model, year }, { new: true });
        if (!updatedCar) {
            return res.status(404).send("Автомобіль не знайдено");
        }
        res.send(updatedCar);
    } catch (err) {
        console.error("Помилка при оновленні автомобіля", err);
        res.status(500).send("Помилка при оновленні автомобіля");
    }
}
