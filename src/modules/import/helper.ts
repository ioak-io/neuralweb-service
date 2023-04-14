const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { getGlobalCollection, getCollection } from "../../lib/dbutils";
var fs = require("fs");
import * as Papa from "papaparse";
import { format, parse } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import * as LogHelper from "./log/helper";
import * as NoteHelper from "../note/helper";
import * as NotelinkHelper from "../notelink/helper";

const refDate = new Date();

export const deleteTransaction = async (
  space: string,
  transactionId: string,
  userId: string
) => {
  await LogHelper.deleteLogByTransactionId(space, transactionId);
};

export const exportData = async (space: string, userId: string) => {
  const note = await NoteHelper.getNote(space);
  const notelink = await NotelinkHelper.getNotelink(space);

  const response = {
    note,
    notelink
  }

  return response;
};

export const transformExpenseDataForExport = (
  expenseList: any[],
  receiptMap: any,
  categoryMap: any
) => {
  return expenseList.map((item: any) => {
    return {
      type: "expense",
      category: categoryMap[item.category]?.name || "",
      kakeibo: categoryMap[item.category]?.kakeibo || "",
      date: item.billDate,
      description: item.description,
      amount: item.amount,
      billDescription: receiptMap[item.billId]?.description,
      billNumber: receiptMap[item.billId]?.number,
    };
  });
};

export const transformIncomeDataForExport = (
  incomeList: any[],
  categoryMap: any
) => {
  return incomeList.map((item: any) => {
    return {
      type: "income",
      category: categoryMap[item.category]?.name || "",
      date: item.billDate,
      description: item.description,
      amount: item.amount,
    };
  });
};

export const transformBudgetDataForExport = (
  budgetList: any[],
  categoryMap: any
) => {
  return budgetList.map((item: any) => {
    return {
      type: "budget",
      category: categoryMap[item.categoryId]?.name || "",
      kakeibo: categoryMap[item.categoryId]?.kakeibo || "",
      year: item.year,
      month: item.month,
      amount: item.amount,
    };
  });
};

export const importExpense = async (
  space: string,
  file: any,
  userId: string
) => {
  const content = Papa.parse(file.buffer.toString("utf8"), {
    quoteChar: '"',
    escapeChar: '"',
    delimiter: ",",
    header: true,
    newline: "\r\n",
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().replace(/"/g, ""),
  });

  const expenseContent = content.data.filter(
    (item: any) => !["income", "budget"].includes(item.type)
  );

  const incomeContent = content.data.filter(
    (item: any) => item.type === "income"
  );

  const budgetContent = content.data.filter(
    (item: any) => item.type === "budget"
  );

  const transactionId = uuidv4();

  // Processing for log
  const logResponse = await LogHelper.addLog(
    space,
    transactionId,
    new Date(),
  );

  return {
    log: {
      ...logResponse._doc,
      transactionDate: format(logResponse.transactionDate, "yyyy-MM-dd"),
    },
  };
};
