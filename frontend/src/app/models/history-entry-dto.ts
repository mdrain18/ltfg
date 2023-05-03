export class HistoryEntryDto {
  public id: number;
  public date: string;
  public dateAsDaysAgo: string;
  public description: string;
  public authorFullName: string;
  public eventType: number;
  public eventTypeDisplayed: string;
  public appState: number;
  public appStateDisplayed: string;
}
