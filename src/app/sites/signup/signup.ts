import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user';
import { UserDTO } from '../../models/user.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {
  signupForm: FormGroup;

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {
    this.signupForm = this.fb.group({
      userEmail: ['', [Validators.required, Validators.email]],
      userPassword: ['', [Validators.required, Validators.minLength(3)]],
      userName: ['', [Validators.required, Validators.maxLength(20)]],
      userNumber: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  onSubmit(e: Event) {
    e.preventDefault();

    console.log('🧠 Submit recibido');
    console.log('Datos del formulario:', this.signupForm.value);
    console.log('Es válido:', this.signupForm.valid);

    if (this.signupForm.valid) {
      const formValue = this.signupForm.value;

      const payload: UserDTO = {
        userEmail: formValue.userEmail,
        userPassword: formValue.userPassword,
        userName: formValue.userName,
        userNumber: Number(formValue.userNumber)
      };

      this.userService.createUser(payload).subscribe({
        next: (res) => {
          alert('✅ Usuario creado con éxito');
          this.router.navigate(['/signin']);
        },
        error: (err) => {
          alert('❌ Error al crear usuario');
          console.error(err);
        }
      });
    } else {
      console.warn('⚠️ Formulario inválido');
      const controls = this.signupForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          console.warn(`Campo inválido: ${name}`);
        }
      }
    }
  }
}
