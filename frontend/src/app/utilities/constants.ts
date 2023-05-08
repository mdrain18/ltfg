export enum Constants {
  FORBIDDEN_ROUTE              = "page/403",
  LOGIN_ROUTE                  = "page/login",
  REGISTRATION_ROUTE           = "page/registration",
  VIEW_USER_PROFILE_ROUTE      = "page/viewReports",
  WELCOME_ROUTE                = "page/welcome",
  ADD_BUGREPORTS_ROUTE         = "page/reports/add2",
  REPORTS_GRID_VIEW_ROUTE      = "page/reports/grid",
  DASHBOARD_ROUTE              = "page/dashboard",

  LONGVIEW_INTERNAL_NAV_REPORT = "page/longview/",        // This route has a required id
  EDIT_REPORT_ROUTE            = "page/reports/edit/",    // This route has a required id
  SEARCH_DETAILS_ROUTE         = "page/search/details/",  // This route has a required id
  REPORT_SUBMIT_MARKDOWN       = "page/reports/markdown-submit",
  REPORT_HELP_DOC_ROUTE        = "page/reports/pdf-viewer",
  TAB_GROUP_ROUTE              = "page/reports/tab-group",
  SERVER_SIDE_GRID_ROUTE       = "page/reports/search",
  CHARACTERS_GRID_ROUTE        = "page/reports/characters",
  CLANS_GRID_ROUTE             = "page/reports/clans",
  BUILDINGS_GRID_ROUTE         = "page/reports/buildings",
  INVENTORY_GRID_ROUTE         = "page/reports/inventory",

  // All these routes are for the individual dashboard items
  DASHBOARD_LAYOUT_ROUTE       = "page/dashboard/layout",
  DASHBOARD_GRID_PAGE          = "page/dashboard/grid",
  DASHBOARD_BAR_CHART_PAGE     = "page/dashboard/bar_chart",
  DASHBOARD_USA_MAP_PAGE       = "page/dashboard/map",
  USA_MAP_ROUTE                = "page/usa-map",
  CHART_DRILLDOWN_ROUTE        = "page/chart-drill-down",

  GRID_TAB_GROUP_ROUTE         = "page/reports/grid-tab-group/",   // This route has a required startingTab
  GRID_TAB_GROUP_EDIT_DETAILS_ROUTE = "page/reports/edit-details/",   // This route has a required startingTab

  COLUMN_STATE_PREFERENCE_NAME = "grid_column_state"
}
