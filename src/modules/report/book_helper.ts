import * as BookHelper from "../book/helper";
import * as BookSectionHelper from "../book/section/helper";
import * as BookSectiondetailHelper from "../book/sectiondetail/helper";
import { FORMAT_FULL_DATE, formatDateText } from "../../lib/DateUtils";

const SECTION_TYPE_MAP: any = {
  summary: "",
  themes: "Key themes and ideas",
  alternate_takes: "Alternate perspectives",
  purpose: "Thematic Significance",
};

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

export const generateReportForBook = async (space: string, bookref: string) => {
  const book = await BookHelper.getBookByReference(space, bookref);
  if (!book) {
    return "Book not found";
  }

  const bookSections = await BookSectionHelper.getBookSectionsByBookReference(
    space,
    bookref
  );

  const bookSectionMap: any = {};
  const bookSectiondetailMap: any = {};
  for (let i = 0; i < bookSections.length; i++) {
    bookSectionMap[bookSections[i].reference] = bookSections[i];

    const bookSectiondetails =
      await BookSectiondetailHelper.getDetailsByBookReference(
        space,
        bookref,
        bookSections[i].reference
      );
    bookSectiondetailMap[bookSections[i].reference] = bookSectiondetails.map(
      (item: any) => ({ ...item._doc, type: SECTION_TYPE_MAP[item._doc.type] })
    );

    console.log(bookSectiondetails.map(
      (item: any) => ({ ...item, type: SECTION_TYPE_MAP[item.type] })
    ))
  }

  const data: any = {
    book,
    bookSections,
    bookSectiondetailMap,
    createdAt: formatDateText(book.createdAt, FORMAT_FULL_DATE),
  };

  let html = await ejs.renderFile(
    _get_template_path("/src/templates/book/template.ejs"),
    data
  );

  return _get_zip_file(html);
};

const _generateReportForSectiondetail = async (booksectiondetail: any) => {
  const data: any = {
    title: booksectiondetail.name,
    summary: booksectiondetail.summary,
    content: booksectiondetail.content,
    keywords: booksectiondetail.keywords,
    createdAt: formatDateText(booksectiondetail.createdAt, FORMAT_FULL_DATE),
  };

  const html = ejs.renderFile(
    _get_template_path(
      "/src/templates/book/partials/template_sectiondetail.ejs"
    ),
    data
  );

  return html;
};
