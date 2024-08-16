import { noteCollection, noteSchema } from "../../note/model";

const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import * as MetadataDefinitionHelper from '../definition/helper';
const { getCollection } = require("../../../lib/dbutils");

export const getMetadataValue = async (space: string) => {
  const model = getCollection(space, noteCollection, noteSchema);
  const metadataDefinitionList = await MetadataDefinitionHelper.getMetadataDefinition(space);
  const response: any = {};
  for (let i = 0; i < metadataDefinitionList.length; i++) {
    const id = metadataDefinitionList[i]._id.toString();
    if (metadataDefinitionList[i].linkable) {
      response[id] = await model.find().distinct(id);
    }
  }

  return response;
};
