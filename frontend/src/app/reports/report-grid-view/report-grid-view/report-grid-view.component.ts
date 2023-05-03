import {Component, OnDestroy, OnInit} from '@angular/core';
import "ag-grid-enterprise";
import {GridService} from "../../../services/grid.service";
import {ReportRowDataDTO} from "../../../models/report-row-data-dto";
import {ColumnApi, GridApi, GridOptions, ICellRendererParams} from "ag-grid-community";
import {PriorityCellCustomRendererComponent} from "../priority-cell-custom-renderer/priority-cell-custom-renderer.component";
import {ReportGridActionCellRendererComponent} from "../report-grid-action-cell-renderer/report-grid-action-cell-renderer.component";
import {MatDialog} from "@angular/material/dialog";
import {UpdatePriorityDialogFormData} from "../../../models/update-priority-dialog-form-data";
import {UpdatePriorityDialogComponent} from "../update-priority-dialog-component/update-priority-dialog.component";
import {Subject, Subscription} from "rxjs";
import {PreferenceService} from "../../../services/preference.service";
import {debounceTime, switchMap} from "rxjs/operators";
import {Constants} from "../../../utilities/constants";
import {GetOnePreferenceDTO} from "../../../models/preferences/get-one-preference-dto";
import {ThemeService} from "../../../services/theme.service";
import {ThemeOptionDTO} from "../../../models/theme-option-dto";

@Component({
  selector: 'app-report-grid-view',
  templateUrl: './report-grid-view.component.html',
  styleUrls: ['./report-grid-view.component.css']
})
export class ReportGridViewComponent implements OnInit, OnDestroy {

  private readonly PAGE_NAME: string = "reports-grid-view";
  private userHasPastColumnState: boolean = false;
  private listenForGridChanges: boolean = false;
  private saveGridColumnStateEventsSubject: Subject<any> = new Subject();
  private saveGridEventsSubscription: Subscription;

  private themeStateSubscription: Subscription;
  public currentTheme: ThemeOptionDTO;

  public gridOptions: GridOptions = {
    debug: true,
    suppressCellSelection: true,
    rowSelection: 'multiple',      // Possible values are 'single' and 'multiple'
    domLayout: 'normal',

    onSortChanged: () => {
      this.saveColumnState();
    },

    onDragStopped: () => {
      // User finished resizing or moving column
      this.saveColumnState();
    },

    onDisplayedColumnsChanged: () => {
      this.saveColumnState();
    },

    onColumnVisible: () => {
      this.saveColumnState();
    },

    onColumnPinned: () => {
      this.saveColumnState();
    }
  };

  private saveColumnState(): void {
    if (this.listenForGridChanges) {
      // The grid has rendered data.  So, save the sort/column changes

      // Get the current column state
      let currentColumnState = this.gridColumnApi.getColumnState();

      // Send a message to save the current column state
      this.saveGridColumnStateEventsSubject.next(currentColumnState)
    }
  }


  public firstDataRendered(): void {
    // The grid is fully rendered.  So, set the flag to start saving sort/column changes
    this.listenForGridChanges = true;
  }


  public defaultColDefs: any = {
    flex: 1,
    sortable: true,
    filter: true,
    floatingFilter: true,    // Causes the filter row to appear below column names
    autoHeight: true
  };

  public columnDefs = [
    {
      field: 'id',
      cellClass: 'grid-text-cell-format',
      cellRenderer: 'actionCellRenderer',
      cellRendererParams: {
        deleteButtonGridMethod: (params: ICellRendererParams) => this.openDeleteDialog(params),
        editButtonGridMethod: (params: ICellRendererParams) => this.openEditDialog(params)
      },
      headerName: 'Actions',
      filter: false,
      suppressMenu: false,
      sortable: false,
      resizable: true,
      checkboxSelection: true
    },
    {
      field: 'name',
      cellClass: 'grid-text-cell-format',
      sortable: true,
      resizable: true,
      filter: 'agTextColumnFilter'
    },
    {
      field: 'priority',
      cellRenderer: 'priorityCellRenderer',
      sortable: true,
      resizable: true,
      filter: 'agTextColumnFilter'
    },
    {
      field: 'start_date',
      cellClass: 'grid-text-cell-format',
      sortable: true,
      resizable: true,
      filter: 'agTextColumnFilter'
    },
    {
      field: 'end_date',
      cellClass: 'grid-text-cell-format',
      sortable: true,
      resizable: true,
      filter: 'agTextColumnFilter'
    }
  ];

  // Tell ag-grid which cell-renderers will be available
  // This is a map of component names that correspond to components that implement ICellRendererAngularComp
  public frameworkComponents: any = {
    priorityCellRenderer: PriorityCellCustomRendererComponent,
    actionCellRenderer: ReportGridActionCellRendererComponent
  };

  public  rowData: ReportRowDataDTO[];
  private gridApi: GridApi;
  private gridColumnApi: ColumnApi;
  public  totalRowsSelected: number;
  public  updateButtonLabel: string;

  constructor(private gridService: GridService,
              private preferenceService: PreferenceService,
              private matDialog: MatDialog,
              private themeService: ThemeService) {}


