import express, { Application , Request, Response} from 'express';

const app: Application = express()

const port: number = 31622

app.get('/', (req: Request, res: Response) => {
  res.send('Hello world!')
})

app.listen(port, function () {
  console.log(`App is listening on port ${port} !`)
})
