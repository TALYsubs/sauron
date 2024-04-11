import { SSM } from 'aws-sdk';

const ssm = new SSM({
  region: process.env.REGION ?? ''
});

const PARAMETER_NAME = '/taly/';
const env = (process.env.ENVIRONMENT as string) + '/';

export interface Secret {
  ecommerce: string;
  domain: string;
  password: string;
}

export const storeParameterToSSM = async (
  key: string,
  value: string,
  encrypted: boolean = false,
  kmsKeyId?: string
): Promise<void> => {
  const encryption = encrypted ? { Type: 'SecureString', KeyId: kmsKeyId } : {};

  const params = {
    Name: PARAMETER_NAME + env + key,
    Value: value,
    Overwrite: true,
    Type: 'String',
    ...encryption
  };

  await ssm.putParameter(params).promise();
};

export const getParameterFromSSM = async (
  key: string,
  encrypted: boolean = false
): Promise<string> => {
  const params = {
    Name: PARAMETER_NAME + env + key,
    WithDecryption: encrypted
  };

  const response = await ssm.getParameter(params).promise();

  if (!response?.Parameter?.Value) {
    throw new Error('Parameter not found in SSM');
  }

  return response.Parameter.Value;
};