  public ngOnInit(): void {

    // Listen for changes from the theme service
    this.themeStateSubscription = this.themeService.getThemeStateAsObservable().subscribe( (aNewTheme: ThemeOptionDTO) => {
      // The theme has changed.
      this.currentTheme = aNewTheme;
    });

    // Listen for save-grid-column-state events
    // NOTE:  If a user manipulates the grid, then we could be sending LOTS of save-column-state REST calls
    //        The debounceTime slows down the REST calls
    //        The switchMap cancels previous calls
    //        Thus, if there are lots of changes to the grid, we invoke a single REST call using the *LAST* event (over a span of 250 msecs)
    this.saveGridEventsSubscription = this.saveGridColumnStateEventsSubject.asObservable().pipe(
      debounceTime(250),         // Wait 250 msecs before invoking REST call
      switchMap( (aNewColumnState: any) => {
        // Use the switchMap for its cancelling effect:
        // On each observable, the previous observable is cancelled

        // Return an observable
        // Invoke the REST call to save it to the back end
        return this.preferenceService.setPreferenceValueForPageUsingJson(Constants.COLUMN_STATE_PREFERENCE_NAME, aNewColumnState, this.PAGE_NAME)
      })
    ).subscribe();

  }

  public ngOnDestroy(): void {
    if (this.saveGridEventsSubscription) {
      this.saveGridEventsSubscription.unsubscribe();
    }

    if (this.saveGridColumnStateEventsSubject) {
      this.saveGridColumnStateEventsSubject.unsubscribe();
    }

    if (this.themeStateSubscription) {
      this.themeStateSubscription.unsubscribe();
    }
  }


  /*
   * The grid is ready.  So, perform grid initialization here:
   *  1) Invoke the REST call to get the grid column state preferences
   *  2) When the REST endpoint returns
   *     a) Set the grid column state preferences
   *     b) Load the data into the grid
   */
  public onGridReady(params: any): void {
    // Get a reference to the gridApi and gridColumnApi (which we will need later to get selected rows)
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;


    this.preferenceService.getPreferenceValueForPage(Constants.COLUMN_STATE_PREFERENCE_NAME, this.PAGE_NAME).subscribe( (aPreference: GetOnePreferenceDTO) => {
      // REST call came back.  I have the grid preferences

      if (! aPreference.value) {
        // There is no past column state
        this.userHasPastColumnState = false;
      }
      else {
        // There is past column state
        let storedColumnStateObject = JSON.parse(aPreference.value);

        // Set the grid to use past column state
        this.gridColumnApi.setColumnState(storedColumnStateObject);

        this.userHasPastColumnState = true;
      }

      // Load the grid with data
      this.reloadPage();
    });
  }


  private reloadPage(): void {

    // Show the loading overlay
    this.gridApi.showLoadingOverlay();

    // Invoke a REST call to get data for the initial page load
    this.gridService.getReportData().subscribe((aData: ReportRowDataDTO[]) => {
      // We got data from the REST call

      // Put the data into the grid
      this.rowData = aData;

      // Unselect all values
      this.gridApi.deselectAll();

      // Regenerate derived values
      this.generateDerivedValuesOnUserSelection()

      if (! this.userHasPastColumnState) {
        // We did not get any column state on page load.  So, resize the columns
        this.gridApi.sizeColumnsToFit();
      }

      // Reset row heights
      this.gridApi.resetRowHeights();

      // Tell the grid to resize when user resizes the browser window
      window.onresize = () => {
        this.gridApi.sizeColumnsToFit();
      }

    });

  }  // end of reloadPage()



  public openDeleteDialog(params: ICellRendererParams): void {
    console.log('openDeleteDialog()  params=', params);
  }

  public openEditDialog(params: ICellRendererParams): void {
    console.log('openEditDialog() params=', params);
  }


  public generateDerivedValuesOnUserSelection(): void {
    // Get the total number of rows that are selected
    this.totalRowsSelected = this.gridApi.getSelectedRows().length;

    if (this.totalRowsSelected == 0) {
      this.updateButtonLabel = "Update Entries";
    }
    else if (this.totalRowsSelected == 1) {
      // User has checked one entry
      this.updateButtonLabel = "Update 1 Entry";
    }
    else {
      // User has checked multiple entries
      this.updateButtonLabel = "Update " + this.totalRowsSelected + " Entries";
    }

  }

  public openUpdatePriorityPopup(): void {
    console.log('openUpdatePriorityPopup');

    // Create an empty array of numbers
    let selectedReportIds: number[] = [];

    // Loop through the array of selected rows and add the selected ids to the list
    this.gridApi.getSelectedRows().forEach((row: ReportRowDataDTO) => {
      selectedReportIds.push(row.id);
    });

    let formData: UpdatePriorityDialogFormData = new UpdatePriorityDialogFormData();
    formData.reportIds = selectedReportIds;

    // Open the dialog box in modal mode
    let dialogRef = this.matDialog.open(UpdatePriorityDialogComponent, {
      data: formData
      // minWidth: 400,
      // minHeight: 200
    });

    // Listen for the dialog box to close
    dialogRef.afterClosed().subscribe((returnedFormData: UpdatePriorityDialogFormData) => {
      // The dialog box has closed

      if (returnedFormData) {
        // The user pressed OK.  So, update the data

        // TODO: Invoke the REST call

        // Reload the list
        this.reloadPage();
      }
    });

  }   // end of openUpdatePriorityPopup()


  /*
   * Clear all grid sorting
   */
  private clearGridSorting(): void {

    // Tell the grid to clear sorting on all columns
    this.gridColumnApi.applyColumnState({
      defaultState: { sort: null }
    });

  }


  /*
   * Reset the grid back to default settings
   */
  public resetGrid(): void {
    // Clear all sorting
    this.clearGridSorting();

    // Clear the filters
    this.gridApi.setFilterModel(null);

    // Reset columns (so they are visible and restored to default)
    this.gridColumnApi.resetColumnState();
  }

}
