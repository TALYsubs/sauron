import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver } from 'graphql';

export const authDirectiveTransformer = (schema) => {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(schema, fieldConfig, 'auth')?.[0];

      if (!authDirective) return;
      const originalResolve = fieldConfig.resolve ?? defaultFieldResolver;
      const requiredGroups = authDirective.groups;

      fieldConfig.resolve = async (source, args, context, info) => {
        if (!requiredGroups.includes(context.group)) {
          throw new Error('Not authorized');
        }
        const result = await originalResolve(source, args, context, info);

        return result;
      };

      return fieldConfig;
    }
  });
};
