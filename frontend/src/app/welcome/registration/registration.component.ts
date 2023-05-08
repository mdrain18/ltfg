import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistrationDto } from '../../models/registration-dto';
import { UserService } from '../../services/user.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  public registrationForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    private router: Router
  ) { }

  public ngOnInit(): void {
    this.registrationForm = this.formBuilder.group({
      firstName: [null, [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],

      lastName: [null, [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],

      email: [null, [
        Validators.required,
        Validators.email
      ]],

      username: [null, [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],

      password: [null, [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(100)
      ]]
    });
  }

  public reset(): void {
    console.log('User pressed reset');
    this.registrationForm.reset();
  }

  public register(): void {
    // Mark all fields as touched so the user can see any errors
    this.registrationForm.markAllAsTouched();

    if (this.registrationForm.invalid) {
      // User did not pass validation so stop here
      return;
    }

    // Create the RegistrationDto object
    let registrationDto: RegistrationDto = new RegistrationDto();
    registrationDto.firstName = this.registrationForm.controls.firstName.value;
    registrationDto.lastName = this.registrationForm.controls.lastName.value;
    registrationDto.email = this.registrationForm.controls.email.value;
    registrationDto.username = this.registrationForm.controls.username.value;
    registrationDto.password = this.registrationForm.controls.password.value;

    // Invoke the user service to register a new user
    this.userService.registerUser(registrationDto).subscribe(response => {
      // Registration succeeded
      this.messageService.showSuccessMessage('Registration succeeded!');

      // Redirect to login page
      this.router.navigate(['/page/login']).then(() => {
        // Navigation succeeded
        console.log('Navigation succeeded');
      });
    }, error => {
      // Registration failed
      alert('Registration failed: ' + error.message);
    });
  }
}
