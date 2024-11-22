import { ChatMessageType } from "@/modules/IDB/type";

export const siteServer: {
  userHome: (msg: ChatMessageType) => void;
} = {
  userHome: null,
};
