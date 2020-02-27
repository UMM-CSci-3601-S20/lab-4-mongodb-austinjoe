package umm3601.todo;

import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.common.collect.ImmutableMap;
import com.mockrunner.mock.web.MockHttpServletRequest;
import com.mockrunner.mock.web.MockHttpServletResponse;
import com.mongodb.BasicDBObject;
import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.NotFoundResponse;
import io.javalin.http.util.ContextUtil;
import io.javalin.plugin.json.JavalinJson;

/**
 * Test the logic for the Todo controller
 *
 * @throws IOException
 */
public class TodoControllerSpec {
  MockHttpServletRequest mockReq = new MockHttpServletRequest();
  MockHttpServletResponse mockRes = new MockHttpServletResponse();

  private TodoController todoController;

  private ObjectId samsID;

  static MongoClient mongoClient;
  static MongoDatabase db;

  static ObjectMapper jsonMapper = new ObjectMapper();

  @BeforeAll
  public static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(MongoClientSettings.builder()
        .applyToClusterSettings(builder -> builder.hosts(Arrays.asList(new ServerAddress(mongoAddr)))).build());

    db = mongoClient.getDatabase("test");
  }

  @BeforeEach
  public void setupEach() throws IOException {

    // Reset our mock request and response objects
    mockReq.resetAll();
    mockRes.resetAll();

    // Setup database
    MongoCollection<Document> todoDocuments = db.getCollection("todos");
    todoDocuments.drop();
    List<Document> testTodos = new ArrayList<>();
    testTodos.add(Document.parse(
      "{\n"
      + "    owner: \"Steve Rogers\",\n"
      + "    status: false,\n"
      + "    body: \"Unthaw before thanos arrives\",\n"
      + "    category: \"Saving the world\",\n"
      + "}"));
    testTodos.add(Document.parse(
      "{\n"
      + "    owner: \"Marty McFly\",\n"
      + "    status: true,\n"
      + "    body: \"Go Back to 1985 before the lightning strike\",\n"
      + "    category: \"Back to the future\",\n"
      + "}"));
    testTodos.add(Document.parse(
      "{\n"
      + "    owner: \"Superman\",\n"
      + "    status: false,\n"
      + "    body: \"Stop Lex Luther\",\n"
      + "    category: \"Saving the world\",\n" + "}"));

    samsID = new ObjectId();
    BasicDBObject sam = new BasicDBObject("_id", samsID);
    sam = sam.append("owner", "Sam").append("status", true).append("body", "This is the body for sam.")
        .append("category", "Test");

    todoDocuments.insertMany(testTodos);
    todoDocuments.insertOne(Document.parse(sam.toJson()));

    todoController = new TodoController(db);
  }

  @AfterAll
  public static void teardown() {
    db.drop();
    mongoClient.close();
  }

  @Test
  public void GetAllTodos() throws IOException {

    // Create our fake Javalin context
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");
    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    assertEquals(db.getCollection("todos").countDocuments(), JavalinJson.fromJson(result, Todo[].class).length,
        "Wrong number of todos");
  }

  @Test
  public void getTodosByOwner() throws IOException {

    mockReq.setQueryString("owner=Superman");

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());
    String result = ctx.resultString();
    Todo[] todosGotten = JavalinJson.fromJson(result, Todo[].class);
    assertNotEquals(todosGotten.length, 0);
    for (Todo todo : todosGotten) {
      assertEquals("Superman", todo.owner);
    }
  }

  @Test
  public void getTodosByStatus() throws IOException {
    mockReq.setQueryString("status=complete");

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());
    String result = ctx.resultString();
    Todo[] todosGotten = JavalinJson.fromJson(result, Todo[].class);
    assertNotEquals(todosGotten.length, 0);
    for (Todo todo : todosGotten) {
      assertEquals(true, todo.status);
    }
  }

  @Test
  public void getTodosByBody() throws IOException {
    // I'm unsure of whether literal spaces are allowed in setQueryString.
    // For the moment, I've escaped them as %20, just as a precaution.
    mockReq.setQueryString("body=Unthaw%20before%20thanos%20arrives");

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());
    String result = ctx.resultString();
    Todo[] todosGotten = JavalinJson.fromJson(result, Todo[].class);
    assertNotEquals(todosGotten.length, 0);
    for (Todo todo : todosGotten) {
      assertEquals("Unthaw before thanos arrives", todo.body);
    }
  }

  @Test
  public void getTodosByCategory() throws IOException {
    mockReq.setQueryString("category=Test");

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());
    String result = ctx.resultString();
    Todo[] todosGotten = JavalinJson.fromJson(result, Todo[].class);
    assertNotEquals(todosGotten.length, 0);
    for (Todo todo : todosGotten) {
      assertEquals("Test", todo.category);
    }
  }

  @Test
  public void gettingByNonexistentOwner() throws IOException {
    mockReq.setQueryString("owner=Old%20Yeller");

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());
    String result = ctx.resultString();
    Todo[] todosGotten = JavalinJson.fromJson(result, Todo[].class);
    assertEquals(todosGotten.length, 0);
  }

  @Test
  public void gettingByNonexistentBody() throws IOException {
    mockReq.setQueryString("body=Supercalifragilisticexpialidocious");

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());
    String result = ctx.resultString();
    Todo[] todosGotten = JavalinJson.fromJson(result, Todo[].class);
    assertEquals(todosGotten.length, 0);
  }

  @Test
  public void gettingByNonexistentCategory() throws IOException {
    mockReq.setQueryString("category=Frogs");

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());
    String result = ctx.resultString();
    Todo[] todosGotten = JavalinJson.fromJson(result, Todo[].class);
    assertEquals(todosGotten.length, 0);
  }

  @Test
  public void thatOwnerIsCaseInsensitive() throws IOException {

    mockReq.setQueryString("owner=SUPERMAN");

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());
    String result = ctx.resultString();
    Todo[] todosGotten = JavalinJson.fromJson(result, Todo[].class);
    assertNotEquals(todosGotten.length, 0);
    for (Todo todo : todosGotten) {
      assertEquals("Superman", todo.owner);
    }
  }

  @Test
  public void thatStatusIsCaseInsensitive() throws IOException {
    mockReq.setQueryString("status=COMPLETE");

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());
    String result = ctx.resultString();
    Todo[] todosGotten = JavalinJson.fromJson(result, Todo[].class);
    assertNotEquals(todosGotten.length, 0);
    for (Todo todo : todosGotten) {
      assertEquals(true, todo.status);
    }
  }

  @Test
  public void thatBodyIsCaseInsensitive() throws IOException {
    // I'm unsure of whether literal spaces are allowed in setQueryString.
    // For the moment, I've escaped them as %20, just as a precaution.
    mockReq.setQueryString("body=UNTHAW%20BEFORE%20THANOS%20ARRIVES");

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());
    String result = ctx.resultString();
    Todo[] todosGotten = JavalinJson.fromJson(result, Todo[].class);
    assertNotEquals(todosGotten.length, 0);
    for (Todo todo : todosGotten) {
      assertEquals("Unthaw before thanos arrives", todo.body);
    }
  }

  @Test
  public void thatCategoryIsCaseInsensitive() throws IOException {
    mockReq.setQueryString("category=TEST");

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());
    String result = ctx.resultString();
    Todo[] todosGotten = JavalinJson.fromJson(result, Todo[].class);
    assertNotEquals(todosGotten.length, 0);
    for (Todo todo : todosGotten) {
      assertEquals("Test", todo.category);
    }
  }

  @Test
  public void gettingBySubstringOfOwner() throws IOException {

    mockReq.setQueryString("owner=super");

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());
    String result = ctx.resultString();
    Todo[] todosGotten = JavalinJson.fromJson(result, Todo[].class);
    assertNotEquals(todosGotten.length, 0);
    for (Todo todo : todosGotten) {
      assertEquals("Superman", todo.owner);
    }
  }

  @Test
  public void gettingBySubstringOfBody() throws IOException {

    mockReq.setQueryString("body=before");

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());
    String result = ctx.resultString();
    Todo[] todosGotten = JavalinJson.fromJson(result, Todo[].class);
    assertNotEquals(todosGotten.length, 0);
    for (Todo todo : todosGotten) {
      assertTrue(todo.body.contains("before"));
    }
  }

  @Test
  public void gettingBySubstringOfCategory() throws IOException {

    mockReq.setQueryString("category=world");

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());
    String result = ctx.resultString();
    Todo[] todosGotten = JavalinJson.fromJson(result, Todo[].class);
    assertNotEquals(todosGotten.length, 0);
    for (Todo todo : todosGotten) {
      assertEquals("Saving the world", todo.category);
    }
  }

  @Test
  public void thatYouCantInjectARegexIntoTheOwnerFilterViaTheUrlParameters() throws IOException {
    mockReq.setQueryString("owner=.*");

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());
    String result = ctx.resultString();
    Todo[] todosGotten = JavalinJson.fromJson(result, Todo[].class);
    assertEquals(todosGotten.length, 0);
  }

  @Test
  public void thatYouCantInjectARegexIntoTheBodyFilterViaTheUrlParameters() throws IOException {
    mockReq.setQueryString("body=.*");

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());
    String result = ctx.resultString();
    Todo[] todosGotten = JavalinJson.fromJson(result, Todo[].class);
    assertEquals(todosGotten.length, 0);
  }

  @Test
  public void thatYouCantInjectARegexIntoTheCategoryFilterViaTheUrlParameters() throws IOException {
    mockReq.setQueryString("category=.*");

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());
    String result = ctx.resultString();
    Todo[] todosGotten = JavalinJson.fromJson(result, Todo[].class);
    assertEquals(todosGotten.length, 0);
  }
}
