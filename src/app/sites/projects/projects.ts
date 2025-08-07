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
        this.applyFilter('');
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

  handleProjectUpdated(updatedProject: { id: number, title: string }): void {
    const projectToUpdate = this.projects.find(p => p.id === updatedProject.id);
    if (projectToUpdate) {
      projectToUpdate.title = updatedProject.title;
    }
    this.applyFilter('');
    this.closeNewProject();
  }

  showDeleteConfirmation(projectId: number): void {
    this.projectToDeleteId = projectId;
    this.showConfirmationModal = true;
  }

  confirmDelete(): void {
    if (this.projectToDeleteId !== null) {
      const index = this.projects.findIndex(p => p.id === this.projectToDeleteId);
      if (index > -1) {
        this.projects.splice(index, 1);
        this.applyFilter('');
      }
    }
    this.cancelDelete();
  }

  cancelDelete(): void {
    this.projectToDeleteId = null;
    this.showConfirmationModal = false;
  }
}
