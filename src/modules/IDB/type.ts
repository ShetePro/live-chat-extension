import {SearchType, SiteType} from "../../enum";

export type IDBEvent = {
  target: {
    result: any;
  } & EventTarget;
} & IDBVersionChangeEvent;

export type ChatMessageType = {
  user: string
  text: string
  timestamp: number | string
  siteType: SiteType
  liveId: string
  liveName: string
}
export type SearchChatPageParams = {
  pageIndex: number | string
  pageSize: number | string
  siteType: SiteType
  liveId: string
  text: string
  type: SearchType
}
