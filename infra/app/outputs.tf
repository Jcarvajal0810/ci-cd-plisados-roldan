# infra/app/outputs.tf
output "alb_url" { value = local.pf.alb_url }
output "cluster_name" { value = local.pf.cluster_name }
output "api_service_name" { value = aws_ecs_service.api.name }
output "web_service_name" { value = aws_ecs_service.web.name }
