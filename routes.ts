import {Router} from "express";
import { AddTransaction, SpendPoints, ViewBalances } from "./controller";

const routes = Router();

routes.post('/addTransaction', AddTransaction);

routes.post('/spendPoints', SpendPoints);

routes.get('/viewBalances', ViewBalances);

export default routes;