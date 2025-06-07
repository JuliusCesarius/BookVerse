import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

export interface UserDocument extends mongoose.Document {
  id: string;
  username: string;
  email: string;
  password: string;
  savedBooks: Array<{
    bookId: string;
    authors: string[];
    description: string;
    title: string;
    image: string;
    link: string;
  }>;
  isCorrectPassword(password: string): Promise<boolean>;
  bookCount: number;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must match an email address!'],
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
    },
    savedBooks: [
      {
        type: {
          bookId: {
            type: String,
            required: true,
          },
          authors: [String],
          description: String,
          title: {
            type: String,
            required: true,
          },
          image: String,
          link: String,
        },
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

// hash user password
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// custom method to compare and validate password for logging in
userSchema.methods.isCorrectPassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

// when we query a user, we'll also get another field called `bookCount` with the number of saved books we have
userSchema.virtual('bookCount').get(function () {
  return this.savedBooks.length;
});

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;
