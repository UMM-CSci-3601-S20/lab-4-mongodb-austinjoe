import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Todo, TodoStatusSelect } from '../app/todos/todo';
import { TodoService } from '../app/todos/todo.service';

/**
 * A "mock" version of the `TodoService` that can be used to test components
 * without having to create an actual service.
 */
@Injectable()
export class MockTodoService extends TodoService {
  static testTodos: Todo[] = [
    {
        _id: 'peter_parker_id',
        owner: 'Marvel',
        category: 'Superhero',
        status: true,
        body: 'Bit by a spider and as a result has all the powers of a spider',
    },
    {
        _id: 'bruce_wayne_id',
        owner: 'DC',
        category: 'Philanthropist',
        status: true,
        body: 'Batman by night, rich man by day',
    },
    {
        _id: 'Ajunta Pall_id',
        owner: 'Lucas_Arts',
        category: 'Jedi Master',
        status: false,
        body: 'The first sith lord',
    },
  ];

  // When the user adds a todo, keep a reference of it in this
  // array so that we can poke at it later.
  public todosThatHaveBeenAdded: Todo[];

  constructor() {
    super(null);
  }

  getTodos(filters: { owner?: string, status?: TodoStatusSelect, body?: string, category?: string}): Observable<Todo[]> {
    // Just return the test todos regardless of what filters are passed in
    return of(MockTodoService.testTodos);
  }

  addTodo(newTodo: Todo): Observable<string> {
    this.todosThatHaveBeenAdded.push(newTodo);
    return of('Sure, that\'s totally stored in the database now!');
  }
}
