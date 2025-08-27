export const minioConfig = {
  endPoint: process.env.NODE_ENV === 'production' ? (process.env.MINIO_ENDPOINT || 'minio') : 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  bucket: process.env.MINIO_BUCKET || 'quark-media',
};