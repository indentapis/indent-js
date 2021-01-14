variable "aws_region" {
  type    = string
  default = "us-west-2"
}

variable "aws_profile" {
  type    = string
  default = "default"
}

variable "indent_webhook_secret" {
  type = string
}

variable "okta_tenant" {
  type = string
}

variable "okta_token" {
  type = string
}
