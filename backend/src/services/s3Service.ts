import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uploadToS3 = async (
  file: Express.Multer.File,
  userId: string
): Promise<string> => {
  const key = `documents/${userId}/${uuidv4()}-${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ServerSideEncryption: 'AES256',
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};

export const deleteFromS3 = async (fileUrl: string): Promise<void> => {
  const key = fileUrl.split('.amazonaws.com/')[1];
  await s3.deleteObject({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  }).promise();
};

export const getSignedUrl = (fileUrl: string): string => {
  const key = fileUrl.split('.amazonaws.com/')[1];
  return s3.getSignedUrl('getObject', {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Expires: 3600,
  });
};