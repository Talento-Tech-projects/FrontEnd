import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { NewProject } from '../new-project/new-project';
import { DeleteProject } from '../delete-project/delete-project';


@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    NewProject,
    DeleteProject
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.css'
})
export class Projects implements OnInit {

  constructor(private router: Router, private http: HttpClient) {}

  showModal: boolean = false;
  currentUser: string = '';
  userId: number = 0;

  projects: any[] = [];
  filterProjects: any[] = [];

  editingProject: { id: number, title: string, owner: string, lastModified: string } | null = null;

  showConfirmationModal: boolean = false;
  projectToDeleteId: number | null = null;

  currentFilter: string = 'all';
  currentSearchTerm: string = '';


ngOnInit(): void {
  // Si estamos en SSR, no hacer nada y esperar a que se hidrate en el cliente
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    console.log('🔄 Detectado SSR, esperando hidratación del cliente...');
    return;
  }

  // Solo ejecutar la lógica cuando estemos en el navegador
  this.initializeClientSide();
}

private initializeClientSide(): void {
  const storedEmail = localStorage.getItem('userEmail');
  const storedUserId = localStorage.getItem('userId');
  const storedUserName = localStorage.getItem('userName');

  if (!storedEmail || !storedUserId) {
    console.warn('⚠️ No hay usuario logueado. Redirigiendo a login.');
    this.router.navigate(['/signin']);
    return;
  }

  this.currentUser = storedUserName ?? '';
  this.userId = parseInt(storedUserId, 10);

  this.loadProjects();
}

  loadProjects(): void {
  this.http.get<any[]>(`http://localhost:8080/api/beams/user/${this.userId}`).subscribe({
    next: (data) => {
      this.projects = data.map((beam) => ({
        id: beam.id,
        title: beam.projectName,
        owner: this.currentUser,
        lastModified: beam.lastDate?.slice(0, 10) || 'Sin fecha',
      }));

      console.log('✅ Vigas recibidas:', this.projects);

      // ✅ Inicializar filterProjects con todos los proyectos
      this.filterProjects = [...this.projects];
      this.currentFilter = 'all';
      
      console.log('📊 Proyectos iniciales mostrados:', this.filterProjects);
    },
    error: (err) => {
      console.error('❌ Error al cargar vigas del usuario:', err);
    }
  });
}

  setFilter(filterType: string): void {
    this.currentFilter = filterType;
    this.applyFilter(this.currentSearchTerm);
  }

  applyFilter(searchTerm: string): void {
    this.currentSearchTerm = searchTerm.toLowerCase().trim();

    let filtered = this.projects;

    if (this.currentFilter === 'your') {
      filtered = filtered.filter(p => p.owner === this.currentUser);
    }

    if (this.currentSearchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(this.currentSearchTerm)
      );
    }

    this.filterProjects = filtered;

    console.log('📊 Proyectos mostrados:', this.filterProjects);
  }

  filterProject(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilter(searchTerm);
  }

  openNewProject(): void {
    this.editingProject = null;
    this.showModal = true;
  }

  openEditProject(project: any): void {
    this.editingProject = { ...project };
    this.showModal = true;
  }

  closeNewProject(): void {
    this.showModal = false;
    this.editingProject = null;
  }

  handleProjectCreated(newProjectData: { title: string }): void {
    const newProject = {
      id: this.projects.length > 0 ? Math.max(...this.projects.map(p => p.id)) + 1 : 1,
      title: newProjectData.title,
      owner: this.currentUser,
      lastModified: new Date().toISOString().slice(0, 10),
    };
    this.projects.push(newProject);
    this.applyFilter('');
    this.closeNewProject();
  }

  goToBeamAnalysis(projectId: number): void {
  localStorage.setItem('beamId', projectId.toString());
  this.router.navigate(['/beam-analysis']);
  }

  handleProjectUpdated(updatedProject: { id: number, title: string }): void {
  // Si es una edición (tiene ID), llamar al endpoint de actualización
  if (updatedProject.id) {
    this.updateProjectName(updatedProject.id, updatedProject.title);
  } else {
    // Si es nuevo proyecto, mantener la lógica existente
    this.handleProjectCreated({ title: updatedProject.title });
  }
}

  showDeleteConfirmation(projectId: number): void {
    this.projectToDeleteId = projectId;
    this.showConfirmationModal = true;
  }

  confirmDelete(): void {
  if (this.projectToDeleteId !== null) {
    // Llamar al endpoint para eliminar el proyecto
    this.deleteProject(this.projectToDeleteId);
  } else {
    // Si no hay ID, solo cerrar el modal
    this.cancelDelete();
  }}

  cancelDelete(): void {
    this.projectToDeleteId = null;
    this.showConfirmationModal = false;
  }
deleteProject(projectId: number): void {
  this.http.delete(`http://localhost:8080/api/beams/${projectId}`).subscribe({
    next: () => {
      console.log('✅ Proyecto eliminado exitosamente');
      
      // Eliminar el proyecto del array local
      const index = this.projects.findIndex(p => p.id === projectId);
      if (index > -1) {
        this.projects.splice(index, 1);
        // Reaplicar filtros para actualizar la vista
        this.applyFilter(this.currentSearchTerm);
      }
      
      // Cerrar el modal de confirmación
      this.cancelDelete();
    },
    error: (err) => {
      console.error('❌ Error al eliminar el proyecto:', err);
      // Aquí puedes agregar manejo de errores
      // Por ejemplo, mostrar un mensaje de error al usuario
      this.cancelDelete(); // Cerrar modal incluso si hay error
    }
  });
}

  goToFeatures() {
    this.router.navigate([''], { fragment: 'features' });
  }

  goToPricing() {
    this.router.navigate([''], { fragment: 'pricing' });
  }  

  updateProjectName(projectId: number, newName: string): void {
  const updateData = { projectName: newName };
  
  this.http.patch<any>(`http://localhost:8080/api/beams/${projectId}/name`, updateData).subscribe({
    next: (updatedBeam) => {
      console.log('✅ Proyecto actualizado:', updatedBeam);
      
      // Actualizar el proyecto en el array local
      const projectToUpdate = this.projects.find(p => p.id === projectId);
      if (projectToUpdate) {
        projectToUpdate.title = newName;
        projectToUpdate.lastModified = new Date().toISOString().slice(0, 10);
      }
      
      // Reaplicar filtros para mostrar los cambios
      this.applyFilter(this.currentSearchTerm);
      
      // Cerrar el modal
      this.closeNewProject();
    },
    error: (err) => {
      console.error('❌ Error al actualizar el proyecto:', err);
      // Aquí puedes agregar manejo de errores, como mostrar un mensaje al usuario
    }
  });
}
}
