import {Component, OnDestroy, OnInit} from '@angular/core';
import {ColumnApi, GridApi, GridOptions} from "ag-grid-community";
import {DashboardService} from "../../../services/dashboard.service";
import {Router} from "@angular/router";
import {DashboardGridRowDTO} from "../../../models/dashboard-grid-row-dto";
import {Constants} from "../../../utilities/constants";


@Component({
  selector: 'app-grid-page',
  templateUrl: './grid-page.component.html',
  styleUrls: ['./grid-page.component.css']
})
export class GridPageComponent implements OnInit, OnDestroy {

  private gridApi: GridApi;
  private gridColumnApi: ColumnApi;
  public  rowData: DashboardGridRowDTO[];


  private textFilterParams = {
    filterOptions: ['contains', 'notContains'],
    caseSensitive: false,
    debounceMs: 100,
    suppressAndOrCondition: true,
  };


  public gridOptions: GridOptions = {
    overlayLoadingTemplate:
      '<span class="ag-overlay-loading-center">Loading data now...</span>',

    pagination: false,
    paginationPageSize: 100,
    rowGroupPanelShow: 'never',   // Possible options are 'never', 'always', and 'onlyWhenGrouping'
    suppressRowHoverHighlight: false,
    debug: false,
    masterDetail: false,
    suppressCellSelection: true,
    domLayout: 'normal'
  }


  public defaultColDefs: any = {
    flex: 1,
    sortable: true,
    filter: true,
    floatingFilter: true,    // Causes the filter row to appear below column names
    wrapText: true,
    resizable: true,
    autoHeight: true
  };

  public columnDefs = [
    {
      field: 'clanName',
      minWidth: 200,
      headerName: 'Clan Name',
      filter: 'agTextColumnFilter',
      filterParams: this.textFilterParams,
    },
    {
      field: 'buildingLimit',
      minWidth: 130,
      headerName: 'Building Limit',
      cellClass: 'grid-text-cell-format',
      filter: 'agTextColumnFilter',
      filterParams: this.textFilterParams,
    },
    {
      field: 'inventoryLimit',
      minWidth: 150,
      headerName: 'Inventory Limit',
      cellClass: 'grid-text-cell-format',
      filter: 'agTextColumnFilter',
      filterParams: this.textFilterParams,
    },
    {
      field: 'violationDate',
      minWidth: 150,
      headerName: 'Violation Date',
      cellClass: 'grid-text-cell-format',
      filter: 'agTextColumnFilter',
      filterParams: this.textFilterParams,
    },
    {
      field: 'clanOwner',
      minWidth: 150,
      headerName: 'Clan Owner',
      cellClass: 'grid-text-cell-format',
      filter: 'agTextColumnFilter',
      filterParams: this.textFilterParams,
    },

  ];

  constructor(private router: Router,
              private dashboardService: DashboardService) { }


  public ngOnInit(): void {
  }



  public ngOnDestroy(): void {
  }

  /*
   * The grid is ready.  So, perform grid initialization here:
   *  1) Invoke the REST call to get grid preferences
   *  2) When the REST call returns
   *     a) Invoke the REST call to get data
   *     b) Set preferences in the grid (if there are any)
   */
  public onGridReady(params: any): void {
    // Get a reference to the gridApi and gridColumnApi
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    this.reloadPage();
  }


  private reloadPage(): void {
    // Show the loading overlay
    this.gridApi.showLoadingOverlay();

    // Invoke a REST call to get data for the initial page load
    this.dashboardService.getGridData().subscribe((aData: DashboardGridRowDTO[]) => {
      // We got row data from the REST call

      // Put the data into the grid
      this.rowData = aData;

      // We did not get any column state on page load.  So, resize the columns to fit
      this.gridApi.sizeColumnsToFit();
    });
  }

  /*
   * Add this public get method so that we can reference constants in the HTML template
   */
  public get constants(): typeof Constants {
    // Get a reference to the enumerated object
    // -- This is needed so that the html page can use the enum class
    return Constants;
  }

}
