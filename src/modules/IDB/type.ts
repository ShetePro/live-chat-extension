import { SearchType, SiteType } from "../../enum";

export type ChatMessageType = {
  user: string;
  text: string;
  timestamp: number | string;
  siteType: SiteType;
  liveId: string;
  liveName: string;
};
export type SearchChatPageParams = {
  pageIndex: number;
  pageSize: number;
  siteType: SiteType;
  liveId: string;
  text: string;
  type: SearchType;
};
