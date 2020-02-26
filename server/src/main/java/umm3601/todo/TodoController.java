package umm3601.todo;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.regex;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.google.common.collect.ImmutableMap;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;

import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.mongojack.JacksonCodecRegistry;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.NotFoundResponse;

public class TodoController {

  JacksonCodecRegistry jacksonCodecRegistry = JacksonCodecRegistry.withDefaultObjectMapper();

  private final MongoCollection<Todo> todoCollection;

  public TodoController(MongoDatabase database) {
    jacksonCodecRegistry.addCodecForClass(Todo.class);
    todoCollection = database.getCollection("todos").withDocumentClass(Todo.class)
        .withCodecRegistry(jacksonCodecRegistry);
  }

  // Delete Todo?

  public void getTodos(Context ctx) {

    List<Bson> filters = new ArrayList<Bson>(); // start with a blank document

    // TODO: add filters, sorting

    // If we filter using angular I don't believe we need this, I was
    // just programming mindlessly...
    if (ctx.queryParamMap().containsKey("owner")) {
      filters.add(regex("owner", ctx.queryParam("owner"), "i"));
    }
    if (ctx.queryParamMap().containsKey("status")) {
      boolean targetStatus = false;
      // We set the target status to false to just save a step, so the target status
      // only changes if the entry is marked complete
      if (ctx.queryParam("status").equals("complete")) {
        targetStatus = true;
      }
      filters.add(eq("status", targetStatus));
    }

    ctx.json(todoCollection.find(filters.isEmpty() ? new Document() : and(filters))
      .into(new ArrayList<>()));
  }
}
