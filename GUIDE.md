# BookVerse - GraphQL API Implementation Guide

## Project Overview
BookVerse is a MERN stack application that has been enhanced with a GraphQL API implementation. The project demonstrates the integration of Apollo Server with an existing Express.js backend while maintaining backward compatibility with REST endpoints.

## Tech Stack

### Backend
- **Node.js & Express.js**: Core server framework
- **TypeScript**: For type-safe development
- **Apollo Server**: GraphQL server implementation
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JSON Web Tokens (JWT)**: Authentication
- **Nodemon**: Development server with hot reloading

### Frontend (Existing)
- **React**: Frontend framework
- **Apollo Client**: GraphQL client
- **React Router**: Navigation
- **JWT Decode**: Token handling

## GraphQL Concepts

### What is GraphQL?
GraphQL is a query language for APIs and a runtime for executing those queries with your existing data. It provides a complete description of the data in your API, gives clients the power to ask for exactly what they need, makes it easier to evolve APIs over time, and enables powerful developer tools.

**Real-world Use Case**: 
- In a social media app, instead of making multiple REST API calls to fetch a user's profile, posts, and friends, GraphQL allows you to get all this data in a single request, specifying exactly which fields you need for each type of data.

### Key Concepts

#### Schema
The GraphQL schema defines the types and relationships between data in your API. It serves as a contract between the client and server, specifying:
- Available types and their fields
- Available operations (queries and mutations)
- Input types for operations

**Real-world Use Case**:
- In an e-commerce platform, the schema defines relationships between Products, Categories, Reviews, and Users. This allows clients to request a product with its related reviews and category information in a single query, reducing the number of API calls needed.

Example from our schema:
```graphql
type User {
  _id: ID!
  username: String!
  email: String!
  savedBooks: [Book]
}

type Book {
  bookId: String!
  authors: [String]
  description: String
  title: String!
  image: String
  link: String
}
```

#### Queries
Queries are read-only operations that fetch data. They are similar to GET requests in REST. In our implementation:
- `me`: Fetches the current user's information
- Queries can request specific fields, reducing over-fetching

**Real-world Use Case**:
- In a dashboard application, instead of loading all user data, you can request only the specific metrics needed for each widget, improving performance and reducing data transfer.

Example:
```graphql
query {
  me {
    username
    email
    savedBooks {
      title
      authors
    }
  }
}
```

#### Mutations
Mutations are operations that modify data. They are similar to POST, PUT, DELETE requests in REST. Our implementation includes:
- `addUser`: Creates a new user account
- `login`: Authenticates a user
- `saveBook`: Adds a book to user's saved books
- `removeBook`: Removes a book from user's saved books

**Real-world Use Case**:
- In a task management app, when creating a new task, you can use a mutation to add the task and immediately receive the updated task list in the response, eliminating the need for a separate query.

Example:
```graphql
mutation {
  saveBook(bookData: {
    bookId: "123",
    title: "Example Book",
    authors: ["Author Name"]
  }) {
    _id
    savedBooks {
      title
    }
  }
}
```

#### Resolvers
Resolvers are functions that handle the logic for each field in your schema. They:
- Define how to fetch or modify data
- Handle authentication and authorization
- Process input data
- Return the requested data

**Real-world Use Case**:
- In a real-time chat application, resolvers can handle message delivery, user presence, and typing indicators, while also managing permissions and data access control.

Example resolver:
```typescript
const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return await User.findById(context.user._id);
      }
      throw new GraphQLError('Not logged in');
    }
  }
};
```

#### Type Definitions
Type definitions describe the shape of your data and available operations. They include:
- Object types (User, Book)
- Input types (for mutations)
- Scalar types (String, ID, etc.)
- Enums and interfaces

**Real-world Use Case**:
- In a content management system, type definitions can represent different content types (articles, pages, media) with their specific fields and relationships, making it easy to query and modify content.

Example:
```graphql
input BookInput {
  bookId: String!
  authors: [String]
  description: String
  title: String!
  image: String
  link: String
}
```

#### Context
The context object is shared across all resolvers and contains:
- Authentication information
- Database connections
- Other shared resources

**Real-world Use Case**:
- In a multi-tenant application, the context can store the current tenant's information, allowing resolvers to automatically filter data based on the tenant's context without explicit filtering in each query.

In our implementation:
```typescript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});
```

#### Error Handling
GraphQL provides a standardized way to handle errors:
- GraphQLError for application errors
- Authentication errors
- Validation errors
- Database errors

