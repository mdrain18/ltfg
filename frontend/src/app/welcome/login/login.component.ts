import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginDto } from '../../models/login-dto';
import { UserService } from '../../services/user.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    private router: Router
  ) { }

  public ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  public onSubmit(): void {
    // Make sure form is valid before proceeding
    if (this.loginForm.invalid) {
      return;
    }

    // Create a new LoginDto object from the form values
    const loginDto = new LoginDto();
    loginDto.username = this.loginForm.controls.username.value;
    loginDto.password = this.loginForm.controls.password.value;

    // Call the validateUserLogin method in the UserService to validate the login credentials
    this.userService.validateUserLogin(loginDto).subscribe(
      (result) => {
        if (result) {
          // Show success message
          this.messageService.showSuccessMessage('Successful Login');

          // Redirect to the welcome page
          this.router.navigate(['/welcome']).then(() => {
            // Navigation succeeded
            console.log('Navigation succeeded');
          });
        } else {
          // Show error message
          this.messageService.showErrorMessage('Invalid username or password')
        }
      },
      (error) => {
        // Show error message
        alert('Error occurred while logging in');
      }
    );
  }

}
