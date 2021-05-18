import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-phrase-modal',
  templateUrl: './phrase-modal.component.html',
  styleUrls: ['./phrase-modal.component.css'],
})
export class PhraseModalComponent implements OnInit {
  @Input() quote;
  @Input() author;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}
}
