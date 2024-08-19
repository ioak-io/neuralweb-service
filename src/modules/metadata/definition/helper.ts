const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { metadataDefinitionCollection, metadataDefinitionSchema } from "./model";
const { getCollection } = require("../../../lib/dbutils");

export const updateMetadataDefinition = async (space: string, data: any[], userId?: string) => {
  const model = getCollection(space, metadataDefinitionCollection, metadataDefinitionSchema);
  let response = null;

  const allRecords = await model.find();

  const responseList = [];
  const idList: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const response = await updateMetadataDefinitionItem(space, data[i], allRecords);
    responseList.push(response);
    idList.push(response._id);
  }
  await model.deleteMany({ _id: { $nin: idList } })

  return await model.find().sort({ group: "ascending", name: "ascending" });
};

const updateMetadataDefinitionItem = async (space: string, data: any, allRecords: any[]) => {
  const model = getCollection(space, metadataDefinitionCollection, metadataDefinitionSchema);
  let response = null;
  if (data._id) {
    response = await model.findByIdAndUpdate(
      data._id,
      {
        ...data,
        linkable: data.linkable && data.type === 'short-text'
      },
      { new: true, upsert: true }
    );
  } else {
    response = await model.create({
      ...data,
      linkable: data.linkable && data.type === 'short-text'
    });
  }
  return response;
}

export const getMetadataDefinition = async (space: string) => {
  const model = getCollection(space, metadataDefinitionCollection, metadataDefinitionSchema);

  return await model.find().sort({ group: "ascending", name: "ascending" });
};

export const deleteMetadataDefinition = async (space: string, _id: string) => {
  const model = getCollection(space, metadataDefinitionCollection, metadataDefinitionSchema);

  await model.deleteMany({ _id });
  return { metadataDefinition: [_id] };
};
