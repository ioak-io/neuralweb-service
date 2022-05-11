const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { scheduleReceiptCollection, scheduleReceiptSchema } from "./model";
const { getCollection } = require("../../../lib/dbutils");
import * as ReceiptHelper from "../../bill/helper";
import * as ExpenseHelper from "../../expense/helper";
import * as LogHelper from "./log/helper";
import { parse } from "date-fns";
import { v4 as uuidv4 } from "uuid";

export const updateScheduleReceipt = async (
  space: string,
  data: any,
  userId: string
) => {
  const model = getCollection(
    space,
    scheduleReceiptCollection,
    scheduleReceiptSchema
  );
  if (data._id) {
    const response = await model.findByIdAndUpdate(
      data._id,
      {
        ...data,
      },
      { new: true, upsert: true }
    );
    return response;
  }

  return await model.create(data);
};

export const getScheduleReceipt = async (space: string) => {
  const model = getCollection(
    space,
    scheduleReceiptCollection,
    scheduleReceiptSchema
  );

  return await model.find();
};

export const getScheduleReceiptById = async (space: string, id: string) => {
  const model = getCollection(
    space,
    scheduleReceiptCollection,
    scheduleReceiptSchema
  );

  return await model.findOne({ _id: id });
};

export const deleteTransaction = async (space: string, id: string) => {
  await ExpenseHelper.deleteByScheduleId(space, id);
  await ReceiptHelper.deleteByScheduleId(space, id);
  await LogHelper.deleteLogByScheduleId(space, id);
};

export const runTransaction = async (space: string, id: string) => {
  const model = getCollection(
    space,
    scheduleReceiptCollection,
    scheduleReceiptSchema
  );

  const schedule = await model.findOne({ _id: id });
  if (!schedule) {
    return {};
  }

  const from = parse(schedule.from, "yyyy-MM-dd", new Date());
  let to = parse(schedule.to, "yyyy-MM-dd", new Date());
  if (to > new Date()) {
    to = new Date();
  }

  let currentRef = new Date(from.getTime());

  await ExpenseHelper.deleteByScheduleId(space, schedule._id);
  await ReceiptHelper.deleteByScheduleId(space, schedule._id);
  await LogHelper.deleteLogByScheduleId(space, schedule._id);

  while (currentRef <= to) {
    await executeSchedule(space, schedule, currentRef);

    currentRef = new Date(currentRef.getTime() + 24 * 60 * 60 * 1000);
  }

  return await LogHelper.getLog(space, schedule._id);
};

export const executeSchedule = async (
  space: string,
  schedule: any,
  dateRef: Date
) => {
  const dayInMonth = dateRef.getDate();
  const monthInYear = dateRef.getMonth() + 1;
  const dayInWeek = getDayInWeek(dateRef);

  if (!shouldItRun(schedule, dayInWeek, dayInMonth, monthInYear)) {
    return;
  }

  await postTransaction(
    space,
    schedule,
    new Date(dateRef.getTime() + 6 * 60 * 60 * 1000)
  );
};

const deleteAndPostTransaction = async (
  space: string,
  schedule: any,
  dateRef: Date
) => {
  await ExpenseHelper.deleteByScheduleIdAndBillDate(
    space,
    schedule._id,
    dateRef
  );
  await ReceiptHelper.deleteByScheduleIdAndBillDate(
    space,
    schedule._id,
    dateRef
  );
  await LogHelper.deleteByScheduleIdAndTransactionDate(
    space,
    schedule._id,
    dateRef
  );
  return await postTransaction(space, schedule, dateRef);
};

const postTransaction = async (space: string, schedule: any, dateRef: Date) => {
  const transactionId = uuidv4();
  const receipt = await postTransactionReceipt(
    space,
    transactionId,
    schedule,
    dateRef
  );
  await postTransactionLineItems(
    space,
    receipt?._id,
    transactionId,
    schedule,
    dateRef
  );
  await LogHelper.addLog(
    space,
    schedule._id,
    transactionId,
    dateRef,
    schedule.items.length,
    receipt._id,
    schedule.total
  );
};

const postTransactionLineItems = async (
  space: string,
  billId: string,
  transactionId: string,
  schedule: any,
  dateRef: Date
) => {
  const lineItems = schedule.items.map((item: any) => {
    return {
      billDate: dateRef,
      category: item.category,
      description: item.description,
      tagId: item.tagId,
      amount: item.amount,
      billId,
      scheduleId: schedule._id,
      transactionId,
      mode: "Schedule",
    };
  });
  const response = await ExpenseHelper.updateExpenseInBulk(space, lineItems);
};

const postTransactionReceipt = async (
  space: string,
  transactionId: string,
  schedule: any,
  dateRef: Date
) => {
  return await ReceiptHelper.addBill(space, {
    billDate: dateRef,
    number: null,
    total: schedule.total,
    description: schedule.description,
    scheduleId: schedule._id,
    transactionId,
    mode: "Schedule",
  });
};

const shouldItRun = (
  schedule: any,
  dayInWeek: string,
  dayInMonth: number,
  monthInYear: number
) => {
  switch (schedule.recurrence) {
    case "Weekly":
      return schedule.daysInWeek.includes(dayInWeek);
    case "Monthly":
      return schedule.daysInMonth.includes(dayInMonth);
    case "Yearly":
      return (
        schedule.daysInMonth.includes(dayInMonth) &&
        schedule.monthsInYear.includes(monthInYear)
      );

    default:
      break;
  }
};

const getDayInWeek = (dateRef: Date) => {
  let res = "";
  switch (dateRef.getDay()) {
    case 0:
      res = "Sunday";
      break;
    case 1:
      res = "Monday";
      break;
    case 2:
      res = "Tuesday";
      break;
    case 3:
      res = "Wednesday";
      break;
    case 4:
      res = "Thursday";
      break;
    case 5:
      res = "Friday";
      break;
    case 6:
      res = "Saturday";
      break;

    default:
      break;
  }

  return res;
};
