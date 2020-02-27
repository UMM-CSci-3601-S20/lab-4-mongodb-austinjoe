import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Todo } from './todo';
import { TodoService } from './todo.service';
@Component({
  selector: 'app-add-todo',
  templateUrl: './add-todo.component.html',
  styleUrls: []
})

export class AddTodoComponent implements OnInit {

  addTodoForm: FormGroup;

  todo: Todo;

  constructor(private fb: FormBuilder, private todoService: TodoService, private snackBar: MatSnackBar, private router: Router) {
  }

  addTodoValidationMessages = {
    owner: [
      {type: 'required', message: 'Owner is required'},
      {type: 'minlength', message: 'Owner must be two character long'},
      {type: 'maxlength', message: 'Owner cannot be more than 50 characters long'},
    ],
    status: [
      {type: 'required', message: 'Status is required'},
      {type: 'pattern', message: 'Status must be Complete or Incomplete'}
    ],
    category: [
      {type: 'required', message: 'Category is required'},
      {type: 'minlength', message: 'Category must be two character long'},
      {type: 'maxlength', message: 'Category cannot be more than 50 characters long'},
    ],
    body: [
      {type: 'required', message: 'Body is required'},
      {type: 'minlength', message: 'Body must be two character long'},
      {type: 'maxlength', message: 'Body cannot be more than 1000 characters long'},
    ]
  };

  createForms() {
    // add form validations
    this.addTodoForm = this.fb.group({
      owner: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ])),

      status: new FormControl('status', Validators.compose([
        Validators.required,
        Validators.pattern('^(complete|incomplete)$'),
      ])),

      category: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ])),

      body: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(1000),
      ])),
    });
  }

  ngOnInit() {
    this.createForms();
  }

  submitForm() {
    this.todoService.addTodo(this.addTodoForm.value).subscribe(newID => {
      this.snackBar.open('Added todo', null, { duration: 2000 });
      this.router.navigate(['/users']);
    }, err => {
      this.snackBar.open('Failed to add the todo', null, { duration: 2000 });
    })
  }
}
