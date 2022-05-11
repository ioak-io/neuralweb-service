const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import {
  scheduleReceiptLogCollection,
  scheduleReceiptLogSchema,
} from "./model";
const { getCollection } = require("../../../../lib/dbutils");
import * as Helper from "./helper";
import { format } from "date-fns";

export const getLog = async (space: string, scheduleId: string) => {
  const model = getCollection(
    space,
    scheduleReceiptLogCollection,
    scheduleReceiptLogSchema
  );

  const response = await model
    .find({ scheduleId })
    .sort({ transactionDate: -1 });
  return response.map((record: any) => {
    return {
      ...record._doc,
      _id: record._id,
      transactionDate: format(record.transactionDate, "yyyy-MM-dd"),
      lineItems: record.lineItems,
      total: record.total,
      billId: record.billId,
      receiptId: record.receiptId,
    };
  });
};

export const addLog = async (
  space: string,
  scheduleId: string,
  transactionId: string,
  transactionDate: Date,
  lineItems: number,
  receiptId: string,
  total: number
) => {
  const model = getCollection(
    space,
    scheduleReceiptLogCollection,
    scheduleReceiptLogSchema
  );

  return await model.create({
    scheduleId,
    transactionId,
    transactionDate,
    lineItems,
    receiptId,
    total,
  });
};

export const deleteLogByTransactionId = async (
  space: string,
  scheduleId: string,
  transactionId: string
) => {
  const model = getCollection(
    space,
    scheduleReceiptLogCollection,
    scheduleReceiptLogSchema
  );

  return await model.remove({
    scheduleId,
    transactionId,
  });
};

export const deleteLogByScheduleId = async (
  space: string,
  scheduleId: string
) => {
  const model = getCollection(
    space,
    scheduleReceiptLogCollection,
    scheduleReceiptLogSchema
  );

  return await model.remove({
    scheduleId,
  });
};

export const deleteByScheduleIdAndTransactionDate = async (
  space: string,
  scheduleId: string,
  transactionDate: Date
) => {
  const model = getCollection(
    space,
    scheduleReceiptLogCollection,
    scheduleReceiptLogSchema
  );

  return await model.remove({
    scheduleId,
    transactionDate,
  });
};
