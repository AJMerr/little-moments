output "s3_bucket_name" {
    value = aws_s3_bucket.lm_prod.bucket
}

output "instance_public_ip" {
  value = aws_instance.lm_prod_instance.public_ip
}

output "instance_id" {
  value = aws_instance.lm_prod_instance.id
}