**Real-world Use Case**:
- In a payment processing system, error handling can differentiate between validation errors (invalid card number), authentication errors (expired session), and business logic errors (insufficient funds), providing appropriate error messages to the client.

Example:
```typescript
if (!context.user) {
  throw new GraphQLError('You need to be logged in!');
}
```

#### Subscriptions
Subscriptions enable real-time updates in GraphQL:
- WebSocket-based communication
- Real-time data updates
- Event-driven architecture

**Real-world Use Case**:
- In a collaborative document editor, subscriptions can notify all connected clients when a user makes changes, enabling real-time collaboration without polling.

Example:
```graphql
subscription {
  bookAdded {
    _id
    title
    authors
  }
}
```

#### Fragments
Fragments are reusable pieces of query logic:
- Share common fields between queries
- Reduce duplication
- Improve maintainability

**Real-world Use Case**:
- In a social media app, you can define a fragment for user profile information that can be reused across different queries (user profile, comments, posts).

Example:
```graphql
fragment BookDetails on Book {
  title
  authors
  description
  image
}

query {
  me {
    savedBooks {
      ...BookDetails
    }
  }
}
```

## Project Structure
```
BookVerse/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── connection.js
│   │   ├── controllers/
│   │   │   └── userController.js
│   │   ├── models/
│   │   │   ├── Book.js
│   │   │   └── User.js
│   │   ├── schemas/
│   │   │   ├── index.ts
│   │   │   ├── resolvers.ts
│   │   │   └── typeDefs.ts
│   │   ├── routes/
│   │   │   └── index.js
│   │   ├── utils/
│   │   │   └── auth.js
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
└── client/
    └── ... (existing React frontend)
```

## Implementation Details

### GraphQL Schema
The GraphQL schema is defined in `typeDefs.ts` with the following types:
- `User`: User information and saved books
- `Book`: Book details including Google Books API data
- `Auth`: Authentication payload with token and user data
- Input types for mutations

### Resolvers
Resolvers in `resolvers.ts` handle:
- Queries:
  - `me`: Get current user information
- Mutations:
  - `addUser`: Create new user account
  - `login`: User authentication
  - `saveBook`: Add book to user's saved books
  - `removeBook`: Remove book from user's saved books

### Authentication
- JWT-based authentication
- Protected routes using `authMiddleware`
- Token verification in resolvers

### Database
- MongoDB connection using Mongoose
- User and Book models
- Data persistence for user accounts and saved books

## Acceptance Criteria Met

1. ✅ **GraphQL API Implementation**
   - Apollo Server integration
   - GraphQL schema and resolvers
   - Authentication middleware
   - MongoDB connection

2. ✅ **Type Definitions**
   - User, Book, and Auth types
   - Input types for mutations
   - Proper type relationships

3. ✅ **Resolvers**
   - Query resolvers (me)
   - Mutation resolvers (addUser, login, saveBook, removeBook)
   - Authentication checks

4. ✅ **Authentication**
   - JWT implementation
   - Auth middleware
   - Protected routes

5. ✅ **Database Integration**
   - MongoDB connection
   - User and Book models
   - Data persistence

6. ✅ **Error Handling**
   - GraphQL errors
   - Authentication errors
   - Database errors

7. ✅ **Environment Configuration**
   - MongoDB URI
   - JWT secret
   - Port configuration

8. ✅ **Backward Compatibility**
   - REST API routes maintained
   - Existing functionality preserved

## Getting Started

1. **Prerequisites**
   - Node.js
   - MongoDB
   - npm or yarn

2. **Installation**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the server directory:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/googlebooks
   JWT_SECRET=your-secret-key
   ```

4. **Running the Application**
   ```bash
   # Start MongoDB
   brew services start mongodb/brew/mongodb-community

   # Start server (development)
   cd server
   npm run watch

   # Start client (development)
   cd client
   npm start
   ```

5. **Accessing the API**
   - GraphQL Playground: http://localhost:3001/graphql
   - REST API: http://localhost:3001/api

## Deployment Guide

### Local Development

1. **Start MongoDB**
   ```bash
   # macOS
   brew services start mongodb/brew/mongodb-community

   # Windows
   net start MongoDB

   # Linux
   sudo systemctl start mongod
   ```

2. **Development Mode**
   ```bash
   # Terminal 1 - Server
   cd server
   npm run watch

   # Terminal 2 - Client
   cd client
   npm start
   ```

3. **Build for Production**
   ```bash
   # Build server
   cd server
   npm run build

   # Build client
   cd client
   npm run build
   ```

### Production Deployment

1. **Server Deployment (Heroku)**
   ```bash
   # Login to Heroku
   heroku login

   # Create Heroku app
   heroku create your-app-name

   # Add MongoDB addon
   heroku addons:create mongolab

   # Set environment variables
   heroku config:set JWT_SECRET=your-secret-key

   # Deploy server
   git subtree push --prefix server heroku main
   ```

2. **Client Deployment (Netlify)**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Login to Netlify
   netlify login

   # Initialize Netlify
   cd client
   netlify init

   # Deploy
   netlify deploy --prod
   ```

