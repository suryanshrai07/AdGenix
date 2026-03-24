import express , {Request,Response} from 'express';
import cors from 'cors';
import 'dotenv/config';



const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/',(req: Request,res : Response) => {
    res.send("Hello World!");
})

app.listen(PORT,()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
})