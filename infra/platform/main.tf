# infra/platform/main.tf — infraestructura base de un ambiente (workspace = staging | production)
terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
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

locals {
  p = "plisados-${var.environment_name}"
}

# ---------------------------------------------------------------- recursos existentes (Learner Lab)
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }

  filter {
    name   = "default-for-az"
    values = ["true"]
  }

  filter {
    name   = "availability-zone"
    values = ["${var.aws_region}a", "${var.aws_region}b"]
  }
}

# ---------------------------------------------------------------- security groups
resource "aws_security_group" "alb" {
  name        = "${local.p}-alb-sg"
  description = "HTTP desde Internet hacia el ALB"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "web" {
  name        = "${local.p}-web-sg"
  description = "Puerto 4000 solo desde el ALB"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 4000
    to_port         = 4000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "api" {
  name        = "${local.p}-api-sg"
  description = "Puerto 8080 solo desde el ALB"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "migrate" {
  name        = "${local.p}-migrate-sg"
  description = "Tarea Flyway: solo trafico de salida"
  vpc_id      = data.aws_vpc.default.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "rds" {
  name        = "${local.p}-rds-sg"
  description = "PostgreSQL solo desde api y migrate"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.api.id, aws_security_group.migrate.id]
  }
}

# ---------------------------------------------------------------- ALB con enrutamiento por ruta
resource "aws_lb" "main" {
  name               = "${local.p}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = data.aws_subnets.default.ids
}

resource "aws_lb_target_group" "web" {
  name                 = "${local.p}-web-tg"
  port                 = 4000
  protocol             = "HTTP"
  vpc_id               = data.aws_vpc.default.id
  target_type          = "ip"
  deregistration_delay = 30

  health_check {
    path                = "/health"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

resource "aws_lb_target_group" "api" {
  name                 = "${local.p}-api-tg"
  port                 = 8080
  protocol             = "HTTP"
  vpc_id               = data.aws_vpc.default.id
  target_type          = "ip"
  deregistration_delay = 30

  health_check {
    path                = "/api/public/health"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  condition {
    path_pattern {
      values = ["/api/*", "/media/*", "/sitemap.xml"]
    }
  }
}

# ---------------------------------------------------------------- secretos (los genera Terraform)
resource "random_password" "db" {
  length  = 24
  special = false
}

resource "random_password" "admin" {
  length  = 20
  special = false
}

resource "aws_secretsmanager_secret" "db" {
  name                    = "${local.p}-db-password"
  recovery_window_in_days = 0 # permite recrear el mismo nombre después de destroy
}

resource "aws_secretsmanager_secret_version" "db" {
  secret_id     = aws_secretsmanager_secret.db.id
  secret_string = random_password.db.result
}

resource "aws_secretsmanager_secret" "admin" {
  name                    = "${local.p}-admin-password"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "admin" {
  secret_id     = aws_secretsmanager_secret.admin.id
  secret_string = random_password.admin.result
}

# ---------------------------------------------------------------- base de datos
resource "aws_db_subnet_group" "main" {
  name       = "${local.p}-db-subnets"
  subnet_ids = data.aws_subnets.default.ids
}

resource "aws_db_instance" "main" {
  identifier              = "${local.p}-db"
  engine                  = "postgres"
  engine_version          = "17"
  instance_class          = var.db_instance_class
  allocated_storage       = 20
  storage_type            = "gp2"
  db_name                 = "plisados"
  username                = "plisados"
  password                = random_password.db.result
  db_subnet_group_name    = aws_db_subnet_group.main.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  publicly_accessible     = false
  multi_az                = false
  backup_retention_period = 0
  skip_final_snapshot     = true
  deletion_protection     = false
  apply_immediately       = true
}

# ---------------------------------------------------------------- cluster y logs
resource "aws_ecs_cluster" "main" {
  name = "${local.p}-cluster"
}

resource "aws_cloudwatch_log_group" "logs" {
  for_each          = toset(["web", "api", "migrate"])
  name              = "/ecs/${local.p}-${each.key}"
  retention_in_days = 7
}

# ---------------------------------------------------------------- tarea de migraciones (Flyway)
resource "aws_ecs_task_definition" "migrate" {
  family                   = "${local.p}-migrate"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = data.aws_iam_role.lab_role.arn
  task_role_arn            = data.aws_iam_role.lab_role.arn

  container_definitions = jsonencode([{
    name      = "migrate"
    image     = var.migrate_image
    essential = true
    environment = [
      { name = "FLYWAY_URL", value = "jdbc:postgresql://${aws_db_instance.main.endpoint}/plisados" },
      { name = "FLYWAY_USER", value = "plisados" },
    ]
    secrets = [
      { name = "FLYWAY_PASSWORD", valueFrom = aws_secretsmanager_secret.db.arn },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.logs["migrate"].name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}
