import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
  ColumnApi,
  ColumnState,
  GridApi,
  GridOptions,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  ServerSideStoreType
} from "ag-grid-community";
import {GridGetRowsResponseDTO} from "../../models/grid/grid-get-rows-response-dto";
import {GridService} from "../../services/grid.service";
import {GridGetRowsRequestDTO} from "../../models/grid/grid-get-rows-request-dto";
import {ThemeOptionDTO} from "../../models/theme-option-dto";
import {Subject, Subscription} from "rxjs";
import {ThemeService} from "../../services/theme.service";
import {PreferenceService} from "../../services/preference.service";
import {Constants} from "../../utilities/constants";
import {debounceTime, switchMap} from "rxjs/operators";
import {ApplyColumnStateParams} from "ag-grid-community/dist/lib/columnController/columnApi";
import {GetOnePreferenceDTO} from "../../models/preferences/get-one-preference-dto";
import {GetClansDTO} from "../../models/get-clans-dto";

@Component({
  selector: 'app-clan-grid',
  templateUrl: './clan-grid.component.html',
  styleUrls: ['./clan-grid.component.css']
})

export class ClanGridComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly PAGE_NAME: string = "server-side-grid-view";
  private userHasPastColumnState: boolean = false;
  private listenForGridChanges: boolean = false;
  private saveGridColumnStateEventsSubject: Subject<any> = new Subject();
  private saveGridEventsSubscription: Subscription;

  private themeStateSubscription: Subscription;
  public  currentTheme: ThemeOptionDTO;

  private searchAfterClause: string | null;
  public  totalMatches: number = 0;
  public  rawSearchQuery: string = "";
  public  isValidQuery: boolean = true;


  public gridOptions: GridOptions = {
    debug: false,
    suppressCellSelection: true,
    rowSelection: 'multiple',      // Possible values are 'single' and 'multiple'
    domLayout: 'normal',
    rowModelType: 'serverSide',    // Possible values are 'clientSide', 'infinite', 'viewport', and 'serverSide'
    pagination: false,        // Do not show the 1 of 20 of 20, page 1 of 1 (as we are doing infinite scrolling)

    serverSideStoreType: ServerSideStoreType.Partial,   // Use partial Server Side Store Type so that pages of data are loaded
    cacheBlockSize: 50,                                 // Load 50 records at a time with each REST call
    blockLoadDebounceMillis: 100,
    debounceVerticalScrollbar: true,
    overlayNoRowsTemplate: "<span class='no-matches-found-message'>No matches were found</span>",

    onFilterChanged: () => {
      // The user changed a filer.  So, clear the grid cache before the REST endpoint is invoked
      this.clearGridCache();
    },

    onSortChanged: () => {
      // The user changed a sort.  So, clear the grid cache before the REST endpoint is invoked
      this.clearGridCache();
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
  }


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

  private clearGridCache(): void {

    if (this.totalMatches > 0) {
      // The last search had matches and we are clearing the grid cache.

      // So, move the scrollbar to the top
      this.gridApi.ensureIndexVisible(0, 'top');
    }

    // Clear the cache
    this.gridApi?.setServerSideDatasource(this.serverSideDataSource);
  }


  /*
   * Clear all grid sorting
   */
  private clearGridSorting(): void {

    let columnState: ApplyColumnStateParams = new class implements ApplyColumnStateParams {
      applyOrder: boolean;
      defaultState: ColumnState;
      state: ColumnState[];
    }

    this.gridColumnApi.applyColumnState(columnState);
  }


  /*
   * User pressed the Reset Button
   *  1. Clear the grid cache
   *  2. Clear all sorting
   *  3. Clear all filters
   *  4. Empty the search box
   *  5. Force the grid to invoke the REST endpoint by calling onFilterChanged()
   */
  public resetGrid(): void {
    // Clear the grid cache and move the vertical scrollbar to the top
    this.clearGridCache();

    // Clear all sorting
    this.clearGridSorting();

    // Clear the filters
    this.gridApi.setFilterModel(null);

    // Clear the search box
    this.rawSearchQuery = "";

    // Force the grid to invoke the REST endpoint
    this.gridApi.onFilterChanged();

    // Reset columns (so they are visible and restored to default)
    this.gridColumnApi.resetColumnState();
  }


  /*
   * User clicked to run a search
   *  1. Clear the grid cache
   *  2. Clear all sorting
   *  3. Clear all filters
   *  4. Force the grid to invoke the REST endpoint by calling onFilterChanged()
   */
  public runSearch(): void {
    this.clearGridCache();

    // Clear all sorting
    this.clearGridSorting();

    // Clear the filters
    this.gridApi.setFilterModel(null);

    // Force the grid to invoke the REST endpoint
    this.gridApi.onFilterChanged();
  }


  /*
   * Create a server-side data source object
   *
   * The getRows() method is invoked when a user scrolls down (to get more rows)
   * The getRows() method is invoked when a user changes a filter
   * The getRows() method is invoked when a user changes sorting
   * The getRows() method is invoked manually when the code calls this.gridApi.onFilterChanged()
   */
  private serverSideDataSource: IServerSideDatasource = {
    getRows: (params: IServerSideGetRowsParams) => {
      // The grid needs to load data.  So, subscribe to gridService.getServerSideData() and load the data

      if (params.request.startRow == 0) {
        // The user is requesting a first page (so we are not getting a 2nd or 3rd page)
        // -- Reset the additional sort fields  (needed for the 2nd, 3rd, 4th pages)
        this.searchAfterClause = null;
      }

      if (this.totalMatches == 0) {
        this.gridApi.hideOverlay();
      }

      // Add the additional sort fields to the request object
      let getRowsRequestDTO: GridGetRowsRequestDTO = new GridGetRowsRequestDTO(params.request,
        this.searchAfterClause, this.rawSearchQuery)

      // Subscribe to this service method to get the data
      this.gridService.getClanData(getRowsRequestDTO)
        .subscribe((response: GridGetRowsResponseDTO) => {
          // REST Call finished successfully

          this.isValidQuery = response.isValidQuery;

          if (! response.isValidQuery) {
            // The user entered an invalid search

            // Set the flag to false (so the search box changes color)
            this.isValidQuery = false;

            // Update total matches on the screen
            this.totalMatches = 0;

            // Show the 'no matches were found'
            this.gridApi.showNoRowsOverlay();

            // Tell the ag-grid that there were no results
            params.successCallback([], 0);
            return;
          }

          // Save the additional sort fields  (we will use when getting the next page)
          this.searchAfterClause = response.searchAfterClause;

          // Update total matches on the screen
          this.totalMatches = response.totalMatches;

          if (this.totalMatches == 0) {
            this.gridApi.showNoRowsOverlay();
          }

          // Load the data into the grid and turn on/off infinite scrolling
          // If lastRow == -1,           then Infinite-Scrolling is turned ON
          // if lastRow == totalMatches, then infinite-scrolling is turned OFF
          params.successCallback(response.data, response.lastRow)
        });

    }
  };

// Set up the columns for the grid
  public defaultColDefs: any = {
    flex: 1,
    sortable: true,
    filter: true,
    floatingFilter: true,    // Causes the filter row to appear below column names
    autoHeight: true,
    resizable: true
  };

  private textFilterParams = {
    filterOptions: ['contains', 'notContains'],
    caseSensitive: false,
    debounceMs: 200,
    suppressAndOrCondition: true,
  };

  public columnDefs = [
    {
      headerName: 'Clan ID',
      field: 'id',
      filter: 'agNumberColumnFilter',
      filterParams: this.textFilterParams,
      cellClass: 'grid-text-cell-format',
    },
    {
      headerName: 'Clan Name',
      field: 'clanName',
      filter: 'agTextColumnFilter',
      filterParams: this.textFilterParams,
      cellClass: 'grid-text-cell-format'
    },
    {
      headerName: 'Message of the Day',
      field: 'messageOfTheDay',
      filter: 'agTextColumnFilter',
      filterParams: this.textFilterParams,
      cellClass: 'grid-text-cell-format'
    },
    {
      headerName: 'Total Members',
      field: 'totalMembers',
      filter: 'agNumberColumnFilter',
      filterParams: this.textFilterParams,
      cellClass: 'grid-text-cell-format'
    },
    {
      headerName: 'Active Members',
      field: 'activeMembers',
      filter: 'agNumberColumnFilter',
      filterParams: this.textFilterParams,
      cellClass: 'grid-text-cell-format'
    },
    {
      headerName: 'Building Count',
      field: 'buildingCount',
      filter: 'agNumberColumnFilter',
      filterParams: this.textFilterParams,
      cellClass: 'grid-text-cell-format'
    },
    {
      headerName: 'Stored Building Count',
      field: 'storedBuildingCount',
      filter: 'agNumberColumnFilter',
      filterParams: this.textFilterParams,
      cellClass: 'grid-text-cell-format'
    },
    {
      headerName: 'Inventory Count',
      field: 'inventoryCount',
      filter: 'agTextColumnFilter',
      filterParams: this.textFilterParams,
      cellClass: 'grid-text-cell-format'
    }
  ];


  // This is a map of component names that correspond to components that implement ICellRendererAngularComp
  public  frameworkComponents: any = {  };

  public  rowData: GetClansDTO[];
  private gridApi: GridApi;
  private gridColumnApi: ColumnApi;

  @ViewChild('searchBox',  { read: ElementRef }) searchBox: ElementRef;

  constructor(private gridService: GridService,
              private preferenceService: PreferenceService,
              private themeService: ThemeService) {}

  public ngOnInit(): void {

    // Listen for changes from the theme service
    this.themeStateSubscription = this.themeService.getThemeStateAsObservable().subscribe(
      (aNewTheme: ThemeOptionDTO) => {
        // The theme has changed.
        this.currentTheme = aNewTheme;
      });

    // Listen for save-grid-column-state events
    // NOTE:  If a user manipulates the grid, then we could be sending LOTS of save-column-state REST calls
    //        The debounceTime slows down the REST calls
    //        The switchMap cancels previous calls
    //        Thus, if there are lots of changes to the grid,
    //          we invoke a single REST call using the *LAST* event (over a span of 250 msecs)
    this.saveGridEventsSubscription = this.saveGridColumnStateEventsSubject.asObservable().pipe(
      debounceTime(250),         // Wait 250 msecs before invoking REST call
      switchMap( (aNewColumnState: any) => {
        // Use the switchMap for its cancelling effect:
        // On each observable, the previous observable is cancelled

        // Return an observable
        // Invoke the REST call to save it to the back end
        return this.preferenceService.setPreferenceValueForPageUsingJson(
          Constants.COLUMN_STATE_PREFERENCE_NAME, aNewColumnState, this.PAGE_NAME)
      })
    ).subscribe();

  }  // end of ngOnInit()


  public ngAfterViewInit(): void {
    // Set the focus on the search box
    setTimeout(() => this.searchBox.nativeElement.focus(), 10);
  }


  public ngOnDestroy(): void {
    if (this.themeStateSubscription) {
      this.themeStateSubscription.unsubscribe();
    }

    if (this.saveGridEventsSubscription) {
      this.saveGridEventsSubscription.unsubscribe();
    }

    if (this.saveGridColumnStateEventsSubject) {
      this.saveGridColumnStateEventsSubject.unsubscribe();
    }

  }


  /*
   * The grid calls onGridReady() once it is fully initialized.  This is the start of this page.
   *  1. Invoke a REST call to get the grid preferences
   *  2. When the REST call returns
   *      a. Configure the grid with the correct columns
   *      b. Initialize the server-side data source
   *         (which will cause the getRows() REST endpoint to be called asynchronously)
   */
  public onGridReady(params: any): void {
    // Get a reference to the gridApi and gridColumnApi (which we will need later to get selected rows)
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    this.preferenceService.getPreferenceValueForPage(
      Constants.COLUMN_STATE_PREFERENCE_NAME, this.PAGE_NAME).subscribe(
      (aPreference: GetOnePreferenceDTO) => {
        // REST call came back.  I have the grid preferences

        if (! aPreference.value) {
          // There is no past column state
          this.userHasPastColumnState = false;
        }
        else {
          // There is past column state
          let storedColumnStateObject = JSON.parse(aPreference.value);

          // Set the grid state -- e.g., set the column widths, column order, visible columns
          this.gridColumnApi.applyColumnState( { state: storedColumnStateObject,  applyOrder: true} );

          // Clear all sorting
          this.clearGridSorting();

          // Clear any filtering
          this.gridApi.setFilterModel(null);

          this.userHasPastColumnState = true;
        }

        // Set the server-side data source
        // NOTE:  The grid will asynchronously call getRows() as it needs to load data
        this.gridApi.setServerSideDatasource(this.serverSideDataSource);

      });

  }  // end of onGridReady()

}
