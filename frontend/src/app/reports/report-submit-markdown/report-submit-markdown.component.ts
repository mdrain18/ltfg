import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {QuillModules} from "ngx-quill";
import {ThemeService} from "../../services/theme.service";
import {Subscription} from "rxjs";
import {ThemeOptionDTO} from "../../models/theme-option-dto";

@Component({
  selector: 'app-report-submit-markdown',
  templateUrl: './report-submit-markdown.component.html',
  styleUrls: ['./report-submit-markdown.component.css']
})
export class ReportSubmitMarkdownComponent implements OnInit, OnDestroy {

  public myForm: FormGroup;
  private themeStateSubscription: Subscription;
  public currentTheme: ThemeOptionDTO;

  // Configure the Quill Editor so it does not have image, link, or, video options
  public quillModules: QuillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],           // toggled buttons
      ['blockquote', 'code-block'],
      // [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      // [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1'}, { 'indent': '+1' }],             // indent/reverse indent
      [{ 'direction': 'rtl' }],                            // text direction
      // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],             // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],                                           // remove formatting button
    ]
  };

  constructor(private formBuilder: FormBuilder,
              private themeService: ThemeService) { }


  public ngOnInit(): void {

    // Listen for changes from the theme service
    this.themeStateSubscription = this.themeService.getThemeStateAsObservable().subscribe( (aNewTheme: ThemeOptionDTO) => {
      // The theme has changed.
      this.currentTheme = aNewTheme;
    });

    // Initialize the reactive form
    this.myForm = this.formBuilder.group({
      markdownEditor:       [null, null],
    });

  }  // end of ngOnInit()


  public ngOnDestroy(): void {
    if (this.themeStateSubscription) {
      this.themeStateSubscription.unsubscribe();
    }
  }


}
