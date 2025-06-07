import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';

const secret = process.env.JWT_SECRET || 'mysecretsshhhhh';
const expiration = '2h';

export const signToken = (user: any) => {
  const payload = {
    _id: user._id,
    username: user.username,
    email: user.email,
  };

  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};

export const authMiddleware = async ({ req }: { req: any }) => {
  // allows token to be sent via req.body, req.query, or headers
  let token = req.body.token || req.query.token || req.headers.authorization;

  // ["Bearer", "<tokenvalue>"]
  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }

  if (!token) {
    return req;
  }

  try {
    const { data } = jwt.verify(token, secret, { maxAge: expiration }) as { data: any };
    req.user = data;
  } catch {
    throw new GraphQLError('Invalid token');
  }

  return req;
}; 