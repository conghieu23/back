import express, {Application} from "express"
import cors from "cors";
import user from "./routers/user";
import {env} from "./config/env";
import product from "./routers/product";
import cart from "./routers/cart";
import bag from "./routers/bag";

const app: Application = express();

const port = env.port;
app.use(express.json());
app.use(cors({
    origin: "http://localhost:4200",
    credentials: true,
}))

app.listen(port, () => {
    console.log("Listening on " + port);
})

app.use("/user", user);
app.use("/product", product);
app.use("/cart", cart);
app.use("/bag", bag);