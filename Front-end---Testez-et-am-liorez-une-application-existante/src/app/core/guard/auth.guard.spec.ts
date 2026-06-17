import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../service/auth.service';

describe('authGuard', () => {
  let routerMock: { navigate: jest.Mock };

  beforeEach(() => {
    routerMock = { navigate: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: routerMock }
      ]
    });
    localStorage.clear();
  });

  // Le garde est une fonction : on l'execute dans le contexte d'injection d'Angular
  const runGuard = () =>
    TestBed.runInInjectionContext(
      () => authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

  it('autorise l\'acces quand l\'utilisateur est authentifie', () => {
    TestBed.inject(AuthService).setToken('jwt');

    expect(runGuard()).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('redirige vers /login quand l\'utilisateur n\'est pas authentifie', () => {
    expect(runGuard()).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
