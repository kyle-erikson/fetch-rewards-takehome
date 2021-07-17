import express, { Application } from "express";
import routes from "./routes";

const app: Application = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

if (process.env.NODE_ENV !== 'test') {
  try {
    app.listen(port, (): void => {
      console.log(`Connected successfully on port ${port}`);
    });
  } catch (error) {
    console.error(`Error occurred: ${error.message}`);
  }
}

export const server = app;
