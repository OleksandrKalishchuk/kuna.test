import { IUser } from './IUser';
import { mock } from './mock';
import path from 'path';

const mockUser = mock<IUser>('IUser', path.resolve(__dirname, 'IUser.ts'));

mockUser.setAge.mock.setResult(true);
console.log(mockUser.setAge(10));

mockUser.setAge.mock.setResult(false);
console.log(mockUser.setAge(30));

console.log(mockUser.setAge.mock.calls);
