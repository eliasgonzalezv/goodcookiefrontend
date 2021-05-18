import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ContentChildren,
  ElementRef,
  OnChanges,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Journal } from '../models/journal-model';
import { ResourceService } from '../resource/resource.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent
  implements OnInit, AfterViewInit, AfterViewChecked, OnChanges {
  username: string;
  journals: Journal[];
  journalLength: number;
  selectedJournals: Journal[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private resourceService: ResourceService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    const _this = this;
    //if this doesn't work move it to the constructor
    this.username = this.activatedRoute.snapshot.params.username;
    //get all the saved journals for this user
    this.resourceService.getJournals(this.username).subscribe(
      (data) => {
        _this.journals = data;
        _this.journalLength = data.length;

        //Sort the journals based on date (most recent first)
        _this.journals.sort((a: Journal, b: Journal) => {
          return (
            b.journalCreatedDate.valueOf() - a.journalCreatedDate.valueOf()
          );
        });
      },
      (error: HttpErrorResponse) => {
        throwError(error);
      }
    );

    this.selectedJournals = [];
  }

  ngAfterViewInit(): void {}

  ngAfterViewChecked(): void {}

  ngOnChanges(): void {}

  /**
   *
   */
  selectJournal(id: string) {
    //Find the card associated with the checkbox
    let checkboxRef = document.querySelector<HTMLInputElement>('#' + id);
    let imgSelector = '#img-' + id.split('-')[1];
    let imgRef = document.querySelector<HTMLImageElement>(imgSelector);
    if (checkboxRef.checked) {
      //Get the URL of image
      //Push the url since it has been selected
      this.selectedJournals.push(
        this.journals.find((e) => imgRef.src === e.journalUrl)
      );
      console.log(this.selectedJournals);
    } else {
      //find journal with same url
      let idx = this.selectedJournals.findIndex(
        (e) => imgRef.src === e.journalUrl
      );
      //Remove the selected journal
      let deleted = this.selectedJournals.splice(idx, 1);
      console.log(deleted);
    }
  }
  /**
   *
   */
  deleteJournals() {
    this.resourceService
      .deleteJournals(this.selectedJournals)
      .subscribe((res) => {
        if (res) {
          //Request succeeded
          //Update the internal list of journals by removing all previously selected journals
          //which are now deleted
          this.journals = this.journals.filter(
            (journals) => !this.selectedJournals.includes(journals)
          );
          this.toast.success(res);
          //Clear the selected journals
          this.selectedJournals = [];
          //Refresh the view
          this.ngOnInit();
        }
      });
  }

  /**
   *
   * @param imgId
   * @param btnId
   */
  async downloadJournalImage(imgId: string, btnId: string) {
    let imgRef = document.querySelector<HTMLImageElement>('#' + imgId);
    let btnRef = document.querySelector<HTMLButtonElement>('#' + btnId);

    //!Fixed => Cors configuration on amazon s3 since i own the bucket. this will need to be changed once
    //!I post this project on heroku
    const a = document.createElement('a');
    a.href = await this.toDataURL(imgRef.src);
    // console.log(a.href);
    a.download = 'journal' + (Number(imgId.split('-')[1]) + 1);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  /**
   *
   * @param url
   * @returns
   */
  private toDataURL(url) {
    return fetch(url)
      .then((response) => {
        return response.blob();
      })
      .then((blob) => {
        return URL.createObjectURL(blob);
      });
  }
}
