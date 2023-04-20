import moment from 'moment';

export const FORMAT_FULL_DATE = "Do MMM YYYY";
export const FORMAT_MONTH_AND_YEAR = "MMMM YYYY";

export const formatDateText = (dateText: string, format: string) => {
  if (dateText) {
    // const date = new Date(dateText);
    const date = moment(dateText, 'YYYY-MM-DDTHH:mm:ssZ')
    return date.format(format);
  }
  return "";
}
