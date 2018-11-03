import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendrConfiguratorComponent } from './calendr-configurator.component';

describe('CalendrConfiguratorComponent', () => {
  let component: CalendrConfiguratorComponent;
  let fixture: ComponentFixture<CalendrConfiguratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendrConfiguratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendrConfiguratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
