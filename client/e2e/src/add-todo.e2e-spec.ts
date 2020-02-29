import {browser, protractor, by, element, utils} from 'protractor';
import { AddTodoPage, TestTodo } from './add-todo.po';
import { E2EUtil } from './e2e.util';

describe('Add todo', () => {
  let page: AddTodoPage;
  const EC = protractor.ExpectedConditions;

  beforeEach(() => {
    page = new AddTodoPage();
    page.navigateTo();
  });

  it('Should have correct Todo title', () => {
    expect(page.getTitile()).toEqual('New Todo');
  });

  it('Should enable and disable the add todo button', async () => {
    expect(element(by.buttonText('ADD TODO')).isEnabled()).toBe(false);
    await page.typeInput('ownerField', 'test');
    expect(element(by.buttonText('ADD TODO')).isEnabled()).toBe(false);
    await page.selectMatSelectValue('statusField', 'complete');
    expect(element(by.buttonText('ADD TODO')).isEnabled()).toBe(false);
    await page.typeInput('bodyField', 'This is a test body');
    expect(element(by.buttonText('ADD TODO')).isEnabled()).toBe(false);
    await page.typeInput('categoryField', 'test category');
    expect(element(by.buttonText('ADD TODO')).isEnabled()).toBe(true);
  });

  it('Should add a new todo and go to the right page', async () => {
    const todo: TestTodo = {
      owner: E2EUtil.randomText(10),
      TestTodoStatus: 'complete',
      category: E2EUtil.randomText(10),
      body: E2EUtil.randomText(60),
      status: true
    };

    await page.addTodo(todo);

    // Wait until the URL does not contain 'todos/new'
    await browser.wait(EC.not(EC.urlContains('todos/new')), 10000);

    const url = await page.getUrl();
    expect(url.endsWith('/todos/new')).toBe(false);

    page.typeInput('todo-owner-input', todo.owner );
    page.typeInput('todo-body-input', todo.body);
    page.typeInput('todo-category-input', todo.category);
    page.selectMatSelectValue('todo-status-select', todo.TestTodoStatus);

    // my idea here was that the e2e test generated random text that likely would more than likely
    // not be in the database unless for some unreasonably small chance it types something that exists
    // but either way since the newly added item should be unique it can be expected there is only one of this
    expect(page.getTodoCards().count()).toEqual(1);
  });
})
