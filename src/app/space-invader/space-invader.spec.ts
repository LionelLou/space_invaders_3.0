import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceInvader } from './space-invader';

describe('SpaceInvader', () => {
  let component: SpaceInvader;
  let fixture: ComponentFixture<SpaceInvader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaceInvader],
    }).compileComponents();

    fixture = TestBed.createComponent(SpaceInvader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
