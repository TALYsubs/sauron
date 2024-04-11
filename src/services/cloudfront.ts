import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { getParameterFromSSM } from '../helpers/secret';

export async function generateSignedUrl(key: string): Promise<string> {
  const cloudfrontDistributionDomain = process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN ?? '';
  const keyPairId = process.env.CLOUDFRONT_PUBLIC_KEY_ID ?? '';
  const privateKey = (await getParameterFromSSM('cloudfront/PrivateKey')) ?? '';

  const currentDate = new Date();
  const oneMonthFromNow = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    currentDate.getDate()
  );

  try {
    const url = `${cloudfrontDistributionDomain ?? ''}/${key}`;
    const options = {
      keyPairId,
      privateKey,
      url,
      dateLessThan: oneMonthFromNow.toISOString()
    };
    const signedUrl = getSignedUrl(options);
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}
