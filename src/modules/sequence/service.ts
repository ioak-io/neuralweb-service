const { sequenceCollection, sequenceSchema } = require('./model');
const { getGlobalCollection, getCollection } = require('../../lib/dbutils');

export const create_sequence = async (
  field: String,
  context: String | null,
  factor: Number,
  space?: String
) => {
  let model;
  if (space) {
    model = getCollection(space, sequenceCollection, sequenceSchema);
  } else {
    model = getGlobalCollection(sequenceCollection, sequenceSchema);
  }

  const existing_sequence = await model.findOne({ field, context });

  if (existing_sequence) {
    return existing_sequence;
  }

  return await model.findOneAndUpdate(
    { field, context },
    { field, context, factor, nextval: 1 },
    { upsert: true, new: true }
  );
};

export const nextval = async (
  field: String,
  context?: String,
  space?: String
) => {
  let model;
  if (space) {
    model = getCollection(space, sequenceCollection, sequenceSchema);
  } else {
    model = getGlobalCollection(sequenceCollection, sequenceSchema);
  }
  const sequence = await model.findOne({ field, context });
  if (!sequence) {
    return null;
  }
  await model.findOneAndUpdate(
    { field, context },
    { nextval: sequence.nextval + sequence.factor },
    { upsert: true, new: true }
  );
  return sequence.nextval;
};
