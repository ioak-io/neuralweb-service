const axios = require("axios");
import { intersection } from "lodash";
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import * as NoteHelper from "../note/helper";
import { isEmptyOrSpaces } from "../../lib/Utils";

const AI_API = process.env.AI_API || "http://localhost:5003/api";

export const train_similarity_model = async (space: string) => {
    await NoteHelper._ai_train(space);
    await NoteHelper._ai_populate(space);
};
