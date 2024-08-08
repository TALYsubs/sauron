import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

export const getSupergraph = async () => {
  try {
    const s3Client = new S3Client({ region: process.env.AWS_S3_REGION });
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME as string,
      Key: `${process.env.ENVIRONMENT ?? 'dev'}/supergraph.graphql`
    });
    const data = await s3Client.send(command);
    return await data?.Body?.transformToString('utf8');
  } catch (err) {
    console.log('Error fetching schema from S3:', err);
    throw err;
  }
};
