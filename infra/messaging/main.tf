locals {
  tags = { Project = "oficina-os", Environment = var.environment, ManagedBy = "terraform", Phase = "4" }
}
resource "aws_sns_topic" "domain_events" {
  name              = "oficina-domain-events-${var.environment}"
  kms_master_key_id = "alias/aws/sns"
  tags              = local.tags
}
resource "aws_sqs_queue" "messages_dlq" {
  name                      = "os-service-${var.environment}-dlq"
  message_retention_seconds = 1209600
  sqs_managed_sse_enabled   = true
  tags                      = local.tags
}
resource "aws_sqs_queue" "messages" {
  name                       = "os-service-${var.environment}-commands"
  visibility_timeout_seconds = 60
  message_retention_seconds  = 345600
  receive_wait_time_seconds  = 20
  sqs_managed_sse_enabled    = true
  redrive_policy             = jsonencode({ deadLetterTargetArn = aws_sqs_queue.messages_dlq.arn, maxReceiveCount = 5 })
  tags                       = local.tags
}
data "aws_iam_policy_document" "allow_topic" {
  statement {
    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.messages.arn]
    principals {
      type        = "Service"
      identifiers = ["sns.amazonaws.com"]
    }
    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [aws_sns_topic.domain_events.arn]
    }
  }
}
resource "aws_sqs_queue_policy" "allow_topic" {
  queue_url = aws_sqs_queue.messages.id
  policy    = data.aws_iam_policy_document.allow_topic.json
}
resource "aws_sns_topic_subscription" "os_events" {
  topic_arn            = aws_sns_topic.domain_events.arn
  protocol             = "sqs"
  endpoint             = aws_sqs_queue.messages.arn
  raw_message_delivery = true
}
variable "aws_region" {
  type    = string
  default = "us-east-1"
}
variable "environment" {
  type    = string
  default = "hml"
}
output "domain_events_topic_arn" { value = aws_sns_topic.domain_events.arn }
output "messages_queue_url" { value = aws_sqs_queue.messages.url }
output "messages_dlq_url" { value = aws_sqs_queue.messages_dlq.url }
