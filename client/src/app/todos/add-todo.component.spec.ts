import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgForm, ReactiveFormsModule, FormGroup, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MockTodoService } from 'src/testing/todo.service.mock';
import { AddTodoComponent } from './add-todo.component';
import { TodoService } from './todo.service';
import { MatIconModule } from '@angular/material/icon';

describe('AddTodoComponent', () => {
  let addTodoComponent: AddTodoComponent;
  let addTodoForm: FormGroup;
  let calledClose: boolean;
  let fixture: ComponentFixture<AddTodoComponent>;
  const mockTodoService = new MockTodoService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        MatIconModule,
      ],
      declarations: [AddTodoComponent],
      providers: [{ provide: TodoService, useValue: mockTodoService }]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));

  beforeEach(() => {
    calledClose = false;
    fixture = TestBed.createComponent(AddTodoComponent);
    addTodoComponent = fixture.componentInstance;
    addTodoComponent.ngOnInit();
    fixture.detectChanges();
    addTodoForm = addTodoComponent.addTodoForm;
    expect(addTodoForm).toBeDefined();
    expect(addTodoForm.controls).toBeDefined();
  });

  it('should create the component and form', () => {
    expect(addTodoComponent).toBeTruthy();
    expect(addTodoForm).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(addTodoForm.valid).toBeFalsy();
  });

  describe('The owner field', () => {
    let ownerControl: AbstractControl;

    beforeEach(() => {
      ownerControl = addTodoComponent.addTodoForm.controls[`owner`];
    });

    it('should not allow empty names', () => {
      ownerControl.setValue('');
      expect(ownerControl.valid).toBeFalsy();
    });

    it('should be fine with "Chris Smith"', () => {
      ownerControl.setValue('Chris Smith');
      expect(ownerControl.valid).toBeTruthy();
    });

    it('should fail on single character names', () => {
      ownerControl.setValue('x');
      expect(ownerControl.valid).toBeFalsy();
      expect(ownerControl.hasError('minlength')).toBeTruthy();
    });

    it('should fail on really long names', () => {
      ownerControl.setValue('x'.repeat(100));
      expect(ownerControl.valid).toBeFalsy();
      expect(ownerControl.hasError('maxlength')).toBeTruthy();
    });
  });

  describe('The category field', () => {
    let categoryControl: AbstractControl;

    beforeEach(() => {
      categoryControl = addTodoComponent.addTodoForm.controls[`category`];
    });

    it('should not allow empty categories', () => {
      categoryControl.setValue('');
      expect(categoryControl.valid).toBeFalsy();
    });

    it('should be fine with "video games"', () => {
      categoryControl.setValue('video games');
      expect(categoryControl.valid).toBeTruthy();
    });

    it('should fail on single character categories', () => {
      categoryControl.setValue('x');
      expect(categoryControl.valid).toBeFalsy();
      expect(categoryControl.hasError('minlength')).toBeTruthy();
    });

    it('should fail on really long categories', () => {
      categoryControl.setValue('x'.repeat(100));
      expect(categoryControl.valid).toBeFalsy();
      expect(categoryControl.hasError('maxlength')).toBeTruthy();
    });
  });

  describe('The body field', () => {
    let bodyControl: AbstractControl;

    beforeEach(() => {
      bodyControl = addTodoComponent.addTodoForm.controls[`body`];
    });

    it('should not allow empty bodies', () => {
      bodyControl.setValue('');
      expect(bodyControl.valid).toBeFalsy();
    });

    it('should be fine with "Clean your room"', () => {
      bodyControl.setValue('Clean your room');
      expect(bodyControl.valid).toBeTruthy();
    });

    it('should fail on single character bodies', () => {
      bodyControl.setValue('x');
      expect(bodyControl.valid).toBeFalsy();
      expect(bodyControl.hasError('minlength')).toBeTruthy();
    });

    it('should fail on really long bodies', () => {
      bodyControl.setValue('x'.repeat(2000));
      expect(bodyControl.valid).toBeFalsy();
      expect(bodyControl.hasError('maxlength')).toBeTruthy();
    });

    it('should accept medium-length bodies, though', () => {
      bodyControl.setValue('x'.repeat(550));
      expect(bodyControl.valid).toBeTruthy();
      expect(bodyControl.hasError('maxlength')).toBeFalsy();
    });

  });

  describe('The status field', () => {
    let statusControl: AbstractControl;

    beforeEach(() => {
      statusControl = addTodoComponent.addTodoForm.controls[`status`];
    });

    it('should not allow empty statuses', () => {
      statusControl.setValue('');
      expect(statusControl.valid).toBeFalsy();
    });

    it('should be fine with "complete"', () => {
      statusControl.setValue('complete');
      expect(statusControl.valid).toBeTruthy();
    });

    it('should be fine with "incomplete"', () => {
      statusControl.setValue('complete');
      expect(statusControl.valid).toBeTruthy();
    });


    it('should fail on "I\'ll get around to it eventually"', () => {
      statusControl.setValue("I'll get around to it eventually");
      expect(statusControl.valid).toBeFalsy();
    });
  });

  describe('submitting the form', () => {
    let ownerControl: AbstractControl;
    let statusControl: AbstractControl;
    let categoryControl: AbstractControl;
    let bodyControl: AbstractControl;

    beforeEach(() => {
      ownerControl = addTodoComponent.addTodoForm.controls[`owner`];
      statusControl = addTodoComponent.addTodoForm.controls[`status`];
      categoryControl = addTodoComponent.addTodoForm.controls[`category`];
      bodyControl = addTodoComponent.addTodoForm.controls[`body`];
      mockTodoService.todosThatHaveBeenAdded = [];
    });

    it('should give an object to TodoService whose status is true or false, not "complete" or "incomplete"', () => {
      ownerControl.setValue('Yakko');
      statusControl.setValue('complete');
      categoryControl.setValue('educational television');
      bodyControl.setValue('List all the countries of the world');

      addTodoComponent.submitForm();

      expect(typeof (mockTodoService.todosThatHaveBeenAdded[0].status)).toBe('boolean');
    });
  });
});
