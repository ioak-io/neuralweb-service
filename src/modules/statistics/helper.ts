const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { differenceInMonths, format, parse } from "date-fns";
import { getCollection } from "../../lib/dbutils";
import { expenseCollection, expenseSchema } from "../expense/model";
import { budgetCollection, budgetSchema } from "../budget/model";
import { categoryCollection, categorySchema } from "../category/model";
import { incomeCollection, incomeSchema } from "../income/model";
import * as ExpenseHelper from "../expense/helper";
import * as AccountHelper from "../account/helper";
import * as AccountScopeHelper from "../account/scope/helper";

const refDate = new Date();

export const getMetric = async (
  space: string,
  searchCriteria: any,
  trendData: any
) => {
  const minN = 10;
  const maxN = 16;
  const model = getCollection(space, expenseCollection, expenseSchema);

  const { filter, filterCondition, fromDate, toDate } = await _getDateRange(
    space,
    searchCriteria
  );

  const total: number = trendData?.categoryDistribution?.total || 0;

  const top50SpendResponse = await model
    .find({ $and: filterCondition })
    .sort({ amount: -1 })
    .limit(50);
  const topSpend: any[] = [];
  let top50SpendTotal = 0;
  let top25SpendTotal = 0;
  let top10SpendTotal = 0;
  let top5SpendTotal = 0;
  let top1SpendTotal = 0;
  const topNSpendData: any[] = [];
  const topNSpendPercent: number[] = [];
  let totalPercentSoFar = 0;
  top50SpendResponse.forEach((item: any, index: number) => {
    top50SpendTotal += item.amount;
    if (index < 1) {
      top1SpendTotal += item.amount;
    }
    if (index < 5) {
      top5SpendTotal += item.amount;
    }
    if (index < minN || (totalPercentSoFar < 50 && index < maxN)) {
      top10SpendTotal += item.amount;
      topNSpendData.push({
        ...item._doc,
        billDate: format(item.billDate, "yyyy-MM-dd"),
      });
      totalPercentSoFar += Math.round((item.amount * 100 * 10) / total) / 10;
      topNSpendPercent.push(Math.round((item.amount * 100 * 10) / total) / 10);
    }
    if (index < 25) {
      top25SpendTotal += item.amount;
    }
  });

  topSpend.push({
    label: "Top spend",
    data: top1SpendTotal,
    percent: Math.round((top1SpendTotal * 100 * 10) / total) / 10,
  });

  if (top1SpendTotal < total) {
    topSpend.push({
      label: "Top 5 spends",
      data: top5SpendTotal,
      percent: Math.round((top5SpendTotal * 100 * 10) / total) / 10,
    });
  }

  if (top5SpendTotal < total) {
    topSpend.push({
      label: "Top 10 spends",
      data: top10SpendTotal,
      percent: Math.round((top10SpendTotal * 100 * 10) / total) / 10,
    });
  }

  if (top10SpendTotal < total) {
    topSpend.push({
      label: "Top 25 spends",
      data: top25SpendTotal,
      percent: Math.round((top25SpendTotal * 100 * 10) / total) / 10,
    });
  }

  if (top25SpendTotal < total) {
    topSpend.push({
      label: "Top 50 spends",
      data: top50SpendTotal,
      percent: Math.round((top50SpendTotal * 100 * 10) / total) / 10,
    });
  }

  topSpend.push({
    label: "All spends",
    data: total,
    percent: 100,
  });

  const topMonthResponse = await model
    .aggregate([
      {
        $match: {
          $and: filterCondition,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$billDate" },
            month: { $month: "$billDate" },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ])
    .limit(6);

  const topMonth: any[] = [];
  topMonthResponse.forEach((item: any) => {
    topMonth.push({
      label: format(
        parse(`${item._id.year}-${item._id.month}-2`, "yyyy-M-d", refDate),
        "MMM yyyy"
      ),
      data: item.total,
      percent: Math.round((item.total * 100 * 10) / total) / 10,
    });
  });

  return {
    topSpend,
    topSpendList: {
      data: topNSpendData,
      percent: topNSpendPercent,
    },
    topMonth,
  };
};

export const getTrend = async (space: string, searchCriteria: any) => {
  const model = getCollection(space, expenseCollection, expenseSchema);

  const { filter, filterCondition, fromDate, toDate } = await _getDateRange(
    space,
    searchCriteria
  );

  const response = await model.aggregate([
    {
      $match: {
        $and: filterCondition,
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$billDate" },
          month: { $month: "$billDate" },
          category: "$category",
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
  ]);

  const trendResponse = await _constructTrendResponse(
    space,
    filter,
    response,
    fromDate,
    toDate
  );

  const metricResponse = await getMetric(space, searchCriteria, trendResponse);

  return {
    ...trendResponse,
    metric: metricResponse,
  };
};

const _getDateRange = async (
  space: string,
  searchCriteria: any,
  dateInsensitive?: boolean
) => {
  if (searchCriteria.option === "custom") {
    const fromDate = parse(searchCriteria.from, "yyyy-MM", refDate);
    let toDate = parse(searchCriteria.to, "yyyy-MM", refDate);
    toDate = new Date(toDate.getFullYear(), toDate.getMonth() + 1, 1);

    return {
      filter: null,
      filterCondition: dateInsensitive
        ? []
        : [{ billDate: { $gte: fromDate } }, { billDate: { $lte: toDate } }],
      fromDate,
      toDate,
    };
  }
  return {
    filter: null,
    filterCondition: null,
    fromDate: new Date(),
    toDate: new Date(),
  };
};

export const getWeeklyTrend = async (space: string, searchCriteria: any) => {
  const { filterCondition, fromDate, toDate } = await _getDateRange(
    space,
    searchCriteria
  );

  const model = getCollection(space, expenseCollection, expenseSchema);

  const response = await model.aggregate([
    {
      $match: {
        $and: filterCondition,
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$billDate" },
          month: { $month: "$billDate" },
          day: { $dayOfMonth: "$billDate" },
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  const total: number[] = [0, 0, 0, 0];
  const count: number[] = [0, 0, 0, 0];
  const average: number[] = [0, 0, 0, 0];
  const label: string[] = ["Week 1", "Week 2", "Week 3", "Week 4"];

  const monthsWithData: string[] = [];

  const yearLabel: number[] = [];
  const yearTotal: number[] = [];
  const yearCount: number[] = [];

  response.forEach((item: any) => {
    if (!monthsWithData.includes(`${item._id.year}-${item._id.month}`)) {
      monthsWithData.push(`${item._id.year}-${item._id.month}`);
    }
    if (item._id.day <= 7) {
      total[0] += item.total;
      count[0] += item.count;
    } else if (item._id.day <= 14) {
      total[1] += item.total;
      count[1] += item.count;
    } else if (item._id.day <= 21) {
      total[2] += item.total;
      count[2] += item.count;
    } else {
      total[3] += item.total;
      count[3] += item.count;
    }

    if (yearLabel.includes(item._id.year)) {
      yearTotal[yearLabel.length - 1] += item.total;
      yearCount[yearLabel.length - 1] += item.count;
    } else {
      yearTotal.push(item.total);
      yearCount.push(item.count);
      yearLabel.push(item._id.year);
    }
  });

  if (monthsWithData.length > 0) {
    for (let i = 0; i < 4; i++) {
      average[i] = Math.round(total[i] / monthsWithData.length);
    }
  }

  return { total, count, average, label };
};

export const getYearlyTrend = async (space: string, searchCriteria: any) => {
  const { filterCondition, fromDate, toDate } = await _getDateRange(
    space,
    searchCriteria,
    true
  );

  if (!filterCondition) {
    return {};
  }

  const model = getCollection(space, expenseCollection, expenseSchema);

  const aggregateStages: any = [];

  if (filterCondition?.length > 0) {
    aggregateStages.push({
      $match: {
        $and: filterCondition,
      },
    });
  }
  aggregateStages.push({
    $group: {
      _id: {
        year: { $year: "$billDate" },
      },
      total: { $sum: "$amount" },
      count: { $sum: 1 },
    },
  });
  aggregateStages.push({ $sort: { "_id.year": 1 } });

  const response = await model.aggregate(aggregateStages);

  const label: number[] = [];
  const total: number[] = [];
  const count: number[] = [];
  response.forEach((item: any, index: number) => {
    if (index > 0 && label[index - 1] !== item._id.year - 1) {
      for (let i = label[index - 1] + 1; i < item._id.year; i++) {
        label.push(i);
        total.push(0);
        count.push(0);
      }
    }
    label.push(item._id.year);
    total.push(item.total);
    count.push(item.count);
  });

  return { label, total, count };
};

export const getBalanceTrend = async (space: string, searchCriteria: any) => {
  const res: any[] = [];
  const accounts = await AccountHelper.getAccount(space);
  const accountScope = await AccountScopeHelper.getAccountScope(space);
  let accountsOpeningTotal = 0;
  let accountsClosingTotal = 0;
  accounts.forEach((item: any) => {
    if (item.type === "credit") {
      accountsOpeningTotal -= item.opening;
      accountsClosingTotal -= item.closing;
    } else {
      accountsOpeningTotal += item.opening;
      accountsClosingTotal += item.closing;
    }
  });
  res.push({
    label: "Opening balance",
    data: accountsOpeningTotal,
  });
  res.push({
    label: "Closing balance",
    data: accountsClosingTotal,
  });

  let _baseDate = new Date();
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

  if (accountScope.scope === "This year") {
    _fromDate = new Date(_baseDate.getFullYear(), 0, 1, 0, 0, 0);
    _toDate = new Date(_baseDate.getFullYear(), 11, 31, 23, 59, 59);
  }

  if (accountScope.scope === "Last year") {
    _fromDate = new Date(_baseDate.getFullYear() - 1, 0, 1, 0, 0, 0);
    _toDate = new Date(_baseDate.getFullYear() - 1, 11, 31, 23, 59, 59);
  }

  if (accountScope.scope === "Last month") {
    _fromDate = new Date(
      _baseDate.getFullYear(),
      _baseDate.getMonth() - 1,
      1,
      0,
      0,
      0
    );
    _toDate = new Date(
      _baseDate.getFullYear(),
      _baseDate.getMonth() - 1,
      31,
      23,
      59,
      59
    );
  }

  if (accountScope.scope === "Custom") {
    _fromDate = parse(accountScope.from, "yyyy-MM-dd", _baseDate);
    _fromDate = new Date(
      _baseDate.getFullYear(),
      _baseDate.getMonth(),
      1,
      0,
      0,
      0
    );
    _toDate = parse(accountScope.to, "yyyy-MM-dd", _baseDate);
    _toDate = new Date(
      _baseDate.getFullYear(),
      _baseDate.getMonth(),
      31,
      23,
      59,
      59
    );
  }
  const model = getCollection(space, expenseCollection, expenseSchema);
  const expenseRes = await model.aggregate([
    {
      $match: {
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
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  const expenseTotal = expenseRes?.length > 0 ? expenseRes[0].total : 0;

  res.push({
    label: "Accounted spend",
    data: expenseTotal,
  });
  res.push({
    label: "Unaccounted spend",
    data: accountsOpeningTotal - accountsClosingTotal - expenseTotal,
  });
  res.push({
    label: "Total spend",
    data: accountsOpeningTotal - accountsClosingTotal,
  });

  return res;
};

export const getIncomeTrend = async (space: string, from: Date, to: Date) => {
  const model = getCollection(space, incomeCollection, incomeSchema);

  const response = await model.aggregate([
    {
      $match: {
        $and: [{ billDate: { $gte: from } }, { billDate: { $lte: to } }],
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$billDate" },
          month: { $month: "$billDate" },
          category: "$category",
        },
        total: { $sum: "$amount" },
      },
    },
  ]);

  return await _constructMonthSeriesResponse(response, from, to);
};

export const getBudgetTrend = async (
  space: string,
  filter: any,
  from: Date,
  to: Date
) => {
  const model = getCollection(space, budgetCollection, budgetSchema);

  const condition: any = [
    { year: { $gte: parseInt(format(from, "yyyy")) } },
    { month: { $gte: parseInt(format(from, "M")) } },
    { year: { $lte: parseInt(format(to, "yyyy")) } },
    { month: { $lte: parseInt(format(to, "M")) } },
  ];

  if (filter && filter.categoryIdList && filter.categoryIdList.length > 0) {
    condition.push({ categoryId: { $in: filter.categoryIdList } });
  }

  const response = await model.aggregate([
    {
      $match: {
        $and: condition,
      },
    },
    {
      $group: {
        _id: {
          year: "$year",
          month: "$month",
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
  ]);

  const res = _constructMonthSeriesResponse(response, from, to);
  return { budget: res?.data, label: res?.label };
};

const _constructMonthSeriesResponse = (
  payload: any[],
  from: Date,
  to: Date
) => {
  const data: number[] = [];
  const label: Date[] = [];

  const fromYear = parseInt(format(from, "yyyy"));
  const toYear = parseInt(format(to, "yyyy"));
  const fromMonth = parseInt(format(from, "M"));
  // const toMonth = parseInt(format(to, "M")) - 1;
  const toMonth = parseInt(
    format(new Date(to.getTime() - 8 * 60 * 60 * 1000), "M")
  );

  let indexYear = fromYear;
  let indexMonth = fromMonth;

  const dataMap: any = {};

  payload.forEach((item: any) => {
    dataMap[`${item._id.year}-${item._id.month}`] = item.total;
  });

  while (indexYear <= toYear) {
    while (
      (indexYear < toYear && indexMonth <= 12) ||
      (indexYear === toYear && indexMonth <= toMonth)
    ) {
      const key = `${indexYear}-${indexMonth}`;
      label.push(parse(key, "yyyy-M", refDate));
      data.push(dataMap[key] || 0);
      indexMonth += 1;
    }
    indexMonth = 1;
    indexYear += 1;
  }

  return { data, label };
};

const _constructTrendResponse = async (
  space: string,
  filter: any,
  payload: any[],
  from: Date,
  to: Date
) => {
  const categoryDistributionMonthlyData: any = {};
  const categoryDistributionData: number[] = [];
  const categoryDistributionCount: number[] = [];
  const categoryDistributionPercent: number[] = [];
  let categoryDistributionTotal = 0;
  let categoryDistributionTotalCount = 0;
  const totalDistributionData: number[] = [];
  const totalChangeDistributionDataIncrease: number[] = [];
  const totalChangeDistributionDataDecrease: number[] = [];

  const kakeiboDistributionMonthlyData: any = {
    Needs: [],
    Wants: [],
    Culture: [],
    Unexpected: [],
  };
  const kakeiboDistributionData: number[] = [0, 0, 0, 0];
  const kakeiboDistributionCount: number[] = [0, 0, 0, 0];
  const kakeiboDistributionPercent: number[] = [0, 0, 0, 0];

  const topNCategories = 10;

  const label: Date[] = [];

  const fromYear = parseInt(format(from, "yyyy"));
  const toYear = parseInt(format(to, "yyyy"));
  const fromMonth = parseInt(format(from, "M"));
  // let toMonth = parseInt(format(to, "M")) - 1;
  const toMonth = parseInt(
    format(new Date(to.getTime() - 8 * 60 * 60 * 1000), "M")
  );

  let indexYear = fromYear;
  let indexMonth = fromMonth;
  let indexCategory = 0;

  const dataMap: any = {};
  let categoryStat: any = {};
  let categoryCountStat: any = {};
  let dataCountMap: any = {};

  const categoryIdToKakeiboMap = await _getCategoryIdToKakeiboMap(space);

  payload.forEach((item: any) => {
    if (!dataMap[item._id.category]) {
      dataMap[item._id.category] = {};
      dataCountMap[item._id.category] = {};
    }
    dataMap[item._id.category][`${item._id.year}-${item._id.month}`] =
      item.total;
    dataCountMap[item._id.category][`${item._id.year}-${item._id.month}`] =
      item.total;
    categoryStat[item._id.category] =
      (categoryStat[item._id.category] || 0) + item.total;
    categoryCountStat[item._id.category] =
      (categoryCountStat[item._id.category] || 0) + item.count;
    categoryDistributionTotal += item.total;
    categoryDistributionTotalCount += item.count;
  });

  const categoryStatKeys = Object.keys(categoryStat).sort(function (a, b) {
    return categoryStat[b] - categoryStat[a];
  });

  while (indexCategory < Object.keys(categoryStat).length) {
    const categoryId = categoryStatKeys[indexCategory];
    const kakeiboId = categoryId
      ? categoryIdToKakeiboMap[categoryId]
      : "Unknown";
    categoryDistributionMonthlyData[categoryId] = [];
    kakeiboDistributionMonthlyData[kakeiboId] = [];
    let index = 0;
    while (indexYear <= toYear) {
      while (
        (indexYear < toYear && indexMonth <= 12) ||
        (indexYear === toYear && indexMonth <= toMonth)
      ) {
        const key = `${indexYear}-${indexMonth}`;
        if (indexCategory === 0) {
          label.push(parse(key, "yyyy-M", refDate));
          totalDistributionData.push(0);
        }
        categoryDistributionMonthlyData[categoryId].push(
          dataMap[categoryId][key] || 0
        );

        totalDistributionData[index] =
          totalDistributionData[index] + (dataMap[categoryId][key] || 0);

        index += 1;
        indexMonth += 1;
      }
      indexMonth = 1;
      indexYear += 1;
    }
    indexCategory += 1;
    indexYear = fromYear;
    indexMonth = fromMonth;
  }

  categoryStatKeys.forEach((key: any) => {
    const total = categoryStat[key];
    const count = categoryCountStat[key];
    categoryDistributionCount.push(count);
    categoryDistributionData.push(total);

    let kakeiboIndex = 0;
    switch (categoryIdToKakeiboMap[key]) {
      case "Wants":
        kakeiboIndex = 1;
        break;
      case "Culture":
        kakeiboIndex = 2;
        break;
      case "Unexpected":
        kakeiboIndex = 3;
        break;

      default:
        break;
    }

    kakeiboDistributionCount[kakeiboIndex] += count;
    kakeiboDistributionData[kakeiboIndex] += total;

    if (categoryDistributionTotal === 0) {
      categoryDistributionPercent.push(0);
    } else {
      categoryDistributionPercent.push(
        Math.round((total * 100 * 10) / categoryDistributionTotal) / 10
      );
    }

    const categoryDistributionMonthlyDataList =
      categoryDistributionMonthlyData[key];
    for (let i = 0; i < categoryDistributionMonthlyDataList.length; i++) {
      if (!kakeiboDistributionMonthlyData[categoryIdToKakeiboMap[key]][i]) {
        kakeiboDistributionMonthlyData[categoryIdToKakeiboMap[key]].push(0);
      }
      kakeiboDistributionMonthlyData[categoryIdToKakeiboMap[key]][i] +=
        categoryDistributionMonthlyDataList[i];
    }
  });

  ["Needs", "Wants", "Culture", "Unexpected"].forEach(
    (item: string, index: number) => {
      if (categoryDistributionTotal !== 0) {
        kakeiboDistributionPercent[index] =
          Math.round(
            (kakeiboDistributionData[index] * 100 * 10) /
              categoryDistributionTotal
          ) / 10;
      }
    }
  );

  for (let i = 0; i < totalDistributionData.length; i++) {
    let change = 0;
    if (i !== 0) {
      if (totalDistributionData[i - 1] !== 0) {
        change = Math.round(
          ((totalDistributionData[i] - totalDistributionData[i - 1]) * 100) /
            totalDistributionData[i - 1]
        );
        change = totalDistributionData[i] - totalDistributionData[i - 1];
      }

      if (totalDistributionData[i - 1] === 0) {
        change = totalDistributionData[i];
      }
      if (totalDistributionData[i] === 0) {
        change = 0 - totalDistributionData[i - 1];
      }
    }
    if (change > 0) {
      totalChangeDistributionDataIncrease.push(change);
      totalChangeDistributionDataDecrease.push(0);
    } else {
      totalChangeDistributionDataDecrease.push(change);
      totalChangeDistributionDataIncrease.push(0);
    }
  }

  const categoryDistributionMonthly = {
    data: categoryDistributionMonthlyData,
    label,
    category: categoryStatKeys,
  };

  const kakeiboDistributionMonthly = {
    data: kakeiboDistributionMonthlyData,
    label,
    kakeibo: ["Needs", "Wants", "Culture", "Unexpected"],
  };

  const categoryDistribution = {
    data: categoryDistributionData,
    label: categoryStatKeys,
    count: categoryDistributionCount,
    percent: categoryDistributionPercent,
    total: categoryDistributionTotal,
    totalCount: categoryDistributionTotalCount,
  };

  const kakeiboDistribution = {
    data: kakeiboDistributionData,
    label: ["Needs", "Wants", "Culture", "Unexpected"],
    count: kakeiboDistributionCount,
    percent: kakeiboDistributionPercent,
    total: categoryDistributionTotal,
    totalCount: categoryDistributionTotalCount,
  };

  const budgetDistribution = {
    ...(await getBudgetTrend(space, filter, from, to)),
    actual: totalDistributionData,
  };

  const incomeDistributionData: any = await getIncomeTrend(space, from, to);
  const incomeDistributionMonthly = {
    income: incomeDistributionData.data,
    label: incomeDistributionData.label,
    expense: totalDistributionData,
  };

  const totalChangeDistribution = {
    increase: totalChangeDistributionDataIncrease,
    decrease: totalChangeDistributionDataDecrease,
    label,
  };

  return {
    categoryDistributionMonthly,
    categoryDistribution,
    kakeiboDistributionMonthly,
    kakeiboDistribution,
    budgetDistribution,
    incomeDistributionMonthly,
    totalChangeDistribution,
  };
};

const _getCategoryIdToKakeiboMap = async (space: string) => {
  const model = getCollection(space, categoryCollection, categorySchema);
  const categoryList = await model.find();
  const res: any = {};
  categoryList.forEach((item: any) => {
    res[item._id] = item.kakeibo;
  });

  return res;
};
