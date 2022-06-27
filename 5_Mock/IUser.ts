export interface IUser {
  getName(): string;
  setAge(age: number): void;
  save(name: string, age: number): Promise<IUser>;
}
