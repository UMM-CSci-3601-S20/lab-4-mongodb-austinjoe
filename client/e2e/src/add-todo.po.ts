import {browser, by, element, Key, ElementFinder} from 'protractor';
import { type } from 'os';

export interface TestTodo {
  owner: string;
  status: boolean;
  category: string;
  body: string;
  TestTodoStatus: 'complete'|'incomplete';
}


export class AddTodoPage {
  navigateTo() {
    return browser.get('/todos/new');
  }

  getUrl() {
    return browser.getCurrentUrl();
  }

  getTitile() {
    const title = element(by.className('add-todo-title')).getText();
    return title;
  }

  getTodoCards() {
    return element(by.className('todo-cards-container')).all(by.tagName('app-todo-card'));
  }

  getTodoListItems() {
    return element(by.className('todo-nav-list')).all(by.className('todo-list-item'));
  }

  async typeInput(inputId: string, text: string) {
    const input = element(by.id(inputId));
    await input.click();
    await input.sendKeys(text);
  }

  selectMatSelectValue(selectID: string, value: string) {
    const sel = element(by.id(selectID));
    return sel.click().then(() => {
      return element(by.css('mat-option[value="' + value + '"]')).click();
    });
  }

  clickAddTodo() {
    return element(by.buttonText('ADD TODO')).click();
  }

  async addTodo(newTodo: TestTodo) {
    await this.typeInput('ownerField', newTodo.owner);
    await this.typeInput('categoryField', newTodo.category);
    await this.typeInput('bodyField', newTodo.body);
    await this.selectMatSelectValue('statusField', newTodo.TestTodoStatus);
    return this.clickAddTodo();
  }



}
