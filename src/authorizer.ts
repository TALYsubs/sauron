import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient
} from '@aws-sdk/client-cognito-identity-provider';
import axios from 'axios';
import { JwtPayload, verify } from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import { Jwks } from './types/global';

function BadRequestError(message: string): Error {
  const error = new Error(message);
  error.name = 'BadRequestError';
  return error;
}

const fetchJwks = async (): Promise<Jwks> => {
  const url = process.env.JWT_SECRET;
  if (!url) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }
  const response = await axios.get<Jwks>(url);
  return response.data;
};

const getPemFromJwks = (jwks: Jwks, kid: string): string => {
  const key = jwks.keys.find((k) => k.kid === kid);
  if (!key) {
    throw new Error('Key ID not found in JWKS.');
  }
  return jwkToPem(key);
};

export const isAuthorized = async (
  authorizationHeader: string
): Promise<JwtPayload | string | false> => {
  const token = authorizationHeader.split(' ')[1]; // Assuming the header is in the format "Bearer <token>"

  if (!token) {
    throw BadRequestError('Missing token.');
  }

  try {
    const decodedHeader = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString());
    const jwks = await fetchJwks();
    const pem = getPemFromJwks(jwks, decodedHeader.kid);
    const auth = verify(token, pem, { algorithms: ['RS256'] }) as JwtPayload;

    // Set up the Cognito client
    const cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.REGION as string // Replace with your AWS region
    });

    // Get user details from Cognito
    const userCommand = new AdminGetUserCommand({
      UserPoolId: process.env.USER_POOL_ID as string, // Replace with your Cognito User Pool ID
      Username: auth['cognito:username']
    });

    const userData = await cognitoClient.send(userCommand).catch((e) => {
      throw new Error(e.message);
    });

    // If necessary, you can combine JWT payload with Cognito data
    const combinedData = {
      ...auth,
      cognitoData: userData
    };

    return combinedData;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
};
