
import { Injectable } from '@angular/core';
import {HistoryEntryDto} from "../models/history-entry-dto";
import {Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  constructor() { }


  public getListOfHistoryEntries(aReportId: number): Observable<HistoryEntryDto[]> {
    let data: HistoryEntryDto[] = [
      {
        id: 1,
        date: "09/01/2020",
        dateAsDaysAgo: "11 months ago",
        description: "Description for entry 1 is here",
        authorFullName: "John Smith",
        eventType: 1,
        eventTypeDisplayed: "User Submitted Application",
        appState: 1,
        appStateDisplayed: "App Submitted"
      },
      {
        id: 2,
        date: "10/01/2020",
        dateAsDaysAgo: "9 months ago",
        description: "System Assigned this application to Analyst named Jane Smith",
        authorFullName: "System",
        eventType: 2,
        eventTypeDisplayed: "Application was assigned",
        appState: 2,
        appStateDisplayed: "Assigned to Operator"
      },
      {
        id: 3,
        date: "3/01/2021",
        dateAsDaysAgo: "5 months ago",
        description: "First review of the application",
        authorFullName: "Jane Smith",
        eventType: 2,
        eventTypeDisplayed: "Analysts Reviewed",
        appState: 2,
        appStateDisplayed: "In Analysts Review"
      }
    ];

    // Return an observable that holds this data
    return of(data);
  }

}
