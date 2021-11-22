import db from "../db";
import { assert } from "../utils";

type CounterDoc = {
  _id: string;
  value: number;
};

const coll = db.collection<CounterDoc>("counter");

async function next(name: string, defaultValue: number) {
  const find = await coll.findOne({ _id: name });
  if (!find) {
    await coll.insertOne({ _id: name, value: defaultValue });
    return defaultValue;
  }

  const result = await coll.findOneAndUpdate(
    { _id: name },
    { $inc: { value: 1 } },
    { returnDocument: "after" }
  );

  assert(result.ok && result.value);

  return result.value.value;
}

export class Counter {
  static nextProblem() {
    return next("problem", 1000);
  }

  static nextRecord() {
    return next("record", 1);
  }
}
