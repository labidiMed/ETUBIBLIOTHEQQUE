import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { UserService } from '../../core/service/user.service';
import { AuthService } from '../../core/service/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userServiceMock: { login: jest.Mock };
  let authServiceMock: { setToken: jest.Mock };
  let routerMock: { navigate: jest.Mock };

  beforeEach(async () => {
    userServiceMock = { login: jest.fn().mockReturnValue(of('jwt-token')) };
    authServiceMock = { setToken: jest.fn() };
    routerMock = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('le formulaire est invalide vide et valide une fois rempli', () => {
    expect(component.loginForm.valid).toBe(false);
    component.loginForm.setValue({ login: 'jdoe', password: 'pwd' });
    expect(component.loginForm.valid).toBe(true);
  });

  it('onSubmit n\'appelle pas le service si le formulaire est invalide', () => {
    component.onSubmit();
    expect(userServiceMock.login).not.toHaveBeenCalled();
  });

  it('login reussi : stocke le token et redirige vers /students', () => {
    component.loginForm.setValue({ login: 'jdoe', password: 'pwd' });

    component.onSubmit();

    expect(userServiceMock.login).toHaveBeenCalledWith({ login: 'jdoe', password: 'pwd' });
    expect(component.token).toBe('jwt-token');
    expect(authServiceMock.setToken).toHaveBeenCalledWith('jwt-token');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/students']);
  });

  it('login en erreur (corps texte) : renseigne errorMessage', () => {
    userServiceMock.login.mockReturnValue(throwError(() => ({ status: 401, error: 'Invalid credentials' })));
    component.loginForm.setValue({ login: 'jdoe', password: 'mauvais' });

    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid credentials');
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('login en erreur (corps texte JSON) : extrait le message', () => {
    userServiceMock.login.mockReturnValue(throwError(() => ({ status: 400, error: '{"message":"Champ invalide"}' })));
    component.loginForm.setValue({ login: 'jdoe', password: 'x' });

    component.onSubmit();

    expect(component.errorMessage).toBe('Champ invalide');
  });

  it('login en erreur (corps objet) : extrait le message', () => {
    userServiceMock.login.mockReturnValue(throwError(() => ({ status: 400, error: { message: 'Erreur objet' } })));
    component.loginForm.setValue({ login: 'jdoe', password: 'x' });

    component.onSubmit();

    expect(component.errorMessage).toBe('Erreur objet');
  });

  it('login en erreur (sans corps) : message serveur generique', () => {
    userServiceMock.login.mockReturnValue(throwError(() => ({ status: 500 })));
    component.loginForm.setValue({ login: 'jdoe', password: 'x' });

    component.onSubmit();

    expect(component.errorMessage).toContain('Erreur serveur');
  });

  it('onReset reinitialise le formulaire et les etats', () => {
    component.loginForm.setValue({ login: 'jdoe', password: 'pwd' });
    component.token = 'x';
    component.errorMessage = 'y';

    component.onReset();

    expect(component.submitted).toBe(false);
    expect(component.token).toBeNull();
    expect(component.errorMessage).toBeNull();
  });
});
