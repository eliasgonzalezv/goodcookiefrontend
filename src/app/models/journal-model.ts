/**
 * Represents a journal that is obtained from
 * the backend
 */
export class Journal {
  journalUrl: string;
  journalCreatedDate: Date;

  constructor(journalUrl: string, journalCreatedDate: Date) {
    this.journalUrl = journalUrl;
    this.journalCreatedDate = journalCreatedDate;
  }
}
