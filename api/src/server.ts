import { app } from "./app";

const port = Number(process.env.PORT || 3333);
app.listen(port, "0.0.0.0", () => {
  console.log(`API rodando em http://localhost:${port}`);
});
