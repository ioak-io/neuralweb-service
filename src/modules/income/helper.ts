const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { incomeCollection, incomeSchema } from "./model";
const { getCollection } = require("../../lib/dbutils");
import * as Helper from "./helper";
import { isEmptyOrSpaces } from "../../lib/Utils";
import { format, parse } from "date-fns";

export const updateIncome = async (
  space: string,
  data: any,
  userId: string
) => {
  const model = getCollection(space, incomeCollection, incomeSchema);
  let res: any = {};
  if (data._id) {
    res = await model.findByIdAndUpdate(
      data._id,
      {
        ...data,
        billDate: new Date(
          parse(data.billDate, "yyyy-MM-dd", new Date()).getTime() +
            6 * 60 * 60 * 1000
        ),
      },
      { new: true, upsert: true }
    );
  } else {
    res = await model.create({
      ...data,
      billDate: new Date(
        parse(data.billDate, "yyyy-MM-dd", new Date()).getTime() +
          6 * 60 * 60 * 1000
      ),
      mode: "Manual",
    });
  }

  return {
    ...res._doc,
    billDate: format(res._doc.billDate, "yyyy-MM-dd"),
  };
};

export const getIncome = async (space: string) => {
  const model = getCollection(space, incomeCollection, incomeSchema);

  const response = await model.find();
  return response.map((record: any) => {
    return {
      ...record,
      _id: record._id,
      billDate: format(record.billDate, "yyyy-MM-dd"),
      category: record.category,
      description: record.description,
      amount: record.amount,
      billId: record.billId,
    };
  });
};

export const searchIncome = async (space: string, searchCriteria: any) => {
  const pageNo = searchCriteria.pagination?.pageNo || 0;
  const pageSize = searchCriteria.pagination?.pageSize || 10;
  const hasMore = searchCriteria.pagination?.hasMore;

  const sortCondition: any = {};
  if (searchCriteria.pagination?.sortBy) {
    sortCondition[searchCriteria.pagination?.sortBy] =
      searchCriteria.pagination?.sortOrder === "descending" ? -1 : 1;
  }

  if (searchCriteria.pagination?.sortBy !== "billDate") {
    sortCondition.billDate = "descending";
  }

  if (!hasMore) {
    return {
      results: [],
      pageNo,
      pageSize,
      hasMore,
    };
  }

  const model = getCollection(space, incomeCollection, incomeSchema);

  const _condition: any[] = _constructSearchCondition(searchCriteria);
  const response = await model
    .find(_condition.length > 0 ? { $and: _condition } : {})
    .collation({ locale: "en" })
    .sort(sortCondition)
    .skip(pageNo * pageSize)
    .limit(pageSize);

  return {
    results: response.map((record: any) => {
      return {
        ...record._doc,
        _id: record._id,
        billDate: format(record.billDate, "yyyy-MM-dd"),
        category: record.category,
        description: record.description,
        amount: record.amount,
        billId: record.billId,
      };
    }),
    pageNo: response.length === pageSize ? pageNo + 1 : pageNo,
    pageSize,
    hasMore: response.length === pageSize ? true : false,
  };
};

export const aggregateIncome = async (space: string, searchCriteria: any) => {
  const model = getCollection(space, incomeCollection, incomeSchema);

  const _condition: any[] = _constructSearchCondition(searchCriteria);
  const response = await model.aggregate([
    { $match: _condition.length > 0 ? { $and: _condition } : {} },
    { $group: { _id: "", total: { $sum: "$amount" } } },
  ]);

  return { total: response.length > 0 ? response[0].total : 0 };
};

