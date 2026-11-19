# infra/app/main.tf — lo que cambia en cada despliegue: task definitions y servicios ECS
terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {}
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "plisados-roldan"
      Environment = var.environment_name
      ManagedBy   = "Terraform"
    }
  }
}

data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

# Lee los outputs de la capa platform del MISMO workspace (staging o production)
data "terraform_remote_state" "platform" {
  backend   = "s3"
  workspace = terraform.workspace

  config = {
    bucket = var.state_bucket
    key    = "platform/terraform.tfstate"
    region = var.aws_region
  }
}

locals {
  p  = "plisados-${var.environment_name}"
  pf = data.terraform_remote_state.platform.outputs
}

# ---------------------------------------------------------------- backend (api)
resource "aws_ecs_task_definition" "api" {
  family                   = "${local.p}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = data.aws_iam_role.lab_role.arn
  task_role_arn            = data.aws_iam_role.lab_role.arn

  container_definitions = jsonencode([{
    name         = "api"
    image        = var.api_image
    essential    = true
    portMappings = [{ containerPort = 8080, protocol = "tcp" }]
    environment = [
      { name = "DB_URL", value = "jdbc:postgresql://${local.pf.db_endpoint}/plisados" },
      { name = "DB_USER", value = "plisados" },
      { name = "ADMIN_EMAIL", value = var.admin_email },
      { name = "MEDIA_ROOT", value = "/data/media" },
      { name = "PUBLIC_BASE_URL", value = local.pf.alb_url },
      { name = "APP_VERSION", value = var.app_version },
    ]
    secrets = [
      { name = "DB_PASSWORD", valueFrom = local.pf.db_secret_arn },
      { name = "ADMIN_PASSWORD", valueFrom = local.pf.admin_secret_arn },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = local.pf.log_group_api
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_service" "api" {
  name            = "${local.p}-api"
  cluster         = local.pf.cluster_name
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  health_check_grace_period_seconds  = 120 # Spring Boot tarda en arrancar
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  wait_for_steady_state              = true

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    subnets          = split(",", local.pf.subnet_ids)
    security_groups  = [local.pf.api_sg_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = local.pf.api_tg_arn
    container_name   = "api"
    container_port   = 8080
  }

  lifecycle {
    ignore_changes = [desired_count]
  }
}

# ---------------------------------------------------------------- frontend (web)
resource "aws_ecs_task_definition" "web" {
  family                   = "${local.p}-web"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = data.aws_iam_role.lab_role.arn
  task_role_arn            = data.aws_iam_role.lab_role.arn

  container_definitions = jsonencode([{
    name         = "web"
    image        = var.web_image
    essential    = true
    portMappings = [{ containerPort = 4000, protocol = "tcp" }]
    environment = [
      { name = "API_INTERNAL_URL", value = local.pf.alb_url },
      { name = "NG_ALLOWED_HOSTS", value = local.pf.alb_dns },
      { name = "APP_VERSION", value = var.app_version },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = local.pf.log_group_web
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_service" "web" {
  name            = "${local.p}-web"
  cluster         = local.pf.cluster_name
  task_definition = aws_ecs_task_definition.web.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  health_check_grace_period_seconds  = 60
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  wait_for_steady_state              = true

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    subnets          = split(",", local.pf.subnet_ids)
    security_groups  = [local.pf.web_sg_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = local.pf.web_tg_arn
    container_name   = "web"
    container_port   = 4000
  }

  lifecycle {
    ignore_changes = [desired_count]
  }

  depends_on = [aws_ecs_service.api]
}
