# infra/platform/outputs.tf — los consume la capa app y el pipeline
output "alb_url" { value = "http://${aws_lb.main.dns_name}" }
output "alb_dns" { value = aws_lb.main.dns_name }
output "cluster_name" { value = aws_ecs_cluster.main.name }
output "web_tg_arn" { value = aws_lb_target_group.web.arn }
output "api_tg_arn" { value = aws_lb_target_group.api.arn }
output "web_sg_id" { value = aws_security_group.web.id }
output "api_sg_id" { value = aws_security_group.api.id }
output "migrate_sg_id" { value = aws_security_group.migrate.id }
output "subnet_ids" { value = join(",", data.aws_subnets.default.ids) }
output "db_endpoint" { value = aws_db_instance.main.endpoint }
output "db_secret_arn" { value = aws_secretsmanager_secret.db.arn }
output "admin_secret_arn" { value = aws_secretsmanager_secret.admin.arn }
output "admin_secret_name" { value = aws_secretsmanager_secret.admin.name }
output "log_group_web" { value = aws_cloudwatch_log_group.logs["web"].name }
output "log_group_api" { value = aws_cloudwatch_log_group.logs["api"].name }
output "migrate_task_definition_arn" { value = aws_ecs_task_definition.migrate.arn }