const _constructSearchCondition = (searchCriteria: any) => {
  const _condition: any[] = [];
  if (!isEmptyOrSpaces(searchCriteria.description)) {
    _condition.push({ $text: { $search: searchCriteria.description } });
  }

  if (!isEmptyOrSpaces(searchCriteria.from)) {
    _condition.push({
      billDate: { $gte: parse(searchCriteria.from, "yyyy-MM-dd", new Date()) },
    });
  }

  if (!isEmptyOrSpaces(searchCriteria.to)) {
    let _toDate = parse(searchCriteria.to, "yyyy-MM-dd", new Date());
    _toDate = new Date(
      _toDate.getFullYear(),
      _toDate.getMonth(),
      _toDate.getDate(),
      23,
      59,
      59
    );
    _condition.push({ billDate: { $lte: _toDate } });
  }

  if (searchCriteria.days && searchCriteria.days !== 0) {
    let _fromDate = new Date(
      new Date().getTime() - (searchCriteria.days - 1) * 24 * 60 * 60 * 1000
    );
    _fromDate = new Date(
      _fromDate.getFullYear(),
      _fromDate.getMonth(),
      _fromDate.getDate(),
      0,
      0,
      0
    );
    _condition.push({
      billDate: {
        $gte: _fromDate,
      },
    });
  }

  if (searchCriteria.months && searchCriteria.months !== 0) {
    let _baseDate = new Date();
    _baseDate = new Date(
      _baseDate.setMonth(_baseDate.getMonth() - searchCriteria.months + 1)
    );
    let _fromDate = new Date(
      _baseDate.getFullYear(),
      _baseDate.getMonth(),
      1,
      0,
      0,
      0
    );

    _condition.push({
      billDate: {
        $gte: _getStartOfTheDay(_fromDate),
      },
    });
  }

  if (searchCriteria.monthNumber && searchCriteria.monthNumber !== 0) {
    let _baseDate = new Date();
    _baseDate = new Date(
      _baseDate.setMonth(_baseDate.getMonth() - searchCriteria.monthNumber + 1)
    );
    let _fromDate = new Date(
      _baseDate.getFullYear(),
      _baseDate.getMonth(),
      1,
      0,
      0,
      0
    );
    let _toDate = new Date(
      _baseDate.getFullYear(),
      _baseDate.getMonth(),
      31,
      23,
      59,
      59
    );

    _condition.push({
      $and: [
        {
          billDate: {
            $gte: _fromDate,
          },
        },
        {
          billDate: {
            $lte: _toDate,
          },
        },
      ],
    });
  }

  if (searchCriteria.yearNumber && searchCriteria.yearNumber !== 0) {
    let _fromDate = new Date();
    _fromDate = new Date(
      _fromDate.getFullYear() - searchCriteria.yearNumber + 1,
      0,
      1,
      0,
      0,
      0
    );

    let _toDate = new Date();
    _toDate = new Date(
      _toDate.getFullYear() - searchCriteria.yearNumber + 1,
      11,
      31,
      23,
      59,
      59
    );

    _condition.push({
      $and: [
        {
          billDate: {
            $gte: _fromDate,
          },
        },
        {
          billDate: {
            $lte: _toDate,
          },
        },
      ],
    });
  }

  if (searchCriteria.moreThan && searchCriteria.moreThan !== 0) {
    _condition.push({ amount: { $gte: searchCriteria.moreThan } });
  }

  if (searchCriteria.lessThan && searchCriteria.lessThan !== 0) {
    _condition.push({ amount: { $lte: searchCriteria.lessThan } });
  }

  if (
    searchCriteria.categoryIdList &&
    searchCriteria.categoryIdList.length > 0
  ) {
    _condition.push({ category: { $in: searchCriteria.categoryIdList } });
  }

  if (searchCriteria.tagIdList && searchCriteria.tagIdList.length > 0) {
    _condition.push({ tagId: { $in: searchCriteria.tagIdList } });
  }

  return _condition;
};

const _getStartOfTheDay = (_date: Date) => {
  return new Date(
    _date.getFullYear(),
    _date.getMonth(),
    _date.getDate(),
    0,
    0,
    0
  );
};

export const updateIncomeInBulk = async (space: string, data: any) => {
  const model = getCollection(space, incomeCollection, incomeSchema);
  return await model.insertMany(data);
};

