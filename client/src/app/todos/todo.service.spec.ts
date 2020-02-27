import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Todo } from './todo';
import { TodoService } from './todo.service';

describe('Todo service: ', () => {
    const testTodos: Todo[] = [
        {
            _id: 'arrow_to_the_knee',
            owner: 'Stormcloak Guard',
            category: 'Health',
            status: true,
            body: 'Take an arrow to the knee',
        },
        {
            _id: 'steve_rogers',
            owner: 'Avengers',
            category: 'Endgame',
            status: true,
            body: 'Frozen for years',
        },
        {
            _id: 'patrick_id',
            owner: 'Patrick Star',
            category: 'work',
            status: false,
            body: 'Is this the Krusty Crab',
        },
    ];
    let todoService: TodoService;
    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        // Set up the mock handling of the HTTP requests
        TestBed.configureTestingModule({
          imports: [HttpClientTestingModule]// fake url essentially
        });
        httpClient = TestBed.inject(HttpClient);
        httpTestingController = TestBed.inject(HttpTestingController);
        // Construct an instance of the service with the mock
        // HTTP client.
        todoService = new TodoService(httpClient);
      });

    afterEach(() => {
        // After every test, assert that there are no more pending requests.
        httpTestingController.verify();
      });

    it('getTodos() calls api/todos', () => {
        // Assert that the todos we get from this call to getTodos()
        // should be our set of test todos. Because we're subscribing
        // to the result of getTodos(), this won't actually get
        // checked until the mocked HTTP request 'returns' a response.
        // This happens when we call req.flush(testUsers) a few lines
        // down.
        todoService.getTodos().subscribe(
          todos => expect(todos).toBe(testTodos)
        );

        // Specify that (exactly) one request will be made to the specified URL.
        const req = httpTestingController.expectOne(todoService.todoUrl);
    // Check that the request made to that URL was a GET request.
        expect(req.request.method).toEqual('GET');
    // Specify the content of the response to that request. This
    // triggers the subscribe above, which leads to that check
    // actually being performed.
        req.flush(testTodos);
    });
    // test for the owner parameter
    it('getTodos() calls api/todos with filter parameter \'owner\'', () => {

        todoService.getTodos({ owner: 'Avengers' }).subscribe(
          todos => expect(todos).toBe(testTodos)
        );

        // Specify that (exactly) one request will be made to the specified URL with the role parameter.
        const req = httpTestingController.expectOne(
          (request) => request.url.startsWith(todoService.todoUrl) && request.params.has('owner')
        );

        // Check that the request made to that URL was a GET request.
        expect(req.request.method).toEqual('GET');

        // Check that the role parameter was 'admin'
        expect(req.request.params.get('owner')).toEqual('Avengers');

        req.flush(testTodos);
      });
    it('getTodos() calls api/todos with filter parameter \'complete\'', () => {

        todoService.getTodos({ status: 'complete' }).subscribe(
          todos => expect(todos).toBe(testTodos)
        );

        // Specify that (exactly) one request will be made to the specified URL with the role parameter.
        const req = httpTestingController.expectOne(
          (request) => request.url.startsWith(todoService.todoUrl) && request.params.has('status')
        );
        // Check that the request made to that URL was a GET request.
        expect(req.request.method).toEqual('GET');
        expect(req.request.params.get('status')).toEqual('complete');
        req.flush(testTodos);
      });

    it('getTodos() calls api/todos with multiple filter parameters', () => {

        todoService.getTodos({ category: 'work', body: 'Is this the Krusty Crab'}).subscribe(
          todos => expect(todos).toBe(testTodos)
        );

        // Specify that (exactly) one request will be made to the specified URL with the role parameter.
        const req = httpTestingController.expectOne(
          (request) => request.url.startsWith(todoService.todoUrl)
            && request.params.has('category') && request.params.has('body')
        );

        // Check that the request made to that URL was a GET request.
        expect(req.request.method).toEqual('GET');

        // Check that the role parameters are correct
        // is not toBeFalse because since false = false tobeFalse returns true when that function needs to be false
        expect(req.request.params.get('category')).toEqual('work');
        expect(req.request.params.get('body')).toEqual('Is this the Krusty Crab');

        req.flush(testTodos);
      });

    it('filterTodos() filters by owner', () => {
        expect(testTodos.length).toBe(3);
        const todoOwner = 'st';
        expect(todoService.filterTodos(testTodos, { owner: todoOwner }).length).toBe(2);
      });
    it('filterTodos() filters by body', () =>{
        expect(testTodos.length).toBe(3);
        const todoBody = 'Take an arrow to the knee';
        expect(todoService.filterTodos(testTodos, {body: todoBody}).length).toBe(1);
    });
    it('filterTodos() filters by category', () =>{
      expect(testTodos.length).toBe(3);
      const todoCategory = 'work';
      expect(todoService.filterTodos(testTodos, {category: todoCategory}).length).toBe(1);
  });
    it('addUser() calls api/users/new', () => {

    todoService.addTodo(testTodos[1]).subscribe(
      id => expect(id).toBe('testid')
    );

    const req = httpTestingController.expectOne(todoService.todoUrl + '/new');

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(testTodos[1]);

    req.flush({id: 'testid'});
  });
});
