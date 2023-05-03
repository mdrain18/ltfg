export class GetClansDTO {

  public id: number;
  public clanName: string;
  public messageOfTheDay: string;
  public ownerId: number;
  public totalMembers: number;
  public activeMembers: number;
  public memberGrowthRate: string;
  public warWins: number;
  public warLosses: number;
  public buildingCount: number;
  public storedBuildingCount: number;
  public inventoryCount: number;
  public clanKDRatio: string;
  public lastUpdated: string;
}
