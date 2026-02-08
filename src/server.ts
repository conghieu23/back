import express, {Application} from "express"
import cors from "cors";
import user from "./routers/user";
import {env} from "./config/env";
import product from "./routers/product";
import cart from "./routers/cart";
import bag from "./routers/bag";
import invoice from "./routers/invoice";
import banner from "./routers/banner";

const app: Application = express();

const port = env.port;
app.use(express.json());
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.listen(port, () => {
    console.log("Listening on " + port);
})

app.use("/user", user);
app.use("/product", product);
app.use("/cart", cart);
app.use("/bag", bag);
app.use("/invoice", invoice)
app.use("/banner", banner);