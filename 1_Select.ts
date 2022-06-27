type User = {
  id: string;
  name: string;
  posts: Post[];
};

type Post = {
  id: string;
  text: string;
  user: User;
};

type Select<T> = {
  [K in keyof T]?: T[K] extends Record<any, any>
    ? Select<T[K]> extends any[]
      ? Select<T[K][number]>
      : Select<T[K]>
    : boolean;
};

const userSelect: Select<User> = {
  id: true,
  name: true,
  posts: {
    id: true,
    text: true,
  },
};

const postSelect: Select<Post> = {
  id: true,
  text: true,
  user: {
    id: true,
    name: true,
  },
};
