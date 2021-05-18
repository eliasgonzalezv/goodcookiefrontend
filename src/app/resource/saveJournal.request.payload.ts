/**
 * Represents the journal information that is
 * sent to the backend when performing a save
 * journal call.
 */
export interface SaveJournalRequest {
  username: string;
  journalDataUrl: string;
}
