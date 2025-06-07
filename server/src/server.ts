import express from 'express';
import path from 'node:path';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { json } from 'body-parser';
import db from './config/connection';
import { typeDefs, resolvers } from './schemas/index';
import { authMiddleware } from './utils/auth';
import routes from './routes/index';

const app = express();
const PORT = process.env.PORT || 3001;

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start Apollo Server
const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  // Apply Apollo Server middleware
  app.use(
    '/graphql',
    json(),
    expressMiddleware(server, {
      context: authMiddleware,
    })
  );

  // Keep the REST API routes for backward compatibility
  app.use(routes);

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(`🚀 GraphQL server ready at http://localhost:${PORT}/graphql`);
    });
  });
};

startApolloServer();
