# infra/platform/variables.tf
variable "aws_region" {
  description = "Región de AWS donde se despliegan los recursos"
  type        = string
  default     = "us-east-1"
}

variable "environment_name" {
  description = "Nombre del ambiente (staging o production)"
  type        = string

  validation {
    condition     = contains(["staging", "production"], var.environment_name)
    error_message = "environment_name debe ser \"staging\" o \"production\"."
  }
}

variable "migrate_image" {
  description = "URI completa de la imagen de Flyway (ECR) con su tag"
  type        = string
}

variable "db_instance_class" {
  description = "Clase de la instancia RDS (el Learner Lab solo permite clases pequeñas)"
  type        = string
  default     = "db.t3.micro"
}
