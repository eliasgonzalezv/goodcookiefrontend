import { resolve } from '@angular/compiler-cli/src/ngtsc/file_system';
import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Phrase } from '../models/phrase-model';
import { ResourceService } from '../resource/resource.service';
import { PhraseModalComponent } from './phrase-modal/phrase-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  //Phrase object to hold phrases obtained from backend call
  phrase: Phrase;

  //Resource service for making backend calls to get phrases, modal service for
  // handling the modal where phrases appear.
  constructor(
    private resourceService: ResourceService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.phrase = new Phrase();
  }

  /**
   * Calls on the resource service to fetch the phrase
   * from backend and opens the phrase modal component
   * to display the phrase obtained.
   */
  async openPhraseModal() {
    //fetch the phrase from backend
    const data = await this.resourceService.getPhrase();
    this.phrase.text = data.text;
    this.phrase.author = data.author;

    // console.log(this.phrase);

    //Open modal
    const modalReference = this.modalService.open(PhraseModalComponent, {
      centered: true,
    });
    //Pass phrase content to the modal
    modalReference.componentInstance.quote = this.phrase.text;
    modalReference.componentInstance.author =
      this.phrase.author == null || this.phrase.author === ''
        ? 'Anonymous'
        : this.phrase.author;
  }
}
