const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { getGlobalCollection, getCollection } from "../../lib/dbutils";
var fs = require("fs");
import * as Papa from "papaparse";
import { format, parse } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import * as CategoryHelper from "../category/helper";
import * as BudgetHelper from "../budget/helper";
import * as IncomeCategoryHelper from "../incomecategory/helper";
import * as ExpenseHelper from "../expense/helper";
import * as IncomeHelper from "../income/helper";
import * as ReceiptHelper from "../bill/helper";
import * as LogHelper from "./log/helper";
import { isEmptyOrSpaces } from "../../lib/Utils";

const refDate = new Date();

export const deleteTransaction = async (
  space: string,
  transactionId: string,
  userId: string
) => {
  await BudgetHelper.deleteByTransactionId(space, transactionId);
  await IncomeHelper.deleteByTransactionId(space, transactionId);
  await ExpenseHelper.deleteByTransactionId(space, transactionId);
  await ReceiptHelper.deleteByTransactionId(space, transactionId);
  await CategoryHelper.deleteByTransactionId(space, transactionId);
  await LogHelper.deleteLogByTransactionId(space, transactionId);
};

export const exportExpense = async (space: string, userId: string) => {
  const categoryMap = await _getCategoryIdMap(space);
  const incomeCategoryMap = await _getIncomeCategoryIdMap(space);
  const expenseList = await ExpenseHelper.getExpense(space);
  const receiptList = await ReceiptHelper.getBill(space);
  const incomeList = await IncomeHelper.getIncome(space);
  const budgetList = await BudgetHelper.getBudget(space);
  const receiptMap: any = {};
  receiptList.forEach((item: any) => {
    receiptMap[item._id] = item;
  });

  const expenseRes = transformExpenseDataForExport(
    expenseList,
    receiptMap,
    categoryMap
  );

  const incomeRes = transformIncomeDataForExport(incomeList, incomeCategoryMap);

  const budgetRes = transformBudgetDataForExport(budgetList, categoryMap);

  const res = [...expenseRes, ...incomeRes, ...budgetRes];

  const csv = Papa.unparse({
    data: res,
    fields: [
      "type",
      "category",
      "kakeibo",
      "date",
      "year",
      "month",
      "description",
      "amount",
      "tag",
      "billDescription",
      "billNumber",
    ],
  });

  return csv;
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
  const categoryMap = await _getCategoryMap(space);
  const incomeCategoryMap = await _getIncomeCategoryMap(space);

  // Expense data processing
  const lineItemsPayload = await _getTransformedPayload(
    space,
    expenseContent,
    categoryMap,
    transactionId
  );
  const [receiptResponse, lineItemsPayloadTransformed] = await _createReceipts(
    space,
    lineItemsPayload,
    expenseContent,
    transactionId
  );
  const expenseResponse = await ExpenseHelper.updateExpenseInBulk(
    space,
    lineItemsPayloadTransformed
  );

  let _total = 0;

  expenseResponse.forEach((item: any) => {
    _total += item.amount;
  });

  let _receiptTotal = 0;

  Object.values(receiptResponse).forEach((item: any) => {
    _receiptTotal += item.total;
  });

  let newCategoryMap = await _getCategoryMap(space);

  // Income data processing
  const incomeItemsPayload = await _getTransformedIncomePayload(
    space,
    incomeContent,
    incomeCategoryMap,
    transactionId
  );
  const incomeResponse = await IncomeHelper.updateIncomeInBulk(
    space,
    incomeItemsPayload
  );

  let _incomeTotal = 0;

  incomeResponse.forEach((item: any) => {
    _incomeTotal += item.amount;
  });

  const newIncomeCategoryMap = await _getIncomeCategoryMap(space);

  // Budget data processing
  const budgetItemsPayload = await _getTransformedBudgetPayload(
    space,
    budgetContent,
    newCategoryMap,
    transactionId
  );
  const budgetResponse = await BudgetHelper.updateBudgetInBulk(
    space,
    budgetItemsPayload
  );

  let _budgetTotal: number = 0;

  budgetItemsPayload.forEach((item: any) => {
    _budgetTotal += parseInt(item.amount);
  });

  newCategoryMap = await _getCategoryMap(space);

  // Processing for log
  const logResponse = await LogHelper.addLog(
    space,
    transactionId,
    new Date(),
    lineItemsPayloadTransformed.length,
    _total,
    incomeItemsPayload.length,
    _incomeTotal,
    Object.values(receiptResponse).length,
    _receiptTotal,
    Object.values(budgetResponse).length,
    _budgetTotal,
    Object.keys(newCategoryMap).length - Object.keys(categoryMap).length,
    Object.keys(newIncomeCategoryMap).length -
      Object.keys(incomeCategoryMap).length
  );

  return {
    receipt: Object.values(receiptResponse),
    expenseRecords: expenseResponse,
    incomeRecords: incomeResponse,
    log: {
      ...logResponse._doc,
      transactionDate: format(logResponse.transactionDate, "yyyy-MM-dd"),
    },
  };
};

const _getCategoryMap = async (space: string) => {
  const categories = await CategoryHelper.getCategory(space);
  const _categoryMap: any = {};
  categories.forEach((item: any) => {
    _categoryMap[item.name.toLowerCase()] = item._id;
  });
  return _categoryMap;
};

const _getIncomeCategoryMap = async (space: string) => {
  const categories = await IncomeCategoryHelper.getIncomeCategory(space);
  const _categoryMap: any = {};
  categories.forEach((item: any) => {
    _categoryMap[item.name.toLowerCase()] = item._id;
  });
  return _categoryMap;
};

