  
locals {
  name          = "indent-okta-webhook"
  lambda_memory = 128

  tags = {
    Name       = "Indent + Okta on AWS via Terraform"
    GitRepo    = "https://github.com/indentapis/indent-js"
    ProvidedBy = "Indent"
  }
}