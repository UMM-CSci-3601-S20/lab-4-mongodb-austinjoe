import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoCardComponent } from './todo-card.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';

describe('TodoCardComponent', () => {
    let component: TodoCardComponent;
    let fixture: ComponentFixture<TodoCardComponent>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [
          BrowserAnimationsModule,
          MatCardModule
        ],
        declarations: [ TodoCardComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(TodoCardComponent);
      component = fixture.componentInstance;
      component.todo = {
        _id: 'Arrow_to_the_knee',
        owner: 'Stormcloak Guard',
        category: 'Health',
        status: true,
        body: 'Take an arrow to the knee',
      };
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
