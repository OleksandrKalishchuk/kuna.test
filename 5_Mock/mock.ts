import { getInterfaceMethods } from './utils';

type MockedMethodCall = { arguments: any[] };

interface MockedMethod {
  (...options: any[]): any;
  mock: {
    calls: MockedMethodCall[];
    result: any;
    setResult: (result: any) => void;
  };
}

type MockedObject<T> = {
  [K in keyof T]: MockedMethod;
};

const createMockedMethod = (): MockedMethod => {
  const mockedMethod = <MockedMethod>function (...options: any[]): any {
    mockedMethod.mock.calls.push({
      arguments: options,
    });

    return mockedMethod.mock.result;
  };

  mockedMethod.mock = {
    calls: [],
    result: null,
    setResult: function (result: any): void {
      this.result = result;
    },
  };

  return mockedMethod;
};

export const mock = <T>(
  interfaceName: string,
  filePath: string
): MockedObject<T> => {
  const object = {} as MockedObject<T>;

  const interfaceMethods = getInterfaceMethods(interfaceName, filePath);
  for (const methodName of interfaceMethods) {
    Object.defineProperty(object, methodName, {
      value: createMockedMethod(),
    });
  }

  return object;
};
