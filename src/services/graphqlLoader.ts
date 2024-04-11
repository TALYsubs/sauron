import fs from 'fs';
import path from 'path';
import { print } from 'graphql';
import { mergeTypeDefs } from '@graphql-tools/merge';

const isGraphqlFile = (filePath: string): boolean => path.extname(filePath) === '.graphql';

const readGraphqlFile = (filePath: string): string => {
  console.log('Reading file:', filePath);
  return fs.readFileSync(filePath, 'utf8');
};

const getGraphqlFiles = (dir: string): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return getGraphqlFiles(entryPath);
    } else if (entry.isFile() && isGraphqlFile(entryPath)) {
      return readGraphqlFile(entryPath);
    }
    return [];
  });
};

export const mergeGraphqlTypes = (dir: string): string => {
  const filesContent = getGraphqlFiles(dir);
  const mergedDocument = mergeTypeDefs(filesContent);
  return print(mergedDocument);
};
