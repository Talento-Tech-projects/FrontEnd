import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; 
import { NewProject } from '../new-project/new-project';
import { CommonModule } from '@angular/common';
import { DeleteProject } from '../delete-project/delete-project';

interface Project {
  id: number;
  title: string;
  owner: string;
  lastModified: string;
  isShared: boolean;
  isTrashed: boolean;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    RouterModule,
    NewProject,
    CommonModule,
    DeleteProject
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.css'
})
export class Projects implements OnInit {

  constructor(private router: Router) {} // Constructor agregado

  showModal: boolean = false;
  currentUser: string = '';

  projects: Project[] = [
    { id: 1, title: 'Website Redesign', owner: 'Thomas', lastModified: '2025-08-01', isShared: false, isTrashed: false },
    { id: 2, title: 'Mobile App Concept', owner: 'Jane', lastModified: '2025-07-28', isShared: false, isTrashed: false },
    { id: 3, title: 'Marketing Campaign Plan', owner: 'Thomas', lastModified: '2025-08-05', isShared: false, isTrashed: true },
    { id: 4, title: 'Database Migration', owner: 'Mike', lastModified: '2025-07-25', isShared: false, isTrashed: false },
    { id: 5, title: 'QA Testing Protocol', owner: 'Jane', lastModified: '2025-08-03', isShared: false, isTrashed: false }
  ];

  filterProjects: Project[] = [];
  editingProject: { id: number, title: string, owner: string, lastModified: string } | null = null;
  showConfirmationModal: boolean = false;
  projectToDeleteId: number | null = null;
  currentFilter: string = 'all';
  currentSearchTerm: string = '';

  ngOnInit(): void {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      this.currentUser = storedEmail;
    } else {
      console.warn('⚠️ No hay usuario logueado. Redirigiendo a login.');
      this.router.navigate(['/signin']);
      return;
    }
    this.filterProjects = [...this.projects];
  }

  setFilter(filterType: string): void {
    this.currentFilter = filterType;
    this.applyFilter(this.currentSearchTerm);
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
      isShared: false,
      isTrashed: false
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
      const projectsIndex = this.projects.findIndex(p => p.id === this.projectToDeleteId);
      if (projectsIndex > -1) {
        this.projects.splice(projectsIndex, 1);
        this.applyFilter('');
      }
    }
    this.cancelDelete();
  }

  cancelDelete(): void {
    this.projectToDeleteId = null;
    this.showConfirmationModal = false;
  }

  applyFilter(searchTerm: string): void {
    this.currentSearchTerm = searchTerm;
    let tempProjects = [...this.projects];

    if (this.currentFilter === 'your') {
      tempProjects = tempProjects.filter(p => p.owner === this.currentUser && !p.isTrashed);
    } else if (this.currentFilter === 'shared') {
      tempProjects = tempProjects.filter(p => p.isShared && !p.isTrashed);
    } else if (this.currentFilter === 'trashed') {
      tempProjects = tempProjects.filter(p => p.isTrashed);
    } else {
      tempProjects = tempProjects.filter(p => !p.isTrashed);
    }

    const term = searchTerm.toLowerCase().trim();
    if (term) {
      tempProjects = tempProjects.filter(project =>
        project.title.toLowerCase().includes(term)
      );
    }

    this.filterProjects = tempProjects;
  }

  filterProject(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilter(searchTerm);
  }
} 
