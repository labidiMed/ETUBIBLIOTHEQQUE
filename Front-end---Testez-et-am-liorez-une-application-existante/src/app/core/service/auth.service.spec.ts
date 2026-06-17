import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('stocke et relit le token', () => {
    service.setToken('abc');
    expect(service.getToken()).toBe('abc');
  });

  it('isAuthenticated renvoie true quand un token est present', () => {
    service.setToken('abc');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('isAuthenticated renvoie false sans token', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('logout supprime le token', () => {
    service.setToken('abc');
    service.logout();
    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});
