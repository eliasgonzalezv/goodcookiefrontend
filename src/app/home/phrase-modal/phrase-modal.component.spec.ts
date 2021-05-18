import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhraseModalComponent } from './phrase-modal.component';

describe('PhraseModalComponent', () => {
  let component: PhraseModalComponent;
  let fixture: ComponentFixture<PhraseModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhraseModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhraseModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
