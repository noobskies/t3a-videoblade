/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import "dotenv/config"; // Load .env file
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../src/env.js";

const s3 = new S3Client({
  region: env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

async function testS3() {
  console.log("Testing S3 connectivity...");
  console.log("Region:", env.AWS_REGION ?? "us-east-1");
  console.log("Bucket:", env.AWS_S3_BUCKET_NAME ?? "not-set");

  try {
    const result = await s3.send(
      new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET_NAME ?? "videoblade-dev-videos",
        Key: "test.txt",
        Body: "Hello from VideoBlade!",
      }),
    );
    console.log("✅ S3 upload successful!");
    console.log("ETag:", result.ETag);
    console.log(
      "\nYou can verify the file in AWS Console or run:",
      `aws s3 ls s3://${env.AWS_S3_BUCKET_NAME ?? "videoblade-dev-videos"}/`,
    );
  } catch (error) {
    console.error("❌ S3 upload failed:");
    console.error(error);
    process.exit(1);
  }
}

void testS3();
