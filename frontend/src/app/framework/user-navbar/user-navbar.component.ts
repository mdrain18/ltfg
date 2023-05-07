import {Component, OnInit} from '@angular/core';
import {BannerService} from "../../services/banner.service";
import {Observable, Subscription} from "rxjs";
import {Constants} from "../../utilities/constants";
import {UserService} from "../../services/user.service";
import {UserInfoDTO} from "../../models/user-info-dto";
import {ThemeOptionDTO} from "../../models/theme-option-dto";
import {ThemeService} from "../../services/theme.service";
import {UserIsLoggedOutDialogComponent} from "../../dialogs/user-is-logged-out-dialog/user-is-logged-out-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-user-navbar',
  templateUrl: './user-navbar.component.html',
  styleUrls: ['./user-navbar.component.css']
})
export class UserNavbarComponent implements OnInit {

  public bannerIsVisible: boolean;
  private bannerSubscription: Subscription;

  public userInfoObs: Observable<UserInfoDTO>
  public currentTheme: ThemeOptionDTO;
  private themeStateSubscription: Subscription;

  constructor(private matDialog: MatDialog,
              public bannerService: BannerService,
              private themeService: ThemeService,
              private userService: UserService) {
  }

  public ngOnInit(): void {

    // Listen for changes from the theme service
    this.themeStateSubscription = this.themeService.getThemeStateAsObservable().subscribe((aNewTheme: ThemeOptionDTO) => {
      // The theme has changed.
      this.currentTheme = aNewTheme;
    });

    this.bannerSubscription = this.bannerService.getStateAsObservable().subscribe((aCurrentValue: boolean) => {
      // We received a message from the banner service with the value
      this.bannerIsVisible = aCurrentValue;
    });


    // Setup an observable to get the UserInfo
    // NOTE:  The HTML Template uses an async pipe to subscribe and unsubscribe to this observable
    this.userInfoObs = this.userService.getUserInfo();
  }

  public ngOnDestroy(): void {
    if (this.themeStateSubscription) {
      this.themeStateSubscription.unsubscribe();
    }
  }

  public downloadHelpFile(): void {
    // Open the help.pdf in another tab
    window.open('./assets/help.pdf', "_blank");
  }

  public get constants(): typeof Constants {
    // Get a reference to the enumerated object
    // -- This is needed so that the html page can use the enum class
    return Constants;
  }

  public userClickedLogout(): void {

    // Invoke the REST call to end the user's session
    this.userService.logout().subscribe(() => {
      // REST endpoint succeeded

      // Clear the frontend cache
      this.userService.clearCache();

      // Open the dialog box (that cannot be escaped)
      this.matDialog.open(UserIsLoggedOutDialogComponent, {
        disableClose: true,              // Stop the user from closing the dialog box
        backdropClass: "logout-backdrop"
      });
    });
  }
}
