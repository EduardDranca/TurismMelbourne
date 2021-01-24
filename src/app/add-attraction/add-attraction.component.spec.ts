import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAttractionComponent } from './add-attraction.component';

describe('AddAttractionComponent', () => {
  let component: AddAttractionComponent;
  let fixture: ComponentFixture<AddAttractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAttractionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAttractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
