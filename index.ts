import express, { Response, Request, NextFunction } from "express";
import { createClient } from "redis";

const app = express();
const port = 3000;

const redisServer = createClient({
  url: "redis://127.0.0.1:6379",
  legacyMode: true,
});
redisServer.on("error", (err) => {
  console.log(err);
});

(() => redisServer.connect())();

app.get("/", (_, res) => {
  res.send("Server is running");
});

app.post("/entries", async (_, res) => {
  try {
    const fetchData = await fetch(
      "https://jsonplaceholder.typicode.com/posts",
      {
        method: "POST",
        body: JSON.stringify({
          title: "foo",
          body: "bar",
          userId: 1,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }
    );
    const entry = await fetchData.json();

    console.log(entry.id);

    await redisServer.setEx(entry.id, 60, JSON.stringify(entry));

    res.status(200).json({ data: entry });
  } catch (error) {
    console.log(error);
  }
});

const isCached = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const data = await redisServer.get(id);

  if (data) {
    return res.status(200).json({ data: JSON.parse(data) });
  }
  next();
};

app.get(
  "/entries/:id",
  isCached,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const fetchEntry = await fetch(
      `https://jsonplaceholder.typicode.com/posts/${id}`
    );

    const entry = await fetchEntry.json();

    res.status(200).json({ data: entry });
  }
);

app.listen(port, () => console.log("[SERVER] Running on port: ", port));
