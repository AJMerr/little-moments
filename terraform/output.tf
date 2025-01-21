output "s3_bucket_name" {
    value = aws_s3_bucket.lm_prod.bucket
}

output "instance_public_ip" {
  value = aws_instance.lm_prod_instance.public_ip
}

output "instance_id" {
  value = aws_instance.lm_prod_instance.id
}

output "cognito_pool_arn" {
  description = "ARN of the Cognito User Pool"
  value       = aws_cognito_user_pool.little_moments_pool.arn
}

output "cognito_pool_endpoint" {
  description = "Endpoint of the Cognito User Pool"
  value       = aws_cognito_user_pool.little_moments_pool.endpoint
} 
