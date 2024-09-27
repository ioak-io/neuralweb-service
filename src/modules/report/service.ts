import * as NoteHelper from "./note_helper";
import * as BookHelper from "./book_helper";

export const generateReportForNote = async (req: any, res: any) => {
  const report: any = await NoteHelper.generateReportForNote(
    req.params.space,
    req.params.noteRef
  );
  res.status(200);
  res.send(report);
  res.end();
};

export const generateReport = async (req: any, res: any) => {
  const report: any = await NoteHelper.generateReport(req.params.space);
  res.status(200);
  res.send(report);
  res.end();
};


export const generateReportForBook = async (req: any, res: any) => {
  const report: any = await BookHelper.generateReportForBook(
    req.params.space,
    req.params.bookref
  );
  res.status(200);
  res.send(report);
  res.end();
};