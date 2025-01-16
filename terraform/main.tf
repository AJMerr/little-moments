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

resource "aws_s3_bucket" "lm_prod_bucket" {
    bucket = var.s3_bucket_name
    force_destroy = true
}

resource "aws_s3_bucket_policy" "lm_prod_bucket_policy" {
    bucket = aws_s3_bucket.lm_prod_bucket.id
    policy = jsonencode({   
        Version = "2012-10-17"
        Statement = [
            {
                Effect = "Allow"
                Principal = "*"
                Action = "s3:GetObject"
                Resource = "${aws_s3_bucket.lm_prod_bucket.arn}/*"
            }
        ]
    })
}

resource "aws_s3_bucket_cors_configuration" "lm_prod_bucket_cors_configuration" {
    bucket = aws_s3_bucket.lm_prod_bucket.id
    cors_rule = [
        {
            allowed_headers = ["Authorization"]
            allowed_methods = ["GET", "POST", "PUT", "DELETE", "HEAD"]
            allowed_origins = ["*"]
        }
    ]
}
