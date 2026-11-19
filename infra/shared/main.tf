# infra/shared/main.tf — repositorios ECR (sin workspaces: los comparten staging y production)
terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # La configuración del bucket se pasa en "terraform init -backend-config=../backend.hcl"
  backend "s3" {}
}

provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Project   = "plisados-roldan"
      ManagedBy = "Terraform"
    }
  }
}

locals {
  repos = ["plisados-web", "plisados-api", "plisados-db-migrate"]
}

resource "aws_ecr_repository" "repo" {
  for_each             = toset(local.repos)
  name                 = each.key
  image_tag_mutability = "IMMUTABLE" # un tag nunca vuelve a apuntar a otra imagen
  force_delete         = true        # permite destruir al final del curso

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "keep_last_20" {
  for_each   = aws_ecr_repository.repo
  repository = each.value.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Conservar las ultimas 20 imagenes"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 20
      }
      action = { type = "expire" }
    }]
  })
}

output "repository_urls" {
  value = { for k, r in aws_ecr_repository.repo : k => r.repository_url }
}
