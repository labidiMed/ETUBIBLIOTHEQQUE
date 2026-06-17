import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RegisterComponent } from './register.component';
import { UserService } from '../../core/service/user.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userServiceMock: { register: jest.Mock };

  beforeEach(async () => {
    userServiceMock = { register: jest.fn().mockReturnValue(of({})) };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // declenche ngOnInit (construction du formulaire)
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('le formulaire est invalide vide et valide une fois rempli', () => {
    expect(component.registerForm.valid).toBe(false);
    component.registerForm.setValue({ firstName: 'John', lastName: 'Doe', login: 'jdoe', password: 'pwd' });
    expect(component.registerForm.valid).toBe(true);
  });

  it('onSubmit n\'appelle pas le service si le formulaire est invalide', () => {
    component.onSubmit();
    expect(component.submitted).toBe(true);
    expect(userServiceMock.register).not.toHaveBeenCalled();
  });

  it('onSubmit appelle register quand le formulaire est valide', () => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    component.registerForm.setValue({ firstName: 'John', lastName: 'Doe', login: 'jdoe', password: 'pwd' });

    component.onSubmit();

    expect(userServiceMock.register).toHaveBeenCalledWith({
      firstName: 'John', lastName: 'Doe', login: 'jdoe', password: 'pwd'
    });
  });

  it('onReset reinitialise le formulaire', () => {
    component.registerForm.setValue({ firstName: 'John', lastName: 'Doe', login: 'jdoe', password: 'pwd' });
    component.onReset();
    expect(component.submitted).toBe(false);
    expect(component.registerForm.get('firstName')?.value).toBeNull();
  });
});
