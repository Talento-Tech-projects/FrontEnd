import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router'; 
import { NewProject } from '../new-project/new-project';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-projects',
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

  projects: { id:number, title: string, owner: string, lastModified: string }[] = [
  ];
  
  editingProject: { id: number, title: string, owner: string, lastModified: string } | null = null;
  

  private readonly STORAGE_KEY = 'projects-list';

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    const storedProjects = localStorage.getItem(this.STORAGE_KEY);
    if (storedProjects) {
      this.projects = JSON.parse(storedProjects);
    } else {
      this.projects = [
        { id: 1, title: 'Project Alpha', owner: 'John Doe', lastModified: '2025-08-05' },
        { id: 2, title: 'New Website Design', owner: 'Jane Smith', lastModified: '2025-08-04' }
      ];
      this.saveProjects();
    }
  }

  private saveProjects(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.projects));
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
      owner: 'Current User',
      lastModified: new Date().toISOString().slice(0, 10)
    };
    this.projects.push(newProject);
    this.closeNewProject();
    this.saveProjects();
    console.log('New project added:', newProject);
  }

  handleProjectUpdated(updatedProject: { id: number, title: string }): void {
    const projectToUpdate = this.projects.find(p => p.id === updatedProject.id);
    if (projectToUpdate) {
      projectToUpdate.title = updatedProject.title;
      this.saveProjects(); // Save the updated list
      console.log('Project updated:', projectToUpdate);
    }
    this.closeNewProject();
  }

  deleteProject(index: number): void {
    if(confirm("Are you sure you want to delete this project?")) {
      this.projects.splice(index, 1);
      console.log("Project deleted at index:", index);
    }
  }

}