3. **Environment Variables**
   ```bash
   # Server (.env)
   MONGODB_URI=your-mongodb-uri
   JWT_SECRET=your-secret-key
   PORT=3001

   # Client (.env)
   REACT_APP_GRAPHQL_URI=your-graphql-endpoint
   REACT_APP_REST_URI=your-rest-endpoint
   ```

### Docker Deployment

1. **Build Docker Images**
   ```bash
   # Build server image
   cd server
   docker build -t bookverse-server .

   # Build client image
   cd client
   docker build -t bookverse-client .
   ```

2. **Run with Docker Compose**
   ```bash
   # Create docker-compose.yml
   version: '3'
   services:
     server:
       build: ./server
       ports:
         - "3001:3001"
       environment:
         - MONGODB_URI=mongodb://mongo:27017/googlebooks
         - JWT_SECRET=your-secret-key
       depends_on:
         - mongo

     client:
       build: ./client
       ports:
         - "3000:3000"
       environment:
         - REACT_APP_GRAPHQL_URI=http://localhost:3001/graphql
         - REACT_APP_REST_URI=http://localhost:3001/api

     mongo:
       image: mongo:latest
       ports:
         - "27017:27017"
       volumes:
         - mongodb_data:/data/db

   volumes:
     mongodb_data:

   # Run containers
   docker-compose up -d
   ```

### Deployment Checklist

1. **Pre-deployment**
   - [ ] All tests passing
   - [ ] Environment variables configured
   - [ ] Build successful
   - [ ] Database migrations ready
   - [ ] SSL certificates obtained

2. **Server Deployment**
   - [ ] MongoDB connection string updated
   - [ ] JWT secret configured
   - [ ] CORS settings adjusted
   - [ ] Error logging configured
   - [ ] Rate limiting implemented

3. **Client Deployment**
   - [ ] API endpoints updated
   - [ ] Environment variables set
   - [ ] Build optimized
   - [ ] Static assets served
   - [ ] Cache headers configured

4. **Post-deployment**
   - [ ] Health checks passing
   - [ ] Monitoring configured
   - [ ] Backup strategy in place
   - [ ] Documentation updated
   - [ ] Performance metrics checked

### Troubleshooting

1. **Common Issues**
   ```bash
   # MongoDB connection issues
   mongosh
   # Check connection
   db.runCommand({ ping: 1 })

   # Server build issues
   cd server
   rm -rf dist/
   npm run build

   # Client build issues
   cd client
   rm -rf build/
   npm run build
   ```

2. **Logs**
   ```bash
   # Server logs
   heroku logs --tail

   # Client logs
   netlify logs

   # Docker logs
   docker-compose logs -f
   ```

3. **Database**
   ```bash
   # Backup
   mongodump --uri="your-mongodb-uri"

   # Restore
   mongorestore --uri="your-mongodb-uri" dump/
   ```

## Testing the API

### GraphQL Queries
```graphql
# Get current user
query {
  me {
    _id
    username
    email
    savedBooks {
      bookId
      title
      authors
    }
  }
}
```

### GraphQL Mutations
```graphql
# Create user
mutation {
  addUser(username: "testuser", email: "test@example.com", password: "password123") {
    token
    user {
      _id
      username
    }
  }
}

# Login
mutation {
  login(email: "test@example.com", password: "password123") {
    token
    user {
      _id
      username
    }
  }
}
```

## Security Considerations
- JWT tokens for authentication
- Password hashing
- Protected routes and resolvers
- Environment variables for sensitive data

## Future Improvements
- Add input validation
- Implement rate limiting
- Add caching layer
- Enhance error handling
- Add comprehensive testing
- Implement real-time features with subscriptions 