import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { UserService } from '../../core/service/user.service';
import { Login } from '../../core/models/Login';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  imports: [CommonModule, MaterialModule],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  loginForm: FormGroup = new FormGroup({});
  submitted: boolean = false;

  // Gestion des états : chargement, erreur, succès
  loading: boolean = false;
  errorMessage: string | null = null;
  token: string | null = null;

  ngOnInit() {
    this.loginForm = this.formBuilder.group(
      {
        login: ['', Validators.required],
        password: ['', Validators.required]
      },
    );
  }

  get form() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    // Réinitialisation des états avant l'appel
    this.loading = true;
    this.errorMessage = null;
    this.token = null;

    const credentials: Login = {
      login: this.loginForm.get('login')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.userService.login(credentials)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (token: string) => {
          this.token = token;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = this.getServerErrorMessage(err);
        }
      });
  }

  onReset(): void {
    this.submitted = false;
    this.errorMessage = null;
    this.token = null;
    this.loginForm.reset();
  }

  // Affiche le message d'erreur renvoyé par le serveur (le corps est en texte brut).
  private getServerErrorMessage(err: any): string {
    if (err?.error) {
      if (typeof err.error === 'string') {
        try {
          return JSON.parse(err.error).message ?? err.error;
        } catch {
          return err.error;
        }
      }
      return err.error.message ?? JSON.stringify(err.error);
    }
    return `Erreur serveur (${err?.status ?? 'inconnue'})`;
  }
}
