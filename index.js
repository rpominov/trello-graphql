const {
  ApolloServer,
  AuthenticationError,
  ForbiddenError,
  UserInputError,
  ApolloError
} = require("apollo-server");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const resolvers = require("./resolvers");
const { appKey } = require("./secret");

const server = new ApolloServer({
  typeDefs: fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf8"),
  resolvers,
  formatError: error => {
    // delete error.extensions.exception;
    return error;
  },
  context: ({ req }) => {
    console.log();
    console.log("______________________________________________________");
    console.log(req.body.query);
    console.log({ variables: req.body.variables });
    console.log();

    const token = req.headers.token || null;

    async function request(
      path,
      { allowNotFound = true, params = {}, method = "GET", body = null } = {}
    ) {
      const paramsStr = Object.entries({ ...params, key: appKey, token })
        .map(([key, value]) => key + "=" + encodeURIComponent(value))
        .join("&");

      const url = `https://api.trello.com/1/${path}?${paramsStr}`;

      const resp = await fetch(url);

      const text = await resp.text();
      const { status } = resp;

      if (status === 401) {
        throw new AuthenticationError(text);
      }

      if (status === 404) {
        if (allowNotFound) {
          console.log();
          console.log({ path, params, response: "NOT_FOUND" });
          console.log();

          return null;
        } else {
          throw new ApolloError("Not found", "NOT_FOUND");
        }
      }

      if (status !== 200) {
        throw new ApolloError(text, "BAD_TRELLO_STATUS", { status });
      }

      try {
        const result = JSON.parse(text);

        console.log();
        console.log({ path, params, response: result });
        console.log();

        return result;
      } catch (e) {
        throw new ApolloError(text, "BAD_TRELLO_BODY");
      }
    }

    return { request };
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
