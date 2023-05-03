import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-is-logged-out-dialog',
  templateUrl: './user-is-logged-out-dialog.component.html',
  styleUrls: ['./user-is-logged-out-dialog.component.css']
})
export class UserIsLoggedOutDialogComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  public userClickedOK(): void {
    // Take the user to the external website
    window.location.href = 'https://www.google.com';
  }

}
