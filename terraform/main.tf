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

resource "aws_instance" "lm_prod_instance" {
  ami = data.aws_ami.ubuntu.id
  instance_type = "t2.micro"
  key_name = var.key_pair_name
  vpc_security_group_ids = [aws_security_group.lm_prod_security_group.id]
  tags = {
    Name = "lm_prod_instance"
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners = ["099720109477"]

  filter {
    name = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
}

// Add this data source to get the default VPC
data "aws_vpc" "default" {
  default = true
}

resource "aws_security_group" "lm_prod_security_group" {
  name = "lm_prod_security_group"
  description = "Security group for HTTP and SSH access"
  vpc_id = data.aws_vpc.default.id

  ingress {
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port = 22
    to_port = 22
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {    
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "lm_prod_security_group"
  }
}
