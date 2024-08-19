const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { colorfilterCollection, colorfilterSchema } from "./model";
const { getCollection } = require("../../lib/dbutils");

export const updateColorfilter = async (space: string, data: any, userId?: string) => {
  const model = getCollection(space, colorfilterCollection, colorfilterSchema);
  let response = null;
  if (data._id) {
    response = await model.findByIdAndUpdate(
      data._id, data,
      { new: true, upsert: true }
    );
  } else {
    const order = await model.find().count() + 1;
    response = await model.create({ ...data, order });
  }
  return await getColorfilter(space);
};

export const updateColorfilterItem = async (space: string, data: any) => {
  const model = getCollection(space, colorfilterCollection, colorfilterSchema);
  let response = null;
  if (data._id) {
    response = await model.findByIdAndUpdate(
      data._id, data,
      { new: true, upsert: true }
    );
  } else {
    response = await model.create(data);
  }
  return response;
}

export const getColorfilter = async (space: string) => {
  const model = getCollection(space, colorfilterCollection, colorfilterSchema);

  return await model.find().sort({ order: "ascending" });
};

export const deleteColorfilter = async (space: string, _id: string) => {
  const model = getCollection(space, colorfilterCollection, colorfilterSchema);

  await model.deleteMany({ _id });
  return { colorfilter: [_id] };
};


export const move = async (space: string, _id: string, mode: 'up' | 'down') => {
  const model = getCollection(space, colorfilterCollection, colorfilterSchema);
  const data = await model.find();

  const currentItem = data.find((item: any) => {
    return item._id.toString() === _id
  });

  if (!currentItem) {
    return { 'status': 'data not found' };
  }

  await model.findByIdAndUpdate(
    _id, { order: mode === 'up' ? currentItem.order - 1 : currentItem.order + 1 },
    { new: true, upsert: true }
  );

  const impactedItem = data.find((item: any) => {
    if (mode === 'up') {
      return item.order === currentItem.order - 1;
    } else {
      return item.order === currentItem.order + 1;
    }
  })

  await model.findByIdAndUpdate(
    impactedItem._id, { order: mode === 'up' ? impactedItem.order + 1 : impactedItem.order - 1 },
    { new: true, upsert: true }
  );

  return await getColorfilter(space);
};
