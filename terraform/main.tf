terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
    region = var.aws_region
}

resource "aws_s3_bucket" "lm_prod" {
    bucket = var.s3_bucket_name
    force_destroy = true
}

// Temporary block to allow public access to the bucket. Will be removed in favor of using Cognito to authenticate users.  
resource "aws_s3_bucket_public_access_block" "lm_prod_bucket_public_access_block" {
  bucket = aws_s3_bucket.lm_prod.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "lm_prod_bucket_policy" {
    bucket = aws_s3_bucket.lm_prod.id
    policy = jsonencode({   
        Version = "2012-10-17"
        Statement = [
            {
                Effect = "Allow"
                Principal = "*"
                Action = "s3:GetObject"
                Resource = "${aws_s3_bucket.lm_prod.arn}/*"
            }
        ]
    })
}

resource "aws_s3_bucket_cors_configuration" "lm_prod_bucket_cors_configuration" {
    bucket = aws_s3_bucket.lm_prod.id

    cors_rule {
        allowed_headers = ["Authorization"]
        allowed_methods = ["GET", "POST", "PUT", "DELETE", "HEAD"]
        allowed_origins = ["*"]
    }
}
