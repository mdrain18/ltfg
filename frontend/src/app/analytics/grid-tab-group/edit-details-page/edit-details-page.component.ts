import { Component, OnInit } from '@angular/core';
import {HttpErrorResponse} from "@angular/common/http";
import {isNumeric} from "rxjs/internal-compatibility";
import {ErrorService} from "../../../errorHandler/error.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Constants} from "../../../utilities/constants";
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-edit-details-page',
  templateUrl: './edit-details-page.component.html',
  styleUrls: ['./edit-details-page.component.css']
})
export class EditDetailsPageComponent implements OnInit {
  public reportId: number;
  public myForm: FormGroup;

  constructor(private errorService: ErrorService,
              public  router: Router,
              private formBuilder: FormBuilder,
              private activatedRoute: ActivatedRoute) { }


  public ngOnInit(): void {
    let rawReportId: string | null = this.activatedRoute.snapshot.paramMap.get("id");

    if (!rawReportId) {
      // The id field was not passed-in (in the URL to this route)
      // Display an error to the user
      this.errorService.addError(new HttpErrorResponse({
        statusText: "Invalid reportId",
        error:      "The reportId is invalid or was not passed-in."
      }))
      return;
    }
    else if (! isNumeric(rawReportId))  {
      // The id field is not numeric.  So, display an error to the user
      this.errorService.addError(new HttpErrorResponse({
        statusText: "Invalid reportId",
        error:      "The reportId is invalid or was not passed-in."
      }))
      return;
    }


    // Convert the reportId from a string to a number
    this.reportId = +rawReportId;

    // Initialize the form
    this.initializeForm();

    // TODO:  Use the reportId to get an observable and have an async-pipe and tap load the reactive form

  } // end of ngOnInit()


  private initializeForm(): void {
    // Initialize the reactive form
    this.myForm = this.formBuilder.group( {
      textField1:  [null, null],
      textField2:  [null, null],
      textField3:  [null, null],
      textField4:  [null, null],
      textField5:  [null, null],
      textField6:  [null, null],
      textField7:  [null, null],
      textField8:  [null, null],
      textField9:  [null, null],
      textField10:  [null, null]
    });
  }

  /*
   * This constants getter is added so we can use constants in the HTML markup
   */
  public get constants(): typeof Constants {
    return Constants;
  }

}
