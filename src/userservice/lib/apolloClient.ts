import {
  ApolloClient,
  InMemoryCache,
  from,
  HttpLink,
  CombinedGraphQLErrors,
} from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";

// HTTP connection to the GraphQL API
const httpLink = new HttpLink({
  uri: "http://localhost:8084/graphql", // 👈 update port if needed
});

// Error handling (new v4 style)
const errorLink = new ErrorLink(({ error }: { error: any }) => {
  if (CombinedGraphQLErrors.is(error)) {
    // GraphQL errors from the server
    console.error("[GraphQL errors]:", error.errors);
  } else if (error) {
    // Network or other errors
    console.error("[Network/Other error]:", error.message);
  }
});

// Auth link (new v4 style with SetContextLink)
const authLink = new SetContextLink((prevContext) => {
  // guard for SSR / non-browser envs
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth.token") : null;

  return {
    ...prevContext,
    headers: {
      ...(prevContext.headers || {}),
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Create Apollo Client
const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});

export default apolloClient;
