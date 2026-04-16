import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Breakout } from './breakout';

describe('Breakout', () => {
  let component: Breakout;
  let fixture: ComponentFixture<Breakout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Breakout],
    }).compileComponents();

    fixture = TestBed.createComponent(Breakout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
