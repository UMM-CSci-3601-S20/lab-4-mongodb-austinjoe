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
 * @throws IOException 
 */

 public class TodoControllerSpec{
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

        mongoClient = MongoClients.create(
        MongoClientSettings.builder()
            .applyToClusterSettings(builder ->
            builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
            .build());

        db = mongoClient.getDatabase("test");
    }

    @BeforeEach
    public void setupEach() throws IOException{

        // Reset our mock request and response objects
        mockReq.resetAll();
        mockRes.resetAll();

        //Setup database
        MongoCollection<Document> todoDocuments = db.getCollection("todos");
        todoDocuments.drop();
        List<Document> testTodos = new ArrayList<>();
        testTodos.add(Document.parse(
            "{\n" +
            "    owner: \"Steve Rogers\",\n" +
            "    status: false,\n" +
            "    body: \"Unthaw before thanos arrives\",\n" +
            "    category: \"Saving the world\",\n" +
            "}"));
        testTodos.add(Document.parse(
            "{\n" +
            "    owner: \"Marty McFly\",\n" +
            "    status: true,\n" +
            "    body: \"Go Back to 1985 before the lightning strike\",\n" +
            "    category: \"Back to the future\",\n" +
            "}"));
        testTodos.add(Document.parse(
            "{\n" +
            "    owner: \"Superman\",\n" +
            "    status: false,\n" +
            "    body: \"Stop Lex Luther\",\n" +
            "    category: \"Saving the world\",\n" +
            "}"));

        samsID = new ObjectId();
        BasicDBObject sam = new BasicDBObject("_id", samsID);
        sam = sam.append("owner", "Sam")
            .append("status", true)
            .append("body", "This is the body for sam.")
            .append("category", "Test");
            

        todoDocuments.insertMany(testTodos);
        todoDocuments.insertOne(Document.parse(sam.toJson()));

        todoController = new TodoController(db);
    }
 }