const express = require("express");
const debug = require("debug");
const uuid = require("uuid");

const { getSnap, setSnap, getAllSnaps } = require("./libs/Redis");

const app = express();

const log = debug("app:server");
const towerLog = debug("app:snapshot");

const REDIS_KEY = "Tower";

app.use(express.json());

/**Routes */
app.get("/", async (req, res) => {
  const snapshots = await getAllSnaps(`${REDIS_KEY}:*`);
  let snaps = [];
  for await (const tower of snapshots) {
    const value = await getSnap(tower);
    snaps.push(JSON.parse(value));
  }
  towerLog(`Snapshots listed for key ${REDIS_KEY}:*`);
  return res.status(200).json(snaps);
});

app.post("/", async (req, res) => {
  const { tower } = req.body;
  const id = uuid.v4();
  const date = new Date().toISOString();

  const towerSnap = await getSnap(`${REDIS_KEY}:${tower}`);
  let towerJson = {};

  if (towerSnap[0]) {
    towerJson = JSON.parse(towerSnap);

    // Save only 5 minutes of data
    if (towerJson.values.length === 5) {
      towerJson.values.pop();
    }

    towerJson.values.unshift({ id, value: uuid.v4(), date });
  } else {
    towerJson = {
      id,
      tower,
      values: [{ id: uuid.v4(), value: uuid.v4(), date }],
    };
  }

  // Update or Create a Snapshot of data
  await setSnap(`${REDIS_KEY}:${tower}`, JSON.stringify(towerJson));

  towerLog(
    `Snapshots created with Tower ${tower} at ${new Date().toISOString()}`
  );
  return res.status(201).json(towerJson);
});

app.listen(5859, () => {
  log(`Server running at http://localhost:5989/`);
});
