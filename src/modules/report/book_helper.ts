import * as BookHelper from "../book/helper";
import { FORMAT_FULL_DATE, formatDateText } from "../../lib/DateUtils";

const ejs = require("ejs");
const jszip = require("jszip");

const _get_template_path = (name: string) => {
  return process.cwd() + name;
};

const _get_zip_file = async (data: string) => {
  const zip = new jszip();
  zip.file("index.html", data);
  // return data;
  return await zip.generateAsync({ type: "base64", compression: "DEFLATE" });
};

export const generateReportForBook = async (
  space: string,
  reference: string
) => {
  const book = await BookHelper.getBookByReference(space, reference);
  if (!book) {
    return "Book not found";
  }

  const data: any = {
    title: book.title,
    summary: book.description,
    content: book.description,
    // content: book.content.replace(/<p>​<\/p>/gi, ""),
    keywords: book.categories,
    createdAt: formatDateText(book.createdAt, FORMAT_FULL_DATE),
  };

  let html = await ejs.renderFile(
    _get_template_path("/src/templates/book/template.ejs"),
    data
  );

  return _get_zip_file(html);
};
