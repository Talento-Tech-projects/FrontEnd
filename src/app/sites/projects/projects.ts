import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router'; 
import { NewProject } from '../new-project/new-project';
import { CommonModule } from '@angular/common';



  interface Project {
    id: number;
    title: string;
    owner: string;
    lastModified: string; 
  }

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    RouterModule, 
    NewProject,
    CommonModule
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.css'
})
export class Projects implements OnInit{
  showModal: boolean = false;

  currentUser: string = 'Thomas'; 

  projects: Project[] = [
    { id: 1, title: 'Website Redesign', owner: 'Thomas', lastModified: '2025-08-01' },
    { id: 2, title: 'Mobile App Concept', owner: 'Jane', lastModified: '2025-07-28' },
    { id: 3, title: 'Marketing Campaign Plan', owner: 'Thomas', lastModified: '2025-08-05' },
    { id: 4, title: 'Database Migration', owner: 'Mike', lastModified: '2025-07-25' },
    { id: 5, title: 'QA Testing Protocol', owner: 'Jane', lastModified: '2025-08-03' }
  ];

  private filterProjects: Project[] = [
  ];
  
  editingProject: { id: number, title: string, owner: string, lastModified: string } | null = null;
  
  showConfirmationModal: boolean = false;
  projectToDeleteId: number | null = null;

  private readonly STORAGE_KEY = 'projects-list';

  ngOnInit(): void {
    this.filterProjects = [...this.projects];
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
      // Create a unique ID for the new project
      id: this.projects.length > 0 ? Math.max(...this.projects.map(p => p.id)) + 1 : 1,
      title: newProjectData.title,
      owner: this.currentUser, // Correctly using the `currentUser` property
      lastModified: new Date().toISOString().slice(0, 10)
    };
    this.projects.push(newProject);
    this.applyFilter('');
    this.closeNewProject();
    console.log('New project added:', newProject);
  }

  handleProjectUpdated(updatedProject: { id: number, title: string }): void {
    const projectToUpdate = this.projects.find(p => p.id === updatedProject.id);
    if (projectToUpdate) {
      projectToUpdate.title = updatedProject.title;
      console.log('Project updated:', projectToUpdate);
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
        console.log("Project deleted with id:", this.projectToDeleteId);
      }
    }
    this.cancelDelete();
  }

  cancelDelete(): void {
    this.projectToDeleteId = null;
    this.showConfirmationModal = false;
  }


  applyFilter(searchTerm: string): void {
    const term = searchTerm.toLowerCase();
    if (!term) {
      this.filterProjects = [...this.projects];
    } else {
      this.filterProjects = this.projects.filter(project =>
        project.title.toLowerCase().includes(term)
      );
    }
  }


  filterProject(event: Event): void {

    const searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilter(searchTerm);

  }

}
