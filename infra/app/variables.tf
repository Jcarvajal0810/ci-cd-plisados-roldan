# infra/app/variables.tf
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

variable "state_bucket" {
  description = "Bucket S3 donde está el estado de la capa platform"
  type        = string
  default     = "tfstate-plisados-jcarvajal0810"
}

variable "web_image" {
  description = "URI completa de la imagen del frontend (ECR) con su tag"
  type        = string
}

variable "api_image" {
  description = "URI completa de la imagen del backend (ECR) con su tag"
  type        = string
}

variable "app_version" {
  description = "Versión desplegada (SHA o vX.Y.Z). La app la expone en /health"
  type        = string
  default     = "manual"
}

variable "admin_email" {
  description = "Correo del administrador del sitio (no tiene que existir)"
  type        = string
  default     = "admin@plisados.test"
}
