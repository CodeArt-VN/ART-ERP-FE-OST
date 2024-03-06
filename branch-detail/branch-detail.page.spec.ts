import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchDetailPage } from './branch-detail.page';

describe('BranchDetailPage', () => {
  let component: BranchDetailPage;
  let fixture: ComponentFixture<BranchDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BranchDetailPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
