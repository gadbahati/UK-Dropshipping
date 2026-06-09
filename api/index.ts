import { createServer } from "http";
import app from "../dist/index.js";

const server = createServer(app);

export default server;
