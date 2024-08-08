import { ApolloServerPlugin } from '@apollo/server';
import { VariableValues } from '@apollo/server/dist/esm/externalTypes/graphql';

const logPlugin: ApolloServerPlugin = {
  async requestDidStart() {
    const startTime = Date.now();
    return {
      async willSendResponse(context) {
        const metrics = process.env.METRICS === 'true';
        const duration = Date.now() - startTime;
        if (metrics) {
          console.log({
            MetricName: 'FederationQueryDuration',
            Dimensions: [
              {
                Name: 'Action',
                Value: context.request.operationName ?? 'Unknown'
              },
              {
                Name: 'Query',
                Value: context.request.query ?? 'Unknown'
              },
              {
                Name: 'Variables',
                Value: parserVariableValues(context.request.variables) ?? 'Unknown'
              }
            ],
            Unit: 'Milliseconds',
            Value: duration
          });
        }
      }
    };
  }
};

const parserVariableValues = (variableValues: VariableValues | unknown): string => {
  let output = '';
  if (!variableValues) return 'Unknown';
  for (const [key, value] of Object.entries(variableValues)) {
    output += `${key}: ${value as string} \n `;
  }
  return output;
};

export default logPlugin;
