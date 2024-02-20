packer {
  required_plugins {
    googlecompute = {
      version = ">= 1.1.4"
      source  = "github.com/hashicorp/googlecompute"
    }
  }
}

source "googlecompute" "centos" {
  project_id         = "electric-clone-412119"
  source_image_family = "centos-stream-8"
  zone               = "us-central1-a"
  ssh_username       = "centos"
  image_name         = "custom-image-centOS"
}

build {
  sources = ["source.googlecompute.centos"]

  provisioner "file" {
    source      = "application.zip"
    destination = "/tmp/application.zip"
  }

  provisioner "file" {
    source      = "sql.sh"
    destination = "sql.sh"
  }
  provisioner "file" {
    source      = "nodeinstallement.sh"
    destination = "/tmp/nodeinstallement.sh"
  }
  
  provisioner "file" {
    source      = "permissions.sh"
    destination = "/tmp/permissions.sh"
  }

  provisioner "file" {
    source      = "index.sh"
    destination = "/tmp/index.sh"
  }

  provisioner "shell" {
    script = "sql.sh"
  }

  provisioner "shell" {
    script = "nodeinstallement.sh"
  }

  provisioner "shell" {
    script = "permissions.sh"
  }

  provisioner "shell" {
    script = "index.sh"
  }
}

 
            
            
            
