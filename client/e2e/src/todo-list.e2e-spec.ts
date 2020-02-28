import {TodoPage} from './todo-list.po';
import {browser, protractor, by, element} from 'protractor';

describe('Todo list', () => {
  let page: TodoPage;

  beforeEach(() => {
    page = new TodoPage();
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    expect(page.getTodoTitle()).toEqual('Todos');
  });

  it('Should type something in the owner filter and check that it returned correct elements', () => {
    page.typeInput('todo-owner-input', 'Fry');

    // All of the todo cards should have the name we are filtering by
    page.getTodoCards().each(e => {
      expect(e.element(by.className('todo-card-owner')).getText()).toEqual('Fry');
    });
  });

  it('Should type something in the category filter and check that it returned correct elements', () => {
    page.typeInput('todo-category-input', 'homework');

    // All of the todo cards should have the category we are filtering by
    page.getTodoCards().each(e => {
      expect(e.element(by.className('todo-card-category')).getText()).toEqual('homework');
    });
  });

  it('Should type something partial in the category filter and check that it returned correct elements', () => {
    page.typeInput('todo-category-input', 'es');

    // Go through each of the cards that are being shown and get the category
    const category = page.getTodoCards().map(e => e.element(by.className('todo-card-category')).getText());

    // We should see these category
    expect(category).toContain('software design');
    expect(category).toContain('video games');
    expect(category).toContain('groceries');

    // We shouldn't see these category
    expect(category).not.toContain('homework');
  });

  it('Should type something in the body filter and check that it returned correct elements', () => {
    page.typeInput('todo-body-input', 'Est commodo');

    // Go through each of the cards that are being shown and get the bodies containing 'Est commodo'
    const owner = page.getTodoCards().map(e => e.element(by.className('todo-card-owner')).getText());

    // We should see this owner whose body contains "Est commodo"
    expect(owner).toContain('Barry');

    // We shouldn't see these owners
    expect(owner).not.toContain('Blanche');
    expect(owner).not.toContain('Fry');
  });

  it('Should change the view', () => {
    page.changeView('list');

    expect(page.getTodoCards().count()).toEqual(0); // There should be no cards
    expect(page.getTodoListItems().count()).toBeGreaterThan(0); // There should be list items
  });

  it('Should select a status, switch the view, and check that it returned correct elements', () => {
    page.selectMatSelectValue('todo-status-select', 'complete');

    page.changeView('list');

    // All of the owner list items should have the status we are looking for
    page.getTodoListItems().each(e => {
      expect(e.element(by.className('todo-list-status')).getText()).toEqual('true');
    });
    expect(page.getTodoCards().count()).toEqual(0); // There should be no cards
    expect(page.getTodoListItems().count()).toBeGreaterThan(0);
  });

  it('Should input an owner, category, body, and select a status, and check the correct todo is returned', () => {
    page.typeInput('todo-owner-input', 'Fry');
    page.typeInput('todo-body-input', 'Ipsum esse est ullamco mag');
    page.typeInput('todo-category-input', 'video games');
    page.selectMatSelectValue('todo-status-select', 'incomplete');

    expect(page.getTodoCards().count()).toEqual(1);
  });
});
