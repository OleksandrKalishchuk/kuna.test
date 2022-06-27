import { Project } from 'ts-morph';

export const getInterfaceMethods = (
  interfaceName: string,
  filePath: string
): string[] => {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);
  const node = sourceFile.getInterface(interfaceName)!;
  return node.getMethods().map((p) => p.getName());
};