const _getCategoryIdMap = async (space: string) => {
  const categories = await CategoryHelper.getCategory(space);
  const _categoryMap: any = {};
  categories.forEach((item: any) => {
    _categoryMap[item._id] = item;
  });
  return _categoryMap;
};

const _getIncomeCategoryIdMap = async (space: string) => {
  const categories = await IncomeCategoryHelper.getIncomeCategory(space);
  const _categoryMap: any = {};
  categories.forEach((item: any) => {
    _categoryMap[item._id] = item;
  });
  return _categoryMap;
};

const _createReceipts = async (
  space: string,
  lineItemsPayload: any[],
  csvData: any[],
  transactionId: string
) => {
  const lineItemsPayloadTransformed = [...lineItemsPayload];
  const receiptMap: any = {};
  for (let i = 0; i < csvData.length; i++) {
    const csvRecord = csvData[i];
    if (!isEmptyOrSpaces(csvRecord.billNumber)) {
      const receiptKey = `${csvRecord.billNumber}-${csvRecord.date}`;
      if (receiptMap[receiptKey]) {
        receiptMap[receiptKey].total =
          receiptMap[receiptKey].total + parseInt(csvRecord.amount);
      } else {
        receiptMap[receiptKey] = {
          billDate: new Date(
            parse(csvRecord.date, "yyyy-MM-dd", refDate).getTime() +
              6 * 60 * 60 * 1000
          ),
          number: csvRecord.billNumber,
          total: parseInt(csvRecord.amount),
          description: csvRecord.billDescription,
          transactionId,
          mode: "import",
        };
      }
    }
  }

  for (const [key, value] of Object.entries(receiptMap)) {
    const receipt = await ReceiptHelper.addBill(space, value);
    receiptMap[key] = receipt;
  }

  for (let i = 0; i < csvData.length; i++) {
    const lineItem = lineItemsPayloadTransformed[i];
    const csvRecord = csvData[i];
    if (!isEmptyOrSpaces(csvRecord.billNumber)) {
      const receiptKey = `${csvRecord.billNumber}-${csvRecord.date}`;
      lineItem.billId = receiptMap[receiptKey]?._id;
    }
    lineItem.transactionId = transactionId;
    lineItem.mode = "import";
  }

  return [receiptMap, lineItemsPayloadTransformed];
};

const _getTransformedPayload = async (
  space: string,
  data: any[],
  categoryMap: any,
  transactionId: string
) => {
  const res: any = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    categoryMap = await _createNewCategoryIfItDoesNotExist(
      space,
      categoryMap,
      item.category,
      item.kakeibo,
      transactionId
    );
    res.push({
      description: item.description,
      amount: item.amount,
      billDate: new Date(
        parse(item.date, "yyyy-MM-dd", refDate).getTime() + 6 * 60 * 60 * 1000
      ),
      category: categoryMap[item.category.toLowerCase()],
    });
  }

  return res;
};

const _getTransformedIncomePayload = async (
  space: string,
  data: any[],
  categoryMap: any,
  transactionId: string
) => {
  const res: any = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    categoryMap = await _createNewIncomeCategoryIfItDoesNotExist(
      space,
      categoryMap,
      item.category,
      transactionId
    );

    res.push({
      description: item.description,
      amount: item.amount,
      billDate: new Date(
        parse(item.date, "yyyy-MM-dd", refDate).getTime() + 6 * 60 * 60 * 1000
      ),
      category: categoryMap[item.category.toLowerCase()],
      mode: "import",
      transactionId,
    });
  }

  return res;
};

const _getTransformedBudgetPayload = async (
  space: string,
  data: any[],
  categoryMap: any,
  transactionId: string
) => {
  const res: any = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    categoryMap = await _createNewCategoryIfItDoesNotExist(
      space,
      categoryMap,
      item.category,
      item.kakeibo,
      transactionId
    );

    res.push({
      amount: item.amount,
      year: item.year,
      month: item.month,
      categoryId: categoryMap[item.category.toLowerCase()],
      mode: "import",
      transactionId,
    });
  }

  return res;
};

const _createNewCategoryIfItDoesNotExist = async (
  space: string,
  categoryMap: any,
  categoryName: string,
  kakeibo: string,
  transactionId: string
) => {
  let matchingCategoryId = categoryMap[categoryName.toLowerCase()];
  if (matchingCategoryId) {
    return categoryMap;
  }
  const _categoryMap = { ...categoryMap };
  if (!matchingCategoryId) {
    _categoryMap[categoryName.toLowerCase()] = (
      await CategoryHelper.updateCategory(space, {
        name: categoryName,
        transactionId,
        kakeibo,
      })
    )?._id;
  }

  return _categoryMap;
};

const _createNewIncomeCategoryIfItDoesNotExist = async (
  space: string,
  categoryMap: any,
  categoryName: string,
  transactionId: string
) => {
  let matchingCategoryId = categoryMap[categoryName.toLowerCase()];
  if (matchingCategoryId) {
    return categoryMap;
  }
  const _categoryMap = { ...categoryMap };
  if (!matchingCategoryId) {
    _categoryMap[categoryName.toLowerCase()] = (
      await IncomeCategoryHelper.updateIncomeCategory(space, {
        name: categoryName,
        transactionId,
      })
    )?._id;
  }

  return _categoryMap;
};
