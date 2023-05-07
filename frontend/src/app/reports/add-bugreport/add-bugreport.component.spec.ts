import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBugreportComponent } from './add-bugreport.component';

describe('AddReport2Component', () => {
  let component: AddBugreportComponent;
  let fixture: ComponentFixture<AddBugreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddBugreportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBugreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
