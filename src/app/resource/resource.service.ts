import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HitCanvas } from 'konva/types/Canvas';
import { Observable } from 'rxjs';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';
import { AuthService } from '../auth/shared/auth.service';
import { Journal } from '../models/journal-model';
import { Phrase } from '../models/phrase-model';
import { SaveJournalRequest } from './saveJournal.request.payload';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Makes a synchronous call to backend to fetch a phrase
   * @returns A Promise containing the phrase
   */
  getPhrase(): Promise<Phrase> {
    return this.httpClient
      .get<Phrase>('http://localhost:8080/api/resource/phrase')
      .toPromise();
  }

  /**
   * Performs a call to the backend to save the journal
   * @param saveJournalRequest a save journal request object containing the
   * imageDataUrl and the username to perform a save in the backend.
   */
  saveJournal(saveJournalRequest: SaveJournalRequest): Observable<any> {
    return this.httpClient.post(
      'http://localhost:8080/api/resource/saveJournal',
      saveJournalRequest,
      { responseType: 'text' }
    );
  }

  /**
   * Performs a call to the backend to fetch the journals
   * for the username provided.
   * @param username The username of the journals to get
   * @returns An observable object containing a list of GetJournalsResponse
   */
  getJournals(username: string): Observable<Journal[]> {
    return this.httpClient.get<Journal[]>(
      'http://localhost:8080/api/resource/getJournals/' + username
    );
  }

  /**
   * Performs a call to the backend to delete all journals
   * that have been provided in the list
   * @param journalList the list of journals to delete
   */
  deleteJournals(journalList: Journal[]): Observable<any> {
    return this.httpClient.request(
      'DELETE',
      'http://localhost:8080/api/resource/deleteJournalList/',
      { body: journalList, responseType: 'text' }
    );
  }

  // getJournalImage(imgUrl: string): Observable<any> {
  //   return this.httpClient.get(imgUrl, {
  //     headers: new HttpHeaders({ 'Content-Type': 'image/png' }),
  //   });
  // }
}