export const deleteByScheduleId = async (space: string, scheduleId: string) => {
  const model = getCollection(space, incomeCollection, incomeSchema);
  return await model.remove({ scheduleId });
};

export const deleteByReceiptIdList = async (
  space: string,
  receiptIdList: string[]
) => {
  const model = getCollection(space, incomeCollection, incomeSchema);
  return await model.remove({ billId: { $in: receiptIdList } });
};
export const deleteByTransactionId = async (
  space: string,
  transactionId: string
) => {
  const model = getCollection(space, incomeCollection, incomeSchema);
  return await model.remove({ transactionId });
};

export const deleteByScheduleIdAndBillDate = async (
  space: string,
  scheduleId: string,
  billDate: Date
) => {
  const model = getCollection(space, incomeCollection, incomeSchema);
  return await model.remove({ scheduleId, billDate });
};

export const getUnmappedCategories = async (
  space: string,
  categoryList: any[]
) => {
  const model = getCollection(space, incomeCollection, incomeSchema);
  const res: string[] = [];

  for (let i = 0; i < categoryList.length; i++) {
    if (!(await model.exists({ category: categoryList[i]._id }))) {
      res.push(categoryList[i]._id);
    }
  }

  return res;
};

export const getUnmappedTags = async (space: string, tagList: any[]) => {
  const model = getCollection(space, incomeCollection, incomeSchema);
  const res: string[] = [];

  for (let i = 0; i < tagList.length; i++) {
    if ((await model.find({ tagId: tagList[i]._id + "" })).length === 0) {
      res.push(tagList[i]._id);
    }
  }

  return res;
};

export const getDuplicate = async (space: string, pagination: any) => {
  const pageNo = pagination?.pageNo || 0;
  const pageSize = pagination?.pageSize || 10;
  const hasMore = pagination?.hasMore;

  const sortCondition: any = {};
  if (pagination?.sortBy) {
    sortCondition[pagination?.sortBy] =
      pagination?.sortOrder === "descending" ? -1 : 1;
  }

  if (pagination?.sortBy !== "billDate") {
    sortCondition.billDate = "descending";
  }

  if (!hasMore) {
    return {
      results: [],
      pageNo,
      pageSize,
      hasMore,
    };
  }

  const model = getCollection(space, incomeCollection, incomeSchema);

  const response = await model
    .aggregate([
      {
        $group: {
          _id: {
            billDate: "$billDate",
            category: "$category",
            description: { $toLower: "$description" },
            amount: "$amount",
          },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
      { $sort: { count: -1 } },
    ])
    .skip(pageNo * pageSize)
    .limit(pageSize);

  return {
    results: response.map((record: any) => {
      return {
        ...record._id,
        // billDateString: format(record._id.billDate, "yyyy-MM-dd"),
        billDate: record._id.billDate,
        count: record.count,
      };
    }),
    pageNo: response.length === pageSize ? pageNo + 1 : pageNo,
    pageSize,
    hasMore: response.length === pageSize ? true : false,
  };
};

export const fixDuplicate = async (space: string, payload: any) => {
  const model = getCollection(space, incomeCollection, incomeSchema);

  const _receiptIdsToDelete: string[] = [];

  const _condition: any[] = [];

  payload.forEach((item: any) => {
    _condition.push({
      billDate: item.billDate,
      category: item.category,
      description: { $regex: new RegExp(item.description, "i") },
      amount: item.amount,
    });
  });

  const retainIdList: string[] = [];

  const duplicateRecords = await model
    .find({
      $or: _condition,
    })
    .sort({ createdAt: 1 });

  const deleteIdList: string[] = [];

  duplicateRecords.forEach((item: any) => {
    const key = `${item.billDate}--${
      item.category
    }--${item.description.toLowerCase()}--${item.amount}`;
    if (retainIdList.includes(key)) {
      deleteIdList.push(item._id);
    } else {
      retainIdList.push(key);
    }
  });

  await model.remove({ _id: { $in: deleteIdList } });

  return { deleteIdList };
};
