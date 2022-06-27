import {
  BufferField,
  BufferSchema,
  BufferSerializer,
  BufferSchemaValue,
} from './BufferSerializer';

type Post = {
  id: string;
  text: string;
  createAt: Date;
  draft: boolean;
};

type User = {
  id: string;
  age: number;
  posts: Post[];
};

const userSchema: BufferSchema = {
  id: new BufferField(BufferSchemaValue.String),
  age: new BufferField(BufferSchemaValue.Number),
  posts: [
    {
      id: new BufferField(BufferSchemaValue.String),
      text: new BufferField(BufferSchemaValue.String),
      createAt: new BufferField(BufferSchemaValue.Date),
      draft: new BufferField(BufferSchemaValue.Boolean, false),
    },
  ],
};

const serializer = new BufferSerializer<User>(userSchema);

const buffer = serializer.toBuffer({
  id: 'u1',
  age: 30,
  posts: [
    {
      id: 'p1',
      text: 'post1',
      createAt: new Date(),
      draft: true,
    },
    {
      id: 'p2',
      text: 'post2',
      createAt: new Date(),
    },
  ],
});
console.log(buffer);

const user = serializer.fromBuffer(buffer);
console.log(user);
