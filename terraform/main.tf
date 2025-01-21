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
        allowed_headers = ["*"]
        allowed_methods = ["GET", "POST", "PUT", "DELETE", "HEAD"]
        allowed_origins = ["*"]
        expose_headers = ["ETag"]
        max_age_seconds = 3000
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

resource "aws_security_group" "rds_security_group" {
  name = "rds_security_group"
  description = "Security group for RDS"
  vpc_id = data.aws_vpc.default.id

  ingress {
    from_port = 5432
    to_port = 5432
    protocol = "tcp"
    cidr_blocks = ["172.31.0.0/16"]
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "rds_security_group"
  }
}

resource "aws_db_instance" "lm_prod_rds" {
  allocated_storage = 20
  engine = "postgres"
  engine_version = "16.3"
  instance_class = "db.t3.micro"
  db_name = "lm_prod_db"
  username = var.db_username
  password = var.db_password
  parameter_group_name = "default.postgres16"
  publicly_accessible = true
  vpc_security_group_ids = [aws_security_group.rds_security_group.id]

  tags = {
    Name = "lm_prod_rds"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_subnet" "lm_prod_subnet_1" {
  vpc_id     = data.aws_vpc.default.id
  cidr_block = "172.31.128.0/20" 
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "lm_prod_subnet"
  }
}

resource "aws_subnet" "lm_prod_subnet_2" {
  vpc_id     = data.aws_vpc.default.id
  cidr_block = "172.31.112.0/20" 
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = {
    Name = "lm_prod_subnet_2"
  }
}

resource "aws_db_subnet_group" "lm_prod_subnet_group" {
  name = "lm_prod_subnet_group"
  subnet_ids = [aws_subnet.lm_prod_subnet_1.id, aws_subnet.lm_prod_subnet_2.id]

  tags = {
    Name = "lm_prod_subnet_group"
  }
}

# Cognito User Pool
resource "aws_cognito_user_pool" "little_moments_pool" {
  name = "little-moments-user-pool"

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  username_attributes = ["email"]
  
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject = "Your Little Moments verification code"
    email_message = "Your verification code is {####}"
  }

  schema {
    attribute_data_type = "String"
    name                = "name"
    required           = true
    mutable            = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
}

# Cognito User Pool Client
resource "aws_cognito_user_pool_client" "little_moments_client" {
  name = "little-moments-client"

  user_pool_id = aws_cognito_user_pool.little_moments_pool.id

  generate_secret = false
  
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"
  ]
}